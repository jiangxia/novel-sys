# Story 3.3: 自动保存和版本管理

## O (Objective)
### 功能目标
- 开发智能自动保存机制，防止数据丢失
- 实现简单的版本管理和历史记录
- 建立数据恢复和回滚功能

### 技术目标  
- 设计高效的自动保存触发机制
- 实现轻量级版本存储策略
- 确保自动保存不影响用户体验

## E (Environment)
### 技术环境
- Web API定时器 + 事件监听机制
- IndexedDB本地数据库 + 压缩存储
- 差分存储算法 + 版本清理策略

### 依赖环境
- Story3.1的文件读取引擎
- Story3.2的文件保存引擎
- Fullstack Story3.1的文件操作协议

## S (Success Criteria)

### 及格标准
- 自动保存功能正常，30秒间隔触发
- 版本历史记录准确，支持基础回滚
- 数据恢复机制工作，异常情况能恢复

### 优秀标准
- 自动保存智能触发，根据编辑活动调整频率
- 版本存储高效，使用差分压缩节省空间
- 用户体验优秀，保存过程不阻塞操作

## 具体任务分解

### Task 3.3.1: 智能自动保存管理器
**预估时间**: 2小时
**具体内容**:
- 开发自适应的自动保存触发机制
- 实现编辑活动监测和保存频率调整
- 建立保存状态指示和用户反馈

