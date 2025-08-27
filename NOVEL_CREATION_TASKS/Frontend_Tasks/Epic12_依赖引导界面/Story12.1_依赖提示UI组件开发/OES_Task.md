# Story 12.1: 依赖提示UI组件开发

## O (Objective)

### 功能目标
- 开发友好的依赖缺失提示组件
- 实现直观的依赖建议引导界面
- 构建清晰的依赖状态可视化组件

### 技术目标  
- 组件响应时间<100ms
- 支持多种依赖状态的视觉呈现
- 实现无障碍访问兼容性

## E (Environment)

### 技术环境
- React 18 + TypeScript
- TailwindCSS + Headless UI
- 前端状态管理 (Context/Zustand)
- 图标库 (Heroicons)

### 依赖环境
- 全栈制定的依赖API接口规范
- 依赖状态数据格式标准
- 现有UI组件设计系统
- 左侧交互区布局框架

### 设计环境
- 极简黑白灰配色方案
- 微信聊天界面风格参考
- 友好引导的交互模式
- 移动端适配要求

## S (Success Criteria)

### 及格标准 (Must Have)
- **基础提示展示**：正确显示依赖缺失状态和建议
- **交互响应性**：点击操作有明确反馈
- **数据格式适配**：完全兼容后端API数据格式

### 优秀标准 (Should Have)  
- **用户体验优秀**：提示信息清晰易懂，引导自然
- **视觉设计精美**：符合整体设计风格，视觉层次清晰
- **响应式适配**：在不同屏幕尺寸下都有良好表现

### 卓越标准 (Nice to Have)
- **智能交互**：基于用户行为优化提示策略
- **动效增强**：适当的动画效果提升体验
- **个性化定制**：支持用户自定义提示偏好

## 具体任务分解

### Task 12.1.1: 核心依赖提示组件

**DependencyAlert 组件设计**：
```typescript
// components/dependency/DependencyAlert.tsx
interface DependencyAlertProps {
  dependencies: DependencyStatus[];
  onAction: (action: DependencyAction) => void;
  variant?: 'warning' | 'info' | 'success';
  showRecommendations?: boolean;
}

const DependencyAlert: React.FC<DependencyAlertProps> = ({
  dependencies,
  onAction,
  variant = 'warning',
  showRecommendations = true
}) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={`dependency-alert ${variant}`}>
      {/* 主要提示信息 */}
      <AlertHeader 
        type={variant}
        message={generateMainMessage(dependencies)}
        onExpand={() => setExpanded(!expanded)}
      />
      
      {/* 详细信息展开 */}
      <AnimatePresence>
        {expanded && (
          <AlertDetails 
            dependencies={dependencies}
            onAction={onAction}
            showRecommendations={showRecommendations}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
```

