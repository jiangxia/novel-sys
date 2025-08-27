# Story 10.1: 6步逻辑骨架引导UI组件开发

## O (Objective)

### 功能目标
- 开发6步逻辑骨架的可视化引导界面
- 实现起始状态→矛盾发生→冲突升级→智慧介入→问题解决→结果状态的流程UI
- 建立步骤间的逻辑关系展示和交互引导

### 技术目标  
- 基于React + TypeScript构建逻辑骨架组件库
- 实现步骤流程的可视化和交互控制
- 集成与规划师服务的实时引导接口

## E (Environment)

### 技术环境
- React 18 + TypeScript + TailwindCSS
- 流程可视化库（React Flow 或自定义）
- Zustand状态管理
- 与Epic 9大纲数据的关联接口

### 依赖环境
- Epic 9：规划师大纲创作界面已实现，提供大纲数据
- Epic 7：规划师角色切换界面已实现
- 6步逻辑骨架的UI设计规范已确定
- 概要创作的交互逻辑已设计

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 6个逻辑步骤的UI界面正确显示和交互
- ✅ 步骤间的逻辑关系可视化展示清晰
- ✅ 每个步骤的引导输入和结果展示功能完整
- ✅ 与后端规划师服务的数据交互正常工作

### 优秀标准 (Should Have)  
- ✅ 逻辑骨架的可视化直观易懂，体现因果关系
- ✅ 步骤引导专业化，体现规划师的叙事理论基础
- ✅ 支持步骤间的回退修改和预览功能
- ✅ 界面响应速度快，用户体验流畅

### 卓越标准 (Nice to Have)
- ✅ 支持不同小说类型的逻辑骨架模板
- ✅ 提供智能写作建议和创意启发
- ✅ 逻辑骨架的动态可视化效果精美
- ✅ 支持协作编辑和版本对比

## 具体任务分解

### Task 10.1.1: 6步逻辑骨架主界面

```typescript
// 6步逻辑骨架主组件
const SixStepLogicFramework: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [outlineContext] = useOutlineContext(); // 来自Epic 9
  
  const logicSteps = [
    { id: 1, title: '起始状态', description: '故事开始时的人物和环境状况' },
    { id: 2, title: '矛盾发生', description: '引发冲突的核心事件或问题出现' },
    { id: 3, title: '冲突升级', description: '矛盾激化，困难和挑战加剧' },
    { id: 4, title: '智慧介入', description: '主角运用智慧寻找解决方案' },
    { id: 5, title: '问题解决', description: '采取行动，逐步化解矛盾' },
    { id: 6, title: '结果状态', description: '新的平衡状态和人物成长' }
  ];
  
  return (
    <div className="six-step-framework">
      <FrameworkHeader 
        title="6步逻辑骨架构建" 
        subtitle="规划师专业引导"
        outlineContext={outlineContext}
      />
      
      <LogicFlowVisualization 
        steps={logicSteps}
        currentStep={currentStep}
        stepData={stepData}
        onStepClick={setCurrentStep}
      />
      
      <StepDetailPanel>
        {logicSteps.map(step => (
          <StepEditor
            key={step.id}
            step={step}
            isActive={currentStep === step.id}
            data={stepData[step.id - 1]}
            onDataChange={(data) => updateStepData(step.id, data)}
          />
        ))}
      </StepDetailPanel>
      
      <FrameworkControls 
        onValidate={handleValidateLogic}
        onPreview={handlePreviewSummary}
        onSave={handleSaveProgress}
      />
    </div>
  );
};
```

### Task 10.1.2: 逻辑流程可视化组件

```typescript
// 逻辑流程可视化组件
const LogicFlowVisualization: React.FC<LogicFlowProps> = ({
  steps, currentStep, stepData, onStepClick
}) => {
  return (
    <div className="logic-flow-container">
      <div className="flow-diagram">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <StepNode
              step={step}
              isActive={currentStep === step.id}
              isCompleted={stepData[index]?.isCompleted}
              hasData={!!stepData[index]?.content}
              onClick={() => onStepClick(step.id)}
            />
            
            {index < steps.length - 1 && (
              <FlowConnector 
                from={step.id}
                to={step.id + 1}
                isActive={currentStep > step.id}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <LogicRelationships 
        steps={steps}
        stepData={stepData}
        showCausalChain={true}
      />
    </div>
  );
};

// 步骤节点组件
const StepNode: React.FC<StepNodeProps> = ({
  step, isActive, isCompleted, hasData, onClick
}) => (
  <div
    className={cn(
      'step-node',
      'relative p-4 rounded-lg border-2 cursor-pointer transition-all',
      'flex flex-col items-center text-center min-w-[160px]',
      {
        'border-blue-500 bg-blue-50 text-blue-700 shadow-lg': isActive,
        'border-green-500 bg-green-50 text-green-700': isCompleted,
        'border-gray-300 bg-white text-gray-700 hover:border-gray-400': !isActive && !isCompleted,
        'opacity-75': !hasData && !isActive
      }
    )}
    onClick={onClick}
  >
    <div className="step-number text-lg font-bold mb-1">
      {step.id}
    </div>
    <div className="step-title font-medium mb-2">
      {step.title}
    </div>
    <div className="step-description text-sm text-gray-600">
      {step.description}
    </div>
    
    {isCompleted && (
      <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-green-500" />
    )}
    
    {hasData && !isCompleted && (
      <Badge className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800">
        草稿
      </Badge>
    )}
  </div>
);
```

### Task 10.1.3: 步骤编辑器组件

