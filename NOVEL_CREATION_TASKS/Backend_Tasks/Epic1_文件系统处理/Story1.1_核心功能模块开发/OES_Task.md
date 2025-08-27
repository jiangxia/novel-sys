# Story 1.1: 核心功能模块开发

## O (Objective)
### 功能目标
- 开发文件系统访问和目录处理核心功能
- 实现目录识别算法和分类逻辑
- 建立目录创建和验证机制

### 技术目标  
- 封装File System Access API，提供统一接口
- 设计高效的目录分析算法
- 确保跨浏览器兼容性和错误处理

## E (Environment)
### 技术环境
- 现代JavaScript ES6+ + Browser APIs
- File System Access API (Chrome 86+, Edge 86+)
- 异步编程模式，Promise/async-await

### 依赖环境
- Fullstack Story1.1的数据格式协议
- 浏览器API兼容性要求
- 目录识别关键词规范

## S (Success Criteria)

### 及格标准
- 文件系统访问功能稳定可靠
- 目录识别准确率达到100%（标准关键词）
- 目录创建成功率>95%

### 优秀标准
- 支持模糊匹配和智能识别
- 性能优秀，大目录处理流畅
- 错误处理全面，用户体验友好

## 具体任务分解

### Task 1.1.1: 文件系统访问管理器
**预估时间**: 1.5小时
**具体内容**:
- 封装File System Access API
- 实现浏览器兼容性检查
- 建立权限管理和错误处理机制

**核心模块架构**:
```javascript
// utils/FileSystemManager.js
export class FileSystemManager {
  constructor() {
    this.isSupported = 'showDirectoryPicker' in window
    this.currentDirectoryHandle = null
  }

  // 检查浏览器支持
  checkSupport() {
    return {
      isSupported: this.isSupported,
      version: this.getBrowserVersion(),
      recommendations: this.isSupported ? null : [
        '请使用Chrome 86+或Edge 86+浏览器',
        '确保浏览器已启用实验性功能'
      ]
    }
  }

  // 选择目录
  async selectDirectory(options = {}) {
    if (!this.isSupported) {
      throw new UnsupportedError('BROWSER_NOT_SUPPORTED')
    }

    try {
      const directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
        ...options
      })
      
      this.currentDirectoryHandle = directoryHandle
      return directoryHandle
    } catch (error) {
      throw this.handlePickerError(error)
    }
  }

  // 读取目录内容
  async readDirectory(directoryHandle = this.currentDirectoryHandle) {
    if (!directoryHandle) {
      throw new Error('DIRECTORY_NOT_SELECTED')
    }

    const entries = []
    try {
      for await (const [name, handle] of directoryHandle.entries()) {
        if (handle.kind === 'directory') {
          entries.push({
            name,
            handle,
            type: 'directory',
            originalName: name
          })
        }
      }
      return entries
    } catch (error) {
      throw new Error(`DIRECTORY_READ_FAILED: ${error.message}`)
    }
  }

  // 检查目录权限
  async verifyPermissions(directoryHandle, mode = 'readwrite') {
    try {
      const permission = await directoryHandle.queryPermission({ mode })
      if (permission === 'granted') return true
      
      const requestResult = await directoryHandle.requestPermission({ mode })
      return requestResult === 'granted'
    } catch (error) {
      return false
    }
  }
}
```

### Task 1.1.2: 目录分类识别器
**预估时间**: 2小时
**具体内容**:
- 实现基于关键词的目录分类算法
- 支持模糊匹配和相似度计算
- 添加自定义规则和学习能力

**识别算法核心**:
```javascript
// utils/DirectoryClassifier.js
export class DirectoryClassifier {
  constructor() {
    this.keywordRules = {
      setting: {
        primary: ['设定', '世界观', '人物设定'],
        secondary: ['背景', '世界', '角色'],
        patterns: [/\d*-*设定/, /世界.*设定/, /人物.*设定/],
        weight: 1.0
      },
      outline: {
        primary: ['大纲', '故事大纲', '剧情大纲'],  
        secondary: ['故事线', '情节', '架构'],
        patterns: [/\d*-*大纲/, /故事.*大纲/, /剧情.*大纲/],
        weight: 1.0
      },
      summary: {
        primary: ['概要', '故事概要', '剧情概要'],
        secondary: ['梗概', '简介', '摘要'], 
        patterns: [/\d*-*概要/, /故事.*概要/, /剧情.*概要/],
        weight: 0.9
      },
      content: {
        primary: ['内容', '正文', '章节'],
        secondary: ['文本', '小说', '写作'],
        patterns: [/\d*-*内容/, /正文/, /章节/],
        weight: 1.0
      }
    }
  }

  // 分类单个目录
  classifyDirectory(directoryName) {
    const normalizedName = directoryName.toLowerCase().trim()
    let bestMatch = {
      category: 'unknown',
      confidence: 0,
      matchedKeyword: null,
      matchType: null
    }

    // 遍历所有分类规则
    for (const [category, rules] of Object.entries(this.keywordRules)) {
      const match = this.calculateMatch(normalizedName, rules)
      
      if (match.confidence > bestMatch.confidence) {
        bestMatch = {
          category,
          confidence: match.confidence * rules.weight,
          matchedKeyword: match.keyword,
          matchType: match.type,
          originalName: directoryName
        }
      }
    }

    return bestMatch
  }

  // 批量分类目录
  classifyDirectories(directories) {
    const results = {
      setting: [],
      outline: [],
      summary: [], 
      content: [],
      unknown: []
    }

    // 对每个目录进行分类
    directories.forEach(directory => {
      const classification = this.classifyDirectory(directory.name)
      const enrichedDirectory = {
        ...directory,
        classification
      }
      
      results[classification.category].push(enrichedDirectory)
    })

    // 生成统计摘要
    const summary = {
      total: directories.length,
      identified: directories.length - results.unknown.length,
      missing: this.findMissingCategories(results),
      duplicates: this.findDuplicateCategories(results),
      isComplete: this.checkStructureCompleteness(results)
    }

    return { results, summary, timestamp: new Date().toISOString() }
  }

  // 计算匹配度
  calculateMatch(dirName, rules) {
    // 精确匹配
    for (const keyword of rules.primary) {
      if (dirName === keyword) {
        return { confidence: 1.0, keyword, type: 'exact' }
      }
    }

    // 包含匹配
    for (const keyword of rules.primary) {
      if (dirName.includes(keyword)) {
        return { confidence: 0.9, keyword, type: 'contains' }
      }
    }

    // 正则模式匹配
    for (const pattern of rules.patterns) {
      if (pattern.test(dirName)) {
        return { confidence: 0.8, keyword: pattern.source, type: 'pattern' }
      }
    }

    // 二级关键词匹配
    for (const keyword of rules.secondary) {
      if (dirName.includes(keyword)) {
        return { confidence: 0.6, keyword, type: 'secondary' }
      }
    }

    return { confidence: 0, keyword: null, type: null }
  }
}
```

