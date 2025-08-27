# Story 3.1: 文件读取和缓存引擎

## O (Objective)
### 功能目标
- 开发高效的文件读取引擎，支持各种文本格式
- 实现智能文件缓存机制，提升读取性能
- 建立文件内容解析和格式化系统

### 技术目标  
- 设计可扩展的文件读取架构
- 实现内存高效的缓存策略
- 确保大文件读取的性能和稳定性

## E (Environment)
### 技术环境
- File System Access API + FileReader API
- Web Workers + 流式处理 + 异步读取
- LRU缓存算法 + IndexedDB本地存储

### 依赖环境
- Epic 1的文件系统管理器基础
- Fullstack Story3.1的文件操作协议
- 浏览器文件API兼容性支持

## S (Success Criteria)

### 及格标准
- 文件读取功能稳定，支持常见文本格式
- 缓存机制工作正常，重复读取性能提升明显
- 大文件(>5MB)读取不阻塞主线程

### 优秀标准
- 读取性能优秀，1MB文件<100ms完成
- 缓存命中率>80%，内存使用合理
- 支持增量读取和流式处理

## 具体任务分解

### Task 3.1.1: 核心文件读取引擎
**预估时间**: 2.5小时
**具体内容**:
- 开发统一的文件读取接口
- 实现多种文件格式的解析器
- 建立错误处理和重试机制

**文件读取引擎架构**:
```typescript
// core/fileReader/FileReaderEngine.ts
export interface FileReadOptions {
  encoding?: 'utf-8' | 'gbk' | 'utf-16'
  maxSize?: number
  useWorker?: boolean
  chunkSize?: number
  onProgress?: (progress: number) => void
}

export interface FileReadResult {
  content: string
  metadata: {
    size: number
    lastModified: number
    encoding: string
    lineCount: number
    wordCount: number
    readTime: number
  }
  checksum: string
}

export class FileReaderEngine {
  private workerPool: Worker[] = []
  private readonly maxWorkers = 2

  constructor() {
    this.initializeWorkerPool()
  }

  // 主要文件读取方法
  async readFile(
    fileHandle: FileSystemFileHandle, 
    options: FileReadOptions = {}
  ): Promise<FileReadResult> {
    const startTime = performance.now()
    
    try {
      // 获取文件基础信息
      const file = await fileHandle.getFile()
      const metadata = await this.extractMetadata(file)
      
      // 检查文件大小限制
      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(`文件大小 ${file.size} 超过限制 ${options.maxSize}`)
      }

      // 选择读取策略
      const readStrategy = this.selectReadStrategy(file.size, options)
      const content = await this.executeReadStrategy(file, readStrategy, options)
      
      // 计算校验和
      const checksum = await this.calculateChecksum(content)
      
      return {
        content,
        metadata: {
          ...metadata,
          readTime: performance.now() - startTime
        },
        checksum
      }
    } catch (error) {
      throw new Error(`文件读取失败: ${error.message}`)
    }
  }

  // 流式读取大文件
  async readFileStream(
    fileHandle: FileSystemFileHandle,
    chunkCallback: (chunk: string, progress: number) => void,
    options: FileReadOptions = {}
  ): Promise<void> {
    const file = await fileHandle.getFile()
    const chunkSize = options.chunkSize || 64 * 1024 // 64KB chunks
    const totalSize = file.size
    let offset = 0

    while (offset < totalSize) {
      const chunk = file.slice(offset, offset + chunkSize)
      const text = await chunk.text()
      
      chunkCallback(text, (offset + chunk.size) / totalSize)
      offset += chunkSize
      
      // 让出主线程
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  // 批量读取文件
  async readMultipleFiles(
    fileHandles: FileSystemFileHandle[],
    options: FileReadOptions = {}
  ): Promise<Map<string, FileReadResult>> {
    const results = new Map<string, FileReadResult>()
    const batchSize = 3 // 并发读取数量

    for (let i = 0; i < fileHandles.length; i += batchSize) {
      const batch = fileHandles.slice(i, i + batchSize)
      
      const batchResults = await Promise.allSettled(
        batch.map(async (handle) => ({
          name: handle.name,
          result: await this.readFile(handle, options)
        }))
      )

      batchResults.forEach((result, index) => {
        const handle = batch[index]
        if (result.status === 'fulfilled') {
          results.set(handle.name, result.value.result)
        } else {
          console.error(`读取文件 ${handle.name} 失败:`, result.reason)
        }
      })
    }

    return results
  }

  private selectReadStrategy(fileSize: number, options: FileReadOptions): 'direct' | 'worker' | 'stream' {
    if (fileSize > 10 * 1024 * 1024) return 'stream' // >10MB 流式读取
    if (fileSize > 1 * 1024 * 1024 || options.useWorker) return 'worker' // >1MB Worker读取
    return 'direct' // 直接读取
  }

  private async executeReadStrategy(
    file: File, 
    strategy: 'direct' | 'worker' | 'stream',
    options: FileReadOptions
  ): Promise<string> {
    switch (strategy) {
      case 'direct':
        return await file.text()
      
      case 'worker':
        return await this.readWithWorker(file, options)
      
      case 'stream':
        return await this.readWithStream(file, options)
      
      default:
        throw new Error(`未知的读取策略: ${strategy}`)
    }
  }

  private async readWithWorker(file: File, options: FileReadOptions): Promise<string> {
    const worker = await this.getAvailableWorker()
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        worker.terminate()
        reject(new Error('Worker读取文件超时'))
      }, 30000) // 30秒超时

      worker.onmessage = (event) => {
        clearTimeout(timeoutId)
        this.releaseWorker(worker)
        
        if (event.data.error) {
          reject(new Error(event.data.error))
        } else {
          resolve(event.data.content)
        }
      }

      worker.onerror = (error) => {
        clearTimeout(timeoutId)
        worker.terminate()
        reject(error)
      }

      worker.postMessage({
        file,
        options
      })
    })
  }

  private async extractMetadata(file: File) {
    // 快速预读一小部分内容来分析文件
    const sample = file.slice(0, 1024)
    const sampleText = await sample.text()
    
    return {
      size: file.size,
      lastModified: file.lastModified,
      encoding: this.detectEncoding(sampleText),
      lineCount: this.countLines(sampleText, file.size),
      wordCount: this.estimateWordCount(sampleText, file.size)
    }
  }

  private detectEncoding(sample: string): string {
    // 简化的编码检测
    if (sample.includes('\ufffd')) return 'unknown'
    return 'utf-8'
  }

  private countLines(sample: string, fileSize: number): number {
    const sampleLines = sample.split('\n').length
    const ratio = fileSize / 1024
    return Math.round(sampleLines * ratio)
  }

  private estimateWordCount(sample: string, fileSize: number): number {
    const sampleWords = sample.split(/\s+/).length
    const ratio = fileSize / 1024  
    return Math.round(sampleWords * ratio)
  }

  private async calculateChecksum(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}
```

