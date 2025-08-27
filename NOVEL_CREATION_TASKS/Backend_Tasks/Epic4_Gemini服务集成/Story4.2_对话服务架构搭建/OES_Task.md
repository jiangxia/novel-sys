# Story 4.2: 对话服务架构搭建

## O (Objective)

### 功能目标
- 基于Gemini客户端构建完整的对话服务架构
- 实现对话上下文管理和会话状态维护
- 提供标准化的对话API接口供前端调用

### 技术目标  
- 设计可扩展的对话服务架构，支持未来多AI模型接入
- 实现高效的上下文管理，优化内存使用和性能
- 建立完整的API路由和中间件体系
- 提供生产级的错误处理和日志监控

## E (Environment)

### 技术环境
- **后端框架**：Node.js + Express.js 4.x
- **上下文存储**：内存存储 + Redis缓存(可选)
- **API设计**：RESTful API + JSON格式
- **中间件**：CORS、body-parser、错误处理中间件
- **日志系统**：winston 日志记录

### 依赖环境
- **Gemini客户端**：依赖Story 4.1开发的GeminiClient
- **API接口规范**：依赖全栈制定的接口协议
- **数据库**：暂时使用内存存储，预留数据库接口
- **环境配置**：Express服务器配置和环境变量管理

### 服务架构设计
```javascript
backend/
├── routes/
│   └── chat.js                  // 对话API路由
├── services/
│   ├── conversation-service.js  // 对话业务逻辑
│   ├── context-manager.js       // 上下文管理服务
│   └── ai-service.js           // AI服务统一接口
├── middleware/
│   ├── error-handler.js         // 错误处理中间件
│   ├── request-logger.js        // 请求日志中间件
│   └── rate-limiter.js          // 速率限制中间件(可选)
├── models/
│   ├── conversation.js          // 对话数据模型
│   └── message.js              // 消息数据模型
└── utils/
    ├── response-formatter.js    // 响应格式化工具
    └── validation.js            // 请求验证工具
```

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] **对话API接口**：提供完整的POST /api/chat接口，支持消息发送和接收
- [ ] **上下文管理**：正确维护对话历史，支持多轮对话
- [ ] **消息处理**：正确处理用户输入，调用Gemini API，返回AI回复
- [ ] **错误处理**：API调用错误、验证错误等都有合理的HTTP状态码返回
- [ ] **基础验证**：请求参数验证，防止无效请求

### 优秀标准 (Should Have)
- [ ] **会话管理**：支持多个独立会话，通过sessionId区分不同用户对话
- [ ] **上下文优化**：实现上下文长度限制，避免token超限
- [ ] **响应格式化**：统一的API响应格式，包含状态码、消息、数据等
- [ ] **请求日志**：记录所有API请求和响应，便于调试和监控
- [ ] **中间件体系**：完整的Express中间件链，支持CORS、JSON解析等

### 卓越标准 (Nice to Have)
- [ ] **速率限制**：防止API滥用，实现请求频率限制
- [ ] **缓存机制**：相似请求的缓存处理，提升响应速度
- [ ] **健康检查**：提供/health接口，支持服务健康状态检查
- [ ] **API文档**：自动生成的API文档，便于前端开发对接
- [ ] **性能监控**：API响应时间、错误率等性能指标收集

## 具体任务分解

### Task 4.2.1: Express服务器和路由搭建 (2-3小时)
- 创建Express应用程序基础结构
- 配置基础中间件(CORS、body-parser等)
- 创建/api/chat主要对话路由
- 设置错误处理中间件

### Task 4.2.2: 对话服务业务逻辑开发 (3-4小时)
- 开发ConversationService对话业务逻辑类
- 实现消息处理流程：接收→验证→调用AI→返回
- 集成Gemini客户端，处理AI调用
- 实现请求参数验证和响应格式化

### Task 4.2.3: 上下文管理系统实现 (3-4小时)
- 开发ContextManager上下文管理类
- 实现会话创建、获取、更新、清理功能
- 处理多轮对话的上下文维护
- 实现上下文长度限制和优化策略

### Task 4.2.4: 数据模型和工具类开发 (2-3小时)
- 创建Conversation和Message数据模型
- 开发ResponseFormatter响应格式化工具
- 实现Validation请求验证工具
- 创建通用工具函数和常量定义

### Task 4.2.5: 错误处理和日志系统集成 (2小时)
- 完善错误处理中间件
- 集成winston日志系统
- 实现请求日志和错误日志记录
- 添加健康检查和API状态监控

## 开发参考

### 对话API路由参考
```javascript
// routes/chat.js
const express = require('express');
const ConversationService = require('../services/conversation-service');

const router = express.Router();

// POST /api/chat - 发送消息并获取AI回复
router.post('/', async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    
    // 参数验证
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }
    
    // 调用对话服务
    const result = await ConversationService.processMessage({
      message,
      sessionId: sessionId || 'default'
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

### 对话服务参考
```javascript
// services/conversation-service.js
const GeminiClient = require('../lib/gemini-client');
const ContextManager = require('./context-manager');

class ConversationService {
  constructor() {
    this.geminiClient = new GeminiClient();
    this.contextManager = new ContextManager();
  }
  
  async processMessage({ message, sessionId }) {
    // 获取上下文历史
    const context = await this.contextManager.getContext(sessionId);
    
    // 构建消息历史
    const messages = [
      ...context.messages,
      { role: 'user', content: message }
    ];
    
    // 调用AI获取回复
    const aiResponse = await this.geminiClient.chat(messages);
    
    // 更新上下文
    await this.contextManager.updateContext(sessionId, [
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse.content }
    ]);
    
    return {
      message: aiResponse.content,
      sessionId,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new ConversationService();
```

### 上下文管理参考
```javascript
// services/context-manager.js
class ContextManager {
  constructor() {
    this.contexts = new Map(); // 内存存储，生产环境可替换为Redis
    this.maxContextLength = 10; // 最大对话轮数
  }
  
  async getContext(sessionId) {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        sessionId,
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    }
    return this.contexts.get(sessionId);
  }
  
  async updateContext(sessionId, newMessages) {
    const context = await this.getContext(sessionId);
    context.messages.push(...newMessages);
    
    // 限制上下文长度
    if (context.messages.length > this.maxContextLength * 2) {
      context.messages = context.messages.slice(-this.maxContextLength * 2);
    }
    
    context.lastUpdated = new Date();
    return context;
  }
}

module.exports = ContextManager;
```

### Express应用配置参考
```javascript
// app.js
const express = require('express');
const cors = require('cors');
const chatRouter = require('./routes/chat');
const errorHandler = require('./middleware/error-handler');

const app = express();

// 基础中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// API路由
app.use('/api/chat', chatRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use(errorHandler);

module.exports = app;
```

## API接口规范

### 请求格式
```javascript
POST /api/chat
Content-Type: application/json

{
  "message": "用户输入的消息内容",
  "sessionId": "可选的会话ID"
}
```

### 响应格式
```javascript
// 成功响应
{
  "success": true,
  "data": {
    "message": "AI回复的内容",
    "sessionId": "会话ID",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}

// 错误响应
{
  "success": false,
  "error": "错误信息描述",
  "code": "错误代码"
}
```

## 验收标准
1. **API功能完整**：所有定义的API接口正常工作
2. **上下文准确性**：多轮对话上下文维护正确
3. **错误处理完善**：各种错误场景都有合理处理
4. **性能表现良好**：API响应时间在可接受范围
5. **代码结构清晰**：服务架构合理，易于维护扩展