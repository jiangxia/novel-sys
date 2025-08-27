# Story 5.1: 记忆接口设计和协议制定

## O (Objective)

### 功能目标
- 设计前后端记忆功能的完整API接口规范
- 制定角色激活和状态管理的数据协议
- 定义记忆数据的存储和传输格式
- 建立错误处理和状态同步机制

### 协作目标
- 为Backend Tasks提供明确的API实现规范
- 为Frontend Tasks提供准确的数据格式定义
- 建立前后端数据一致性保证机制
- 确保记忆功能的端到端用户体验

### 技术目标  
- REST API设计遵循最佳实践
- WebSocket实时状态同步机制
- 完整的TypeScript类型定义
- 错误处理和重试策略标准化

## E (Environment)

### 协作环境
- **前端**: React + TypeScript + TailwindCSS
- **后端**: Node.js + Express + TypeScript
- **实时通信**: WebSocket (记忆状态同步)
- **数据格式**: JSON (API) + TypeScript interfaces
- **协作接口**: REST API + WebSocket事件

### 依赖环境
- Express服务器基础架构已建立
- PromptX MCP客户端基础类已设计（Backend Epic5）
- 前端状态管理Context已规划（Frontend Epic5）
- WebSocket连接基础设施已准备

### 技术栈协作点
```
前端组件 ←→ REST API ←→ PromptX封装层 ←→ MCP客户端 ←→ PromptX服务
     ↓           ↑
WebSocket ←→ 状态广播服务
```

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] 完整的API接口规范文档
- [ ] TypeScript类型定义文件
- [ ] 基础的错误处理协议
- [ ] 前后端数据格式一致性验证

### 优秀标准 (Should Have)  
- [ ] WebSocket实时状态同步机制
- [ ] 完善的错误分类和用户友好提示
- [ ] API版本控制和向后兼容性
- [ ] 请求限流和防护机制

### 协作标准 (Must Have)
- [ ] 前端开发者可基于规范独立开发
- [ ] 后端开发者可基于规范独立实现
- [ ] 接口规范包含完整的示例和边界情况
- [ ] 数据格式变更的协商机制

### 卓越标准 (Nice to Have)
- [ ] API文档自动生成和测试
- [ ] 接口性能指标和SLA定义
- [ ] 多客户端同步的冲突解决机制
- [ ] 记忆数据的隐私和安全规范

## 核心接口规范设计

### 1. 角色管理API
```typescript
// POST /api/memory/roles/activate
interface ActivateRoleRequest {
  role: RoleType;
  context?: string;
  forceReactivate?: boolean;
}

interface ActivateRoleResponse {
  success: boolean;
  role: RoleType;
  activated: boolean;
  message: string;
  activatedAt: ISO8601String;
  context?: {
    memoryLoaded: boolean;
    previousState?: RoleState;
  };
}

// GET /api/memory/roles/current
interface CurrentRoleResponse {
  currentRole: RoleType | null;
  activatedAt: ISO8601String | null;
  status: 'active' | 'inactive' | 'switching';
  availableRoles: RoleInfo[];
}
```

### 2. 记忆管理API
```typescript
// POST /api/memory/save
interface SaveMemoryRequest {
  content: string;
  category?: MemoryCategory;
  importance?: number; // 1-10
  tags?: string[];
  context?: {
    currentRole: RoleType;
    conversationId: string;
    timestamp: ISO8601String;
  };
}

interface SaveMemoryResponse {
  success: boolean;
  memoryId: string;
  savedAt: ISO8601String;
  category: MemoryCategory;
  message: string;
}

// POST /api/memory/recall
interface RecallMemoryRequest {
  query?: string;
  category?: MemoryCategory;
  limit?: number; // default: 10, max: 50
  role?: RoleType;
  timeRange?: {
    from?: ISO8601String;
    to?: ISO8601String;
  };
}

interface RecallMemoryResponse {
  success: boolean;
  memories: Memory[];
  totalCount: number;
  query: string;
  searchTime: number; // milliseconds
}
```

### 3. 状态同步WebSocket
```typescript
// WebSocket事件定义
interface WebSocketEvents {
  // 客户端 → 服务器
  'memory:subscribe': { conversationId: string };
  'memory:unsubscribe': { conversationId: string };
  
  // 服务器 → 客户端
  'memory:status': MemoryStatusUpdate;
  'memory:saved': MemorySavedEvent;
  'memory:recalled': MemoryRecalledEvent;
  'role:activated': RoleActivatedEvent;
  'role:status': RoleStatusUpdate;
}

interface MemoryStatusUpdate {
  type: 'status';
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  workingStatus: 'idle' | 'saving' | 'recalling' | 'error';
  timestamp: ISO8601String;
}
```

