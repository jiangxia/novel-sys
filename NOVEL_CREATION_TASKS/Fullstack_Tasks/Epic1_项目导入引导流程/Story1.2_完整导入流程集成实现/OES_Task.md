# Story 1.2: 完整导入流程集成实现

## O (Objective)
### 功能目标
- 实现端到端的项目导入用户体验流程
- 集成前后端功能模块，确保流程顺畅
- 提供完整的状态反馈和错误处理

### 协作目标
- 前后端功能深度集成验证
- 用户体验流程优化和测试
- 确保导入成功率达到预期指标

## E (Environment)
### 协作环境
- **前端**: React组件 + 状态管理 + UI反馈
- **后端**: 文件系统处理 + 目录分析 + 业务逻辑
- **协作点**: 完整用户流程、实时状态同步、错误恢复

### 依赖环境
- Story1.1的接口协议规范
- Frontend_Tasks的UI组件（如已完成）
- Backend_Tasks的核心功能（如已完成）

## S (Success Criteria)

### 及格标准
- 导入流程端到端正常工作
- 主要场景（空目录、缺失目录、完整目录）处理正确
- 用户能完成导入并进入下一步

### 优秀标准
- 用户体验流畅，反馈及时清晰
- 导入成功率≥90%，用户满意度高
- 错误处理优雅，恢复机制完善

### 协作标准
- 前后端数据流转无误
- 状态同步实时准确
- 接口调用稳定可靠

## 前后端协作任务分解

### Task 1.2.1: 导入流程主控制器实现
**预估时间**: 2小时
**责任**: 全栈协作
**具体内容**:
- 创建导入流程主控制器
- 实现状态机管理逻辑
- 集成前后端功能模块

**主控制器架构**:
```javascript
// controllers/ImportFlowController.js
export class ImportFlowController {
  constructor() {
    this.state = {
      current: 'idle',
      progress: { current: 0, total: 5, message: '', percentage: 0 },
      data: { directoryHandle: null, classificationResult: null },
      error: { code: null, message: null }
    }
    
    this.eventHandlers = new Map()
    this.fileSystemManager = new FileSystemManager()
    this.directoryClassifier = new DirectoryClassifier()
    this.directoryCreator = new DirectoryCreator()
  }

  // 开始导入流程
  async startImport() {
    this.setState('selecting')
    this.updateProgress(1, 5, '选择项目文件夹...')
    
    try {
      const directoryHandle = await this.fileSystemManager.selectDirectory()
      this.state.data.directoryHandle = directoryHandle
      
      await this.analyzeDirectory()
    } catch (error) {
      this.handleError(error)
    }
  }

  // 分析目录结构
  async analyzeDirectory() {
    this.setState('analyzing')
    this.updateProgress(2, 5, '分析目录结构...')
    
    try {
      const entries = await this.fileSystemManager.readDirectory()
      const classificationResult = this.directoryClassifier.classifyDirectories(entries)
      
      this.state.data.classificationResult = classificationResult
      
      if (classificationResult.summary.isComplete) {
        await this.completeImport()
      } else {
        await this.handleMissingDirectories()
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  // 处理缺失目录
  async handleMissingDirectories() {
    const result = this.state.data.classificationResult
    
    // 根据缺失情况选择处理策略
    if (result.summary.total === 0) {
      // 空目录，自动创建
      await this.createStandardDirectories()
    } else {
      // 部分缺失，提供用户选择
      this.setState('awaiting_user_decision')
      this.emit('missing_directories_detected', result)
    }
  }

  // 创建标准目录
  async createStandardDirectories() {
    this.setState('creating')
    this.updateProgress(3, 5, '创建标准目录结构...')
    
    try {
      const creationResult = await this.directoryCreator.createStandardDirectories(
        this.state.data.directoryHandle,
        (progress) => this.updateProgress(3, 5, `创建中... ${progress.current}/${progress.total}`)
      )
      
      if (creationResult.success.length > 0) {
        // 重新分析更新后的目录
        await this.analyzeDirectory()
      } else {
        throw new Error('目录创建失败')
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  // 完成导入
  async completeImport() {
    this.setState('completed')
    this.updateProgress(5, 5, '导入完成！')
    
    const finalResult = {
      directoryHandle: this.state.data.directoryHandle,
      structure: this.state.data.classificationResult,
      timestamp: new Date().toISOString()
    }
    
    this.emit('import_completed', finalResult)
  }

  // 状态管理方法
  setState(newState) {
    const oldState = this.state.current
    this.state.current = newState
    this.emit('state_changed', { oldState, newState })
  }

  updateProgress(current, total, message) {
    this.state.progress = {
      current,
      total, 
      message,
      percentage: Math.round((current / total) * 100)
    }
    this.emit('progress_updated', this.state.progress)
  }

  handleError(error) {
    this.state.error = this.formatError(error)
    this.setState('error')
    this.emit('error_occurred', this.state.error)
  }
}
```

