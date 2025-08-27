# Story 3.2: 文件保存和同步管理

## O (Objective)
### 功能目标
- 开发可靠的文件保存引擎，确保数据安全性
- 实现本地文件实时同步机制
- 建立文件冲突检测和解决策略

### 技术目标  
- 设计事务性文件写入机制
- 实现高效的增量同步算法
- 确保并发保存的数据一致性

## E (Environment)
### 技术环境
- File System Access API + 原子写入操作
- Web Locks API + 并发控制机制
- 差分算法 + 增量更新策略

### 依赖环境
- Epic 1的文件系统管理器
- Story3.1的文件读取引擎
- Fullstack Story3.1的文件操作协议

## S (Success Criteria)

### 及格标准
- 文件保存成功率>99%，数据不丢失
- 本地文件同步正常，修改实时反映
- 基础冲突检测机制工作正常

### 优秀标准
- 保存性能优秀，1MB文件<200ms完成
- 增量同步效率高，只更新变更部分
- 并发保存处理正确，无数据竞争

## 具体任务分解

### Task 3.2.1: 原子文件保存引擎
**预估时间**: 2.5小时
**具体内容**:
- 开发事务性文件写入机制
- 实现保存失败的回滚功能
- 建立文件完整性验证系统

**文件保存引擎架构**:
```typescript
// core/fileSaver/FileSaverEngine.ts
export interface SaveOptions {
  backup?: boolean
  atomic?: boolean
  encoding?: 'utf-8' | 'gbk' | 'utf-16'
  onProgress?: (progress: number) => void
  validateContent?: boolean
}

export interface SaveResult {
  success: boolean
  filePath: string
  savedAt: number
  checksum: string
  bytesWritten: number
  duration: number
  error?: string
}

export class FileSaverEngine {
  private saveQueue = new Map<string, Promise<SaveResult>>()
  private lockManager = new FileLockManager()

  // 主要文件保存方法
  async saveFile(
    fileHandle: FileSystemFileHandle,
    content: string,
    options: SaveOptions = {}
  ): Promise<SaveResult> {
    const startTime = performance.now()
    const filePath = await this.getFilePath(fileHandle)

    // 防止重复保存同一文件
    const existingSave = this.saveQueue.get(filePath)
    if (existingSave) {
      return await existingSave
    }

    // 创建保存任务
    const saveTask = this.executeSave(fileHandle, content, options)
    this.saveQueue.set(filePath, saveTask)

    try {
      const result = await saveTask
      return {
        ...result,
        duration: performance.now() - startTime
      }
    } finally {
      this.saveQueue.delete(filePath)
    }
  }

  // 批量保存文件
  async saveMultipleFiles(
    saves: Array<{
      fileHandle: FileSystemFileHandle
      content: string
      options?: SaveOptions
    }>
  ): Promise<SaveResult[]> {
    const batchSize = 3 // 并发保存数量
    const results: SaveResult[] = []

    for (let i = 0; i < saves.length; i += batchSize) {
      const batch = saves.slice(i, i + batchSize)
      
      const batchResults = await Promise.allSettled(
        batch.map(({ fileHandle, content, options }) =>
          this.saveFile(fileHandle, content, options)
        )
      )

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            success: false,
            filePath: 'unknown',
            savedAt: Date.now(),
            checksum: '',
            bytesWritten: 0,
            duration: 0,
            error: result.reason.message
          })
        }
      })
    }

    return results
  }

  private async executeSave(
    fileHandle: FileSystemFileHandle,
    content: string,
    options: SaveOptions
  ): Promise<SaveResult> {
    const filePath = await this.getFilePath(fileHandle)
    
    // 获取文件锁
    const lockId = await this.lockManager.acquire(filePath)
    
    try {
      // 内容验证
      if (options.validateContent) {
        this.validateContent(content)
      }

      // 创建备份
      let backupResult: SaveResult | null = null
      if (options.backup) {
        backupResult = await this.createBackup(fileHandle)
      }

      // 执行原子写入
      const result = options.atomic 
        ? await this.atomicWrite(fileHandle, content, options)
        : await this.directWrite(fileHandle, content, options)

      // 验证写入结果
      if (result.success) {
        const verification = await this.verifyWrite(fileHandle, content)
        if (!verification.valid) {
          result.success = false
          result.error = verification.error
          
          // 恢复备份
          if (backupResult?.success) {
            await this.restoreBackup(fileHandle, backupResult)
          }
        }
      }

      return result
    } catch (error) {
      return {
        success: false,
        filePath,
        savedAt: Date.now(),
        checksum: '',
        bytesWritten: 0,
        duration: 0,
        error: error.message
      }
    } finally {
      this.lockManager.release(lockId)
    }
  }

  // 原子写入实现
  private async atomicWrite(
    fileHandle: FileSystemFileHandle,
    content: string,
    options: SaveOptions
  ): Promise<SaveResult> {
    const filePath = await this.getFilePath(fileHandle)
    
    // 创建临时文件
    const tempHandle = await this.createTempFile(fileHandle)
    
    try {
      // 写入临时文件
      const tempResult = await this.directWrite(tempHandle, content, options)
      
      if (!tempResult.success) {
        throw new Error(`临时文件写入失败: ${tempResult.error}`)
      }

      // 原子性替换
      await this.atomicReplace(tempHandle, fileHandle)
      
      return {
        success: true,
        filePath,
        savedAt: Date.now(),
        checksum: tempResult.checksum,
        bytesWritten: tempResult.bytesWritten,
        duration: 0
      }
    } catch (error) {
      // 清理临时文件
      try {
        await this.deleteTempFile(tempHandle)
      } catch (cleanupError) {
        console.error('临时文件清理失败:', cleanupError)
      }
      
      throw error
    }
  }

  // 直接写入实现
  private async directWrite(
    fileHandle: FileSystemFileHandle,
    content: string,
    options: SaveOptions
  ): Promise<SaveResult> {
    const filePath = await this.getFilePath(fileHandle)
    const encoder = new TextEncoder()
    const data = encoder.encode(content)

    try {
      const writable = await fileHandle.createWritable()
      
      // 分块写入大文件
      if (data.length > 1024 * 1024) { // 1MB+
        await this.writeInChunks(writable, data, options.onProgress)
      } else {
        await writable.write(data)
      }
      
      await writable.close()

      // 计算校验和
      const checksum = await this.calculateChecksum(content)

      return {
        success: true,
        filePath,
        savedAt: Date.now(),
        checksum,
        bytesWritten: data.length,
        duration: 0
      }
    } catch (error) {
      throw new Error(`文件写入失败: ${error.message}`)
    }
  }

  private async writeInChunks(
    writable: FileSystemWritableFileStream,
    data: Uint8Array,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const chunkSize = 64 * 1024 // 64KB
    const totalSize = data.length
    let written = 0

    for (let offset = 0; offset < totalSize; offset += chunkSize) {
      const chunk = data.slice(offset, offset + chunkSize)
      await writable.write(chunk)
      
      written += chunk.length
      onProgress?.(written / totalSize)
      
      // 让出主线程
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  private async verifyWrite(
    fileHandle: FileSystemFileHandle,
    originalContent: string
  ): Promise<{ valid: boolean, error?: string }> {
    try {
      const file = await fileHandle.getFile()
      const savedContent = await file.text()
      
      if (savedContent === originalContent) {
        return { valid: true }
      } else {
        return { 
          valid: false, 
          error: '保存的内容与原内容不匹配' 
        }
      }
    } catch (error) {
      return { 
        valid: false, 
        error: `验证失败: ${error.message}` 
      }
    }
  }

  private validateContent(content: string): void {
    // 基础内容验证
    if (typeof content !== 'string') {
      throw new Error('内容必须是字符串类型')
    }
    
    if (content.length > 100 * 1024 * 1024) { // 100MB
      throw new Error('文件内容超过大小限制')
    }

    // 检查特殊字符
    const invalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
    if (invalidChars.test(content)) {
      console.warn('内容包含可能有问题的控制字符')
    }
  }

  private async calculateChecksum(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async getFilePath(fileHandle: FileSystemFileHandle): Promise<string> {
    // 这是一个简化实现，实际中需要更复杂的路径解析
    return fileHandle.name
  }
}

// 文件锁管理器
class FileLockManager {
  private locks = new Map<string, string>()
  private waitQueue = new Map<string, Array<{ resolve: Function, lockId: string }>>()

  async acquire(filePath: string, timeout = 30000): Promise<string> {
    const lockId = this.generateLockId()
    
    if (!this.locks.has(filePath)) {
      this.locks.set(filePath, lockId)
      return lockId
    }

    // 等待锁释放
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.removeFromQueue(filePath, lockId)
        reject(new Error(`获取文件锁超时: ${filePath}`))
      }, timeout)

      const waiter = {
        resolve: (acquiredLockId: string) => {
          clearTimeout(timeoutId)
          resolve(acquiredLockId)
        },
        lockId
      }

      if (!this.waitQueue.has(filePath)) {
        this.waitQueue.set(filePath, [])
      }
      this.waitQueue.get(filePath)!.push(waiter)
    })
  }

  release(lockId: string): void {
    for (const [filePath, currentLockId] of this.locks.entries()) {
      if (currentLockId === lockId) {
        this.locks.delete(filePath)
        
        // 处理等待队列
        const queue = this.waitQueue.get(filePath)
        if (queue && queue.length > 0) {
          const nextWaiter = queue.shift()!
          this.locks.set(filePath, nextWaiter.lockId)
          nextWaiter.resolve(nextWaiter.lockId)
        }
        
        if (!queue || queue.length === 0) {
          this.waitQueue.delete(filePath)
        }
        break
      }
    }
  }

  private generateLockId(): string {
    return `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private removeFromQueue(filePath: string, lockId: string): void {
    const queue = this.waitQueue.get(filePath)
    if (queue) {
      const index = queue.findIndex(w => w.lockId === lockId)
      if (index !== -1) {
        queue.splice(index, 1)
      }
    }
  }
}
```

### Task 3.2.2: 增量同步引擎
**预估时间**: 2小时
**具体内容**:
- 开发高效的文件差分算法
- 实现增量更新和同步机制
- 建立同步状态监控系统

**增量同步引擎**:
```typescript
// core/sync/IncrementalSyncEngine.ts
export interface SyncState {
  filePath: string
  lastSyncTime: number
  localChecksum: string
  remoteChecksum: string
  syncStatus: 'synced' | 'local_changed' | 'conflict' | 'error'
  changesSummary: {
    additions: number
    deletions: number
    modifications: number
  }
}

