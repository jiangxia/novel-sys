# Story 6.1: 总监角色专属交互界面组件

## O (Objective)

### 功能目标
- 实现总监角色的专属交互界面组件
- 提供总监质量评估结果的可视化展示
- 建立总监跨文章协调的界面交互
- 实现总监角色的专业化对话体验

### 技术目标  
- 扩展Epic 5的记忆状态指示器以支持总监特性
- 实现质量评估结果的图形化展示组件
- 建立总监角色的专门UI交互模式
- 提供总监建议的结构化展示界面

### 用户体验目标
- 突出总监角色的权威性和专业性
- 提供直观的质量状况可视化
- 支持总监建议的快速操作和应用
- 建立总监角色的独特交互感受

## E (Environment)

### 技术环境
- **前端框架**: React 18+ with TypeScript
- **样式方案**: TailwindCSS
- **基础组件**: 基于Epic 5的记忆状态指示器组件
- **图表库**: Chart.js 或 Recharts (质量可视化)
- **图标库**: Heroicons + 自定义总监专属图标

### 依赖环境
- Epic 5的记忆状态指示器组件已实现
- Epic 2的左侧对话区组件基础架构
- Backend Epic 6的总监API接口已定义
- 总监角色的UI设计规范和视觉标识

### 总监界面集成位置
```
左侧交互区 - 对话Tab (总监激活时)
┌─────────────────────┐
│  [对话] [项目]       │
├─────────────────────┤
│ ┌─总监状态面板─────┐ │
│ │👨‍💼总监 ●活跃     │ │
│ │📊质量总览        │ │
│ │⚡主动建议 (2)     │ │
│ └─────────────────┘ │
│ ┌─对话区域─────────┐ │
│ │总监: 我注意到...  │ │
│ │[应用建议] [忽略]  │ │
│ └─────────────────┘ │
│ ┌─质量面板─────────┐ │
│ │一致性: 85% ●●●○  │ │
│ │结构性: 92% ●●●●  │ │
│ └─────────────────┘ │
└─────────────────────┘
```

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] 总监角色激活时界面切换到专属模式
- [ ] 质量评估结果能清晰直观地展示
- [ ] 总监建议能结构化展示并支持快速操作
- [ ] 总监对话界面与其他角色有明显区分

### 优秀标准 (Should Have)  
- [ ] 质量状况的实时可视化更新
- [ ] 总监建议的智能分类和优先级展示
- [ ] 总监角色的专业化视觉设计和动画效果
- [ ] 支持总监建议的批量应用和撤销操作

### 卓越标准 (Nice to Have)
- [ ] 总监工作状态的实时动画反馈
- [ ] 质量趋势的历史图表展示
- [ ] 总监建议的预览和影响评估
- [ ] 个性化的总监界面配置和布局调整

## 核心组件设计

### 总监专属状态面板
```tsx
// components/supervisor/SupervisorStatusPanel.tsx
interface SupervisorStatusPanelProps {
  supervisorState: SupervisorState;
  qualityOverview: QualityOverview;
  activeSuggestions: SupervisorSuggestion[];
  onApplySuggestion: (suggestion: SupervisorSuggestion) => void;
}

export const SupervisorStatusPanel: React.FC<SupervisorStatusPanelProps> = ({
  supervisorState,
  qualityOverview,
  activeSuggestions,
  onApplySuggestion
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
      {/* 总监状态指示 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">👨‍💼</div>
          <div>
            <div className="font-bold text-blue-800">总监</div>
            <div className="text-sm text-blue-600">{supervisorState.status}</div>
          </div>
        </div>
        <SupervisorActivityIndicator activity={supervisorState.currentActivity} />
      </div>

      {/* 质量总览 */}
      <QualityOverviewWidget overview={qualityOverview} />

      {/* 主动建议 */}
      <ActiveSuggestionsWidget 
        suggestions={activeSuggestions}
        onApply={onApplySuggestion}
      />
    </div>
  );
};
```