**自动保存管理器架构**:
```typescript
// core/autoSave/AutoSaveManager.ts
export interface AutoSaveConfig {
  baseInterval: number        // 基础保存间隔(毫秒)
  maxInterval: number         // 最大保存间隔
  minInterval: number         // 最小保存间隔
  idleThreshold: number       // 空闲阈值(毫秒)
  maxPendingChanges: number   // 最大待保存更改数
  enableSmartTrigger: boolean // 启用智能触发
}

export interface AutoSaveState {
  filePath: string
  isActive: boolean
  lastSaveTime: number
  nextSaveTime: number
  pendingChanges: number
  saveInProgress: boolean
  lastError?: string
}

export interface EditActivity {
  timestamp: number
  changeSize: number
  changeType: 'insert' | 'delete' | 'replace'
  cursorPosition: number
}

export class AutoSaveManager {
  private config: AutoSaveConfig = {
    baseInterval: 30000,      // 30秒
    maxInterval: 300000,      // 5分钟
    minInterval: 5000,        // 5秒
    idleThreshold: 60000,     // 1分钟无操作
    maxPendingChanges: 100,   // 100个字符更改
    enableSmartTrigger: true
  }

  private saveStates = new Map<string, AutoSaveState>()
  private timers = new Map<string, NodeJS.Timeout>()
  private editActivities = new Map<string, EditActivity[]>()
  private fileSaver: FileSaverEngine
  private versionManager: VersionManager

  constructor() {
    this.fileSaver = new FileSaverEngine()
    this.versionManager = new VersionManager()
    this.setupEventListeners()
  }

  // 启用文件自动保存
  enableAutoSave(
    filePath: string,
    fileHandle: FileSystemFileHandle,
    getContentFn: () => string,
    config?: Partial<AutoSaveConfig>
  ): void {
    if (config) {
      this.config = { ...this.config, ...config }
    }

    const saveState: AutoSaveState = {
      filePath,
      isActive: true,
      lastSaveTime: Date.now(),
      nextSaveTime: Date.now() + this.config.baseInterval,
      pendingChanges: 0,
      saveInProgress: false
    }

    this.saveStates.set(filePath, saveState)
    this.editActivities.set(filePath, [])
    
    // 设置定时器
    this.scheduleNextSave(filePath, fileHandle, getContentFn)
  }

  // 禁用文件自动保存
  disableAutoSave(filePath: string): void {
    const timer = this.timers.get(filePath)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(filePath)
    }

    const saveState = this.saveStates.get(filePath)
    if (saveState) {
      saveState.isActive = false
    }

    this.editActivities.delete(filePath)
  }

  // 记录编辑活动
  recordEditActivity(
    filePath: string,
    changeType: EditActivity['changeType'],
    changeSize: number,
    cursorPosition: number
  ): void {
    const activities = this.editActivities.get(filePath)
    if (!activities) return

    const activity: EditActivity = {
      timestamp: Date.now(),
      changeSize,
      changeType,
      cursorPosition
    }

    activities.push(activity)

    // 更新待保存更改计数
    const saveState = this.saveStates.get(filePath)
    if (saveState) {
      saveState.pendingChanges += changeSize
      
      // 检查是否需要立即保存
      if (this.shouldTriggerImmediateSave(filePath)) {
        this.triggerImmediateSave(filePath)
      }
    }

    // 清理过期活动记录
    this.cleanupEditActivities(filePath)
  }

  // 手动触发保存
  async triggerSave(filePath: string): Promise<{ success: boolean, error?: string }> {
    const saveState = this.saveStates.get(filePath)
    if (!saveState || !saveState.isActive) {
      return { success: false, error: '自动保存未启用' }
    }

    if (saveState.saveInProgress) {
      return { success: false, error: '保存正在进行中' }
    }

    return await this.executeSave(filePath)
  }

  private scheduleNextSave(
    filePath: string,
    fileHandle: FileSystemFileHandle,
    getContentFn: () => string
  ): void {
    const saveState = this.saveStates.get(filePath)
    if (!saveState || !saveState.isActive) return

    // 计算下次保存间隔
    const interval = this.calculateNextInterval(filePath)
    saveState.nextSaveTime = Date.now() + interval

    const timer = setTimeout(async () => {
      if (saveState.isActive && !saveState.saveInProgress) {
        await this.executeSaveWithContent(filePath, fileHandle, getContentFn)
        
        // 递归调度下次保存
        if (saveState.isActive) {
          this.scheduleNextSave(filePath, fileHandle, getContentFn)
        }
      }
    }, interval)

    // 清理旧定时器
    const oldTimer = this.timers.get(filePath)
    if (oldTimer) {
      clearTimeout(oldTimer)
    }

    this.timers.set(filePath, timer)
  }

  private calculateNextInterval(filePath: string): number {
    if (!this.config.enableSmartTrigger) {
      return this.config.baseInterval
    }

    const activities = this.editActivities.get(filePath) || []
    const now = Date.now()
    
    // 计算最近编辑活动的强度
    const recentActivities = activities.filter(
      activity => now - activity.timestamp < this.config.idleThreshold
    )

    if (recentActivities.length === 0) {
      // 无最近活动，使用最大间隔
      return this.config.maxInterval
    }

    // 根据编辑频率调整间隔
    const activityIntensity = recentActivities.length / (this.config.idleThreshold / 1000)
    const dynamicInterval = this.config.baseInterval / Math.max(1, activityIntensity / 2)

    return Math.max(
      this.config.minInterval,
      Math.min(this.config.maxInterval, dynamicInterval)
    )
  }

  private shouldTriggerImmediateSave(filePath: string): boolean {
    const saveState = this.saveStates.get(filePath)
    if (!saveState || saveState.saveInProgress) return false

    // 检查待保存更改数量
    if (saveState.pendingChanges >= this.config.maxPendingChanges) {
      return true
    }

    // 检查最后保存时间
    const timeSinceLastSave = Date.now() - saveState.lastSaveTime
    if (timeSinceLastSave >= this.config.maxInterval) {
      return true
    }

    return false
  }

  private async triggerImmediateSave(filePath: string): Promise<void> {
    // 取消当前定时器
    const timer = this.timers.get(filePath)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(filePath)
    }

    await this.executeSave(filePath)
  }

  private async executeSave(filePath: string): Promise<{ success: boolean, error?: string }> {
    const saveState = this.saveStates.get(filePath)
    if (!saveState) {
      return { success: false, error: '保存状态未找到' }
    }

    saveState.saveInProgress = true
    saveState.lastError = undefined

    try {
      // 这里需要从外部获取文件内容
      // 在实际使用中，需要传入获取内容的函数
      console.log(`执行自动保存: ${filePath}`)
      
      // 模拟保存成功
      saveState.lastSaveTime = Date.now()
      saveState.pendingChanges = 0
      
      return { success: true }
    } catch (error) {
      const errorMsg = error.message || '自动保存失败'
      saveState.lastError = errorMsg
      return { success: false, error: errorMsg }
    } finally {
      saveState.saveInProgress = false
    }
  }

  private async executeSaveWithContent(
    filePath: string,
    fileHandle: FileSystemFileHandle,
    getContentFn: () => string
  ): Promise<void> {
    const saveState = this.saveStates.get(filePath)
    if (!saveState || saveState.saveInProgress) return

    saveState.saveInProgress = true

    try {
      const content = getContentFn()
      
      // 创建版本快照
      await this.versionManager.createSnapshot(filePath, content)
      
      // 执行保存
      const result = await this.fileSaver.saveFile(fileHandle, content, {
        backup: false, // 不需要额外备份，版本管理器已处理
        atomic: true,
        validateContent: true
      })

      if (result.success) {
        saveState.lastSaveTime = Date.now()
        saveState.pendingChanges = 0
        saveState.lastError = undefined
      } else {
        saveState.lastError = result.error
      }
    } catch (error) {
      saveState.lastError = error.message
      console.error('自动保存失败:', error)
    } finally {
      saveState.saveInProgress = false
    }
  }

  private cleanupEditActivities(filePath: string): void {
    const activities = this.editActivities.get(filePath)
    if (!activities) return

    const cutoffTime = Date.now() - this.config.idleThreshold * 2
    const validActivities = activities.filter(activity => activity.timestamp > cutoffTime)
    
    this.editActivities.set(filePath, validActivities.slice(-100)) // 保持最多100条记录
  }

  private setupEventListeners(): void {
    // 监听页面卸载事件，执行最后保存
    window.addEventListener('beforeunload', async (event) => {
      const pendingSaves = Array.from(this.saveStates.entries())
        .filter(([_, state]) => state.isActive && state.pendingChanges > 0)

      if (pendingSaves.length > 0) {
        event.preventDefault()
        
        // 执行紧急保存
        for (const [filePath] of pendingSaves) {
          await this.triggerSave(filePath)
        }
      }
    })

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时，立即保存所有待保存文件
        this.saveStates.forEach((state, filePath) => {
          if (state.isActive && state.pendingChanges > 0) {
            this.triggerSave(filePath)
          }
        })
      }
    })
  }

  // 获取所有保存状态
  getAllSaveStates(): Map<string, AutoSaveState> {
    return new Map(this.saveStates)
  }

  // 获取单个文件保存状态
  getSaveState(filePath: string): AutoSaveState | null {
    return this.saveStates.get(filePath) || null
  }

  // 更新配置
  updateConfig(newConfig: Partial<AutoSaveConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}
```

