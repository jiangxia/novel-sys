# Story 4.1: 对话接口设计和协议制定

## O (Objective)

### 功能目标
- 制定完整的前后端对话API接口规范和协议标准
- 定义数据格式、错误处理、状态管理等协作规范
- 为前后端独立开发提供统一的接口契约

### 技术目标
- 设计RESTful风格的对话API接口规范
- 制定标准化的请求/响应数据格式
- 定义完整的错误码体系和错误处理协议
- 建立接口版本管理和扩展性考虑

### 协作目标
- 确保前后端开发人员对接口理解一致
- 提供详细的接口文档和示例代码
- 建立接口变更管理机制

## E (Environment)

### 协作环境
- **前端技术栈**：React + TypeScript + Fetch API
- **后端技术栈**：Node.js + Express + JSON
- **协作接口点**：HTTP REST API + JSON数据格式
- **文档工具**：Markdown文档 + 接口示例

### 技术环境
- **API设计规范**：RESTful API设计原则
- **数据格式**：JSON标准格式
- **HTTP协议**：标准HTTP状态码和头部
- **错误处理**：统一错误响应格式

### 依赖环境
- **业务需求**：基础AI对话功能需求
- **技术约束**：Gemini API调用限制和特点
- **安全要求**：API安全性和数据保护
- **性能要求**：响应时间和并发处理能力

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] **核心接口定义**：完整定义/api/chat对话接口的请求和响应格式
- [ ] **数据格式规范**：明确消息、会话、错误等核心数据结构
- [ ] **HTTP状态码**：定义各种场景下的HTTP状态码使用规范
- [ ] **基础错误处理**：制定基础错误类型和错误响应格式
- [ ] **接口文档**：提供清晰的API文档和使用示例

### 优秀标准 (Should Have)
- [ ] **会话管理协议**：定义会话创建、维护、清理的完整协议
- [ ] **错误码体系**：建立详细的错误分类和错误码定义
- [ ] **请求验证规范**：定义请求参数验证规则和验证失败处理
- [ ] **响应格式标准化**：统一的成功/失败响应格式规范
- [ ] **接口版本管理**：考虑API版本控制和向后兼容性

### 卓越标准 (Nice to Have)
- [ ] **扩展性设计**：为未来功能扩展预留接口设计空间
- [ ] **性能优化协议**：定义缓存、限流等性能优化相关协议
- [ ] **监控和日志规范**：定义接口调用监控和日志记录规范
- [ ] **安全性协议**：API安全访问和数据保护相关规范
- [ ] **测试规范**：接口测试用例和集成测试规范

### 协作标准
- [ ] **前后端接口对接成功**：接口规范能够指导前后端成功对接
- [ ] **数据流转正常**：定义的数据格式能够正确传递和解析
- [ ] **错误处理协调一致**：前后端错误处理逻辑一致
- [ ] **开发效率**：接口规范清晰，减少开发过程中的沟通成本

## 具体任务分解

### Task 4.1.1: 核心对话接口设计 (2-3小时)
- 设计POST /api/chat主要对话接口
- 定义请求参数结构和验证规则
- 设计响应数据格式和字段说明
- 确定HTTP方法和URL路径规范

### Task 4.1.2: 数据模型和格式规范 (2-3小时)
- 定义Message消息数据模型
- 定义Conversation会话数据模型
- 设计统一的API响应格式规范
- 制定数据类型和字段命名规范

### Task 4.1.3: 错误处理和状态码体系 (2小时)
- 设计HTTP状态码使用规范
- 定义错误码分类和错误信息格式
- 制定异常情况的处理协议
- 设计客户端错误重试机制

### Task 4.1.4: 会话管理协议制定 (2小时)
- 设计会话ID生成和管理策略
- 定义会话生命周期管理协议
- 制定多轮对话的上下文维护规范
- 设计会话清理和超时处理机制

### Task 4.1.5: 接口文档和示例编写 (2-3小时)
- 编写完整的API接口文档
- 提供详细的请求/响应示例
- 创建常见场景的使用示例
- 制定接口变更和版本管理规范

## 接口设计规范

### 1. 核心对话接口

#### 接口定义
```
POST /api/chat
Content-Type: application/json
```

#### 请求格式
```typescript
interface ChatRequest {
  message: string;                    // 必填：用户输入的消息内容
  sessionId?: string;                 // 可选：会话ID，不传则创建新会话
  options?: {                         // 可选：对话选项
    temperature?: number;             // 温度参数 0-1，默认0.7
    maxTokens?: number;              // 最大回复长度，默认2048
    context?: boolean;               // 是否包含历史上下文，默认true
  };
}
```

