# Story 9.1: 4步创作流程UI组件开发

## O (Objective)

### 功能目标
- 开发规划师4步大纲创作流程的完整UI界面
- 实现主题分析→背景匹配→事件设计→价值提炼的流程引导
- 建立专业化的创作辅助和结果展示界面

### 技术目标  
- 基于React + TypeScript构建模块化流程组件
- 实现流程状态管理和步骤间的数据传递
- 集成与后端规划师服务的实时交互接口

## E (Environment)

### 技术环境
- React 18 + TypeScript + TailwindCSS
- Zustand状态管理
- 流程控制和步骤导航组件库
- 与Epic 8设定数据的关联接口

### 依赖环境
- Epic 7：规划师角色切换界面已实现
- Epic 8：架构师设定创作数据可作为输入
- 大纲创作的UI设计规范已确定
- 4步流程的交互逻辑已设计

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 4个步骤的UI界面正确显示和交互
- ✅ 流程状态管理正常，支持步骤间切换
- ✅ 与后端规划师服务的数据交互正常工作
- ✅ 每个步骤的专业引导和结果展示功能完整

### 优秀标准 (Should Have)  
- ✅ 流程引导直观清晰，用户体验流畅
- ✅ 步骤间切换有合适的动画和过渡效果
- ✅ 数据展示专业化，体现规划师专业特色
- ✅ 支持流程暂停、保存和恢复功能

### 卓越标准 (Nice to Have)
- ✅ 智能提示和创作建议的精美UI展示
- ✅ 支持不同创作风格的界面个性化
- ✅ 流程进度可视化和创作历史记录
- ✅ 响应式设计适配各种屏幕尺寸

## 具体任务分解

### Task 9.1.1: 4步流程主界面框架

```typescript
// 4步大纲创作流程主组件
const OutlineCreationFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [flowData, setFlowData] = useState<OutlineFlowData>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const steps = [
    { id: 1, title: '主题深度分析', description: '探索故事核心价值和哲学内涵' },
    { id: 2, title: '背景事件匹配', description: '选择最适合的时代背景和历史环境' },
    { id: 3, title: '核心事件设计', description: '构建体现主题的核心情节冲突' },
    { id: 4, title: '价值意义提炼', description: '明确故事要传达的深层价值' }
  ];
  
  return (
    <div className="outline-creation-flow">
      <FlowHeader 
        title="故事大纲创作" 
        subtitle="规划师专业引导"
      />
      
      <StepNavigation 
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepNavigation}
        disabled={isProcessing}
      />
      
      <StepContent>
        {currentStep === 1 && <ThemeAnalysisStep />}
        {currentStep === 2 && <BackgroundMatchStep />}
        {currentStep === 3 && <EventsDesignStep />}
        {currentStep === 4 && <ValueRefinementStep />}
      </StepContent>
      
      <FlowControls 
        currentStep={currentStep}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
        onSave={handleSaveProgress}
        isProcessing={isProcessing}
      />
    </div>
  );
};
```

### Task 9.1.2: 第一步主题分析组件

```typescript
// 主题分析步骤组件
const ThemeAnalysisStep: React.FC = () => {
  const [settingsData] = useSettingsData(); // 来自Epic 8
  const [themeInput, setThemeInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ThemeAnalysisResult>();
  const [analysisDepth, setAnalysisDepth] = useState<'basic' | 'deep' | 'philosophical'>('deep');
  
  const handleAnalyze = async () => {
    const result = await plannerService.analyzeTheme({
      userInput: themeInput,
      existingSettings: settingsData,
      analysisDepth
    });
    
    setAnalysisResult(result);
  };
  
  return (
    <div className="theme-analysis-step">
      <StepDescription>
        基于您的世界观设定，深入分析故事要传达的核心主题和价值内涵
      </StepDescription>
      
      <SettingsContext settings={settingsData} />
      
      <ThemeInputSection>
        <TextArea
          value={themeInput}
          onChange={setThemeInput}
          placeholder="描述您希望通过这个故事传达的核心主题、价值观念或哲学思考"
          rows={4}
        />
        
        <AnalysisDepthSelector 
          value={analysisDepth}
          onChange={setAnalysisDepth}
          options={[
            { value: 'basic', label: '基础分析' },
            { value: 'deep', label: '深度分析' },
            { value: 'philosophical', label: '哲学层面' }
          ]}
        />
        
        <Button onClick={handleAnalyze} disabled={!themeInput.trim()}>
          开始主题分析
        </Button>
      </ThemeInputSection>
      
      {analysisResult && (
        <AnalysisResultDisplay 
          result={analysisResult}
          onAccept={handleAcceptAnalysis}
          onRevise={handleReviseAnalysis}
        />
      )}
    </div>
  );
};
```

### Task 9.1.3: 第二步背景匹配组件