### Task 3.3.2: 版本管理系统
**预估时间**: 2小时
**具体内容**:
- 实现轻量级版本存储机制
- 开发版本历史查看和比较功能
- 建立版本回滚和恢复系统

**版本管理系统**:
```typescript
// core/version/VersionManager.ts
export interface VersionSnapshot {
  id: string
  filePath: string
  content: string
  checksum: string
  timestamp: number
  size: number
  changesSummary?: {
    additions: number
    deletions: number
    modifications: number
  }
  tags: string[]
  metadata: {
    source: 'auto_save' | 'manual_save' | 'user_checkpoint'
    userNote?: string
    wordCount: number
    lineCount: number
  }
}

export interface VersionDiff {
  oldVersion: VersionSnapshot
  newVersion: VersionSnapshot
  additions: string[]
  deletions: string[]
  modifications: Array<{
    oldLine: string
    newLine: string
    lineNumber: number
  }>
}

export class VersionManager {
  private readonly dbName = 'NovelVersionDB'
  private readonly dbVersion = 1
  private readonly maxVersionsPerFile = 50
  private readonly maxStorageSize = 100 * 1024 * 1024 // 100MB

  // 创建版本快照
  async createSnapshot(
    filePath: string,
    content: string,
    options: {
      source?: VersionSnapshot['metadata']['source']
      userNote?: string
      tags?: string[]
    } = {}
  ): Promise<VersionSnapshot> {
    const snapshot: VersionSnapshot = {
      id: this.generateSnapshotId(),
      filePath,
      content,
      checksum: await this.calculateChecksum(content),
      timestamp: Date.now(),
      size: new Blob([content]).size,
      tags: options.tags || [],
      metadata: {
        source: options.source || 'auto_save',
        userNote: options.userNote,
        wordCount: this.countWords(content),
        lineCount: this.countLines(content)
      }
    }

    // 计算与上一版本的差异
    const lastSnapshot = await this.getLastSnapshot(filePath)
    if (lastSnapshot) {
      snapshot.changesSummary = this.calculateChangesSummary(lastSnapshot.content, content)
    }

    // 存储到IndexedDB
    await this.storeSnapshot(snapshot)
    
    // 清理旧版本
    await this.cleanupOldVersions(filePath)

    return snapshot
  }

  // 获取文件的所有版本
  async getVersionHistory(
    filePath: string,
    limit?: number
  ): Promise<VersionSnapshot[]> {
    const db = await this.openDB()
    const transaction = db.transaction(['snapshots'], 'readonly')
    const store = transaction.objectStore('snapshots')
    const index = store.index('filePath_timestamp')
    
    const range = IDBKeyRange.bound([filePath, 0], [filePath, Date.now()])
    const snapshots: VersionSnapshot[] = []

    return new Promise((resolve, reject) => {
      const request = index.openCursor(range, 'prev') // 倒序
      
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor && (!limit || snapshots.length < limit)) {
          snapshots.push(cursor.value)
          cursor.continue()
        } else {
          resolve(snapshots)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  // 获取特定版本
  async getSnapshot(snapshotId: string): Promise<VersionSnapshot | null> {
    const db = await this.openDB()
    const transaction = db.transaction(['snapshots'], 'readonly')
    const store = transaction.objectStore('snapshots')
    
    return new Promise((resolve, reject) => {
      const request = store.get(snapshotId)
      
      request.onsuccess = () => {
        resolve(request.result || null)
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  // 比较两个版本
  async compareVersions(
    oldSnapshotId: string,
    newSnapshotId: string
  ): Promise<VersionDiff | null> {
    const [oldVersion, newVersion] = await Promise.all([
      this.getSnapshot(oldSnapshotId),
      this.getSnapshot(newSnapshotId)
    ])

    if (!oldVersion || !newVersion) {
      return null
    }

    const diff = this.computeDiff(oldVersion.content, newVersion.content)

    return {
      oldVersion,
      newVersion,
      additions: diff.additions,
      deletions: diff.deletions,
      modifications: diff.modifications
    }
  }

  // 回滚到指定版本
  async rollbackToVersion(
    filePath: string,
    snapshotId: string,
    createCheckpoint = true
  ): Promise<{ success: boolean, content: string, error?: string }> {
    try {
      const snapshot = await this.getSnapshot(snapshotId)
      if (!snapshot) {
        return { success: false, content: '', error: '版本快照未找到' }
      }

      if (snapshot.filePath !== filePath) {
        return { success: false, content: '', error: '文件路径不匹配' }
      }

      // 创建回滚前的检查点
      if (createCheckpoint) {
        await this.createCheckpoint(filePath, snapshot.content, '回滚前自动检查点')
      }

      return {
        success: true,
        content: snapshot.content
      }
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error.message
      }
    }
  }

  // 创建用户检查点
  async createCheckpoint(
    filePath: string,
    content: string,
    note: string,
    tags: string[] = []
  ): Promise<VersionSnapshot> {
    return this.createSnapshot(filePath, content, {
      source: 'user_checkpoint',
      userNote: note,
      tags: ['checkpoint', ...tags]
    })
  }

  // 删除指定版本
  async deleteSnapshot(snapshotId: string): Promise<boolean> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(['snapshots'], 'readwrite')
      const store = transaction.objectStore('snapshots')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(snapshotId)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      return true
    } catch (error) {
      console.error('删除版本快照失败:', error)
      return false
    }
  }

  // 清理文件的所有版本
  async clearVersionHistory(filePath: string): Promise<boolean> {
    try {
      const snapshots = await this.getVersionHistory(filePath)
      
      for (const snapshot of snapshots) {
        await this.deleteSnapshot(snapshot.id)
      }

      return true
    } catch (error) {
      console.error('清理版本历史失败:', error)
      return false
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = () => {
        const db = request.result
        
        // 创建快照存储
        const snapshotStore = db.createObjectStore('snapshots', { keyPath: 'id' })
        snapshotStore.createIndex('filePath', 'filePath', { unique: false })
        snapshotStore.createIndex('timestamp', 'timestamp', { unique: false })
        snapshotStore.createIndex('filePath_timestamp', ['filePath', 'timestamp'], { unique: false })
        
        // 创建元数据存储
        db.createObjectStore('metadata', { keyPath: 'key' })
      }
    })
  }

  private async storeSnapshot(snapshot: VersionSnapshot): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction(['snapshots'], 'readwrite')
    const store = transaction.objectStore('snapshots')
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(snapshot)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async getLastSnapshot(filePath: string): Promise<VersionSnapshot | null> {
    const history = await this.getVersionHistory(filePath, 1)
    return history.length > 0 ? history[0] : null
  }

  private async cleanupOldVersions(filePath: string): Promise<void> {
    const snapshots = await this.getVersionHistory(filePath)
    
    if (snapshots.length > this.maxVersionsPerFile) {
      // 保留最新的版本和所有用户检查点
      const toDelete = snapshots
        .slice(this.maxVersionsPerFile)
        .filter(snapshot => 
          snapshot.metadata.source !== 'user_checkpoint' && 
          !snapshot.tags.includes('checkpoint')
        )

      for (const snapshot of toDelete) {
        await this.deleteSnapshot(snapshot.id)
      }
    }

    // 检查存储大小限制
    await this.checkStorageLimit()
  }

  private async checkStorageLimit(): Promise<void> {
    // 这里可以实现存储大小检查和清理逻辑
    // 简化实现：检查navigator.storage.estimate()
    if ('storage' in navigator) {
      const estimate = await navigator.storage.estimate()
      if (estimate.usage && estimate.usage > this.maxStorageSize) {
        console.warn('版本存储接近限制，建议清理旧版本')
      }
    }
  }

  private computeDiff(oldContent: string, newContent: string) {
    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')

    const additions: string[] = []
    const deletions: string[] = []
    const modifications: Array<{ oldLine: string, newLine: string, lineNumber: number }> = []

    // 简化的差分算法
    const maxLength = Math.max(oldLines.length, newLines.length)

    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i] || ''
      const newLine = newLines[i] || ''

      if (oldLine === newLine) {
        continue
      } else if (!oldLine) {
        additions.push(newLine)
      } else if (!newLine) {
        deletions.push(oldLine)
      } else {
        modifications.push({ oldLine, newLine, lineNumber: i + 1 })
      }
    }

    return { additions, deletions, modifications }
  }

  private calculateChangesSummary(oldContent: string, newContent: string) {
    const diff = this.computeDiff(oldContent, newContent)
    return {
      additions: diff.additions.length,
      deletions: diff.deletions.length,
      modifications: diff.modifications.length
    }
  }

  private generateSnapshotId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async calculateChecksum(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private countWords(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  private countLines(content: string): number {
    return content.split('\n').length
  }
}
```

