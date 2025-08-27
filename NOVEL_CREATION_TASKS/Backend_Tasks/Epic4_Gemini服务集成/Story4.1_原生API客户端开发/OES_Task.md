# Story 4.1: 原生API客户端开发

## O (Objective)

### 功能目标
- 实现原生Google Gemini API客户端封装
- 提供稳定可靠的AI对话调用能力
- 建立标准化的API调用接口和错误处理机制

### 技术目标  
- 基于原生HTTP请求实现Gemini API调用，避免第三方SDK依赖
- 实现消息格式转换和API响应解析
- 提供配置管理和API密钥安全处理
- 建立重试机制和错误分类处理

## E (Environment)

### 技术环境
- **后端框架**：Node.js 18+ + Express.js
- **HTTP客户端**：原生fetch API 或 axios
- **配置管理**：dotenv + 配置文件
- **错误处理**：自定义错误类 + 错误码体系
- **日志系统**：winston 或 console (开发阶段)

### 依赖环境
- **Gemini API文档**：Google Generative AI API官方文档
- **API密钥**：Google Cloud Console申请的API Key
- **网络环境**：能够访问Google API服务的网络环境
- **配置文件**：环境变量和配置文件管理

### 核心架构设计
```javascript
backend/
├── lib/
│   ├── gemini-client.js         // 核心Gemini客户端
│   ├── message-formatter.js     // 消息格式转换工具
│   ├── error-handler.js         // 错误处理和分类
│   └── retry-manager.js         // 重试机制管理
├── config/
│   ├── gemini-config.js         // Gemini配置管理
│   └── api-config.js            // API相关配置
└── types/
    └── gemini-types.js          // 类型定义和接口
```

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] **基础API调用**：成功调用Gemini API，获取AI回复
- [ ] **消息格式转换**：正确转换用户消息格式为Gemini API要求的格式
- [ ] **响应解析**：正确解析API响应，提取AI回复内容
- [ ] **配置管理**：支持API Key配置和基础参数设置
- [ ] **基础错误处理**：API调用失败时能够捕获和处理基础错误

### 优秀标准 (Should Have)
- [ ] **重试机制**：API调用失败时自动重试，支持指数退避策略
- [ ] **错误分类**：区分不同类型错误(网络错误、API错误、配置错误等)
- [ ] **参数配置**：支持temperature、maxTokens等生成参数配置
- [ ] **请求限流**：避免超出API调用频率限制
- [ ] **日志记录**：记录API调用日志，便于调试和监控

### 卓越标准 (Nice to Have)
- [ ] **缓存机制**：相同请求的缓存处理，提升性能
- [ ] **监控指标**：API调用成功率、响应时间等性能指标收集
- [ ] **多模型支持**：支持Gemini Pro、Gemini Pro Vision等不同模型
- [ ] **流式响应**：支持流式API调用，实现打字机效果
- [ ] **API版本管理**：支持不同版本的Gemini API

## 具体任务分解

### Task 4.1.1: 核心客户端框架搭建 (3-4小时)
- 创建GeminiClient核心类
- 实现基础的HTTP请求封装
- 设置API Base URL和认证头处理
- 建立基础的配置管理系统

### Task 4.1.2: 消息格式转换实现 (2-3小时)
- 开发MessageFormatter消息格式转换工具
- 实现用户消息到Gemini API格式的转换
- 处理对话历史的格式化
- 支持不同消息类型的格式转换

### Task 4.1.3: API调用和响应解析 (3-4小时)
- 实现核心的chat()方法
- 处理Gemini API的请求和响应
- 解析API响应，提取AI回复内容
- 处理API返回的元数据信息

### Task 4.1.4: 错误处理和重试机制 (2-3小时)
- 开发ErrorHandler错误处理类
- 实现错误分类和错误码定义
- 开发RetryManager重试机制
- 实现指数退避和最大重试次数控制

### Task 4.1.5: 配置管理和安全处理 (2小时)
- 完善配置管理系统
- 实现API密钥的安全存储和获取
- 添加环境变量支持
- 实现配置验证和默认值处理

## 开发参考

### GeminiClient核心实现参考
```javascript
// lib/gemini-client.js
class GeminiClient {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = config.model || 'gemini-pro';
    this.defaultConfig = {
      temperature: 0.7,
      maxOutputTokens: 2048,
      topK: 40,
      topP: 0.95
    };
  }

  async chat(messages, options = {}) {
    const config = { ...this.defaultConfig, ...options };
    const formattedMessages = this.formatMessages(messages);
    
    const response = await this.makeRequest('generateContent', {
      contents: formattedMessages,
      generationConfig: config
    });
    
    return this.parseResponse(response);
  }

  formatMessages(messages) {
    // 消息格式转换逻辑
  }

  async makeRequest(endpoint, data) {
    // HTTP请求逻辑
  }

  parseResponse(response) {
    // 响应解析逻辑
  }
}
```

### 错误处理参考
```javascript
// lib/error-handler.js
class GeminiError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const ERROR_CODES = {
  API_KEY_INVALID: 'API_KEY_INVALID',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST'
};
```

### 配置管理参考
```javascript
// config/gemini-config.js
const config = {
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL || 'gemini-pro',
  maxRetries: parseInt(process.env.GEMINI_MAX_RETRIES) || 3,
  timeout: parseInt(process.env.GEMINI_TIMEOUT) || 30000,
  generation: {
    temperature: 0.7,
    maxOutputTokens: 2048,
    topK: 40,
    topP: 0.95
  }
};
```

## API接口规范

### 输入格式
```javascript
// 标准消息格式
const messages = [
  {
    role: 'user',
    content: '用户输入的文本内容'
  },
  {
    role: 'assistant', 
    content: 'AI之前的回复内容'
  }
];
```

### 输出格式
```javascript
// 标准响应格式
const response = {
  content: 'AI回复的文本内容',
  metadata: {
    model: 'gemini-pro',
    tokensUsed: 150,
    finishReason: 'stop'
  }
};
```

## 验收标准
1. **功能完整性**：所有核心API调用功能正常工作
2. **错误处理**：各种异常情况都有合理的处理机制
3. **性能表现**：API调用响应时间在可接受范围内
4. **代码质量**：代码结构清晰，易于维护和扩展
5. **安全性**：API密钥和敏感信息处理安全