#### 响应格式
```typescript
// 成功响应
interface ChatResponse {
  success: true;
  data: {
    message: string;                  // AI回复内容
    sessionId: string;                // 会话ID
    messageId: string;                // 消息ID
    timestamp: string;                // ISO格式时间戳
    usage?: {                         // 可选：token使用情况
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}

// 错误响应
interface ErrorResponse {
  success: false;
  error: {
    code: string;                     // 错误码
    message: string;                  // 错误描述
    details?: any;                    // 可选：错误详细信息
  };
  timestamp: string;                  // 错误发生时间
}
```

### 2. HTTP状态码规范

```typescript
const HTTP_STATUS = {
  200: 'OK - 请求成功',
  400: 'Bad Request - 请求参数错误',
  401: 'Unauthorized - 认证失败',
  429: 'Too Many Requests - 请求频率过高',
  500: 'Internal Server Error - 服务器内部错误',
  502: 'Bad Gateway - 上游服务错误（如Gemini API错误）',
  503: 'Service Unavailable - 服务暂时不可用'
};
```

### 3. 错误码体系

```typescript
const ERROR_CODES = {
  // 请求参数错误 (4xx)
  INVALID_MESSAGE: 'INVALID_MESSAGE',           // 消息内容无效
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',         // 消息过长
  INVALID_SESSION: 'INVALID_SESSION',           // 无效会话ID
  
  // API调用错误 (5xx)  
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',         // AI服务调用错误
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',       // AI配额超限
  AI_TIMEOUT: 'AI_TIMEOUT',                     // AI调用超时
  
  // 系统错误
  INTERNAL_ERROR: 'INTERNAL_ERROR',             // 内部系统错误
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'    // 服务不可用
};
```

### 4. 数据模型定义

```typescript
// 消息模型
interface Message {
  id: string;                         // 消息唯一ID
  sessionId: string;                  // 所属会话ID
  role: 'user' | 'assistant';         // 消息角色
  content: string;                    // 消息内容
  timestamp: string;                  // 消息时间戳
  metadata?: {                        // 可选元数据
    tokens?: number;
    model?: string;
    [key: string]: any;
  };
}

// 会话模型
interface Conversation {
  sessionId: string;                  // 会话唯一ID
  messages: Message[];                // 消息历史
  createdAt: string;                  // 创建时间
  lastUpdated: string;                // 最后更新时间
  metadata?: {                        // 会话元数据
    totalMessages: number;
    totalTokens: number;
    [key: string]: any;
  };
}
```

## 前端集成指导

### HTTP客户端使用示例
```typescript
// 前端API调用示例
class ChatAPI {
  private baseURL = '/api';

  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || '请求失败');
    }
    
    return data;
  }
}
```

### 错误处理示例
```typescript
// 前端错误处理示例
try {
  const response = await chatAPI.sendMessage('Hello');
  // 处理成功响应
  console.log(response.data.message);
} catch (error) {
  // 处理错误响应
  if (error.code === 'AI_SERVICE_ERROR') {
    // AI服务错误处理
  } else if (error.code === 'INVALID_MESSAGE') {
    // 消息格式错误处理
  } else {
    // 其他错误处理
  }
}
```

## 后端实现指导

### 接口验证中间件示例
```javascript
// 请求参数验证中间件
const validateChatRequest = (req, res, next) => {
  const { message, sessionId } = req.body;
  
  // 消息内容验证
  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_MESSAGE',
        message: '消息内容不能为空且必须为字符串'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // 消息长度验证
  if (message.length > 10000) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MESSAGE_TOO_LONG',
        message: '消息内容过长，最大支持10000字符'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};
```

## 测试用例规范

### 接口测试用例
```javascript
// API接口测试用例示例
describe('POST /api/chat', () => {
  test('应该成功发送消息并获得回复', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        message: 'Hello, world!'
      });
      
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toBeDefined();
    expect(response.body.data.sessionId).toBeDefined();
  });
  
  test('应该正确处理无效消息请求', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        message: ''
      });
      
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_MESSAGE');
  });
});
```

## 验收标准
1. **接口规范完整性**：所有需要的接口和数据格式都有明确定义
2. **文档清晰性**：前后端开发人员能够根据文档独立开发
3. **错误处理完善性**：各种错误场景都有明确的处理协议
4. **扩展性设计**：接口设计支持未来功能扩展
5. **一致性保证**：前后端实现能够基于该规范保持一致