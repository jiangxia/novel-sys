# Story 8.1: 架构师专属创作界面组件开发

## O (Objective)

### 功能目标
- 实现架构师角色的专属创作界面组件体系
- 提供架构师5步引导流程的完整UI交互
- 建立架构师专业化的视觉设计和交互体验
- 实现架构师创作过程的实时状态反馈

### 技术目标  
- 开发可复用的架构师专属React组件库
- 实现复杂创作流程的状态管理和UI同步
- 建立架构师界面的响应式设计和适配
- 提供流畅的用户交互和专业化体验

### 用户体验目标
- 体现架构师角色的专业权威感
- 提供直观友好的创作引导体验
- 支持复杂创作内容的高效输入和管理
- 建立架构师独特的交互风格和视觉标识

## E (Environment)

### 技术环境
- **前端框架**: React 18+ with TypeScript
- **样式方案**: TailwindCSS + 自定义架构师主题
- **状态管理**: React Context + useReducer
- **表单处理**: React Hook Form + Yup验证
- **图标库**: Heroicons + 自定义架构师图标

### 依赖环境
- Epic 2的主工作界面基础架构已完成
- Epic 5/6的角色状态管理组件已实现
- Backend Epic 8的架构师API接口已定义
- 架构师创作流程的业务逻辑和数据格式已确定

### 架构师界面集成位置
```
主工作界面 (架构师激活时)
┌─────────────────────────────────────────┐
│ 左侧交互区              右侧内容区        │
├─────────────────┬───────────────────────┤
│ 🏗️架构师模式     │ ┌─创作引导面板─────┐    │
│ ┌─引导步骤─────┐ │ │ 步骤2: 智能整理   │    │
│ │●开放收集      │ │ │ ○世界 ○主题 ○角色│    │
│ │●智能整理 ←当前│ │ └─────────────────┘    │
│ │○主动补充      │ │ ┌─创作内容区───────┐    │
│ │○整体确认      │ │ │                   │    │
│ │○模板验收      │ │ │ [用户输入区域]     │    │
│ └─────────────┘ │ │                   │    │
│ ┌─专业建议─────┐ │ │ [智能建议区域]     │    │
│ │💡世界观建议   │ │ └─────────────────┘    │
│ │🎭角色建议     │ │                       │
│ │📖主题建议     │ │                       │
│ └─────────────┘ │                       │
└─────────────────┴───────────────────────┘
```

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] 架构师5步引导流程的UI完整实现
- [ ] 架构师专属界面组件功能正常
- [ ] 创作内容的输入和展示界面可用
- [ ] 架构师角色的视觉标识明确区分

### 优秀标准 (Should Have)  
- [ ] 架构师界面的交互体验流畅专业
- [ ] 5步流程的状态切换动画效果优雅
- [ ] 智能建议的展示和操作界面直观
- [ ] 响应式设计适配各种屏幕尺寸

### 卓越标准 (Nice to Have)
- [ ] 架构师界面具有独特的专业美感
- [ ] 创作流程的用户体验超出预期
- [ ] 界面组件的可复用性和扩展性优秀
- [ ] 支持个性化的界面配置和主题

## 核心组件设计

### 架构师主控面板组件
```tsx
// components/architect/ArchitectMasterPanel.tsx
interface ArchitectMasterPanelProps {
  currentStep: ArchitectFlowStep;
  flowProgress: FlowProgress;
  architectState: ArchitectState;
  onStepChange: (step: ArchitectFlowStep) => void;
  onGuidanceRequest: (type: GuidanceType) => void;
}

export const ArchitectMasterPanel: React.FC<ArchitectMasterPanelProps> = ({
  currentStep,
  flowProgress,
  architectState,
  onStepChange,
  onGuidanceRequest
}) => {
  return (
    <div className="architect-master-panel bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg border-2 border-emerald-200">
      {/* 架构师身份标识 */}
      <ArchitectIdentityHeader state={architectState} />
      
      {/* 5步引导流程进度 */}
      <FlowStepProgress 
        currentStep={currentStep}
        progress={flowProgress}
        onStepSelect={onStepChange}
      />
      
      {/* 专业建议面板 */}
      <ProfessionalSuggestionsPanel
        currentStep={currentStep}
        suggestions={architectState.activeSuggestions}
        onGuidanceRequest={onGuidanceRequest}
      />
      
      {/* 创作质量指示器 */}
      <CreationQualityIndicator
        qualityMetrics={architectState.qualityMetrics}
        templateCompleteness={flowProgress.templateCompleteness}
      />
    </div>
  );
};
```