export interface SyncOptions {
  forceSync?: boolean
  diffGranularity?: 'line' | 'word' | 'char'
  maxSyncSize?: number
  onProgress?: (progress: SyncProgress) => void
}

export interface SyncProgress {
  filePath: string
  phase: 'analyzing' | 'diffing' | 'applying' | 'complete'
  progress: number
  message: string
}

export class IncrementalSyncEngine {
  private syncStates = new Map<string, SyncState>()
  private activeSyncs = new Set<string>()

  // 同步单个文件
  async syncFile(
    fileHandle: FileSystemFileHandle,
    localContent: string,
    options: SyncOptions = {}
  ): Promise<SyncState> {
    const filePath = fileHandle.name
    
    if (this.activeSyncs.has(filePath)) {
      throw new Error(`文件 ${filePath} 正在同步中`)
    }

    this.activeSyncs.add(filePath)
    
    try {
      return await this.executeSyncFile(fileHandle, localContent, options)
    } finally {
      this.activeSyncs.delete(filePath)
    }
  }

  // 批量同步文件
  async syncMultipleFiles(
    files: Array<{
      fileHandle: FileSystemFileHandle
      localContent: string
      options?: SyncOptions
    }>
  ): Promise<SyncState[]> {
    const results: SyncState[] = []
    
    // 串行同步，避免I/O竞争
    for (const { fileHandle, localContent, options } of files) {
      try {
        const result = await this.syncFile(fileHandle, localContent, options)
        results.push(result)
      } catch (error) {
        results.push({
          filePath: fileHandle.name,
          lastSyncTime: Date.now(),
          localChecksum: '',
          remoteChecksum: '',
          syncStatus: 'error',
          changesSummary: {
            additions: 0,
            deletions: 0,
            modifications: 0
          }
        })
      }
    }

    return results
  }

