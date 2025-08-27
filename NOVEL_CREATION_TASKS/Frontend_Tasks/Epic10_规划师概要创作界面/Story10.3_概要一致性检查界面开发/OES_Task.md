# Story 10.3: 概要一致性检查界面开发

## O (Objective)

### 功能目标
- 开发概要与大纲一致性检查的可视化界面
- 实现智能对比分析和差异标注功能
- 建立一致性修复和版本同步机制

### 技术目标  
- 基于React + TypeScript构建对比分析组件
- 实现文档diff算法和可视化展示
- 集成智能修复建议和批量处理功能

## E (Environment)

### 技术环境
- React 18 + TypeScript + TailwindCSS
- 文档对比库（react-diff-viewer）
- Zustand状态管理
- 数据验证和错误提示系统

### 依赖环境
- Epic 9：规划师大纲数据作为对比基准
- Story 10.1-10.2：完整概要数据作为检查对象
- 一致性检查规则已定义
- 差异修复策略已设计

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 一致性检查界面完整显示和交互
- ✅ 准确识别概要与大纲的差异点
- ✅ 提供清晰的差异可视化和标注
- ✅ 支持基础的修复建议和操作

### 优秀标准 (Should Have)  
- ✅ 智能差异分类和优先级排序
- ✅ 批量修复和一键同步功能
- ✅ 详细的一致性报告和分析
- ✅ 历史检查记录和趋势分析

### 卓越标准 (Nice to Have)
- ✅ AI驱动的智能修复建议
- ✅ 自定义检查规则配置
- ✅ 团队协作和审核工作流
- ✅ 自动化检查和预警系统

## 具体任务分解

### Task 10.3.1: 一致性检查主界面

```typescript
// 概要一致性检查主组件
const ConsistencyCheckInterface: React.FC = () => {
  const [checkResult, setCheckResult] = useState<ConsistencyResult>();
  const [selectedIssue, setSelectedIssue] = useState<ConsistencyIssue>();
  const [checkMode, setCheckMode] = useState<'full' | 'incremental'>('full');
  
  const [outlineData] = useOutlineData(); // 大纲数据
  const [summaryData] = useSummaryData(); // 概要数据
  
  const handleRunCheck = async () => {
    const result = await consistencyService.checkConsistency({
      outline: outlineData,
      summary: summaryData,
      mode: checkMode
    });
    
    setCheckResult(result);
  };
  
  return (
    <div className="consistency-check-interface">
      <CheckHeader 
        title="概要一致性检查" 
        subtitle="确保概要与大纲完全一致"
      />
      
      <CheckControls>
        <CheckModeSelector 
          value={checkMode}
          onChange={setCheckMode}
          options={[
            { value: 'full', label: '全面检查' },
            { value: 'incremental', label: '增量检查' }
          ]}
        />
        
        <Button 
          onClick={handleRunCheck}
          variant="primary"
          size="large"
        >
          开始检查
        </Button>
      </CheckControls>
      
      <div className="check-layout">
        <IssuesSidebar>
          <IssuesSummary result={checkResult} />
          <IssuesList 
            issues={checkResult?.issues || []}
            selectedIssue={selectedIssue}
            onSelect={setSelectedIssue}
          />
        </IssuesSidebar>
        
        <ComparisonArea>
          {selectedIssue ? (
            <IssueDetailView 
              issue={selectedIssue}
              onResolve={handleResolveIssue}
            />
          ) : (
            <OverallComparison 
              outline={outlineData}
              summary={summaryData}
              result={checkResult}
            />
          )}
        </ComparisonArea>
        
        <ActionsPanel>
          <QuickActions result={checkResult} />
          <BulkOperations issues={checkResult?.issues} />
        </ActionsPanel>
      </div>
    </div>
  );
};
```

### Task 10.3.2: 差异可视化组件