### 5步流程进度组件
```tsx
// components/architect/FlowStepProgress.tsx
interface FlowStepProgressProps {
  currentStep: ArchitectFlowStep;
  progress: FlowProgress;
  onStepSelect: (step: ArchitectFlowStep) => void;
}

const FLOW_STEPS: FlowStepConfig[] = [
  {
    id: 'openGuidance',
    name: '开放收集',
    icon: '💭',
    description: '自由表达创意想法',
    color: 'blue'
  },
  {
    id: 'intelligentSort',
    name: '智能整理',
    icon: '🧠',
    description: 'AI智能归类分析',
    color: 'green'
  },
  {
    id: 'proactiveSupport',
    name: '主动补充',
    icon: '💡',
    description: '专业建议补充',
    color: 'yellow'
  },
  {
    id: 'overallConfirm',
    name: '整体确认',
    icon: '👀',
    description: '完整展示确认',
    color: 'purple'
  },
  {
    id: 'templateComplete',
    name: '模板验收',
    icon: '✅',
    description: '最终验收完成',
    color: 'emerald'
  }
];

export const FlowStepProgress: React.FC<FlowStepProgressProps> = ({
  currentStep,
  progress,
  onStepSelect
}) => {
  return (
    <div className="flow-step-progress mb-4">
      <h3 className="text-sm font-medium text-emerald-800 mb-2">创作流程</h3>
      <div className="space-y-2">
        {FLOW_STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = progress.completedSteps.includes(step.id);
          const isAccessible = progress.accessibleSteps.includes(step.id);
          
          return (
            <FlowStepItem
              key={step.id}
              step={step}
              isActive={isActive}
              isCompleted={isCompleted}
              isAccessible={isAccessible}
              onClick={() => isAccessible && onStepSelect(step.id)}
              progress={progress.stepProgress[step.id]}
            />
          );
        })}
      </div>
    </div>
  );
};

const FlowStepItem: React.FC<FlowStepItemProps> = ({
  step,
  isActive,
  isCompleted,
  isAccessible,
  onClick,
  progress
}) => {
  const baseClasses = "flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200";
  const stateClasses = isActive 
    ? "bg-emerald-100 border-2 border-emerald-400 shadow-md" 
    : isCompleted
    ? "bg-emerald-50 border border-emerald-200"
    : isAccessible
    ? "bg-gray-50 border border-gray-200 hover:bg-gray-100"
    : "bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed";

  return (
    <div className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white">
        {isCompleted ? '✓' : step.icon}
      </div>
      <div className="ml-3 flex-1">
        <div className="text-sm font-medium">{step.name}</div>
        <div className="text-xs text-gray-600">{step.description}</div>
        {progress && (
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div 
              className="bg-emerald-400 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

### 专业建议面板组件
```tsx
// components/architect/ProfessionalSuggestionsPanel.tsx
interface ProfessionalSuggestionsPanelProps {
  currentStep: ArchitectFlowStep;
  suggestions: ArchitectSuggestion[];
  onGuidanceRequest: (type: GuidanceType) => void;
}

