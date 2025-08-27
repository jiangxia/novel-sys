# Story 2.1: 组件协作规范制定

## O (Objective)
### 功能目标
- 制定左右区域组件的协作接口规范
- 定义状态同步和事件通信协议
- 建立组件间数据传递的标准格式

### 协作目标
- 前后端开发人员达成协作共识
- 确保组件集成的顺畅性
- 建立可扩展的协作框架

## E (Environment)
### 协作环境
- **前端**: React组件系统 + Zustand状态管理
- **后端**: 状态管理逻辑 + 数据处理服务
- **协作点**: 组件接口、状态同步、事件通信

### 依赖环境
- Epic 1项目导入成功状态
- 基础组件库和工具函数
- TypeScript类型定义系统

## S (Success Criteria)

### 及格标准
- 组件接口规范定义完整且类型安全
- 状态同步协议明确可执行
- 事件通信机制覆盖主要场景

### 优秀标准
- 协作规范具备良好扩展性
- 接口设计支持未来功能需求
- 协议文档包含完整实现示例

### 协作标准
- 前后端开发理解一致
- 规范可直接指导开发实现
- 协作接口经过验证可行

## 前后端协作任务分解

### Task 2.1.1: 组件接口规范定义
**预估时间**: 1小时  
**责任**: 全栈协作
**具体内容**:
- 定义左右区域组件的Props接口
- 制定组件间通信的事件格式
- 设计状态更新的回调规范

**组件接口规范**:
```typescript
// types/componentInterfaces.ts

// 左侧交互区组件接口
export interface LeftSidebarProps {
  className?: string
  defaultTab?: 'chat' | 'project'
  collapsed?: boolean
  width?: number
  onTabChange?: (tab: 'chat' | 'project') => void
  onCollapsedChange?: (collapsed: boolean) => void
  onWidthChange?: (width: number) => void
  onFileSelect?: (filePath: string) => void
  onChatMessage?: (message: ChatMessage) => void
}

// 右侧内容区组件接口  
export interface RightContentAreaProps {
  className?: string
  minWidth?: number
  tabs?: TabItem[]
  activeTabId?: string | null
  onTabAdd?: (tab: Omit<TabItem, 'id' | 'lastModified'>) => void
  onTabRemove?: (tabId: string) => void
  onTabActivate?: (tabId: string) => void
  onTabUpdate?: (tabId: string, updates: Partial<TabItem>) => void
  onTabReorder?: (oldIndex: number, newIndex: number) => void
  onContentChange?: (tabId: string, content: string) => void
  onSaveRequest?: (tabId: string) => void
}

// Tab项数据接口
export interface TabItem {
  id: string
  title: string
  type: 'setting' | 'outline' | 'summary' | 'content'
  filePath: string
  content?: string
  isDirty: boolean
  lastModified: number
  cursorPosition?: number
  scrollPosition?: number
  metadata?: {
    wordCount?: number
    characterCount?: number
    lineCount?: number
  }
}

// 聊天消息接口
export interface ChatMessage {
  id: string
  role: 'user' | 'director' | 'architect' | 'planner' | 'writer'
  content: string
  timestamp: number
  relatedTabId?: string
  attachments?: ChatAttachment[]
}

export interface ChatAttachment {
  type: 'file' | 'selection' | 'reference'
  name: string
  content: string
  filePath?: string
}

// 组件状态同步接口
export interface ComponentSyncState {
  leftPanel: {
    activeTab: 'chat' | 'project'
    collapsed: boolean
    width: number
  }
  rightPanel: {
    activeTabId: string | null
    tabCount: number
    hasUnsavedChanges: boolean
  }
  global: {
    isLoading: boolean
    lastSyncTime: number
    errorMessage?: string
  }
}
```

### Task 2.1.2: 状态同步协议制定
**预估时间**: 1小时
**责任**: 全栈协作  
**具体内容**:
- 设计双向状态同步机制
- 制定状态冲突的解决策略
- 建立状态变化的通知系统