  private async executeSyncFile(
    fileHandle: FileSystemFileHandle,
    localContent: string,
    options: SyncOptions
  ): Promise<SyncState> {
    const filePath = fileHandle.name
    
    options.onProgress?.({
      filePath,
      phase: 'analyzing',
      progress: 0.1,
      message: '分析文件状态...'
    })

    // 获取当前远程内容
    const remoteContent = await this.getRemoteContent(fileHandle)
    const localChecksum = await this.calculateChecksum(localContent)
    const remoteChecksum = await this.calculateChecksum(remoteContent)

    // 获取上次同步状态
    const lastSyncState = this.syncStates.get(filePath)
    
    options.onProgress?.({
      filePath,
      phase: 'diffing',
      progress: 0.3,
      message: '计算文件差异...'
    })

    // 检查是否需要同步
    if (!options.forceSync && localChecksum === remoteChecksum) {
      const syncState: SyncState = {
        filePath,
        lastSyncTime: Date.now(),
        localChecksum,
        remoteChecksum,
        syncStatus: 'synced',
        changesSummary: { additions: 0, deletions: 0, modifications: 0 }
      }
      
      this.syncStates.set(filePath, syncState)
      
      options.onProgress?.({
        filePath,
        phase: 'complete',
        progress: 1.0,
        message: '文件已同步'
      })
      
      return syncState
    }

    // 执行差分分析
    const diff = this.computeDiff(remoteContent, localContent, options.diffGranularity)
    
    options.onProgress?.({
      filePath,
      phase: 'applying',
      progress: 0.7,
      message: '应用更改...'
    })

    // 应用更改到远程文件
    const applyResult = await this.applyChanges(fileHandle, diff, options)
    
    const syncState: SyncState = {
      filePath,
      lastSyncTime: Date.now(),
      localChecksum,
      remoteChecksum: applyResult.newChecksum,
      syncStatus: applyResult.success ? 'synced' : 'error',
      changesSummary: diff.summary
    }

    this.syncStates.set(filePath, syncState)
    
    options.onProgress?.({
      filePath,
      phase: 'complete',
      progress: 1.0,
      message: applyResult.success ? '同步完成' : '同步失败'
    })

    return syncState
  }