### 质量评估可视化组件
```tsx
// components/supervisor/QualityVisualization.tsx
interface QualityVisualizationProps {
  qualityData: QualityAssessmentResult;
  showTrends?: boolean;
  compact?: boolean;
}

export const QualityVisualization: React.FC<QualityVisualizationProps> = ({
  qualityData,
  showTrends = false,
  compact = false
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* 总体质量评分 */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-800">
          {Math.round(qualityData.overallScore * 100)}
        </div>
        <div className="text-sm text-gray-600">总体质量评分</div>
        <QualityScoreRing score={qualityData.overallScore} />
      </div>

      {/* 各维度评分 */}
      <div className="grid grid-cols-2 gap-2">
        <QualityDimensionBar
          label="一致性"
          score={qualityData.dimensions.consistency}
          color="blue"
        />
        <QualityDimensionBar
          label="结构性"
          score={qualityData.dimensions.structure}
          color="green"
        />
        <QualityDimensionBar
          label="文学性"
          score={qualityData.dimensions.literary}
          color="purple"
        />
        <QualityDimensionBar
          label="规范性"
          score={qualityData.dimensions.standards}
          color="yellow"
        />
      </div>

      {/* 趋势图 */}
      {showTrends && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <QualityTrendChart />
        </div>
      )}
    </div>
  );
};
```

### 总监建议展示组件
```tsx
// components/supervisor/SupervisorSuggestions.tsx
interface SupervisorSuggestionsProps {
  suggestions: SupervisorSuggestion[];
  onApply: (suggestion: SupervisorSuggestion) => void;
  onDismiss: (suggestionId: string) => void;
  groupByPriority?: boolean;
}

export const SupervisorSuggestions: React.FC<SupervisorSuggestionsProps> = ({
  suggestions,
  onApply,
  onDismiss,
  groupByPriority = true
}) => {
  const groupedSuggestions = groupByPriority 
    ? groupBy(suggestions, 'priority')
    : { all: suggestions };

  return (
    <div className="space-y-4">
      {Object.entries(groupedSuggestions).map(([priority, items]) => (
        <div key={priority} className="space-y-2">
          {groupByPriority && (
            <h4 className="font-medium text-gray-700 capitalize">
              {priority === 'critical' ? '🔴 紧急' : 
               priority === 'important' ? '🟡 重要' : '💡 建议'}
            </h4>
          )}
          
          {items.map((suggestion, index) => (
            <SuggestionCard
              key={`${priority}-${index}`}
              suggestion={suggestion}
              onApply={() => onApply(suggestion)}
              onDismiss={() => onDismiss(suggestion.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onApply,
  onDismiss
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h5 className="font-medium text-blue-800 mb-1">
            {suggestion.title}
          </h5>
          <p className="text-sm text-blue-600 mb-2">
            {suggestion.description}
          </p>
          {suggestion.examples && (
            <div className="text-xs text-blue-500">
              <strong>示例:</strong> {suggestion.examples[0]}
            </div>
          )}
        </div>
        <div className="flex space-x-1 ml-3">
          {suggestion.actionable && (
            <button
              onClick={onApply}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              应用
            </button>
          )}
          <button
            onClick={onDismiss}
            className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
          >
            忽略
          </button>
        </div>
      </div>
    </div>
  );
};
```

## 具体任务分解

### Task 6.1.1: 总监专属状态面板组件
**时间估算**: 4小时
- 实现SupervisorStatusPanel主组件
- 设计总监角色的专属视觉标识和样式
- 实现总监活动状态的实时指示器
- 集成到左侧对话区的角色状态系统

### Task 6.1.2: 质量评估可视化组件
**时间估算**: 5小时
- 实现QualityVisualization质量展示组件
- 建立质量评分的环形图表和柱状图
- 实现质量维度的分类展示
- 添加质量趋势的历史图表功能

### Task 6.1.3: 总监建议展示和交互组件
**时间估算**: 4小时
- 实现SupervisorSuggestions建议展示组件
- 建立建议的分类、优先级和操作界面
- 实现建议的应用和忽略交互逻辑
- 添加建议的批量处理功能

### Task 6.1.4: 总监专属对话界面优化
**时间估算**: 3小时
- 优化总监角色的对话消息展示样式
- 实现总监消息的特殊格式（建议、警告、确认）
- 添加总监对话的快捷操作按钮
- 实现总监与用户对话的专业化体验