**状态同步协议**:
```typescript
// protocols/stateSyncProtocol.ts

// 状态同步事件类型
export enum SyncEventType {
  // 左侧面板同步事件
  LEFT_TAB_CHANGED = 'left:tab:changed',
  LEFT_COLLAPSED_CHANGED = 'left:collapsed:changed', 
  LEFT_WIDTH_CHANGED = 'left:width:changed',
  
  // 右侧面板同步事件
  RIGHT_TAB_ADDED = 'right:tab:added',
  RIGHT_TAB_REMOVED = 'right:tab:removed',
  RIGHT_TAB_ACTIVATED = 'right:tab:activated',
  RIGHT_TAB_UPDATED = 'right:tab:updated',
  RIGHT_TAB_REORDERED = 'right:tab:reordered',
  
  // 内容同步事件
  CONTENT_CHANGED = 'content:changed',
  CONTENT_SAVED = 'content:saved',
  
  // 全局状态事件
  GLOBAL_LOADING_CHANGED = 'global:loading:changed',
  GLOBAL_ERROR_OCCURRED = 'global:error:occurred'
}

// 状态同步事件数据
export interface SyncEvent<T = any> {
  type: SyncEventType
  payload: T
  timestamp: number
  source: 'left' | 'right' | 'global'
  metadata?: {
    userId?: string
    sessionId?: string
    previousValue?: any
  }
}

// 状态同步管理器
export class StateSyncManager {
  private listeners: Map<SyncEventType, Set<(event: SyncEvent) => void>> = new Map()
  private eventHistory: SyncEvent[] = []
  private conflictResolver: ConflictResolver = new ConflictResolver()

  // 注册事件监听器
  subscribe<T>(
    eventType: SyncEventType, 
    listener: (event: SyncEvent<T>) => void
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    
    this.listeners.get(eventType)!.add(listener)
    
    // 返回取消订阅函数
    return () => {
      this.listeners.get(eventType)?.delete(listener)
    }
  }

  // 发布状态同步事件
  publish<T>(type: SyncEventType, payload: T, source: SyncEvent['source']): void {
    const event: SyncEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source,
      metadata: {
        sessionId: this.getSessionId()
      }
    }

    // 记录事件历史
    this.eventHistory.push(event)
    this.trimEventHistory()

    // 检查状态冲突
    const conflictResolution = this.conflictResolver.resolve(event, this.eventHistory)
    if (conflictResolution.hasConflict) {
      console.warn('State sync conflict detected:', conflictResolution)
      // 根据解决策略处理冲突
      if (conflictResolution.strategy === 'reject') {
        return
      }
    }

    // 通知所有监听器
    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          console.error('State sync listener error:', error)
        }
      })
    }
  }

  // 批量同步状态
  batchSync(events: Array<{ type: SyncEventType, payload: any, source: SyncEvent['source'] }>): void {
    events.forEach(({ type, payload, source }) => {
      this.publish(type, payload, source)
    })
  }

  private getSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private trimEventHistory(): void {
    const maxHistory = 100
    if (this.eventHistory.length > maxHistory) {
      this.eventHistory = this.eventHistory.slice(-maxHistory)
    }
  }
}

// 状态冲突解决器
class ConflictResolver {
  resolve(event: SyncEvent, history: SyncEvent[]): {
    hasConflict: boolean
    strategy: 'accept' | 'reject' | 'merge'
    reason?: string
  } {
    const recentEvents = history.slice(-10).filter(e => 
      e.timestamp > Date.now() - 1000 && e.type === event.type
    )

    if (recentEvents.length > 1) {
      // 检测快速连续的状态变化
      return {
        hasConflict: true,
        strategy: 'accept', // 使用最新值
        reason: 'Rapid successive changes detected'
      }
    }

    return { hasConflict: false, strategy: 'accept' }
  }
}

// 全局状态同步管理器实例
export const stateSyncManager = new StateSyncManager()
```