  private computeDiff(
    oldContent: string,
    newContent: string,
    granularity: SyncOptions['diffGranularity'] = 'line'
  ) {
    switch (granularity) {
      case 'line':
        return this.computeLineDiff(oldContent, newContent)
      case 'word':
        return this.computeWordDiff(oldContent, newContent)
      case 'char':
        return this.computeCharDiff(oldContent, newContent)
      default:
        return this.computeLineDiff(oldContent, newContent)
    }
  }

  private computeLineDiff(oldContent: string, newContent: string) {
    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')
    
    const additions: string[] = []
    const deletions: string[] = []
    const modifications: Array<{ oldLine: string, newLine: string, index: number }> = []

    // 简化的LCS算法实现
    const lcs = this.longestCommonSubsequence(oldLines, newLines)
    
    let oldIndex = 0
    let newIndex = 0
    let lcsIndex = 0

    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      if (lcsIndex < lcs.length && 
          oldIndex < oldLines.length && 
          oldLines[oldIndex] === lcs[lcsIndex]) {
        // 匹配的行
        oldIndex++
        newIndex++
        lcsIndex++
      } else if (lcsIndex < lcs.length && 
                 newIndex < newLines.length && 
                 newLines[newIndex] === lcs[lcsIndex]) {
        // 新增的行
        additions.push(newLines[newIndex])
        newIndex++
      } else if (oldIndex < oldLines.length) {
        // 删除的行
        deletions.push(oldLines[oldIndex])
        oldIndex++
      } else {
        // 新增的行
        additions.push(newLines[newIndex])
        newIndex++
      }
    }

