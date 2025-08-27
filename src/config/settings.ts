// 统一配置管理类（借鉴Pydantic模式）
export class Settings {
  // AI服务配置
  geminiApiKey: string
  promptxMcpServer: string
  defaultModel: 'gemini-pro' | 'gemini-pro-vision' = 'gemini-pro'
  
  // 应用配置
  appName: string = '小说创作系统'
  debug: boolean = false
  
  // 服务器配置
  port: number = 3001
  frontendUrl: string = 'http://localhost:3000'
  
  // 存储配置
  memoryLimit: number = 100 // 最大对话记录数
  
  constructor() {
    // 从环境变量加载配置
    this.geminiApiKey = process.env.GEMINI_API_KEY || ''
    this.promptxMcpServer = process.env.PROMPTX_MCP_SERVER || 'npx -y dpml-prompt@dev mcp-server'
    this.port = parseInt(process.env.PORT || '3001')
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    this.debug = process.env.DEBUG === 'true'
    this.memoryLimit = parseInt(process.env.MEMORY_LIMIT || '100')
    
    // 验证必需的配置
    this.validate()
  }
  
  private validate() {
    const errors: string[] = []
    
    if (!this.geminiApiKey && process.env.NODE_ENV === 'production') {
      errors.push('GEMINI_API_KEY 未配置')
    }
    
    if (this.port < 1000 || this.port > 65535) {
      errors.push('PORT 配置无效，应在1000-65535范围内')
    }
    
    if (this.memoryLimit < 10) {
      errors.push('MEMORY_LIMIT 配置过小，最少应为10')
    }
    
    if (errors.length > 0) {
      throw new Error(`配置验证失败：\n${errors.join('\n')}`)
    }
  }
  
  // 获取配置摘要（不包含敏感信息）
  getSummary() {
    return {
      appName: this.appName,
      debug: this.debug,
      port: this.port,
      frontendUrl: this.frontendUrl,
      memoryLimit: this.memoryLimit,
      defaultModel: this.defaultModel,
      hasGeminiKey: !!this.geminiApiKey
    }
  }
}

// 全局配置实例
export const settings = new Settings()