```typescript
// 步骤详细编辑器
const StepEditor: React.FC<StepEditorProps> = ({
  step, isActive, data, onDataChange
}) => {
  const [localData, setLocalData] = useState<StepData>(data || {});
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateGuidance = async () => {
    setIsGenerating(true);
    
    try {
      const guidance = await plannerService.generateStepGuidance({
        stepId: step.id,
        outlineContext: useOutlineContext(),
        previousSteps: getPreviousStepsData()
      });
      
      setLocalData(prev => ({ ...prev, guidance }));
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (!isActive) return null;
  
  return (
    <div className="step-editor">
      <StepHeader step={step} />
      
      <div className="editor-sections space-y-6">
        {/* 基础信息部分 */}
        <Section title="基础设定">
          <FormField 
            label="何人（人物）"
            value={localData.who}
            onChange={(value) => updateLocalData('who', value)}
            placeholder="本步骤中的主要人物"
          />
          <FormField 
            label="何时（时间）"
            value={localData.when}
            onChange={(value) => updateLocalData('when', value)}
            placeholder="事件发生的具体时间"
          />
          <FormField 
            label="何地（地点）"
            value={localData.where}
            onChange={(value) => updateLocalData('where', value)}
            placeholder="事件发生的具体地点"
          />
          <FormField 
            label="何事（事件）"
            value={localData.what}
            onChange={(value) => updateLocalData('what', value)}
            placeholder="具体发生了什么事情"
            type="textarea"
            rows={3}
          />
        </Section>
        
        {/* 深层逻辑部分 */}
        <Section title="逻辑深化">
          <FormField 
            label={getReasoningLabel(step.id)}
            value={localData.reasoning}
            onChange={(value) => updateLocalData('reasoning', value)}
            placeholder={getReasoningPlaceholder(step.id)}
            type="textarea"
            rows={4}
          />
        </Section>
        
        {/* AI引导建议 */}
        <Section title="专业引导">
          <Button 
            onClick={handleGenerateGuidance}
            disabled={isGenerating}
            variant="outline"
          >
            {isGenerating ? '生成中...' : '获取规划师建议'}
          </Button>
          
          {localData.guidance && (
            <GuidanceDisplay 
              guidance={localData.guidance}
              onApply={handleApplyGuidance}
            />
          )}
        </Section>
      </div>
      
      <StepActions 
        onSave={() => onDataChange(localData)}
        onNext={() => moveToNextStep()}
        onPrevious={() => moveToPreviousStep()}
        canProceed={isStepDataComplete(localData)}
      />
    </div>
  );
};

// 根据步骤ID获取推理问题标签
const getReasoningLabel = (stepId: number): string => {
  const labels = {
    1: '为什么会这样？',
    2: '对抗的根源是什么？',
    3: '为什么矛盾加剧？',
    4: '主角如何运用智慧？',
    5: '为什么这样做有效？',
    6: '这个结果如何引导下一篇？'
  };
  return labels[stepId] || '深层逻辑分析';
};
```

### Task 10.1.4: 逻辑验证和预览

```typescript
// 逻辑验证组件
const LogicValidation: React.FC = () => {
  const [validationResult, setValidationResult] = useState<ValidationResult>();
  const stepData = useStepData();
  
  const handleValidateLogic = async () => {
    const result = await plannerService.validateLogicFramework({
      stepData,
      outlineContext: useOutlineContext()
    });
    
    setValidationResult(result);
  };
  
  return (
    <div className="logic-validation">
      <ValidationControls onValidate={handleValidateLogic} />
      
      {validationResult && (
        <ValidationResults result={validationResult} />
      )}
    </div>
  );
};

// 概要预览组件
const SummaryPreview: React.FC = () => {
  const [previewData, setPreviewData] = useState<SummaryPreviewData>();
  const stepData = useStepData();
  
  const generatePreview = async () => {
    const preview = await plannerService.generateSummaryPreview({
      logicFramework: stepData,
      outlineContext: useOutlineContext()
    });
    
    setPreviewData(preview);
  };
  
  return (
    <div className="summary-preview">
      <PreviewControls onGenerate={generatePreview} />
      
      {previewData && (
        <div className="preview-content">
          <PreviewHeader data={previewData} />
          <PreviewBasicInfo data={previewData} />
          <PreviewPlotFlow data={previewData} />
          <PreviewKeyElements data={previewData} />
          <PreviewConnections data={previewData} />
        </div>
      )}
    </div>
  );
};
```

## 状态管理和数据流

```typescript
// 6步逻辑骨架状态管理
interface LogicFrameworkStore {
  currentStep: number;
  stepData: StepData[];
  outlineContext: OutlineContext;
  validationResult?: ValidationResult;
  
  setCurrentStep: (step: number) => void;
  updateStepData: (stepId: number, data: StepData) => void;
  validateFramework: () => Promise<ValidationResult>;
  resetFramework: () => void;
}

const useLogicFrameworkStore = create<LogicFrameworkStore>((set, get) => ({
  currentStep: 1,
  stepData: Array(6).fill({}),
  outlineContext: {},
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  updateStepData: (stepId, data) => set((state) => ({
    stepData: state.stepData.map((item, index) => 
      index === stepId - 1 ? { ...item, ...data } : item
    )
  })),
  
  validateFramework: async () => {
    const { stepData, outlineContext } = get();
    const result = await plannerService.validateLogicFramework({
      stepData,
      outlineContext
    });
    set({ validationResult: result });
    return result;
  },
  
  resetFramework: () => set({
    currentStep: 1,
    stepData: Array(6).fill({}),
    validationResult: undefined
  })
}));
```

---

**注意**: 此前端任务专注于6步逻辑骨架的UI引导，可以与Backend Epic10任务并行开发，通过Mock数据进行前端开发。