    return {
      additions,
      deletions,
      modifications,
      summary: {
        additions: additions.length,
        deletions: deletions.length,
        modifications: modifications.length
      },
      patches: this.generatePatches(additions, deletions, modifications)
    }
  }

  private longestCommonSubsequence(arr1: string[], arr2: string[]): string[] {
    const m = arr1.length
    const n = arr2.length
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    // 回溯构建LCS
    const lcs: string[] = []
    let i = m, j = n
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        lcs.unshift(arr1[i - 1])
        i--
        j--
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--
      } else {
        j--
      }
    }

    return lcs
  }

  private generatePatches(
    additions: string[],
    deletions: string[],
    modifications: Array<{ oldLine: string, newLine: string, index: number }>
  ) {
    return {
      add: additions,
      remove: deletions,
      modify: modifications
    }
  }

  private async applyChanges(
    fileHandle: FileSystemFileHandle,
    diff: any,
    options: SyncOptions
  ) {
    try {
      // 这里应用具体的更改逻辑
      // 简化实现：直接重写整个文件
      const newContent = await this.reconstructContent(fileHandle, diff)
      
      // 使用FileSaverEngine保存
      const fileSaver = new (await import('./FileSaverEngine')).FileSaverEngine()
      const saveResult = await fileSaver.saveFile(fileHandle, newContent, {
        atomic: true,
        backup: true,
        validateContent: true
      })

      return {
        success: saveResult.success,
        newChecksum: saveResult.checksum,
        error: saveResult.error
      }
    } catch (error) {
      return {
        success: false,
        newChecksum: '',
        error: error.message
      }
    }
  }

  private async getRemoteContent(fileHandle: FileSystemFileHandle): Promise<string> {
    try {
      const file = await fileHandle.getFile()
      return await file.text()
    } catch (error) {
      console.error('获取远程内容失败:', error)
      return ''
    }
  }

  private async calculateChecksum(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async reconstructContent(fileHandle: FileSystemFileHandle, diff: any): Promise<string> {
    // 简化实现：这里应该根据diff重构内容
    // 实际实现需要更复杂的patch应用逻辑
    const currentContent = await this.getRemoteContent(fileHandle)
    return currentContent // 占位实现
  }

  // 获取同步状态
  getSyncState(filePath: string): SyncState | null {
    return this.syncStates.get(filePath) || null
  }

  // 获取所有同步状态
  getAllSyncStates(): Map<string, SyncState> {
    return new Map(this.syncStates)
  }
}
```

### Task 3.2.3: 冲突检测和解决
**预估时间**: 1.5小时
**具体内容**:
- 开发文件冲突自动检测机制
- 实现冲突解决策略和用户选择
- 建立冲突历史记录和恢复功能

**冲突检测系统**:
```typescript
// core/conflict/ConflictResolver.ts
export interface FileConflict {
  filePath: string
  conflictType: 'modification' | 'deletion' | 'creation' | 'permission'
  localVersion: {
    content: string
    checksum: string
    lastModified: number
  }
  remoteVersion: {
    content: string
    checksum: string
    lastModified: number
  }
  commonAncestor?: {
    content: string
    checksum: string
    lastModified: number
  }
}

export interface ResolutionStrategy {
  type: 'use_local' | 'use_remote' | 'merge_auto' | 'merge_manual'
  mergedContent?: string
  userChoices?: Map<string, 'local' | 'remote' | 'merged'>
}

export class ConflictResolver {
  private conflictHistory = new Map<string, FileConflict[]>()

  // 检测文件冲突
  async detectConflict(
    fileHandle: FileSystemFileHandle,
    localContent: string,
    localChecksum: string
  ): Promise<FileConflict | null> {
    const filePath = fileHandle.name

    try {
      const remoteFile = await fileHandle.getFile()
      const remoteContent = await remoteFile.text()
      const remoteChecksum = await this.calculateChecksum(remoteContent)

      // 如果校验和相同，没有冲突
      if (localChecksum === remoteChecksum) {
        return null
      }

      const conflict: FileConflict = {
        filePath,
        conflictType: 'modification',
        localVersion: {
          content: localContent,
          checksum: localChecksum,
          lastModified: Date.now()
        },
        remoteVersion: {
          content: remoteContent,
          checksum: remoteChecksum,
          lastModified: remoteFile.lastModified
        }
      }

      // 记录冲突历史
      this.addToConflictHistory(filePath, conflict)

      return conflict
    } catch (error) {
      console.error('冲突检测失败:', error)
      return null
    }
  }

  // 自动解决冲突
  async resolveConflictAuto(
    conflict: FileConflict,
    strategy: ResolutionStrategy
  ): Promise<{ success: boolean, resolvedContent: string, error?: string }> {
    try {
      let resolvedContent: string

      switch (strategy.type) {
        case 'use_local':
          resolvedContent = conflict.localVersion.content
          break

        case 'use_remote':
          resolvedContent = conflict.remoteVersion.content
          break

        case 'merge_auto':
          resolvedContent = await this.performAutoMerge(conflict)
          break

        case 'merge_manual':
          if (!strategy.mergedContent) {
            throw new Error('手动合并需要提供合并后的内容')
          }
          resolvedContent = strategy.mergedContent
          break

        default:
          throw new Error(`未知的解决策略: ${strategy.type}`)
      }

      return {
        success: true,
        resolvedContent
      }
    } catch (error) {
      return {
        success: false,
        resolvedContent: '',
        error: error.message
      }
    }
  }

