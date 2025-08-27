<execution>
  <constraint>
    ## AI集成的技术约束
    - **API调用规范**：必须使用原生Gemini API，不依赖中间框架
    - **MCP协议遵循**：严格按照Model Context Protocol标准实现PromptX集成
    - **实时通信要求**：WebSocket连接必须支持断线重连和状态恢复
    - **角色状态管理**：4角色系统的状态必须保持一致性和可追踪性
    - **错误处理强制**：所有AI服务调用必须有完整的错误处理和降级机制
  </constraint>

  <rule>
    ## AI集成强制规则
    - **消息格式标准化**：所有AI交互必须遵循统一的消息格式定义
    - **流式响应处理**：必须支持AI响应的流式处理和实时UI更新
    - **角色上下文注入**：每次AI调用必须正确注入角色特定的上下文信息
    - **记忆管理同步**：PromptX记忆操作必须与本地状态保持同步
    - **API限流遵守**：必须实现请求频率控制，避免触发API限制
  </rule>

  <guideline>
    ## AI集成指导原则
    - **用户体验优先**：AI响应速度和质量优化始终服务于用户体验
    - **渐进式降级**：AI服务不可用时提供基础功能的可用性保证
    - **透明化处理**：AI处理状态和可能的错误对用户透明可见
    - **智能化推荐**：基于用户行为和内容特征提供智能的角色推荐
  </guideline>

  <process>
    ## AI集成开发流程
    
    ### Step 1: Gemini API集成
    ```mermaid
    flowchart TD
        A[API客户端初始化] --> B[消息格式转换]
        B --> C[请求参数配置]
        C --> D[流式响应处理]
        D --> E[错误处理实现]
        E --> F[重试机制配置]
    ```
    
    **核心实现要点**：
    - OpenAI格式 → Gemini原生格式的消息转换
    - temperature、maxOutputTokens参数的业务优化
    - 流式响应的chunk处理和WebSocket推送
    - API错误的分类处理和用户友好提示
    
    ### Step 2: MCP协议集成
    ```mermaid
    flowchart TD
        A[MCP客户端连接] --> B[PromptX服务发现]
        B --> C[工具调用封装]
        C --> D[角色激活实现]
        D --> E[记忆管理集成]
        E --> F[连接状态监控]
    ```
    
    **核心实现要点**：
    - promptx_action、promptx_recall、promptx_remember工具调用
    - JSON-RPC 2.0消息格式的正确实现
    - 连接失败的重试和降级策略
    - 4角色状态的持久化和恢复
    
    ### Step 3: WebSocket实时通信
    ```mermaid
    flowchart TD
        A[WebSocket服务启动] --> B[客户端连接管理]
        B --> C[消息路由实现]
        C --> D[AI流式数据转发]
        D --> E[连接状态维护]
        E --> F[错误恢复机制]
    ```
    
    **消息类型定义**：
    - ai:thinking - AI思考状态显示
    - ai:response - AI响应内容推送
    - ai:complete - AI响应完成标记
    - ai:error - AI错误信息通知
    - role:switch - 角色切换状态更新
    
    ### Step 4: 4角色系统集成
    ```mermaid
    graph TD
        A[内容类型识别] --> B{角色路由决策}
        B -->|设定内容| C[激活架构师角色]
        B -->|大纲概要| D[激活规划师角色] 
        B -->|小说内容| E[激活写手角色]
        B -->|跨类型协调| F[激活总监角色]
        C --> G[角色状态管理]
        D --> G
        E --> G
        F --> G
    ```
  </process>

  <criteria>
    ## AI集成质量标准
    
    ### 技术实现标准
    - ✅ Gemini API调用成功率 ≥ 95%
    - ✅ MCP连接稳定性 ≥ 99%
    - ✅ WebSocket消息延迟 ≤ 100ms
    - ✅ 角色切换响应时间 ≤ 2s
    
    ### 用户体验标准  
    - ✅ AI响应流畅无卡顿
    - ✅ 错误提示友好明确
    - ✅ 离线功能可正常使用
    - ✅ 角色差异化体验清晰
    
    ### 系统稳定性标准
    - ✅ 24小时运行无崩溃
    - ✅ 内存使用量控制合理
    - ✅ API配额使用在安全范围
    - ✅ 错误恢复机制有效
  </criteria>
</execution>