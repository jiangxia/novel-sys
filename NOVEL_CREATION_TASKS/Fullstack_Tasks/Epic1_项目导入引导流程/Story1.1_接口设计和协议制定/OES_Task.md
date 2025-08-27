# Story 1.1: 前后端接口设计和协议制定

## O (Objective)
### 功能目标
- 定义项目导入流程的前后端数据交换协议
- 统一目录识别和处理的数据格式规范
- 建立错误处理和状态同步机制

### 协作目标
- 前后端开发人员达成接口共识
- 确保数据流转顺畅无误
- 建立可扩展的协议框架

## E (Environment)
### 协作环境
- **前端**: React + TailwindCSS + File System Access API
- **后端**: JavaScript工具函数 + 浏览器API
- **协作点**: 数据格式、状态管理、错误处理

### 依赖环境
- File System Access API规范
- 浏览器兼容性要求（Chrome 86+, Edge 86+）
- 目录结构识别需求（关键词: 设定、大纲、概要、内容）

## S (Success Criteria)

### 及格标准
- 数据格式规范定义完整
- 接口协议文档清晰可执行
- 错误处理机制覆盖主要异常

### 优秀标准
- 接口设计具备良好扩展性
- 数据格式支持未来功能需求
- 协议文档包含完整示例

### 协作标准
- 前后端开发人员理解一致
- 接口规范可直接指导开发
- 数据格式经过验证可行

## 前后端协作任务分解

### Task 1.1.1: 目录数据格式定义
**预估时间**: 1小时  
**责任**: 全栈协作
**具体内容**:
- 定义目录信息数据结构
- 制定识别结果数据格式
- 设计状态枚举和错误码

**核心数据格式**:
```javascript
// 目录信息数据结构
const DirectoryInfo = {
  name: string,           // 目录名称
  handle: DirectoryHandle, // 文件系统句柄
  type: 'directory',
  originalName: string,   // 原始名称（用于显示）
  classification: {       // 识别结果
    category: 'setting' | 'outline' | 'summary' | 'content' | 'unknown',
    confidence: number,   // 0-1，匹配置信度
    matchedKeyword: string | null,
    reason: string       // 匹配原因说明
  }
}

// 识别结果数据格式
const ClassificationResult = {
  results: {
    setting: DirectoryInfo[],
    outline: DirectoryInfo[],
    summary: DirectoryInfo[],
    content: DirectoryInfo[],
    unknown: DirectoryInfo[]
  },
  summary: {
    total: number,        // 总目录数
    identified: number,   // 已识别数
    missing: string[],    // 缺失的类别
    isComplete: boolean   // 结构是否完整
  },
  timestamp: string
}

// 状态枚举
const ImportStatus = {
  IDLE: 'idle',                    // 初始状态
  SELECTING: 'selecting',          // 选择目录中
  ANALYZING: 'analyzing',          // 分析目录中
  CREATING: 'creating',            // 创建目录中
  COMPLETED: 'completed',          // 导入完成
  ERROR: 'error'                   // 发生错误
}

// 错误码定义
const ErrorCode = {
  BROWSER_NOT_SUPPORTED: 'BROWSER_NOT_SUPPORTED',
  USER_CANCELLED: 'USER_CANCELLED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DIRECTORY_ACCESS_FAILED: 'DIRECTORY_ACCESS_FAILED',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  CREATION_FAILED: 'CREATION_FAILED'
}
```

### Task 1.1.2: 导入流程状态管理协议
**预估时间**: 1小时
**责任**: 全栈协作  
**具体内容**:
- 设计导入流程状态机
- 定义状态转换规则
- 建立进度反馈机制

**状态管理协议**:
```javascript
// 导入流程状态机
const ImportStateMachine = {
  // 状态转换图
  transitions: {
    idle: ['selecting'],
    selecting: ['analyzing', 'error'],
    analyzing: ['creating', 'completed', 'error'],
    creating: ['completed', 'error'],
    completed: ['idle'],
    error: ['idle', 'selecting']
  },
  
  // 状态数据结构
  state: {
    current: ImportStatus,
    progress: {
      current: number,    // 当前步骤
      total: number,      // 总步骤数
      message: string,    // 进度消息
      percentage: number  // 百分比 0-100
    },
    data: {
      directoryHandle: DirectoryHandle | null,
      classificationResult: ClassificationResult | null,
      creationResult: CreationResult | null
    },
    error: {
      code: ErrorCode | null,
      message: string | null,
      details: any
    }
  }
}

// 进度报告格式
const ProgressReport = {
  step: string,           // 当前步骤名称
  current: number,        // 当前进度
  total: number,          // 总进度
  percentage: number,     // 百分比
  message: string,        // 进度描述
  estimatedTime: number,  // 预计剩余时间(秒)
  data?: any             // 步骤相关数据
}
```

### Task 1.1.3: 错误处理和用户反馈协议
**预估时间**: 0.5小时
**责任**: 全栈协作
**具体内容**:
- 制定统一错误处理机制
- 设计用户友好的错误提示
- 建立错误恢复策略

**错误处理协议**:
```javascript
// 统一错误格式
const AppError = {
  code: ErrorCode,
  message: string,        // 用户友好的错误信息
  technical: string,      // 技术错误详情
  timestamp: string,
  recovery: {             // 恢复策略
    canRetry: boolean,
    retryAction: string,
    alternatives: string[]
  },
  context: any           // 错误上下文信息
}

// 用户反馈消息格式
const UserFeedback = {
  type: 'info' | 'success' | 'warning' | 'error',
  title: string,
  message: string,
  actions?: {
    primary?: { text: string, action: string },
    secondary?: { text: string, action: string }
  },
  autoHide: boolean,
  duration?: number      // 自动隐藏时间(毫秒)
}
```

### Task 1.1.4: 前后端通信约定
**预估时间**: 0.5小时  
**责任**: 全栈协作
**具体内容**:
- 定义前后端数据传递方式
- 建立事件通信机制
- 设计回调函数规范

**通信协议**:
```javascript
// 事件通信机制
const EventProtocol = {
  // 前端 -> 后端事件
  FRONTEND_TO_BACKEND: {
    SELECT_DIRECTORY: 'select:directory',
    ANALYZE_DIRECTORY: 'analyze:directory', 
    CREATE_DIRECTORIES: 'create:directories',
    CANCEL_OPERATION: 'cancel:operation'
  },
  
  // 后端 -> 前端事件  
  BACKEND_TO_FRONTEND: {
    PROGRESS_UPDATE: 'progress:update',
    ANALYSIS_COMPLETE: 'analysis:complete',
    CREATION_COMPLETE: 'creation:complete',
    ERROR_OCCURRED: 'error:occurred'
  }
}

// 回调函数规范
const CallbackSpecs = {
  onProgress: (report: ProgressReport) => void,
  onSuccess: (result: any) => void,
  onError: (error: AppError) => void,
  onStateChange: (oldState: ImportStatus, newState: ImportStatus) => void
}
```

## 验收标准
1. 所有数据格式定义完整且类型安全
2. 状态管理协议覆盖所有业务场景  
3. 错误处理机制健壮且用户友好
4. 通信协议清晰可执行
5. 协议文档可直接指导前后端开发

## 后续衔接
本Story完成后，前端和后端可以基于统一的协议并行开发各自的功能模块。