### Task 3.1.2: 智能缓存管理系统
**预估时间**: 2小时
**具体内容**:
- 实现LRU缓存算法和内存管理
- 建立多层缓存策略(内存+IndexedDB)
- 添加缓存命中率统计和优化

**缓存管理系统**:
```typescript
// core/cache/FileCacheManager.ts
interface CacheItem {
  key: string
  content: string
  metadata: FileReadResult['metadata']
  checksum: string
  accessTime: number
  accessCount: number
  size: number
}

interface CacheStats {
  memoryHits: number
  memoryMisses: number
  diskHits: number
  diskMisses: number
  totalSize: number
  itemCount: number
}

export class FileCacheManager {
  private memoryCache = new Map<string, CacheItem>()
  private accessOrder: string[] = []
  private stats: CacheStats = {
    memoryHits: 0,
    memoryMisses: 0,
    diskHits: 0,
    diskMisses: 0,
    totalSize: 0,
    itemCount: 0
  }

  constructor(
    private readonly maxMemorySize = 50 * 1024 * 1024, // 50MB
    private readonly maxMemoryItems = 100,
    private readonly maxDiskSize = 200 * 1024 * 1024 // 200MB
  ) {}

  // 获取缓存内容
  async get(filePath: string, lastModified: number): Promise<FileReadResult | null> {
    const cacheKey = this.generateCacheKey(filePath, lastModified)
    
    // 1. 尝试内存缓存
    const memoryResult = this.getFromMemory(cacheKey)
    if (memoryResult) {
      this.stats.memoryHits++
      return memoryResult
    }
    this.stats.memoryMisses++

    // 2. 尝试磁盘缓存
    const diskResult = await this.getFromDisk(cacheKey)
    if (diskResult) {
      this.stats.diskHits++
      // 提升到内存缓存
      this.setInMemory(cacheKey, diskResult)
      return diskResult
    }
    this.stats.diskMisses++

    return null
  }

  // 设置缓存内容
  async set(filePath: string, result: FileReadResult): Promise<void> {
    const cacheKey = this.generateCacheKey(filePath, result.metadata.lastModified)
    const cacheItem: CacheItem = {
      key: cacheKey,
      content: result.content,
      metadata: result.metadata,
      checksum: result.checksum,
      accessTime: Date.now(),
      accessCount: 1,
      size: new Blob([result.content]).size
    }

    // 设置内存缓存
    this.setInMemory(cacheKey, result)
    
    // 异步设置磁盘缓存
    this.setInDisk(cacheKey, cacheItem).catch(error => {
      console.error('磁盘缓存设置失败:', error)
    })
  }

  // 清理过期缓存
  async cleanup(): Promise<void> {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24小时

    // 清理内存缓存
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.accessTime > maxAge) {
        this.removeFromMemory(key)
      }
    }

    // 清理磁盘缓存
    await this.cleanupDiskCache(maxAge)
  }

  // 获取缓存统计
  getCacheStats(): CacheStats & { hitRate: number } {
    const totalRequests = this.stats.memoryHits + this.stats.memoryMisses
    const hitRate = totalRequests > 0 ? (this.stats.memoryHits + this.stats.diskHits) / totalRequests : 0

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    }
  }

  private getFromMemory(cacheKey: string): FileReadResult | null {
    const item = this.memoryCache.get(cacheKey)
    if (!item) return null

    // 更新访问信息
    item.accessTime = Date.now()
    item.accessCount++

    // 更新LRU顺序
    this.updateAccessOrder(cacheKey)

    return {
      content: item.content,
      metadata: item.metadata,
      checksum: item.checksum
    }
  }

  private setInMemory(cacheKey: string, result: FileReadResult): void {
    const size = new Blob([result.content]).size

    // 检查内存限制
    this.ensureMemoryCapacity(size)

    const cacheItem: CacheItem = {
      key: cacheKey,
      content: result.content,
      metadata: result.metadata,
      checksum: result.checksum,
      accessTime: Date.now(),
      accessCount: 1,
      size
    }

    this.memoryCache.set(cacheKey, cacheItem)
    this.accessOrder.push(cacheKey)
    this.stats.totalSize += size
    this.stats.itemCount++
  }

  private ensureMemoryCapacity(newItemSize: number): void {
    while (
      (this.stats.totalSize + newItemSize > this.maxMemorySize) ||
      (this.stats.itemCount >= this.maxMemoryItems)
    ) {
      const oldestKey = this.accessOrder.shift()
      if (oldestKey) {
        this.removeFromMemory(oldestKey)
      } else {
        break
      }
    }
  }

  private removeFromMemory(cacheKey: string): void {
    const item = this.memoryCache.get(cacheKey)
    if (item) {
      this.memoryCache.delete(cacheKey)
      this.stats.totalSize -= item.size
      this.stats.itemCount--
    }

    const orderIndex = this.accessOrder.indexOf(cacheKey)
    if (orderIndex !== -1) {
      this.accessOrder.splice(orderIndex, 1)
    }
  }

  private updateAccessOrder(cacheKey: string): void {
    const index = this.accessOrder.indexOf(cacheKey)
    if (index !== -1) {
      this.accessOrder.splice(index, 1)
      this.accessOrder.push(cacheKey)
    }
  }

  private generateCacheKey(filePath: string, lastModified: number): string {
    return `${filePath}:${lastModified}`
  }

  private async getFromDisk(cacheKey: string): Promise<FileReadResult | null> {
    try {
      const db = await this.openCacheDB()
      const transaction = db.transaction(['files'], 'readonly')
      const store = transaction.objectStore('files')
      const request = store.get(cacheKey)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result
          if (result && this.isValidCacheItem(result)) {
            resolve({
              content: result.content,
              metadata: result.metadata,
              checksum: result.checksum
            })
          } else {
            resolve(null)
          }
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('从磁盘缓存读取失败:', error)
      return null
    }
  }

  private async setInDisk(cacheKey: string, cacheItem: CacheItem): Promise<void> {
    try {
      const db = await this.openCacheDB()
      const transaction = db.transaction(['files'], 'readwrite')
      const store = transaction.objectStore('files')
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(cacheItem)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('设置磁盘缓存失败:', error)
    }
  }

  private isValidCacheItem(item: any): boolean {
    return item && 
           item.content && 
           item.metadata && 
           item.checksum &&
           typeof item.accessTime === 'number'
  }
}
```

