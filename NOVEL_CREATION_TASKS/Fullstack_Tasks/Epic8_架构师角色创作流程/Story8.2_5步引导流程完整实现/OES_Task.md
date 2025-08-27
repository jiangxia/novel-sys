# Story 8.2: 5步引导流程完整实现

## O (Objective)

### 功能目标
- 实现架构师角色主导的完整5步引导流程
- 建立从开放式收集到模板验收的端到端用户体验
- 实现智能归类和主动补充建议的核心功能

### 技术目标  
- 集成PromptX MCP架构师角色与前端交互界面
- 实现实时流式对话的用户体验优化
- 建立状态管理和流程控制的完整机制

### 协作目标
- 验证架构师接口协议的实际可用性
- 确保前后端协作的流畅性和稳定性
- 建立5步流程的完整端到端测试验证

## E (Environment)

### 协作环境
- **前端**: React + TypeScript + Zustand状态管理
- **后端**: PromptX MCP + 架构师角色配置
- **协作点**: 实时对话流、状态同步、流程控制

### 技术环境
- 基于Story 8.1制定的接口协议实现
- PromptX MCP架构师角色提示词配置
- 前端对话组件和流程控制组件
- 状态持久化和会话管理机制

### 依赖环境
- Story 8.1：架构师接口协议已完成
- Epic 6-7：4角色系统和PromptX MCP集成已完成
- 前端对话界面基础组件已实现
- 本地文件操作机制已建立

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 用户可以通过架构师完成完整的5步引导流程
- ✅ 每个步骤的交互逻辑正确且用户体验友好
- ✅ 智能归类功能可以准确识别并分类用户输入
- ✅ 主动补充建议基于已有信息提供合理建议

### 优秀标准 (Should Have)  
- ✅ 对话交互自然流畅，用户感受像与专家对话
- ✅ 流程控制支持用户随时回退和修改前面步骤
- ✅ 智能归类的准确率达到85%以上
- ✅ 补充建议具备专业性和创意性

### 卓越标准 (Nice to Have)
- ✅ 架构师可根据用户水平自适应调整对话复杂度
- ✅ 系统可学习用户偏好并优化后续交互
- ✅ 支持多种创作风格的专业化引导
- ✅ 提供创作灵感和参考资料的智能推荐

### 协作标准
- ✅ 前后端数据流转完全符合协议规范
- ✅ 错误处理机制完善，异常情况下用户体验不受影响
- ✅ 性能表现优秀，对话响应时间<2秒
- ✅ 状态管理稳定，支持长时间创作会话

## 5步引导流程详细实现

### 第一步：开放式引导收集

**前端实现要点**：
```typescript
// 第一步交互组件
const Step1Collection: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [architectResponse, setArchitectResponse] = useState('');
  
  const handleStartCreation = async () => {
    const response = await architectService.initializeCreation();
    setArchitectResponse(response.message);
  };
  
  const handleUserInput = async (input: string) => {
    const response = await architectService.collectUserIdeas({
      message: input,
      step: 1,
      context: { userProfile: currentUser }
    });
    
    setArchitectResponse(response.message);
    if (response.nextStep === 2) {
      proceedToStep(2, response.data);
    }
  };
};
```

**后端实现要点**：
- 架构师友好引导："让我们聊聊您心中的故事，无论是一个人物、一个场景，还是一个想法"
- 收集用户所有创意信息，不做任何限制和分类
- 通过追问引导用户表达更多细节
- 判断信息收集充分时自动进入第二步

### 第二步：智能整理归类

**前端实现要点**：
```typescript
// 第二步归类展示组件
const Step2Categorization: React.FC = () => {
  const [categorizedData, setCategorizedData] = useState<CategorizedData>();
  const [isProcessing, setIsProcessing] = useState(true);
  
  const processCategorization = async (rawInput: string) => {
    const response = await architectService.categorizeUserInput({
      rawUserInput: rawInput,
      step: 2,
      existingCategories: {}
    });
    
    setCategorizedData(response.data.categorizedInfo);
    setIsProcessing(false);
  };
};
```

**后端实现要点**：
- 使用AI能力将用户想法按三维度归类
- 实现MECE原则确保归类完整无重叠
- 标识已归类信息和待归类信息
- 向用户展示归类结果并确认准确性

### 第三步：主动补充建议

**前端实现要点**：
```typescript
// 第三步补充建议组件
const Step3Suggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SettingSuggestions>();
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  
  const applySuggestions = async (selected: string[]) => {
    const response = await architectService.applySuggestions({
      suggestions: selected,
      currentData: categorizedData,
      step: 3
    });
    
    updateCategorizedData(response.data.updatedSettings);
  };
};
```

