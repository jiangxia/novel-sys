# Story 5.1: MCP基础客户端开发

## O (Objective)

### 功能目标
- 建立稳定的MCP协议客户端连接
- 实现基础的MCP工具调用封装
- 提供可复用的MCP通信基础设施

### 技术目标  
- 集成 `@modelcontextprotocol/sdk` 客户端
- 实现MCP服务器连接和重连机制
- 建立错误处理和日志记录系统
- 提供类型安全的TypeScript接口

## E (Environment)

### 技术环境
- **核心依赖**: `@modelcontextprotocol/sdk`
- **运行时**: Node.js 18+
- **语言**: TypeScript
- **通信协议**: stdio（标准输入输出）
- **开发工具**: VSCode + TypeScript插件

### 依赖环境
- PromptX MCP服务器已配置并可通过命令行启动
- package.json中已配置MCP SDK依赖
- TypeScript编译环境已配置

### 技术架构参考
```javascript
backend/
├── lib/
│   ├── mcp/
│   │   ├── client.ts           // 核心MCP客户端
│   │   ├── types.ts            // MCP类型定义
│   │   ├── error-handler.ts    // 错误处理
│   │   └── logger.ts           // MCP专用日志
│   └── config/
│       └── mcp-servers.json    // MCP服务器配置
```

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] MCP客户端可以成功连接PromptX服务器
- [ ] 基础工具调用功能正常（list_tools, call_tool）
- [ ] 连接失败时有明确错误信息
- [ ] 支持服务器重启后自动重连

### 优秀标准 (Should Have)  
- [ ] 完整的TypeScript类型支持
- [ ] 详细的操作日志记录
- [ ] 优雅的错误处理和用户友好提示
- [ ] 连接状态的实时监控

### 卓越标准 (Nice to Have)
- [ ] 多MCP服务器支持架构
- [ ] 连接池优化
- [ ] 性能监控和指标收集

## 核心实现结构

### MCP客户端类设计
```typescript
// lib/mcp/client.ts
export class MCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private connected = false;

  async connect(serverConfig: MCPServerConfig): Promise<void> {
    // 建立stdio transport连接
    // 初始化MCP客户端
    // 处理连接错误和重连逻辑
  }

  async listTools(): Promise<Tool[]> {
    // 列出可用工具
  }

  async callTool(name: string, args: Record<string, any>): Promise<any> {
    // 调用指定工具
  }

  async disconnect(): Promise<void> {
    // 优雅关闭连接
  }
}
```

### 配置文件格式
```json
// config/mcp-servers.json
{
  "promptx": {
    "command": "npx",
    "args": ["-y", "-f", "--registry", "https://registry.npmjs.org", "@promptx/cli@dev", "mcp-server"],
    "name": "PromptX角色和记忆系统",
    "timeout": 10000,
    "retry": {
      "maxAttempts": 3,
      "delay": 1000
    }
  }
}
```

## 具体任务分解

### Task 5.1.1: MCP SDK集成和基础连接
**时间估算**: 4小时
- 安装和配置`@modelcontextprotocol/sdk`
- 实现基础MCPClient类
- 建立stdio transport连接
- 测试与PromptX服务器的连接

### Task 5.1.2: 工具调用封装和错误处理  
**时间估算**: 4小时
- 实现listTools和callTool方法
- 建立完整的错误处理机制
- 添加连接状态监控
- 编写单元测试

### Task 5.1.3: 重连机制和日志系统
**时间估算**: 3小时
- 实现自动重连逻辑
- 建立MCP操作日志系统
- 添加配置文件支持
- 性能和稳定性测试

## 验证方式
1. **连接测试**: 启动PromptX MCP服务器，验证客户端连接成功
2. **工具调用测试**: 调用基础MCP工具（如list_tools）
3. **错误恢复测试**: 模拟服务器断开，验证重连机制
4. **并发测试**: 多个并发请求的稳定性验证

## 风险和应对策略
- **风险**: PromptX MCP服务器不稳定
  **应对**: 实现robust的重连和错误恢复机制
- **风险**: stdio通信的复杂性
  **应对**: 使用官方SDK，参考最佳实践
- **风险**: TypeScript类型安全
  **应对**: 严格定义接口，使用泛型确保类型安全