### Task 3.1.3: 文件格式解析器
**预估时间**: 1.5小时
**具体内容**:
- 开发Markdown格式专用解析器
- 实现文本文件的编码自动检测
- 添加文件完整性验证机制

**格式解析器**:
```typescript
// core/parsers/FileFormatParser.ts
export interface ParseResult {
  content: string
  structure?: DocumentStructure
  metadata: {
    format: 'markdown' | 'text' | 'unknown'
    encoding: string
    hasFormatErrors: boolean
    errorMessages: string[]
  }
}

export interface DocumentStructure {
  headings: Array<{
    level: number
    text: string
    line: number
  }>
  sections: Array<{
    title: string
    startLine: number
    endLine: number
    wordCount: number
  }>
  links: Array<{
    text: string
    url: string
    line: number
  }>
}

export class FileFormatParser {
  // 解析文件内容
  parse(content: string, filename: string): ParseResult {
    const format = this.detectFormat(filename, content)
    
    switch (format) {
      case 'markdown':
        return this.parseMarkdown(content)
      case 'text':
        return this.parseText(content)
      default:
        return this.parseUnknown(content)
    }
  }

  private detectFormat(filename: string, content: string): 'markdown' | 'text' | 'unknown' {
    const ext = filename.split('.').pop()?.toLowerCase()
    
    if (ext === 'md' || ext === 'markdown') return 'markdown'
    if (ext === 'txt') return 'text'
    
    // 基于内容检测
    if (this.hasMarkdownSyntax(content)) return 'markdown'
    if (this.isPlainText(content)) return 'text'
    
    return 'unknown'
  }

  private parseMarkdown(content: string): ParseResult {
    const lines = content.split('\n')
    const headings: DocumentStructure['headings'] = []
    const sections: DocumentStructure['sections'] = []
    const links: DocumentStructure['links'] = []
    const errors: string[] = []

    let currentSection: { title: string, startLine: number, lines: string[] } | null = null

    lines.forEach((line, index) => {
      const lineNum = index + 1
      
      // 解析标题
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const text = headingMatch[2].trim()
        
        headings.push({ level, text, line: lineNum })
        
        // 结束上一个章节
        if (currentSection) {
          sections.push({
            title: currentSection.title,
            startLine: currentSection.startLine,
            endLine: lineNum - 1,
            wordCount: this.countWords(currentSection.lines.join('\n'))
          })
        }
        
        // 开始新章节
        currentSection = {
          title: text,
          startLine: lineNum,
          lines: []
        }
      }
      
      // 解析链接
      const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)
      for (const match of linkMatches) {
        links.push({
          text: match[1],
          url: match[2],
          line: lineNum
        })
      }
      
      // 添加到当前章节
      if (currentSection) {
        currentSection.lines.push(line)
      }
    })

    // 结束最后一个章节
    if (currentSection) {
      sections.push({
        title: currentSection.title,
        startLine: currentSection.startLine,
        endLine: lines.length,
        wordCount: this.countWords(currentSection.lines.join('\n'))
      })
    }

    return {
      content,
      structure: { headings, sections, links },
      metadata: {
        format: 'markdown',
        encoding: 'utf-8',
        hasFormatErrors: errors.length > 0,
        errorMessages: errors
      }
    }
  }

  private hasMarkdownSyntax(content: string): boolean {
    const markdownPatterns = [
      /^#{1,6}\s+/m,           // 标题
      /\*\*[^*]+\*\*/,         // 粗体
      /\*[^*]+\*/,             // 斜体
      /\[.+\]\(.+\)/,          // 链接
      /^[-*+]\s+/m,            // 无序列表
      /^\d+\.\s+/m,            // 有序列表
      /^>\s+/m,                // 引用
      /```[\s\S]*?```/,        // 代码块
    ]
    
    return markdownPatterns.some(pattern => pattern.test(content))
  }

  private isPlainText(content: string): boolean {
    // 检查是否为纯文本（无特殊格式字符）
    return !/[^\x00-\x7F]/.test(content) || /^[\s\S]*$/.test(content)
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }
}
```

## 验收标准
1. 文件读取引擎支持多种格式，读取性能达标
2. 缓存系统工作正常，命中率>80%，内存使用合理  
3. 大文件读取不阻塞主线程，支持流式处理
4. 文件格式解析准确，Markdown结构识别正确
5. 错误处理完善，异常情况有合理降级
6. 代码架构清晰，接口设计易于扩展

## 依赖关系
- 依赖Epic 1的文件系统管理器基础
- 需要Fullstack Story3.1的文件操作协议
- 为Story3.2文件保存提供读取支撑
- 为前端组件提供文件内容数据