### Task 1.1.3: 目录创建管理器
**预估时间**: 1.5小时
**具体内容**:
- 实现智能目录创建功能
- 支持批量创建和进度跟踪
- 添加冲突检测和恢复机制

**创建管理器**:
```javascript
// utils/DirectoryCreator.js  
export class DirectoryCreator {
  constructor() {
    this.standardTemplate = [
      { name: '0-小说设定', category: 'setting', priority: 1 },
      { name: '1-故事大纲', category: 'outline', priority: 2 },
      { name: '2-故事概要', category: 'summary', priority: 3 },
      { name: '3-小说内容', category: 'content', priority: 4 }
    ]
  }

  // 创建标准目录结构
  async createStandardDirectories(parentHandle, progressCallback) {
    const results = {
      created: [],
      failed: [],
      skipped: [],
      total: this.standardTemplate.length
    }

    for (let i = 0; i < this.standardTemplate.length; i++) {
      const template = this.standardTemplate[i]
      
      try {
        // 检查是否已存在
        const exists = await this.checkDirectoryExists(parentHandle, template.name)
        if (exists) {
          results.skipped.push({ ...template, reason: 'already_exists' })
          continue
        }

        // 更新进度
        progressCallback?.({
          current: i + 1,
          total: this.standardTemplate.length,
          currentItem: template.name,
          status: 'creating'
        })

        // 创建目录
        const dirHandle = await parentHandle.getDirectoryHandle(
          template.name, 
          { create: true }
        )

        results.created.push({
          ...template,
          handle: dirHandle,
          createdAt: new Date().toISOString()
        })

        // 短暂延迟，优化用户体验
        await this.delay(200)

      } catch (error) {
        results.failed.push({
          ...template,
          error: error.message,
          failedAt: new Date().toISOString()
        })
      }
    }

    return results
  }

  // 创建用户选择的目录
  async createSelectedDirectories(parentHandle, selections, progressCallback) {
    const items = Object.values(selections)
    const results = { created: [], failed: [], total: items.length }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      try {
        progressCallback?.({
          current: i + 1,
          total: items.length,
          currentItem: item.name,
          status: 'creating'
        })

        const dirHandle = await parentHandle.getDirectoryHandle(
          item.name,
          { create: true }
        )

        results.created.push({
          ...item,
          handle: dirHandle,
          createdAt: new Date().toISOString()
        })

      } catch (error) {
        results.failed.push({
          ...item,
          error: error.message
        })
      }
    }

    return results
  }
}
```

### Task 1.1.4: 错误处理和验证工具
**预估时间**: 1小时
**具体内容**:
- 建立统一错误处理机制
- 实现数据验证和格式检查
- 添加诊断和调试工具

**错误处理系统**:
```javascript
// utils/ErrorHandler.js
export class ErrorHandler {
  static createError(code, message, context = {}) {
    const error = new Error(message)
    error.code = code
    error.context = context
    error.timestamp = new Date().toISOString()
    return error
  }

  static handleFileSystemError(error) {
    const errorMap = {
      'AbortError': 'USER_CANCELLED',
      'NotAllowedError': 'PERMISSION_DENIED', 
      'SecurityError': 'SECURITY_VIOLATION',
      'NotFoundError': 'DIRECTORY_NOT_FOUND'
    }

    const code = errorMap[error.name] || 'UNKNOWN_ERROR'
    return this.createError(code, this.getUserMessage(code), { originalError: error })
  }

  static getUserMessage(code) {
    const messages = {
      'USER_CANCELLED': '用户取消了操作',
      'PERMISSION_DENIED': '没有访问目录的权限',
      'BROWSER_NOT_SUPPORTED': '浏览器不支持文件系统访问功能',
      'DIRECTORY_READ_FAILED': '读取目录内容失败',
      'DIRECTORY_CREATE_FAILED': '创建目录失败'
    }
    return messages[code] || '发生未知错误'
  }
}
```

## 验收标准
1. 文件系统访问功能在支持的浏览器中100%可用
2. 目录识别准确率达到标准关键词100%匹配
3. 目录创建成功率>95%，失败情况有合理处理
4. 错误处理覆盖全面，用户提示友好
5. 代码结构清晰，易于维护和扩展

## 依赖关系
- 需要Fullstack Story1.1的协议规范作为开发指导
- 为Fullstack Story1.2提供核心功能支撑