```typescript
// 差异对比可视化组件
const DifferenceVisualizer: React.FC<DiffVisualizerProps> = ({
  outlineSection, summarySection, differences
}) => {
  const [viewMode, setViewMode] = useState<'sideBySide' | 'inline' | 'unified'>('sideBySide');
  
  return (
    <div className="difference-visualizer">
      <ViewModeSelector 
        value={viewMode}
        onChange={setViewMode}
      />
      
      {viewMode === 'sideBySide' && (
        <SideBySideComparison 
          left={{
            title: '大纲内容',
            content: outlineSection,
            type: 'outline'
          }}
          right={{
            title: '概要内容', 
            content: summarySection,
            type: 'summary'
          }}
          differences={differences}
        />
      )}
      
      {viewMode === 'inline' && (
        <InlineComparison 
          content={summarySection}
          references={outlineSection}
          differences={differences}
        />
      )}
      
      {viewMode === 'unified' && (
        <UnifiedDiffView 
          original={outlineSection}
          modified={summarySection}
          differences={differences}
        />
      )}
      
      <DifferenceDetails differences={differences} />
    </div>
  );
};

// 差异详情展示
const DifferenceDetails: React.FC<{ differences: Difference[] }> = ({ differences }) => (
  <div className="difference-details">
    <h3>差异分析</h3>
    
    {differences.map(diff => (
      <DifferenceCard key={diff.id} className={`diff-${diff.type}`}>
        <DifferenceHeader diff={diff} />
        
        <DifferenceContent>
          <div className="diff-description">
            {diff.description}
          </div>
          
          {diff.type === 'missing' && (
            <MissingContent 
              expected={diff.expected}
              suggestions={diff.suggestions}
            />
          )}
          
          {diff.type === 'inconsistent' && (
            <InconsistentContent 
              outline={diff.outlineValue}
              summary={diff.summaryValue}
              severity={diff.severity}
            />
          )}
          
          {diff.type === 'extra' && (
            <ExtraContent 
              content={diff.extraContent}
              recommendation={diff.recommendation}
            />
          )}
        </DifferenceContent>
        
        <DifferenceActions>
          <Button onClick={() => handleAcceptSuggestion(diff)}>
            接受建议
          </Button>
          <Button onClick={() => handleIgnoreDifference(diff)} variant="outline">
            忽略差异
          </Button>
          <Button onClick={() => handleManualEdit(diff)} variant="secondary">
            手动修改
          </Button>
        </DifferenceActions>
      </DifferenceCard>
    ))}
  </div>
);
```

### Task 10.3.3: 智能修复系统

```typescript
// 智能修复建议系统
const IntelligentRepairSystem: React.FC = () => {
  const [repairPlan, setRepairPlan] = useState<RepairPlan>();
  const [repairProgress, setRepairProgress] = useState<RepairProgress>();
  
  const generateRepairPlan = async (issues: ConsistencyIssue[]) => {
    const plan = await repairService.generatePlan({
      issues,
      priority: 'automatic', // 'automatic' | 'manual' | 'hybrid'
      strategy: 'minimal' // 'minimal' | 'comprehensive' | 'conservative'
    });
    
    setRepairPlan(plan);
  };
  
  const executeRepair = async (plan: RepairPlan) => {
    setRepairProgress({ status: 'running', completed: 0, total: plan.operations.length });
    
    for (const operation of plan.operations) {
      try {
        await repairService.executeOperation(operation);
        setRepairProgress(prev => ({ 
          ...prev!, 
          completed: prev!.completed + 1 
        }));
      } catch (error) {
        setRepairProgress(prev => ({ 
          ...prev!, 
          status: 'error', 
          error: error.message 
        }));
        break;
      }
    }
    
    setRepairProgress(prev => ({ ...prev!, status: 'completed' }));
  };
  
  return (
    <div className="intelligent-repair-system">
      <RepairPlanGenerator onGenerate={generateRepairPlan} />
      
      {repairPlan && (
        <RepairPlanDisplay 
          plan={repairPlan}
          onExecute={() => executeRepair(repairPlan)}
          onModify={handleModifyPlan}
        />
      )}
      
      {repairProgress && (
        <RepairProgressMonitor 
          progress={repairProgress}
          onCancel={handleCancelRepair}
        />
      )}
    </div>
  );
};

// 修复操作组件
const RepairOperations: React.FC = () => {
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  
  const operationTypes = [
    {
      type: 'sync-content',
      name: '内容同步',
      description: '将大纲内容同步到概要中',
      automatic: true
    },
    {
      type: 'resolve-conflict',
      name: '冲突解决',
      description: '解决内容冲突并选择正确版本',
      automatic: false
    },
    {
      type: 'add-missing',
      name: '补充缺失',
      description: '添加概要中缺失的必要内容',
      automatic: true
    },
    {
      type: 'remove-extra',
      name: '删除多余',
      description: '删除概要中与大纲不符的内容',
      automatic: false
    }
  ];
  
  return (
    <div className="repair-operations">
      <OperationsList>
        {operationTypes.map(op => (
          <OperationCard 
            key={op.type}
            operation={op}
            selected={selectedOperations.includes(op.type)}
            onToggle={(type) => toggleOperation(type)}
          />
        ))}
      </OperationsList>
      
      <BatchOperations>
        <Button onClick={handleSelectAll}>
          全选
        </Button>
        <Button onClick={handleSelectAutomatic}>
          仅选自动修复
        </Button>
        <Button 
          onClick={handleExecuteSelected}
          disabled={selectedOperations.length === 0}
          variant="primary"
        >
          执行选中操作
        </Button>
      </BatchOperations>
    </div>
  );
};
```