**后端实现要点**：
- 分析已有设定识别缺失的重要要素
- 基于逻辑推理提供合理补充建议
- 每个建议都提供理由说明
- 用户可选择性接受建议

### 第四步：整体展示确认

**前端实现要点**：
```typescript
// 第四步整体确认组件
const Step4Confirmation: React.FC = () => {
  const [completeSettings, setCompleteSettings] = useState<WorldSettings>();
  const [editingField, setEditingField] = useState<string | null>(null);
  
  const confirmSettings = async () => {
    const response = await architectService.confirmSettings({
      settings: completeSettings,
      step: 4
    });
    
    if (response.action === 'validate') {
      proceedToStep(5);
    }
  };
};
```

**后端实现要点**：
- 将完整设定按三维度结构化展示
- 支持用户修改任何字段内容
- 提供整体性确认而非逐项确认
- 确认后自动进入验收步骤

### 第五步：模板完善验收

**前端实现要点**：
```typescript
// 第五步验收组件
const Step5Validation: React.FC = () => {
  const [validationResults, setValidationResults] = useState<ValidationResults>();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateTemplateFiles = async () => {
    setIsGenerating(true);
    const response = await architectService.generateTemplateFiles({
      settings: completeSettings,
      step: 5
    });
    
    setValidationResults(response.data.validationResults);
    setIsGenerating(false);
  };
};
```

**后端实现要点**：
- 执行完整性检查确保所有必填字段有内容
- 检查逻辑一致性和相互支撑关系
- 生成三个标准模板文件
- 保存到本地指定目录并确认成功

## 核心技术实现

### 1. 架构师角色PromptX配置

```yaml
# 架构师角色提示词配置
architect_role:
  name: "小说架构师"
  description: "专业的小说世界观构建专家"
  personality:
    - "专业且友好，像有经验的创作导师"
    - "善于引导而非主导，尊重用户创意"
    - "具备深厚的文学和叙事理论基础"
    - "能够提供专业建议同时保持创意开放性"
  
  capabilities:
    - "世界观设定体系化构建"
    - "创意信息的智能归类整理"
    - "基于逻辑推理的补充建议"
    - "设定完整性和一致性检查"
  
  workflow:
    step1: "开放式引导收集用户创意想法"
    step2: "智能归类到三维度模板体系"
    step3: "主动补充缺失要素的专业建议"
    step4: "整体展示并支持用户确认修改"
    step5: "完整性检查并生成标准模板文件"
```

### 2. 状态管理和流程控制

```typescript
// 架构师创作状态管理
interface ArchitectCreationState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  rawUserInput: string;
  categorizedData: CategorizedWorldInfo;
  suggestions: SettingSuggestions[];
  completeSettings: WorldSettings;
  validationResults: ValidationResults;
  conversationHistory: ChatMessage[];
}

// 流程控制Service
class ArchitectFlowService {
  async progressToNextStep(currentState: ArchitectCreationState): Promise<StepTransition> {
    // 验证当前步骤完成条件
    // 准备下一步骤所需数据
    // 更新状态并触发UI更新
  }
  
  async revertToPreviousStep(targetStep: number): Promise<void> {
    // 支持用户回退到任意前面的步骤
    // 保留已完成的数据避免重复工作
  }
}
```

### 3. 智能归类算法实现

```typescript
// 智能归类核心算法
class IntelligentCategorization {
  async categorizeUserInput(input: string, context: CreationContext): Promise<CategorizedResult> {
    // 使用NLP技术识别关键信息
    const keyInfo = await this.extractKeyInformation(input);
    
    // 按三维度分类规则归类
    const categorized = await this.applyCategorizationRules(keyInfo);
    
    // 计算归类置信度
    const confidence = await this.calculateConfidence(categorized);
    
    return {
      categorizedData: categorized,
      confidence: confidence,
      uncategorizedInfo: this.findUncategorized(input, categorized)
    };
  }
}
```

## 测试验证

### 用户体验测试
- [ ] 新手用户可以顺利完成完整流程
- [ ] 有经验用户感受到专业引导价值
- [ ] 流程支持各种创作风格和类型
- [ ] 错误恢复机制用户友好

### 功能完整性测试
- [ ] 5个步骤的逻辑正确性验证
- [ ] 智能归类准确性测试
- [ ] 补充建议质量评估
- [ ] 模板文件生成正确性验证

### 性能和稳定性测试
- [ ] 长会话状态管理稳定性
- [ ] 高并发用户创作支持
- [ ] 异常情况处理完善性
- [ ] 响应时间性能指标达标

---

**注意**: 本任务属于**事后检查类**，需要在Story 8.1完成后，与Story 8.3并行实现，最终进行端到端集成验证。