  // 执行自动合并
  private async performAutoMerge(conflict: FileConflict): Promise<string> {
    const localLines = conflict.localVersion.content.split('\n')
    const remoteLines = conflict.remoteVersion.content.split('\n')

    // 使用三路合并算法
    if (conflict.commonAncestor) {
      return this.threeWayMerge(
        conflict.commonAncestor.content,
        conflict.localVersion.content,
        conflict.remoteVersion.content
      )
    }

    // 简单的两路合并
    return this.twoWayMerge(
      conflict.localVersion.content,
      conflict.remoteVersion.content
    )
  }

  private threeWayMerge(ancestor: string, local: string, remote: string): string {
    const ancestorLines = ancestor.split('\n')
    const localLines = local.split('\n')
    const remoteLines = remote.split('\n')

    const mergedLines: string[] = []
    const maxLength = Math.max(ancestorLines.length, localLines.length, remoteLines.length)

    for (let i = 0; i < maxLength; i++) {
      const ancestorLine = ancestorLines[i] || ''
      const localLine = localLines[i] || ''
      const remoteLine = remoteLines[i] || ''

      if (localLine === remoteLine) {
        // 两边相同，使用任意一边
        mergedLines.push(localLine)
      } else if (localLine === ancestorLine) {
        // 本地未改变，使用远程
        mergedLines.push(remoteLine)
      } else if (remoteLine === ancestorLine) {
        // 远程未改变，使用本地
        mergedLines.push(localLine)
      } else {
        // 两边都改变了，产生冲突标记
        mergedLines.push(`<<<<<<< LOCAL`)
        mergedLines.push(localLine)
        mergedLines.push(`=======`)
        mergedLines.push(remoteLine)
        mergedLines.push(`>>>>>>> REMOTE`)
      }
    }

    return mergedLines.join('\n')
  }

  private twoWayMerge(local: string, remote: string): string {
    const localLines = local.split('\n')
    const remoteLines = remote.split('\n')

    // 找到最长公共子序列
    const commonLines = this.longestCommonSubsequence(localLines, remoteLines)
    
    const mergedLines: string[] = []
    let localIndex = 0
    let remoteIndex = 0
    let commonIndex = 0

    while (localIndex < localLines.length || remoteIndex < remoteLines.length) {
      if (commonIndex < commonLines.length &&
          localIndex < localLines.length &&
          localLines[localIndex] === commonLines[commonIndex]) {
        
        mergedLines.push(localLines[localIndex])
        localIndex++
        
        // 跳过远程中相同的行
        while (remoteIndex < remoteLines.length && 
               remoteLines[remoteIndex] !== commonLines[commonIndex]) {
          remoteIndex++
        }
        remoteIndex++
        commonIndex++
        
      } else if (localIndex < localLines.length) {
        mergedLines.push(localLines[localIndex])
        localIndex++
      } else if (remoteIndex < remoteLines.length) {
        mergedLines.push(remoteLines[remoteIndex])
        remoteIndex++
      }
    }

    return mergedLines.join('\n')
  }

  private longestCommonSubsequence(arr1: string[], arr2: string[]): string[] {
    // 复用之前实现的LCS算法
    const m = arr1.length
    const n = arr2.length
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    const lcs: string[] = []
    let i = m, j = n
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        lcs.unshift(arr1[i - 1])
        i--
        j--
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--
      } else {
        j--
      }
    }

    return lcs
  }

  private addToConflictHistory(filePath: string, conflict: FileConflict): void {
    if (!this.conflictHistory.has(filePath)) {
      this.conflictHistory.set(filePath, [])
    }
    
    const history = this.conflictHistory.get(filePath)!
    history.push(conflict)
    
    // 保持历史记录数量限制
    if (history.length > 10) {
      history.shift()
    }
  }

  private async calculateChecksum(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // 获取冲突历史
  getConflictHistory(filePath: string): FileConflict[] {
    return this.conflictHistory.get(filePath) || []
  }

  // 清理冲突历史
  clearConflictHistory(filePath?: string): void {
    if (filePath) {
      this.conflictHistory.delete(filePath)
    } else {
      this.conflictHistory.clear()
    }
  }
}
```

## 验收标准
1. 文件保存引擎稳定可靠，保存成功率>99%
2. 原子写入机制工作正常，支持回滚和恢复
3. 增量同步效率高，只更新变更部分  
4. 冲突检测准确，自动解决策略有效
5. 并发保存处理正确，无数据竞争
6. 性能指标达标，大文件保存流畅

## 依赖关系
- 依赖Story3.1的文件读取引擎
- 需要Fullstack Story3.1的文件操作协议
- 为Story3.3自动保存提供保存引擎
- 为前端组件提供保存状态反馈