### Task 3.3.3: 数据恢复和备份系统
**预估时间**: 1.5小时
**具体内容**:
- 实现意外情况的数据恢复机制
- 建立本地备份和导出功能
- 添加数据完整性验证系统

**数据恢复系统**:
```typescript
// core/recovery/DataRecoverySystem.ts
export interface RecoveryPoint {
  id: string
  timestamp: number
  filePaths: string[]
  totalSize: number
  recoveryData: Map<string, string>
  metadata: {
    trigger: 'auto' | 'manual' | 'crash' | 'before_operation'
    description: string
    userAgent: string
    appVersion: string
  }
}

export interface RecoveryOptions {
  includeVersionHistory?: boolean
  validateIntegrity?: boolean
  createBackup?: boolean
  onProgress?: (progress: number, message: string) => void
}

export class DataRecoverySystem {
  private readonly recoveryDBName = 'NovelRecoveryDB'
  private readonly maxRecoveryPoints = 20
  private versionManager: VersionManager
  private autoSaveManager: AutoSaveManager

  constructor() {
    this.versionManager = new VersionManager()
    this.autoSaveManager = new AutoSaveManager()
    this.setupCrashDetection()
  }

  // 创建恢复点
  async createRecoveryPoint(
    fileContents: Map<string, string>,
    trigger: RecoveryPoint['metadata']['trigger'],
    description: string
  ): Promise<RecoveryPoint> {
    const recoveryPoint: RecoveryPoint = {
      id: this.generateRecoveryId(),
      timestamp: Date.now(),
      filePaths: Array.from(fileContents.keys()),
      totalSize: this.calculateTotalSize(fileContents),
      recoveryData: new Map(fileContents),
      metadata: {
        trigger,
        description,
        userAgent: navigator.userAgent,
        appVersion: this.getAppVersion()
      }
    }

    await this.storeRecoveryPoint(recoveryPoint)
    await this.cleanupOldRecoveryPoints()

    return recoveryPoint
  }

  // 获取所有恢复点
  async getRecoveryPoints(): Promise<RecoveryPoint[]> {
    const db = await this.openRecoveryDB()
    const transaction = db.transaction(['recovery_points'], 'readonly')
    const store = transaction.objectStore('recovery_points')
    const index = store.index('timestamp')

    return new Promise((resolve, reject) => {
      const points: RecoveryPoint[] = []
      const request = index.openCursor(null, 'prev')

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          points.push(cursor.value)
          cursor.continue()
        } else {
          resolve(points)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  // 从恢复点恢复数据
  async recoverFromPoint(
    recoveryId: string,
    options: RecoveryOptions = {}
  ): Promise<{
    success: boolean
    recoveredFiles: string[]
    errors: string[]
  }> {
    const recoveredFiles: string[] = []
    const errors: string[] = []

    try {
      options.onProgress?.(0.1, '加载恢复点数据...')

      const recoveryPoint = await this.getRecoveryPoint(recoveryId)
      if (!recoveryPoint) {
        throw new Error('恢复点未找到')
      }

      // 验证数据完整性
      if (options.validateIntegrity) {
        options.onProgress?.(0.2, '验证数据完整性...')
        const validation = await this.validateRecoveryData(recoveryPoint)
        if (!validation.valid) {
          throw new Error(`数据完整性验证失败: ${validation.error}`)
        }
      }

      // 创建当前状态备份
      if (options.createBackup) {
        options.onProgress?.(0.3, '创建当前状态备份...')
        await this.createPreRecoveryBackup()
      }

      // 恢复文件数据
      const totalFiles = recoveryPoint.filePaths.length
      let processedFiles = 0

      for (const [filePath, content] of recoveryPoint.recoveryData.entries()) {
        try {
          options.onProgress?.(
            0.4 + (processedFiles / totalFiles) * 0.5,
            `恢复文件: ${filePath}`
          )

          // 这里需要实际的文件恢复逻辑
          // 在实际实现中，需要调用文件保存引擎
          console.log(`恢复文件: ${filePath}`)
          
          recoveredFiles.push(filePath)
          processedFiles++
        } catch (error) {
          errors.push(`恢复文件 ${filePath} 失败: ${error.message}`)
        }
      }

      // 恢复版本历史
      if (options.includeVersionHistory) {
        options.onProgress?.(0.9, '恢复版本历史...')
        await this.recoverVersionHistory(recoveryPoint)
      }

      options.onProgress?.(1.0, '数据恢复完成')

      return {
        success: errors.length === 0,
        recoveredFiles,
        errors
      }
    } catch (error) {
      errors.push(`恢复过程失败: ${error.message}`)
      return {
        success: false,
        recoveredFiles,
        errors
      }
    }
  }

  // 自动崩溃检测和恢复
  async detectAndRecoverFromCrash(): Promise<boolean> {
    const crashFlag = localStorage.getItem('app_running_flag')
    const lastHeartbeat = localStorage.getItem('app_last_heartbeat')
    
    if (crashFlag && lastHeartbeat) {
      const lastTime = parseInt(lastHeartbeat)
      const now = Date.now()
      
      // 如果超过5分钟没有心跳，认为发生了崩溃
      if (now - lastTime > 5 * 60 * 1000) {
        localStorage.removeItem('app_running_flag')
        localStorage.removeItem('app_last_heartbeat')
        
        // 尝试从最近的恢复点恢复
        const recoveryPoints = await this.getRecoveryPoints()
        if (recoveryPoints.length > 0) {
          const latestPoint = recoveryPoints[0]
          console.warn('检测到应用异常退出，尝试从恢复点恢复数据')
          
          const result = await this.recoverFromPoint(latestPoint.id, {
            validateIntegrity: true,
            onProgress: (progress, message) => {
              console.log(`恢复进度: ${Math.round(progress * 100)}% - ${message}`)
            }
          })
          
          return result.success
        }
      }
    }

    // 设置运行标志
    localStorage.setItem('app_running_flag', 'true')
    this.startHeartbeat()
    
    return false
  }

  // 导出数据备份
  async exportBackup(
    filePaths: string[],
    getContentFn: (filePath: string) => string
  ): Promise<{ success: boolean, backupData?: string, error?: string }> {
    try {
      const backupData = {
        timestamp: Date.now(),
        version: this.getAppVersion(),
        files: {} as Record<string, string>,
        metadata: {
          exportedAt: new Date().toISOString(),
          fileCount: filePaths.length,
          userAgent: navigator.userAgent
        }
      }

      // 收集文件内容
      for (const filePath of filePaths) {
        try {
          const content = getContentFn(filePath)
          backupData.files[filePath] = content
        } catch (error) {
          console.error(`获取文件内容失败: ${filePath}`, error)
        }
      }

      // 压缩和编码
      const jsonData = JSON.stringify(backupData, null, 2)
      const encodedData = btoa(unescape(encodeURIComponent(jsonData)))

      return {
        success: true,
        backupData: encodedData
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 导入数据备份
  async importBackup(
    backupData: string,
    options: { overwriteExisting?: boolean } = {}
  ): Promise<{
    success: boolean
    importedFiles: string[]
    skippedFiles: string[]
    errors: string[]
  }> {
    const importedFiles: string[] = []
    const skippedFiles: string[] = []
    const errors: string[] = []

    try {
      // 解码和解析备份数据
      const jsonData = decodeURIComponent(escape(atob(backupData)))
      const backup = JSON.parse(jsonData)

      // 验证备份格式
      if (!backup.files || !backup.timestamp) {
        throw new Error('备份数据格式不正确')
      }

      // 导入文件数据
      for (const [filePath, content] of Object.entries(backup.files)) {
        try {
          // 这里需要实际的文件导入逻辑
          console.log(`导入文件: ${filePath}`)
          importedFiles.push(filePath)
        } catch (error) {
          errors.push(`导入文件 ${filePath} 失败: ${error.message}`)
        }
      }

      return {
        success: errors.length === 0,
        importedFiles,
        skippedFiles,
        errors
      }
    } catch (error) {
      errors.push(`导入过程失败: ${error.message}`)
      return {
        success: false,
        importedFiles,
        skippedFiles,
        errors
      }
    }
  }

  private async openRecoveryDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.recoveryDBName, 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = () => {
        const db = request.result
        const store = db.createObjectStore('recovery_points', { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('trigger', 'metadata.trigger', { unique: false })
      }
    })
  }

  private setupCrashDetection(): void {
    // 页面卸载时清理运行标志
    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('app_running_flag')
      localStorage.removeItem('app_last_heartbeat')
    })

    // 页面隐藏时创建恢复点
    document.addEventListener('visibilitychange', async () => {
      if (document.hidden) {
        // 创建紧急恢复点
        try {
          const currentFiles = new Map<string, string>()
          // 这里需要获取当前所有打开文件的内容
          
          await this.createRecoveryPoint(
            currentFiles,
            'auto',
            '页面隐藏时自动创建'
          )
        } catch (error) {
          console.error('创建紧急恢复点失败:', error)
        }
      }
    })
  }

  private startHeartbeat(): void {
    const updateHeartbeat = () => {
      localStorage.setItem('app_last_heartbeat', Date.now().toString())
    }

    updateHeartbeat()
    setInterval(updateHeartbeat, 30000) // 每30秒更新一次心跳
  }

  private generateRecoveryId(): string {
    return `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getAppVersion(): string {
    return '1.0.0' // 从实际应用配置获取
  }

  private calculateTotalSize(fileContents: Map<string, string>): number {
    let totalSize = 0
    for (const content of fileContents.values()) {
      totalSize += new Blob([content]).size
    }
    return totalSize
  }
}
```

## 验收标准
1. 自动保存功能正常，智能触发机制有效
2. 版本管理系统稳定，支持快照创建和回滚
3. 数据恢复机制可靠，崩溃检测准确
4. 备份导出导入功能完整，数据完整性保证
5. 性能表现良好，不影响正常编辑体验
6. 存储管理合理，自动清理过期数据

## 依赖关系
- 依赖Story3.1的文件读取引擎
- 依赖Story3.2的文件保存引擎  
- 需要Fullstack Story3.1的文件操作协议
- 为前端组件提供自动保存状态
- 为用户提供数据安全保障