**依赖状态卡片组件**：
```typescript
// components/dependency/DependencyCard.tsx
interface DependencyCardProps {
  dependency: DependencyRequirement;
  onNavigate: (fileId: string) => void;
  compact?: boolean;
}

const DependencyCard: React.FC<DependencyCardProps> = ({
  dependency,
  onNavigate,
  compact = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'satisfied': return <CheckCircleIcon className="text-green-500" />;
      case 'partial': return <ExclamationTriangleIcon className="text-yellow-500" />;
      case 'missing': return <XCircleIcon className="text-red-500" />;
      default: return <QuestionMarkCircleIcon className="text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    const texts = {
      satisfied: '已完成',
      partial: '部分完成',
      missing: '未开始',
      not_started: '未创建'
    };
    return texts[status] || '未知状态';
  };

  return (
    <div className={`dependency-card ${dependency.priority} ${compact ? 'compact' : ''}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon(dependency.status)}
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">
            {dependency.description}
          </h4>
          
          {!compact && (
            <div className="mt-1">
              <p className="text-sm text-gray-600">
                状态: {getStatusText(dependency.status)}
              </p>
              
              {dependency.files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {dependency.files.map(file => (
                    <FileLink 
                      key={file}
                      fileName={file}
                      onClick={() => onNavigate(file)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {dependency.priority === 'required' && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
            必需
          </span>
        )}
      </div>
    </div>
  );
};
```

### Task 12.1.2: 依赖引导流程组件

**创作引导向导组件**：
```typescript
// components/dependency/CreationWizard.tsx
interface CreationWizardProps {
  currentFile: string;
  fileType: FileType;
  onComplete: (action: WizardAction) => void;
}

const CreationWizard: React.FC<CreationWizardProps> = ({
  currentFile,
  fileType,
  onComplete
}) => {
  const [step, setStep] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  const wizardSteps = [
    {
      title: '检查前置依赖',
      component: DependencyCheckStep,
      description: '确认创作此内容所需的前置依赖'
    },
    {
      title: '选择操作方案',
      component: ActionSelectionStep,
      description: '选择如何处理缺失的依赖'
    },
    {
      title: '执行引导操作',
      component: ActionExecutionStep,
      description: '按照选择的方案开始创作'
    }
  ];

  return (
    <div className="creation-wizard">
      {/* 步骤指示器 */}
      <StepIndicator 
        currentStep={step}
        totalSteps={wizardSteps.length}
        steps={wizardSteps.map(s => s.title)}
      />
      
      {/* 当前步骤内容 */}
      <div className="wizard-content">
        <WizardStep
          step={wizardSteps[step]}
          data={{ currentFile, fileType, recommendations }}
          onNext={(data) => handleStepNext(data)}
          onPrevious={() => setStep(Math.max(0, step - 1))}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
};

// 依赖检查步骤
const DependencyCheckStep: React.FC<WizardStepProps> = ({
  data,
  onNext
}) => {
  const [dependencies, setDependencies] = useState<DependencyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkDependencies(data.currentFile, data.fileType)
      .then(setDependencies)
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = () => {
    const missingDeps = dependencies.filter(d => d.status !== 'satisfied');
    onNext({
      dependencies,
      missingDependencies: missingDeps,
      canProceedDirectly: missingDeps.length === 0
    });
  };

  if (loading) {
    return <LoadingSpinner message="正在检查依赖关系..." />;
  }

  return (
    <div className="dependency-check-step">
      <h3 className="text-lg font-semibold mb-4">
        依赖关系检查
      </h3>
      
      <div className="space-y-3">
        {dependencies.map(dep => (
          <DependencyCard 
            key={dep.type}
            dependency={dep}
            onNavigate={(fileId) => {/* 导航到依赖文件 */}}
          />
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={handleContinue}>
          继续
        </Button>
      </div>
    </div>
  );
};
```

### Task 12.1.3: 依赖状态可视化组件

**依赖关系图组件**：
```typescript
// components/dependency/DependencyGraph.tsx
interface DependencyGraphProps {
  projectFiles: ProjectFile[];
  currentFile?: string;
  onFileClick: (fileId: string) => void;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({
  projectFiles,
  currentFile,
  onFileClick
}) => {
  const [layout, setLayout] = useState<'hierarchy' | 'network'>('hierarchy');
  
  const graphData = useMemo(() => 
    calculateGraphLayout(projectFiles, layout), 
    [projectFiles, layout]
  );

  return (
    <div className="dependency-graph">
      <div className="graph-controls mb-4">
        <ToggleGroup value={layout} onValueChange={setLayout}>
          <ToggleGroupItem value="hierarchy">层级视图</ToggleGroupItem>
          <ToggleGroupItem value="network">网络视图</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="graph-container">
        <svg className="w-full h-96" viewBox="0 0 800 400">
          {/* 连接线 */}
          {graphData.edges.map(edge => (
            <DependencyEdge 
              key={`${edge.from}-${edge.to}`}
              from={graphData.nodes.find(n => n.id === edge.from)}
              to={graphData.nodes.find(n => n.id === edge.to)}
              type={edge.type}
            />
          ))}
          
          {/* 文件节点 */}
          {graphData.nodes.map(node => (
            <DependencyNode
              key={node.id}
              node={node}
              isActive={node.id === currentFile}
              onClick={() => onFileClick(node.id)}
            />
          ))}
        </svg>
      </div>
      
      {/* 图例 */}
      <GraphLegend />
    </div>
  );
};

// 依赖节点组件
const DependencyNode: React.FC<DependencyNodeProps> = ({
  node,
  isActive,
  onClick
}) => {
  const getNodeColor = (status: string) => {
    const colors = {
      satisfied: '#10b981', // green
      partial: '#f59e0b',   // yellow
      missing: '#ef4444',   // red
      not_started: '#9ca3af' // gray
    };
    return colors[status] || colors.not_started;
  };

  return (
    <g
      className="dependency-node cursor-pointer"
      onClick={onClick}
      transform={`translate(${node.x}, ${node.y})`}
    >
      <circle
        r="20"
        fill={getNodeColor(node.status)}
        stroke={isActive ? '#1f2937' : 'transparent'}
        strokeWidth={isActive ? '3' : '0'}
        className="transition-all duration-200 hover:r-24"
      />
      
      <text
        textAnchor="middle"
        dy="4"
        className="text-xs fill-white font-medium pointer-events-none"
      >
        {node.label}
      </text>
      
      {/* 状态指示器 */}
      {node.hasIssues && (
        <circle
          cx="15"
          cy="-15"
          r="5"
          fill="#ef4444"
          className="animate-pulse"
        />
      )}
    </g>
  );
};
```

### Task 12.1.4: 智能提示交互组件

**上下文感知提示系统**：
```typescript
// components/dependency/SmartTips.tsx
interface SmartTipsProps {
  context: {
    currentFile: string;
    fileType: FileType;
    userAction: string;
    historyPattern: UserPattern[];
  };
  onAction: (action: SmartTipAction) => void;
}

const SmartTips: React.FC<SmartTipsProps> = ({
  context,
  onAction
}) => {
  const [tips, setTips] = useState<SmartTip[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  
  // 基于上下文生成智能提示
  useEffect(() => {
    const generatedTips = generateSmartTips(context);
    const filteredTips = generatedTips.filter(
      tip => !dismissed.has(tip.id)
    );
    setTips(filteredTips);
  }, [context, dismissed]);

  const handleTipAction = (tip: SmartTip, action: string) => {
    if (action === 'dismiss') {
      setDismissed(prev => new Set([...prev, tip.id]));
    } else {
      onAction({
        tipId: tip.id,
        action,
        data: tip.actionData
      });
    }
  };

  return (
    <div className="smart-tips space-y-2">
      <AnimatePresence>
        {tips.map(tip => (
          <SmartTipCard
            key={tip.id}
            tip={tip}
            onAction={(action) => handleTipAction(tip, action)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const SmartTipCard: React.FC<SmartTipCardProps> = ({ tip, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`smart-tip-card ${tip.type}`}
    >
      <div className="flex items-start space-x-3">
        <TipIcon type={tip.type} />
        
        <div className="flex-1">
          <h4 className="font-medium text-sm">{tip.title}</h4>
          <p className="text-xs text-gray-600 mt-1">{tip.description}</p>
          
          {tip.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {tip.actions.map(action => (
                <Button
                  key={action.id}
                  size="sm"
                  variant={action.primary ? 'primary' : 'secondary'}
                  onClick={() => onAction(action.id)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={() => onAction('dismiss')}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

// 智能提示生成逻辑
function generateSmartTips(context: TipContext): SmartTip[] {
  const tips: SmartTip[] = [];
  
  // 基于文件类型的提示
  if (context.fileType === 'content' && !hasDependency(context, 'summary')) {
    tips.push({
      id: 'missing_summary_for_content',
      type: 'warning',
      title: '建议先完成概要',
      description: '有了详细的故事概要，能帮助你写出更加连贯的内容',
      actions: [
        { id: 'create_summary', label: '创建概要', primary: true },
        { id: 'continue_anyway', label: '继续写作', primary: false }
      ]
    });
  }
  
  // 基于用户行为模式的提示
  if (hasPatternMatch(context.historyPattern, 'frequent_outline_before_content')) {
    tips.push({
      id: 'suggest_outline_based_on_pattern',
      type: 'info',
      title: '根据你的习惯',
      description: '你通常会先完善大纲再写内容，要不要先看看大纲？',
      actions: [
        { id: 'open_outline', label: '查看大纲', primary: true }
      ]
    });
  }
  
  return tips;
}
```

## 技术实现要点

### 组件性能优化
```typescript
// 使用 React.memo 和 useMemo 优化渲染
const DependencyCard = React.memo<DependencyCardProps>(({ dependency, ...props }) => {
  const statusIcon = useMemo(() => 
    getStatusIcon(dependency.status), 
    [dependency.status]
  );
  
  return (
    // 组件JSX
  );
});

// 虚拟化长列表
const DependencyList: React.FC<DependencyListProps> = ({ dependencies }) => {
  return (
    <FixedSizeList
      height={400}
      itemCount={dependencies.length}
      itemSize={80}
      itemData={dependencies}
    >
      {DependencyListItem}
    </FixedSizeList>
  );
};
```

### 响应式设计适配
```css
/* TailwindCSS 响应式类 */
.dependency-alert {
  @apply w-full p-4 rounded-lg border;
  @apply md:max-w-md md:mx-auto;
  @apply lg:max-w-lg;
}

.dependency-graph {
  @apply w-full;
  @apply sm:h-64 md:h-80 lg:h-96;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .smart-tip-card .actions {
    @apply flex-col space-y-2 space-x-0;
  }
}
```

### 无障碍访问支持
```typescript
// ARIA 标签和键盘导航
<div
  role="alert"
  aria-live="polite"
  aria-describedby="dependency-description"
>
  <h3 id="dependency-title">依赖状态</h3>
  <p id="dependency-description">
    {/* 描述文本 */}
  </p>
</div>

// 键盘导航支持
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      handleAction();
      break;
    case 'Escape':
      handleDismiss();
      break;
  }
};
```

## 验收标准

### 功能验收
- [ ] 所有依赖状态正确显示
- [ ] 用户操作反馈及时准确
- [ ] 数据格式完全兼容后端API

### 设计验收  
- [ ] 符合整体设计风格
- [ ] 响应式适配完善
- [ ] 交互体验自然流畅

### 性能验收
- [ ] 组件渲染时间<100ms
- [ ] 长列表滚动流畅
- [ ] 内存使用合理