### Task 1.2.2: 用户交互流程协调
**预估时间**: 1.5小时
**责任**: 全栈协作
**具体内容**:
- 实现用户决策处理逻辑
- 协调UI组件和业务逻辑
- 优化用户体验流程

**交互协调逻辑**:
```javascript
// 用户交互协调器
export class UserInteractionCoordinator {
  constructor(importController, uiManager) {
    this.importController = importController
    this.uiManager = uiManager
    this.setupEventHandlers()
  }

  setupEventHandlers() {
    // 监听导入控制器事件
    this.importController.on('missing_directories_detected', (result) => {
      this.handleMissingDirectories(result)
    })

    this.importController.on('state_changed', ({ oldState, newState }) => {
      this.updateUIState(oldState, newState)
    })

    this.importController.on('progress_updated', (progress) => {
      this.uiManager.updateProgress(progress)
    })

    // 监听UI事件
    this.uiManager.on('user_create_missing', (selections) => {
      this.handleUserCreateDecision(selections)
    })

    this.uiManager.on('user_skip_missing', () => {
      this.handleUserSkipDecision()
    })
  }

  // 处理缺失目录情况
  async handleMissingDirectories(classificationResult) {
    const missingAnalysis = this.analyzeMissingDirectories(classificationResult)
    
    if (missingAnalysis.severity === 'critical') {
      // 严重缺失，强烈建议创建
      this.uiManager.showMissingDirectoriesPrompt(missingAnalysis, {
        recommendAction: 'create',
        allowSkip: false
      })
    } else {
      // 一般缺失，提供选择
      this.uiManager.showMissingDirectoriesPrompt(missingAnalysis, {
        recommendAction: 'create',
        allowSkip: true
      })
    }
  }

  // 处理用户创建决策
  async handleUserCreateDecision(selections) {
    try {
      await this.importController.createSelectedDirectories(selections)
    } catch (error) {
      this.uiManager.showError(error)
    }
  }

  // 处理用户跳过决策  
  async handleUserSkipDecision() {
    await this.importController.completeImport()
  }
}
```

### Task 1.2.3: 端到端流程测试和优化
**预估时间**: 2小时
**责任**: 全栈协作
**具体内容**:
- 测试各种目录结构场景
- 优化流程性能和用户体验
- 完善错误处理和恢复机制

**测试场景覆盖**:
```javascript
// 测试场景定义
const TestScenarios = [
  {
    name: '完全空目录',
    setup: () => createEmptyDirectory(),
    expected: '自动创建4个标准目录',
    flow: 'select → analyze → create → complete'
  },
  {
    name: '标准完整目录',
    setup: () => createStandardDirectories(),
    expected: '直接识别完成导入',
    flow: 'select → analyze → complete'
  },
  {
    name: '部分缺失目录',
    setup: () => createPartialDirectories(['设定', '大纲']),
    expected: '提示用户创建缺失目录',
    flow: 'select → analyze → prompt → create → complete'
  },
  {
    name: '非标准命名目录',
    setup: () => createNonStandardDirectories(['世界观', '故事线']),
    expected: '智能识别并处理缺失',
    flow: 'select → analyze → prompt → create → complete'
  },
  {
    name: '用户取消操作',
    setup: () => simulateUserCancel(),
    expected: '优雅返回初始状态',
    flow: 'select → cancel → idle'
  }
]

// 性能优化检查
const PerformanceChecks = {
  directoryAnalysisTime: '<500ms',
  directoryCreationTime: '<2s',
  totalImportTime: '<5s',
  memoryUsage: '<50MB',
  uiResponseTime: '<100ms'
}
```

### Task 1.2.4: 流程文档和使用指南
**预估时间**: 0.5小时
**责任**: 全栈协作  
**具体内容**:
- 编写流程使用指南
- 制作故障排除文档
- 准备演示和测试数据

## 验收标准
1. 端到端导入流程成功率≥90%
2. 主要使用场景用户体验流畅
3. 错误处理覆盖全面，恢复机制完善
4. 性能指标达到预设要求
5. 流程可重复执行，状态管理稳定

## 后续衔接
导入流程完成后，用户进入小说创作主界面，开始使用AI协作功能。