# Story 7.1: 架构师规划师写手角色集成

## O (Objective)

### 功能目标
- 集成架构师、规划师、写手三个AI角色到PromptX MCP系统
- 建立3个角色的专业能力配置和触发机制
- 实现角色间的独立性和专业化特色

### 技术目标  
- 完成3个角色的PromptX MCP配置和连接
- 建立角色能力映射和专业化提示词配置
- 实现角色服务的模块化和可扩展架构

## E (Environment)

### 技术环境
- PromptX MCP服务器连接
- Node.js + TypeScript后端架构
- 基于Epic 6的总监角色集成基础
- 角色管理服务框架

### 依赖环境
- Epic 5：PromptX MCP基础客户端已完成
- Epic 6：总监角色集成模式已验证
- 角色配置文件和提示词模板已设计
- 角色能力定义和触发条件已确定

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 架构师角色成功集成，专业能力正常工作
- ✅ 规划师角色成功集成，专业能力正常工作
- ✅ 写手角色成功集成，专业能力正常工作
- ✅ 3个角色的专业特色明确区分

### 优秀标准 (Should Have)  
- ✅ 角色响应质量达到专业水准
- ✅ 角色服务性能稳定，响应时间<3秒
- ✅ 角色配置支持动态调整和优化
- ✅ 完整的错误处理和异常恢复机制

### 卓越标准 (Nice to Have)
- ✅ 角色可根据使用反馈自动优化
- ✅ 支持角色个性化和用户适配
- ✅ 提供角色使用统计和分析
- ✅ 角色扩展接口支持未来新角色

## 具体任务分解

### Task 7.1.1: 架构师角色集成

**PromptX配置**：
```yaml
# 架构师角色配置
architect_role:
  name: "小说架构师"
  description: "专业的世界观构建和设定体系化专家"
  
  personality:
    tone: "专业且友好，像有经验的创作导师"
    approach: "引导而非主导，尊重用户创意"
    expertise: "深厚的文学和叙事理论基础"
  
  capabilities:
    - "世界观设定的体系化构建"
    - "创意信息的智能归类整理"
    - "基于逻辑推理的设定补充"
    - "设定完整性和一致性检查"
  
  trigger_patterns:
    content_types: ["novel_settings"]
    keywords: ["设定", "世界观", "背景", "时代", "规则", "体系"]
    file_patterns: ["**/0-小说设定/**/*"]
```

**服务实现**：
```typescript
// 架构师角色服务
class ArchitectRoleService extends BaseRoleService {
  roleId = 'architect';
  
  async initialize(): Promise<void> {
    await this.loadPromptConfig('architect_role');
    await this.setupCapabilities([
      'world_building',
      'setting_systematization',
      'creative_categorization', 
      'completeness_validation'
    ]);
  }
  
  async processUserInput(input: UserInput): Promise<RoleResponse> {
    const context = await this.buildArchitectContext(input);
    
    // 架构师专业处理逻辑
    if (this.isWorldBuildingTask(input)) {
      return await this.handleWorldBuilding(input, context);
    } else if (this.isSettingAnalysisTask(input)) {
      return await this.handleSettingAnalysis(input, context);
    }
    
    return await this.generateArchitectResponse(input, context);
  }
  
  private async buildArchitectContext(input: UserInput): Promise<ArchitectContext> {
    return {
      existingSettings: await this.loadExistingSettings(input.projectPath),
      creativePreferences: await this.analyzeUserPreferences(input.userId),
      worldBuildingTemplates: await this.loadWorldTemplates()
    };
  }
}
```

### Task 7.1.2: 规划师角色集成

**PromptX配置**：
```yaml
# 规划师角色配置
planner_role:
  name: "故事规划师"
  description: "专业的故事结构设计和情节安排专家"
  
  personality:
    tone: "结构化和逻辑性强，注重可读性"
    approach: "系统性分析，提供清晰的结构建议"
    expertise: "深入的叙事结构理论基础"
  
  capabilities:
    - "故事结构的设计和优化"
    - "情节发展脉络的梳理"
    - "大纲和概要的专业创作"
    - "逻辑一致性的检查验证"
  
  trigger_patterns:
    content_types: ["story_outline", "story_summary"]
    keywords: ["大纲", "概要", "情节", "结构", "逻辑", "脉络"]
    file_patterns: ["**/1-故事大纲/**/*", "**/2-故事概要/**/*"]
```

### Task 7.1.3: 写手角色集成

**PromptX配置**：
```yaml
# 写手角色配置
writer_role:
  name: "小说写手"
  description: "专业的文本创作和文学表达专家"
  
  personality:
    tone: "文学性强，富有创意和表现力"
    approach: "注重文本质量和情感表达"
    expertise: "丰富的文学创作技巧和经验"
  
  capabilities:
    - "高质量小说内容的创作"
    - "文学手法的运用和优化"
    - "文本风格的适配和调整"
    - "内容品质的检查和提升"
  
  trigger_patterns:
    content_types: ["novel_content"]
    keywords: ["写作", "内容", "文本", "创作", "润色", "文学"]
    file_patterns: ["**/3-小说内容/**/*"]
```

## 角色管理架构

### 统一角色管理器

```typescript
// 4角色统一管理器
class FourRoleManager {
  private roles: Map<string, BaseRoleService>;
  
  constructor() {
    this.roles = new Map([
      ['supervisor', new SupervisorRoleService()],
      ['architect', new ArchitectRoleService()],
      ['planner', new PlannerRoleService()], 
      ['writer', new WriterRoleService()]
    ]);
  }
  
  async initializeAllRoles(): Promise<void> {
    await Promise.all(
      Array.from(this.roles.values()).map(role => role.initialize())
    );
  }
  
  async getRoleService(roleId: string): Promise<BaseRoleService> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }
    return role;
  }
  
  async validateRoleCapabilities(): Promise<ValidationResult> {
    const results = await Promise.all(
      Array.from(this.roles.entries()).map(async ([id, service]) => ({
        roleId: id,
        isValid: await service.validateCapabilities(),
        capabilities: await service.getCapabilities()
      }))
    );
    
    return {
      allValid: results.every(r => r.isValid),
      roleResults: results
    };
  }
}
```

### 角色基础服务抽象

```typescript
// 角色服务基类
abstract class BaseRoleService {
  protected roleId: string;
  protected promptConfig: any;
  protected capabilities: RoleCapability[];
  
  abstract async initialize(): Promise<void>;
  abstract async processUserInput(input: UserInput): Promise<RoleResponse>;
  
  async loadPromptConfig(configName: string): Promise<void> {
    this.promptConfig = await this.promptxClient.loadConfiguration(configName);
  }
  
  async setupCapabilities(capabilityIds: string[]): Promise<void> {
    this.capabilities = await this.loadCapabilityDefinitions(capabilityIds);
  }
  
  async validateCapabilities(): Promise<boolean> {
    return this.capabilities.every(cap => this.canHandleCapability(cap));
  }
  
  protected async generateRoleResponse(
    input: UserInput, 
    context: any
  ): Promise<RoleResponse> {
    const prompt = await this.buildRolePrompt(input, context);
    const response = await this.promptxClient.chat(prompt);
    
    return {
      content: response.message,
      metadata: {
        roleId: this.roleId,
        processingType: this.identifyProcessingType(input),
        confidence: response.confidence
      }
    };
  }
}
```

---

**注意**: 这个后端任务专注于3个角色的PromptX MCP集成，可以与前端角色切换UI任务并行开发。