### Task 10.3.4: 检查报告系统

```typescript
// 一致性检查报告组件
const ConsistencyReport: React.FC = () => {
  const [report, setReport] = useState<ConsistencyReport>();
  const [reportConfig, setReportConfig] = useState<ReportConfig>();
  
  const generateReport = async (checkResult: ConsistencyResult) => {
    const report = await reportService.generateReport({
      checkResult,
      config: reportConfig,
      includeHistory: true
    });
    
    setReport(report);
  };
  
  return (
    <div className="consistency-report">
      <ReportHeader report={report} />
      
      <ReportSummary>
        <MetricCard 
          title="总体一致性"
          value={`${report?.overallScore}%`}
          trend={report?.trend}
          color={getScoreColor(report?.overallScore)}
        />
        
        <MetricCard 
          title="发现问题"
          value={report?.issuesCount}
          breakdown={report?.issuesByType}
        />
        
        <MetricCard 
          title="修复建议"
          value={report?.suggestionsCount}
          priority={report?.priorityDistribution}
        />
      </ReportSummary>
      
      <DetailedAnalysis>
        <SectionAnalysis 
          title="章节对比分析"
          data={report?.sectionAnalysis}
        />
        
        <CharacterConsistency 
          title="人物一致性检查"
          data={report?.characterConsistency}
        />
        
        <PlotConsistency 
          title="情节逻辑检查"
          data={report?.plotConsistency}
        />
        
        <ThemeConsistency 
          title="主题价值检查"
          data={report?.themeConsistency}
        />
      </DetailedAnalysis>
      
      <ReportActions>
        <Button onClick={handleExportReport}>
          导出报告
        </Button>
        <Button onClick={handleScheduleCheck}>
          定期检查
        </Button>
        <Button onClick={handleShareReport}>
          分享报告
        </Button>
      </ReportActions>
    </div>
  );
};
```

## 状态管理和数据流

```typescript
// 一致性检查状态管理
interface ConsistencyCheckStore {
  checkResult?: ConsistencyResult;
  selectedIssue?: ConsistencyIssue;
  repairPlan?: RepairPlan;
  checkHistory: CheckHistoryItem[];
  
  runCheck: (config: CheckConfig) => Promise<ConsistencyResult>;
  selectIssue: (issue: ConsistencyIssue) => void;
  resolveIssue: (issueId: string, resolution: Resolution) => void;
  generateRepairPlan: () => Promise<RepairPlan>;
  executeRepair: (plan: RepairPlan) => Promise<RepairResult>;
}

const useConsistencyCheckStore = create<ConsistencyCheckStore>((set, get) => ({
  checkHistory: [],
  
  runCheck: async (config) => {
    const result = await consistencyService.checkConsistency(config);
    set({ 
      checkResult: result,
      checkHistory: [
        ...get().checkHistory,
        { result, timestamp: Date.now(), config }
      ]
    });
    return result;
  },
  
  selectIssue: (issue) => set({ selectedIssue: issue }),
  
  resolveIssue: async (issueId, resolution) => {
    const { checkResult } = get();
    if (checkResult) {
      const updatedResult = {
        ...checkResult,
        issues: checkResult.issues.map(issue =>
          issue.id === issueId 
            ? { ...issue, resolved: true, resolution }
            : issue
        )
      };
      set({ checkResult: updatedResult });
    }
  },
  
  generateRepairPlan: async () => {
    const { checkResult } = get();
    if (checkResult) {
      const plan = await repairService.generatePlan(checkResult);
      set({ repairPlan: plan });
      return plan;
    }
    throw new Error('No check result available');
  },
  
  executeRepair: async (plan) => {
    const result = await repairService.executeRepair(plan);
    // 重新运行检查验证修复结果
    const newCheckResult = await get().runCheck({ mode: 'full' });
    return result;
  }
}));
```

---

**注意**: 此一致性检查界面需要与Backend的检查服务紧密配合，确保能够准确识别和修复概要与大纲之间的差异。