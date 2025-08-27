# Story 8.1: 架构师接口设计和协议制定

## O (Objective)

### 功能目标
- 设计架构师角色的完整交互接口规范
- 制定5步引导流程的前后端协作协议
- 定义三维度模板系统的数据交换格式

### 技术目标  
- 建立架构师AI角色的API接口标准
- 规范智能归类算法的输入输出格式
- 设计设定完整性检查的验证机制

### 协作目标
- 为前端交互界面提供清晰的API规范
- 为后端AI服务提供标准的数据格式
- 建立架构师角色与其他角色的切换协议

## E (Environment)

### 协作环境
- **前端**: React + TypeScript + TailwindCSS
- **后端**: Node.js + PromptX MCP集成
- **协作点**: 架构师对话接口、模板数据流转、文件保存同步

### 技术环境
- PromptX MCP服务器连接
- 本地文件系统操作
- 三维度模板系统架构
- 智能归类算法设计

### 依赖环境
- Epic 4-5：Gemini API + PromptX MCP基础服务已完成
- Epic 6-7：4角色系统和路由机制已建立
- 本地文件操作和保存机制已实现

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 完成架构师角色API接口设计文档
- ✅ 定义5步引导流程的完整数据流转协议
- ✅ 制定三维度模板的JSON数据格式规范
- ✅ 建立设定完整性检查的验证标准

### 优秀标准 (Should Have)  
- ✅ API接口支持实时流式对话交互
- ✅ 智能归类算法具备高准确率的分类能力
- ✅ 模板系统支持动态字段扩展和自定义
- ✅ 验证机制提供详细的完整性反馈信息

### 卓越标准 (Nice to Have)
- ✅ 接口设计支持多语言和国际化扩展
- ✅ 归类算法可根据用户习惯自适应优化
- ✅ 模板系统支持用户自定义模板创建
- ✅ 提供架构师角色性能监控和分析接口

### 协作标准
- ✅ 前后端开发团队对接口规范达成完全共识
- ✅ 数据格式在前后端之间流转无损转换
- ✅ 角色切换协议与现有4角色系统完全兼容
- ✅ 错误处理协议统一，前后端错误信息一致

## 核心设计要点

### 1. 架构师角色API接口设计

```typescript
// 架构师对话接口
interface ArchitectChatRequest {
  message: string;
  step: 1 | 2 | 3 | 4 | 5;  // 5步引导流程当前步骤
  context: {
    existingSettings?: PartialWorldSettings;
    userProfile?: UserCreationProfile;
  };
}

interface ArchitectChatResponse {
  message: string;
  action: 'collect' | 'categorize' | 'suggest' | 'confirm' | 'validate';
  data?: {
    categorizedInfo?: CategorizedWorldInfo;
    suggestions?: SettingSuggestions;
    templateData?: WorldSettingsTemplate;
    validationResults?: ValidationResults;
  };
  nextStep?: number;
}
```

### 2. 三维度模板数据格式规范

```typescript
// 故事世界模板数据结构
interface StoryWorldTemplate {
  timeframe: {
    timeSetting: string;
    spaceSetting: string;
    eraCharacteristics: string;
  };
  worldRules: {
    coreSettings: string;
    operationMechanism: string;
    boundaryLimits: string;
  };
  environmentAtmosphere: {
    typicalScenes: string;
    eraTexture: string;
    culturalBackground: string;
  };
}

// 故事主题模板数据结构
interface StoryThemeTemplate {
  workPositioning: {
    novelName: string;
    storyType: string;
    narrativeStructure: string;
    creationConcept: string;
  };
  coreValues: {
    themeCore: string;
    valueSystem: string;
    contemporarySignificance: string;
  };
  valueConflicts: {
    mainConflict: string;
    choiceTest: string;
    growthMainline: string;
  };
  culturalHeritage: {
    traditionalElements: string;
    modernExpression: string;
    spiritualCore: string;
  };
}

// 故事角色模板数据结构
interface StoryCharacterTemplate {
  protagonistSetting: {
    basicInfo: string;
    personalityTraits: string;
    internalConflict: string;
    growthTrajectory: string;
  };
  importantSupportingCharacters: Array<{
    characterName: string;
    rolePositioning: string;
    basicInfo: string;
    relationshipSetting: string;
  }>;
  characterRelationships: {
    coreRelationships: string;
    relationshipEvolution: string;
    conflictDesign: string;
  };
}
```

### 3. 智能归类算法协议

```typescript
// 智能归类输入接口
interface CategorizationRequest {
  rawUserInput: string;
  currentStep: number;
  existingCategories: {
    world: Partial<StoryWorldTemplate>;
    theme: Partial<StoryThemeTemplate>;
    character: Partial<StoryCharacterTemplate>;
  };
}

// 智能归类输出接口
interface CategorizationResponse {
  categorizedData: {
    world: Partial<StoryWorldTemplate>;
    theme: Partial<StoryThemeTemplate>;
    character: Partial<StoryCharacterTemplate>;
  };
  uncategorizedInfo: string[];
  suggestions: string[];
  confidence: number; // 归类置信度 0-1
}
```

### 4. 设定完整性检查协议

```typescript
// 完整性检查接口
interface CompletenessValidation {
  worldSettings: {
    completeness: number; // 0-1
    missingFields: string[];
    qualityScore: number; // 0-1
  };
  themeSettings: {
    completeness: number;
    missingFields: string[];
    qualityScore: number;
  };
  characterSettings: {
    completeness: number;
    missingFields: string[];
    qualityScore: number;
  };
  overallScore: number;
  recommendations: string[];
}
```

### 5. 文件生成和保存协议

```typescript
// 模板文件生成接口
interface TemplateFileGeneration {
  templateType: 'world' | 'theme' | 'character';
  data: StoryWorldTemplate | StoryThemeTemplate | StoryCharacterTemplate;
  filePath: string;
  format: 'markdown';
}

// 文件保存响应
interface FileSaveResponse {
  success: boolean;
  filePath: string;
  fileSize: number;
  lastModified: string;
  error?: string;
}
```

## 实施计划

### Phase 1: 核心接口设计 (Day 1-2)
- 完成架构师角色API接口设计
- 制定三维度模板数据格式规范
- 建立智能归类算法协议

### Phase 2: 协作协议制定 (Day 2-3)
- 设计5步引导流程的完整协作协议
- 制定设定完整性检查验证标准
- 建立文件生成和保存机制规范

### Phase 3: 文档审查和优化 (Day 3)
- 前后端团队协议审查
- 接口规范可行性验证
- 协议文档最终确定和发布

## 质量保证

### 设计原则验证
- [ ] 接口设计遵循RESTful API最佳实践
- [ ] 数据格式支持JSON序列化和反序列化
- [ ] 错误处理机制完整且用户友好
- [ ] 扩展性设计支持未来功能迭代

### 协作验证
- [ ] 前端开发可基于接口规范独立开发
- [ ] 后端开发可基于数据格式独立实现
- [ ] 接口协议经过前后端团队联合评审
- [ ] 测试用例覆盖所有关键协议点

---

**注意**: 本任务属于**事先定义类**，必须在Story 8.2和8.3之前完成，为后续并行开发提供标准化协议基础。