### Task 2.1.3: 组件通信规范
**预估时间**: 0.5小时
**责任**: 全栈协作
**具体内容**:
- 定义组件间的数据传递格式
- 建立统一的错误处理机制
- 制定性能优化的通信策略

**组件通信规范**:
```typescript
// protocols/componentCommunication.ts

// 组件间通信消息格式
export interface ComponentMessage<T = any> {
  id: string
  type: string
  payload: T
  timestamp: number
  from: ComponentId
  to?: ComponentId | ComponentId[]
  priority: 'low' | 'normal' | 'high'
  requiresAck?: boolean
}

// 组件标识符
export type ComponentId = 
  | 'left-sidebar'
  | 'right-content-area'
  | 'top-level-tabs'
  | 'inner-tabs'
  | 'markdown-editor'
  | 'chat-panel'
  | 'project-panel'

// 通信消息类型定义
export enum MessageType {
  // 文件操作消息
  FILE_OPEN_REQUEST = 'file:open:request',
  FILE_OPEN_RESPONSE = 'file:open:response',
  FILE_SAVE_REQUEST = 'file:save:request',
  FILE_SAVE_RESPONSE = 'file:save:response',
  
  // Tab操作消息
  TAB_CREATE_REQUEST = 'tab:create:request',
  TAB_CLOSE_REQUEST = 'tab:close:request',
  TAB_SWITCH_REQUEST = 'tab:switch:request',
  
  // 内容编辑消息
  CONTENT_CHANGE_NOTIFY = 'content:change:notify',
  CURSOR_POSITION_SYNC = 'cursor:position:sync',
  
  // AI聊天消息
  CHAT_MESSAGE_SEND = 'chat:message:send',
  CHAT_ROLE_SWITCH = 'chat:role:switch',
  
  // 错误处理消息
  ERROR_OCCURRED = 'error:occurred',
  WARNING_ISSUED = 'warning:issued'
}

// 组件通信管理器
export class ComponentCommunicationManager {
  private messageQueue: ComponentMessage[] = []
  private handlers: Map<MessageType, Set<MessageHandler>> = new Map()
  private isProcessing = false

  // 消息处理器接口
  type MessageHandler = (message: ComponentMessage) => Promise<ComponentMessage | void>

  // 注册消息处理器
  registerHandler(type: MessageType, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    
    this.handlers.get(type)!.add(handler)
    
    return () => {
      this.handlers.get(type)?.delete(handler)
    }
  }

  // 发送消息
  async sendMessage<T>(
    type: MessageType,
    payload: T,
    from: ComponentId,
    to?: ComponentId | ComponentId[],
    options?: {
      priority?: ComponentMessage['priority']
      requiresAck?: boolean
    }
  ): Promise<ComponentMessage | void> {
    const message: ComponentMessage<T> = {
      id: this.generateMessageId(),
      type,
      payload,
      timestamp: Date.now(),
      from,
      to,
      priority: options?.priority || 'normal',
      requiresAck: options?.requiresAck || false
    }

    // 添加到消息队列
    this.messageQueue.push(message)
    this.messageQueue.sort((a, b) => {
      const priorities = { high: 3, normal: 2, low: 1 }
      return priorities[b.priority] - priorities[a.priority]
    })

    // 处理消息队列
    if (!this.isProcessing) {
      return this.processMessageQueue()
    }
  }

  private async processMessageQueue(): Promise<ComponentMessage | void> {
    this.isProcessing = true
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!
      
      try {
        const result = await this.handleMessage(message)
        if (message.requiresAck && result) {
          return result
        }
      } catch (error) {
        console.error('Message handling error:', error)
        
        // 发送错误消息
        await this.sendMessage(
          MessageType.ERROR_OCCURRED,
          { originalMessage: message, error: error.message },
          'system' as ComponentId
        )
      }
    }
    
    this.isProcessing = false
  }

  private async handleMessage(message: ComponentMessage): Promise<ComponentMessage | void> {
    const handlers = this.handlers.get(message.type as MessageType)
    if (!handlers || handlers.size === 0) {
      console.warn('No handlers for message type:', message.type)
      return
    }

    // 如果指定了接收方，只发送给匹配的处理器
    if (message.to) {
      // 这里可以根据组件ID过滤处理器
      // 简化实现：发送给所有注册的处理器
    }

    const results = await Promise.allSettled(
      Array.from(handlers).map(handler => handler(message))
    )

    // 返回第一个成功的结果
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value
      }
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// 全局组件通信管理器实例
export const componentCommunicationManager = new ComponentCommunicationManager()
```