export const ProfessionalSuggestionsPanel: React.FC<ProfessionalSuggestionsPanelProps> = ({
  currentStep,
  suggestions,
  onGuidanceRequest
}) => {
  return (
    <div className="professional-suggestions-panel mb-4">
      <h3 className="text-sm font-medium text-emerald-800 mb-2">专业建议</h3>
      
      {/* 当前步骤相关建议 */}
      <div className="space-y-2 mb-3">
        {suggestions
          .filter(s => s.stepRelevant === currentStep)
          .map(suggestion => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onApply={() => onGuidanceRequest({ type: 'apply', suggestionId: suggestion.id })}
            />
          ))}
      </div>

      {/* 快捷指导按钮 */}
      <div className="grid grid-cols-1 gap-2">
        <GuidanceButton
          icon="🌍"
          label="世界观指导"
          onClick={() => onGuidanceRequest({ type: 'worldbuilding' })}
          active={currentStep === 'openGuidance' || currentStep === 'intelligentSort'}
        />
        <GuidanceButton
          icon="🎭"
          label="角色设计"
          onClick={() => onGuidanceRequest({ type: 'character' })}
          active={currentStep === 'proactiveSupport'}
        />
        <GuidanceButton
          icon="📖"
          label="主题深化"
          onClick={() => onGuidanceRequest({ type: 'theme' })}
          active={currentStep === 'overallConfirm'}
        />
      </div>
    </div>
  );
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onApply }) => {
  return (
    <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-emerald-700 mb-1">
            {suggestion.title}
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            {suggestion.description}
          </p>
          {suggestion.example && (
            <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded">
              <strong>示例：</strong> {suggestion.example}
            </div>
          )}
        </div>
        <button
          onClick={onApply}
          className="ml-2 px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors"
        >
          应用
        </button>
      </div>
    </div>
  );
};
```

## 具体任务分解

### Task 8.1.1: 架构师身份标识和主题设计
**时间估算**: 3小时
- 设计架构师角色的专属视觉标识和配色方案
- 实现ArchitectIdentityHeader身份标识组件
- 建立架构师界面的主题变量和样式系统
- 创建架构师专属的图标库和视觉元素

### Task 8.1.2: 5步流程进度展示组件
**时间估算**: 4小时
- 实现FlowStepProgress流程进度展示组件
- 建立步骤状态的视觉反馈和动画效果
- 实现流程步骤的交互和导航功能
- 添加流程进度的实时更新和同步

### Task 8.1.3: 专业建议和指导组件
**时间估算**: 4小时
- 实现ProfessionalSuggestionsPanel建议面板组件
- 建立建议卡片的展示和操作界面
- 实现专业指导按钮的分类和交互
- 添加建议应用的反馈和确认机制

### Task 8.1.4: 创作质量和状态指示器
**时间估算**: 3小时
- 实现CreationQualityIndicator质量指示组件
- 建立模板完整性的可视化展示
- 实现创作进度的实时监控界面
- 添加质量问题的警告和改进提示

### Task 8.1.5: 组件集成和响应式优化
**时间估算**: 3小时
- 将所有架构师组件集成到主界面
- 实现组件间的数据流转和状态同步
- 优化响应式设计和移动端适配
- 添加组件的性能优化和懒加载

## 视觉设计规范

### 架构师主题色彩方案
```typescript
const ARCHITECT_THEME = {
  colors: {
    primary: '#059669',      // 翠绿色 - 专业构建感
    secondary: '#0d9488',    // 青绿色 - 智慧理性
    accent: '#10b981',       // 明绿色 - 创造活力
    background: '#f0fdf4',   // 极浅绿色背景
    border: '#86efac',       // 浅绿色边框
    text: '#064e3b',         // 深绿色文字
  },
  gradients: {
    panel: 'from-emerald-50 to-teal-50',
    button: 'from-emerald-600 to-teal-600',
    progress: 'from-emerald-400 to-green-400'
  },
  shadows: {
    card: '0 4px 6px -1px rgba(16, 185, 129, 0.1)',
    panel: '0 10px 15px -3px rgba(16, 185, 129, 0.1)'
  }
};
```

### 架构师图标设计
```typescript
const ARCHITECT_ICONS = {
  identity: '🏗️',          // 架构师身份
  worldbuilding: '🌍',     // 世界构建
  character: '🎭',         // 角色设计
  theme: '📖',            // 主题设计
  structure: '🏛️',        // 结构设计
  creativity: '💡',       // 创意灵感
  quality: '⭐',          // 质量指标
  progress: '📊',         // 进度指示
  guidance: '🧭',         // 专业指导
  validation: '✅'        // 验证确认
};
```

## 状态管理设计

### 架构师界面状态
```typescript
// hooks/useArchitectUI.ts
interface ArchitectUIState {
  // 流程状态
  currentStep: ArchitectFlowStep;
  flowProgress: FlowProgress;
  stepHistory: StepHistoryEntry[];
  