### Task 6.1.5: 组件集成和响应式适配
**时间估算**: 3小时
- 将所有总监组件集成到主界面
- 实现总监模式与其他角色模式的切换
- 响应式适配和移动端优化
- 组件交互测试和用户体验优化

## 视觉设计规范

### 总监角色视觉标识
```typescript
const SUPERVISOR_THEME = {
  colors: {
    primary: '#1e40af',      // 深蓝色 - 权威感
    secondary: '#3b82f6',    // 蓝色 - 专业感
    accent: '#60a5fa',       // 浅蓝色 - 友好感
    background: '#eff6ff',   // 极浅蓝色背景
    border: '#bfdbfe',       // 蓝色边框
    text: '#1e40af',         // 深蓝色文字
  },
  icons: {
    supervisor: '👨‍💼',      // 总监头像
    quality: '📊',          // 质量图标
    suggestion: '💡',       // 建议图标
    warning: '⚠️',          // 警告图标
    success: '✅',          // 成功图标
  },
  animations: {
    thinking: 'pulse',      // 思考动画
    working: 'bounce',      // 工作动画
    success: 'checkmark',   // 成功动画
  }
};
```

### 质量评分视觉映射
```typescript
const QUALITY_SCORE_COLORS = {
  excellent: { range: [0.9, 1.0], color: '#10b981', label: '优秀' },
  good: { range: [0.8, 0.9], color: '#3b82f6', label: '良好' },
  fair: { range: [0.7, 0.8], color: '#f59e0b', label: '一般' },
  poor: { range: [0.6, 0.7], color: '#ef4444', label: '需改进' },
  critical: { range: [0, 0.6], color: '#dc2626', label: '紧急' }
};
```

## 状态管理设计

### 总监界面状态管理
```typescript
// hooks/useSupervisorUI.ts
interface SupervisorUIState {
  isActive: boolean;
  currentQuality: QualityAssessmentResult | null;
  activeSuggestions: SupervisorSuggestion[];
  showQualityDetails: boolean;
  suggestionFilter: 'all' | 'critical' | 'important' | 'suggestion';
}

export const useSupervisorUI = () => {
  const [state, dispatch] = useReducer(supervisorUIReducer, initialState);

  const activateSupervisorMode = useCallback(() => {
    dispatch({ type: 'ACTIVATE_SUPERVISOR_MODE' });
  }, []);

  const updateQualityData = useCallback((quality: QualityAssessmentResult) => {
    dispatch({ type: 'UPDATE_QUALITY_DATA', payload: quality });
  }, []);

  const applySuggestion = useCallback(async (suggestion: SupervisorSuggestion) => {
    dispatch({ type: 'APPLYING_SUGGESTION', payload: suggestion.id });
    try {
      await api.applySupervisorSuggestion(suggestion);
      dispatch({ type: 'SUGGESTION_APPLIED', payload: suggestion.id });
    } catch (error) {
      dispatch({ type: 'SUGGESTION_FAILED', payload: { id: suggestion.id, error } });
    }
  }, []);

  return {
    state,
    activateSupervisorMode,
    updateQualityData,
    applySuggestion
  };
};
```

## 验证方式
1. **界面功能测试**: 验证总监专属组件的功能完整性
2. **视觉一致性测试**: 确保总监界面风格与产品整体一致
3. **交互体验测试**: 验证总监建议的应用和操作流畅性
4. **响应式测试**: 验证组件在不同屏幕尺寸下的表现
5. **集成测试**: 验证与Backend总监API的数据对接
6. **用户体验测试**: 验证总监模式的专业感和权威感

## 风险和应对策略
- **风险**: 总监界面过于复杂影响用户使用
  **应对**: 实现渐进式界面展示，支持简化模式
- **风险**: 质量可视化数据更新延迟影响体验
  **应对**: 实现本地缓存和乐观更新机制
- **风险**: 总监建议操作失败的错误处理
  **应对**: 建立完善的错误提示和重试机制
- **风险**: 不同角色模式切换时的状态丢失
  **应对**: 实现角色状态的持久化和恢复机制