### Task 2.1.4: 协作集成测试规范
**预估时间**: 0.5小时
**责任**: 全栈协作
**具体内容**:
- 制定组件集成测试的标准流程
- 定义协作功能的验收标准
- 建立自动化测试的基础框架

**测试规范**:
```typescript
// testing/integrationTestSpecs.ts

// 集成测试场景定义
export interface IntegrationTestScenario {
  name: string
  description: string
  setup: () => Promise<void>
  execute: () => Promise<void>
  verify: () => Promise<boolean>
  cleanup: () => Promise<void>
}

// 主工作界面集成测试套件
export const mainInterfaceIntegrationTests: IntegrationTestScenario[] = [
  {
    name: 'left-right-panel-sync',
    description: '左右面板状态同步测试',
    setup: async () => {
      // 初始化测试环境
    },
    execute: async () => {
      // 1. 切换左侧面板Tab
      // 2. 验证状态同步
      // 3. 打开文件从项目面板
      // 4. 验证右侧Tab创建
    },
    verify: async () => {
      // 验证状态一致性
      return true
    },
    cleanup: async () => {
      // 清理测试数据
    }
  },
  
  {
    name: 'tab-lifecycle-management',
    description: 'Tab完整生命周期管理测试',
    setup: async () => {},
    execute: async () => {
      // 1. 创建多个Tab
      // 2. 测试拖拽排序
      // 3. 测试Tab关闭
      // 4. 验证激活状态转换
    },
    verify: async () => true,
    cleanup: async () => {}
  },
  
  {
    name: 'responsive-layout-adaptation',
    description: '响应式布局适配测试',
    setup: async () => {},
    execute: async () => {
      // 1. 模拟不同屏幕尺寸
      // 2. 验证布局自动调整
      // 3. 测试移动端抽屉功能
      // 4. 验证触摸交互
    },
    verify: async () => true,
    cleanup: async () => {}
  }
]

// 集成测试执行器
export class IntegrationTestRunner {
  async runTestSuite(scenarios: IntegrationTestScenario[]): Promise<{
    passed: number
    failed: number
    results: Array<{ name: string, success: boolean, error?: string }>
  }> {
    const results = []
    let passed = 0
    let failed = 0

    for (const scenario of scenarios) {
      try {
        await scenario.setup()
        await scenario.execute()
        const success = await scenario.verify()
        await scenario.cleanup()

        results.push({ name: scenario.name, success })
        
        if (success) {
          passed++
        } else {
          failed++
        }
      } catch (error) {
        results.push({ 
          name: scenario.name, 
          success: false, 
          error: error.message 
        })
        failed++
      }
    }

    return { passed, failed, results }
  }
}
```

## 验收标准
1. 组件接口规范定义完整，TypeScript类型安全
2. 状态同步协议明确，支持双向同步和冲突解决
3. 组件通信机制健壮，消息传递可靠
4. 集成测试规范完备，覆盖主要协作场景
5. 协作规范文档可直接指导前后端开发
6. 所有接口经过验证，确保实现可行性

## 后续衔接
本Story完成后，前端和后端可以基于统一的协作规范并行开发，最终集成测试验证协作效果。