  // 专业状态
  architectState: ArchitectState;
  activeSuggestions: ArchitectSuggestion[];
  qualityMetrics: QualityMetrics;
  
  // 界面状态
  panelExpanded: boolean;
  suggestionsVisible: boolean;
  guidanceModalOpen: boolean;
  
  // 创作内容
  currentContent: CreationContent;
  templateData: TemplateData;
}

export const useArchitectUI = () => {
  const [state, dispatch] = useReducer(architectUIReducer, initialState);

  // 步骤切换
  const changeStep = useCallback((step: ArchitectFlowStep) => {
    dispatch({ type: 'CHANGE_STEP', payload: step });
  }, []);

  // 应用建议
  const applySuggestion = useCallback(async (suggestionId: string) => {
    dispatch({ type: 'APPLYING_SUGGESTION', payload: suggestionId });
    try {
      const result = await architectAPI.applySuggestion(suggestionId);
      dispatch({ type: 'SUGGESTION_APPLIED', payload: result });
    } catch (error) {
      dispatch({ type: 'SUGGESTION_FAILED', payload: error });
    }
  }, []);

  // 请求专业指导
  const requestGuidance = useCallback(async (guidanceType: GuidanceType) => {
    const guidance = await architectAPI.getGuidance(guidanceType, state.currentContent);
    dispatch({ type: 'GUIDANCE_RECEIVED', payload: guidance });
  }, [state.currentContent]);

  return {
    state,
    actions: {
      changeStep,
      applySuggestion,
      requestGuidance
    }
  };
};
```

## 用户体验优化

### 流程引导优化
```typescript
// 智能提示系统
class ArchitectGuidanceSystem {
  // 基于用户行为的智能提示
  generateContextualHints(
    currentStep: ArchitectFlowStep,
    userBehavior: UserBehavior,
    contentAnalysis: ContentAnalysis
  ): ContextualHint[] {
    const hints: ContextualHint[] = [];

    // 步骤特定提示
    switch (currentStep) {
      case 'openGuidance':
        if (userBehavior.inputHesitation > 30) {
          hints.push({
            type: 'encouragement',
            message: '可以从任何想法开始，比如故事发生的时间或主角的特点',
            priority: 'high'
          });
        }
        break;
        
      case 'intelligentSort':
        if (contentAnalysis.categoryCoverage < 0.6) {
          hints.push({
            type: 'suggestion',
            message: '尝试补充一些关于故事世界或角色关系的想法',
            priority: 'medium'
          });
        }
        break;
    }

    return hints.sort((a, b) => this.getPriority(b.priority) - this.getPriority(a.priority));
  }

  // 自适应界面布局
  adaptLayoutForUser(
    userProfile: UserProfile,
    screenSize: ScreenSize
  ): LayoutConfiguration {
    return {
      panelSize: userProfile.experienceLevel === 'beginner' ? 'expanded' : 'compact',
      suggestionCount: screenSize.width < 768 ? 2 : 4,
      stepDetail: userProfile.preferredGuidance === 'detailed' ? 'full' : 'summary',
      animationLevel: userProfile.motionPreference === 'reduced' ? 'minimal' : 'full'
    };
  }
}
```

## 验证方式
1. **组件功能测试**: 验证所有架构师界面组件的功能正确性
2. **交互体验测试**: 验证5步流程的用户交互体验
3. **响应式测试**: 验证组件在不同设备尺寸下的表现
4. **性能测试**: 验证复杂界面的渲染性能和响应速度
5. **用户体验测试**: 验证架构师界面的专业感和易用性
6. **集成测试**: 验证与Backend架构师API的数据集成

## 风险和应对策略
- **风险**: 界面复杂度过高影响用户体验
  **应对**: 实现分层展示和渐进式信息披露
- **风险**: 5步流程的状态管理复杂导致bug
  **应对**: 建立完整的状态测试和调试机制
- **风险**: 响应式设计在小屏幕上信息过载
  **应对**: 实现自适应布局和可折叠设计
- **风险**: 组件性能影响整体界面流畅性
  **应对**: 实现组件懒加载和性能优化