## 数据类型定义

### 核心业务类型
```typescript
// shared/types/memory.ts
type RoleType = 'supervisor' | 'architect' | 'planner' | 'writer';

type MemoryCategory = 
  | 'character'        // 角色设定相关
  | 'plot'            // 情节相关
  | 'worldbuilding'   // 世界观相关
  | 'conversation'    // 对话记录
  | 'insight';        // 创作洞察

interface Memory {
  id: string;
  content: string;
  category: MemoryCategory;
  importance: number;
  tags: string[];
  createdAt: ISO8601String;
  updatedAt: ISO8601String;
  role: RoleType;
  context: {
    conversationId: string;
    userId?: string;
    projectId?: string;
  };
}

interface RoleInfo {
  type: RoleType;
  name: string;
  description: string;
  status: 'available' | 'active' | 'unavailable';
  lastActivated?: ISO8601String;
}
```

### 错误处理类型
```typescript
// shared/types/errors.ts
interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: ISO8601String;
  requestId: string;
}

enum ErrorCodes {
  // 连接错误
  MCP_CONNECTION_FAILED = 'MCP_CONNECTION_FAILED',
  PROMPTX_SERVICE_UNAVAILABLE = 'PROMPTX_SERVICE_UNAVAILABLE',
  
  // 角色错误
  ROLE_ACTIVATION_FAILED = 'ROLE_ACTIVATION_FAILED',
  INVALID_ROLE_TYPE = 'INVALID_ROLE_TYPE',
  
  // 记忆错误
  MEMORY_SAVE_FAILED = 'MEMORY_SAVE_FAILED',
  MEMORY_RECALL_FAILED = 'MEMORY_RECALL_FAILED',
  INVALID_MEMORY_FORMAT = 'INVALID_MEMORY_FORMAT',
  
  // 通用错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}
```

## 协作工作流程

### Phase 1: 接口规范制定（本任务）
1. **API接口设计**: 完整的REST API规范
2. **数据格式定义**: TypeScript类型文件
3. **WebSocket协议**: 实时同步机制
4. **错误处理标准**: 统一错误格式和处理流程

### Phase 2: 并行开发阶段
- **Backend开发**: 基于接口规范实现API
- **Frontend开发**: 基于类型定义开发UI组件
- **独立性保证**: 双方无需协调，严格按规范开发

### Phase 3: 集成验证阶段（Story 5.2）
- **接口对接测试**: 验证API实现符合规范
- **数据格式验证**: 确保前后端数据一致性
- **端到端功能测试**: 完整用户流程验证

## 具体任务分解

### Task 5.1.1: API接口规范设计
**时间估算**: 4小时
- 设计REST API的完整接口
- 定义请求/响应数据格式
- 制定HTTP状态码和错误处理规范
- 编写API规范文档

### Task 5.1.2: TypeScript类型定义
**时间估算**: 3小时
- 创建共享类型定义文件
- 定义业务实体和API接口类型
- 建立类型的版本控制机制
- 生成类型文档

### Task 5.1.3: WebSocket实时同步协议
**时间估算**: 3小时
- 设计WebSocket事件协议
- 定义状态同步机制
- 制定连接管理和重连策略
- 编写协议文档和示例

### Task 5.1.4: 错误处理和边界情况
**时间估算**: 2小时
- 定义统一错误格式和错误码
- 制定降级和重试策略
- 设计用户友好的错误提示
- 编写边界情况处理指南

## 接口规范验证

### 规范完整性检查
- [ ] 所有业务功能都有对应API
- [ ] 所有API都有明确的请求/响应格式
- [ ] 所有数据类型都有TypeScript定义
- [ ] 所有错误情况都有处理方案

### 前端开发友好性检查
- [ ] 前端可基于类型定义独立开发
- [ ] API响应格式支持UI组件需求
- [ ] WebSocket事件能驱动状态更新
- [ ] 错误信息能转换为用户提示

### 后端实现可行性检查
- [ ] API设计符合PromptX MCP能力
- [ ] 数据格式兼容MCP工具返回值
- [ ] 性能要求在技术栈能力范围内
- [ ] 错误处理能映射到MCP异常

## 风险和应对策略
- **风险**: PromptX MCP接口变更导致协议不兼容
  **应对**: 建立接口版本控制和兼容性检查机制
- **风险**: WebSocket连接不稳定影响用户体验
  **应对**: 设计降级机制，支持HTTP轮询备选方案
- **风险**: 前后端理解不一致导致集成困难
  **应对**: 提供详细示例和Mock数据，建立沟通机制