```typescript
// 背景事件匹配组件
const BackgroundMatchStep: React.FC = () => {
  const [themeAnalysis] = useThemeAnalysis();
  const [matchOptions, setMatchOptions] = useState<BackgroundOption[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>();
  
  const handleFindMatches = async () => {
    const options = await plannerService.matchBackground({
      themeAnalysis,
      worldSettings: useSettingsData()
    });
    
    setMatchOptions(options);
  };
  
  return (
    <div className="background-match-step">
      <ThemeContextPanel analysis={themeAnalysis} />
      
      <BackgroundSearchSection>
        <Button onClick={handleFindMatches}>
          智能匹配历史背景
        </Button>
      </BackgroundSearchSection>
      
      {matchOptions.length > 0 && (
        <BackgroundOptionsGrid>
          {matchOptions.map(option => (
            <BackgroundOptionCard
              key={option.id}
              option={option}
              isSelected={selectedBackground?.id === option.id}
              onSelect={setSelectedBackground}
              showMatchReason={true}
            />
          ))}
        </BackgroundOptionsGrid>
      )}
      
      {selectedBackground && (
        <BackgroundDetailsPanel 
          background={selectedBackground}
          onConfirm={handleConfirmBackground}
        />
      )}
    </div>
  );
};
```

### Task 9.1.4: 第三步核心事件设计组件

```typescript
// 核心事件设计组件
const EventsDesignStep: React.FC = () => {
  const [designMode, setDesignMode] = useState<'guided' | 'manual'>('guided');
  const [eventsStructure, setEventsStructure] = useState<EventsStructure>();
  
  const handleDesignEvents = async () => {
    const structure = await plannerService.designCoreEvents({
      themeAnalysis: useThemeAnalysis(),
      backgroundMatch: useSelectedBackground(),
      characterSettings: useCharacterSettings()
    });
    
    setEventsStructure(structure);
  };
  
  return (
    <div className="events-design-step">
      <DesignContextPanel 
        theme={useThemeAnalysis()}
        background={useSelectedBackground()}
        characters={useCharacterSettings()}
      />
      
      <DesignModeSelector 
        value={designMode}
        onChange={setDesignMode}
        options={[
          { value: 'guided', label: '智能引导设计' },
          { value: 'manual', label: '手动结构设计' }
        ]}
      />
      
      {designMode === 'guided' ? (
        <GuidedDesignInterface onDesign={handleDesignEvents} />
      ) : (
        <ManualDesignInterface 
          onStructureChange={setEventsStructure}
        />
      )}
      
      {eventsStructure && (
        <EventsStructureDisplay 
          structure={eventsStructure}
          onRefine={handleRefineStructure}
          onConfirm={handleConfirmEvents}
        />
      )}
    </div>
  );
};
```

### Task 9.1.5: 第四步价值提炼组件

```typescript
// 价值意义提炼组件
const ValueRefinementStep: React.FC = () => {
  const [refinementResult, setRefinementResult] = useState<ValueResult>();
  const [previewOutline, setPreviewOutline] = useState<OutlinePreview>();
  
  const handleRefineValue = async () => {
    const result = await plannerService.refineValue({
      completeData: compileFlowData()
    });
    
    setRefinementResult(result);
    setPreviewOutline(result.outlinePreview);
  };
  
  return (
    <div className="value-refinement-step">
      <FlowSummaryPanel data={compileFlowData()} />
      
      <RefinementSection>
        <Button onClick={handleRefineValue}>
          提炼价值意义
        </Button>
      </RefinementSection>
      
      {refinementResult && (
        <ValueMeaningDisplay 
          result={refinementResult}
          onAdjust={handleAdjustValues}
        />
      )}
      
      {previewOutline && (
        <OutlinePreviewPanel 
          outline={previewOutline}
          onEdit={handleEditOutline}
          onGenerate={handleGenerateOutline}
        />
      )}
      
      <FinalizeSection>
        <Button 
          onClick={handleFinalizeOutline}
          variant="primary"
          size="large"
        >
          生成完整大纲
        </Button>
      </FinalizeSection>
    </div>
  );
};
```

## 状态管理和数据流

```typescript
// 大纲创作流程状态管理
interface OutlineFlowStore {
  currentStep: number;
  themeAnalysis?: ThemeAnalysisResult;
  backgroundMatch?: BackgroundOption;
  eventsStructure?: EventsStructure;
  valueRefinement?: ValueResult;
  
  setCurrentStep: (step: number) => void;
  updateThemeAnalysis: (analysis: ThemeAnalysisResult) => void;
  updateBackgroundMatch: (background: BackgroundOption) => void;
  updateEventsStructure: (events: EventsStructure) => void;
  updateValueRefinement: (value: ValueResult) => void;
  resetFlow: () => void;
}

const useOutlineFlowStore = create<OutlineFlowStore>((set) => ({
  currentStep: 1,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  updateThemeAnalysis: (analysis) => set({ themeAnalysis: analysis }),
  updateBackgroundMatch: (background) => set({ backgroundMatch: background }),
  updateEventsStructure: (events) => set({ eventsStructure: events }),
  updateValueRefinement: (value) => set({ valueRefinement: value }),
  resetFlow: () => set({ 
    currentStep: 1, 
    themeAnalysis: undefined,
    backgroundMatch: undefined,
    eventsStructure: undefined,
    valueRefinement: undefined
  })
}));
```

---

**注意**: 此前端任务可以与Backend Epic9任务并行开发，通过Mock数据进行前端开发，最后与后端服务集成对接。