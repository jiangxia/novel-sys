# Story 8.2: 5步引导流程状态管理引擎

## O (Objective)

### 功能目标
- 实现架构师5步引导流程的完整状态管理系统
- 建立流程步骤间的智能转换和验证机制
- 提供流程状态的实时跟踪和回滚能力
- 实现用户友好的流程中断和恢复机制

### 技术目标  
- 设计可扩展的状态机引擎支持复杂创作流程
- 实现流程状态的持久化和分布式同步
- 建立流程质量检查和自动推进机制
- 提供流程分析和优化的数据支持

### 业务目标
- 确保架构师引导流程的连贯性和专业性
- 支持用户在流程中的灵活操作和个性化节奏
- 实现流程结果的质量保证和标准化输出
- 建立流程效果的数据分析和持续改进

## E (Environment)

### 技术环境
- **基础依赖**: Story 8.1的架构师角色管理系统
- **状态机引擎**: XState或自研状态机引擎
- **流程存储**: Redis + PostgreSQL双重持久化
- **语言**: TypeScript + Node.js
- **消息队列**: Redis Pub/Sub用于实时状态同步

### 依赖环境
- 架构师角色已成功激活并具备专业能力
- 三维度模板系统的数据结构已定义
- 用户项目的基础信息和上下文已建立
- Epic 5的记忆系统可提供流程历史数据

### 5步引导流程定义
```typescript
interface ArchitectGuidanceFlow {
  // 流程步骤定义
  steps: {
    step1_openGuidance: {
      name: '开放式引导收集';
      objective: '友好收集用户所有创意想法';
      transitions: ['step2_intelligentSort'];
      validationRequired: false;
    };
    step2_intelligentSort: {
      name: '智能整理归类';
      objective: '将用户想法按三维度智能归类';
      transitions: ['step3_proactiveSupport', 'step1_openGuidance'];
      validationRequired: true;
    };
    step3_proactiveSupport: {
      name: '主动补充建议';
      objective: '针对缺失要素提供专业建议';
      transitions: ['step4_overallConfirm', 'step2_intelligentSort'];
      validationRequired: true;
    };
    step4_overallConfirm: {
      name: '整体展示确认';
      objective: '完整展示设定供用户确认';
      transitions: ['step5_templateComplete', 'step3_proactiveSupport'];
      validationRequired: false;
    };
    step5_templateComplete: {
      name: '模板完善验收';
      objective: '确保三个模板文件完整且一致';
      transitions: [];
      validationRequired: true;
    };
  };

  // 流程状态数据
  state: {
    currentStep: keyof FlowSteps;
    stepProgress: Record<string, StepProgress>;
    collectedData: ThreeDimensionData;
    userFeedback: UserFeedback[];
    qualityChecks: QualityCheckResult[];
  };
}
```

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] 5步引导流程的状态转换正确且稳定
- [ ] 流程状态能正确持久化和恢复
- [ ] 每个步骤的验证机制正常工作
- [ ] 流程中断和恢复功能可靠

### 优秀标准 (Should Have)  
- [ ] 流程状态转换响应时间<500ms
- [ ] 支持并发用户的流程状态隔离
- [ ] 流程分析提供有价值的优化建议
- [ ] 用户可以在流程中灵活前进和后退

### 卓越标准 (Nice to Have)
- [ ] 流程引擎支持个性化的步骤调整
- [ ] 智能预测用户下一步操作并预加载
- [ ] 流程效率的机器学习优化
- [ ] 支持多种流程模式(快速/深度/协作)

## 核心实现架构

### 引导流程状态管理器
```typescript
// lib/guidance/flow-state-manager.ts
export class ArchitectGuidanceFlowManager {
  private stateMachine: StateMachine<FlowContext, FlowEvent>;
  private stateStore: FlowStateStore;
  private validator: FlowValidator;
  private analyzer: FlowAnalyzer;

  constructor(
    private architectManager: ArchitectManager,
    private templateEngine: TemplateEngine,
    private memoryManager: MemoryManager
  ) {
    this.initializeStateMachine();
  }

  // 初始化状态机
  private initializeStateMachine() {
    this.stateMachine = Machine<FlowContext, FlowEvent>({
      id: 'architectGuidanceFlow',
      initial: 'step1_openGuidance',
      context: {
        userId: '',
        projectId: '',
        collectedData: {},
        stepHistory: [],
        qualityMetrics: {}
      },
      states: {
        step1_openGuidance: {
          entry: 'initializeOpenGuidance',
          on: {
            COLLECT_IDEAS: {
              actions: 'collectUserIdeas'
            },
            PROCEED_TO_SORT: {
              target: 'step2_intelligentSort',
              cond: 'hasMinimumIdeas'
            }
          }
        },
        step2_intelligentSort: {
          entry: 'startIntelligentSorting',
          invoke: {
            src: 'intelligentSortingService',
            onDone: {
              actions: 'applySortingResults'
            },
            onError: {
              actions: 'handleSortingError'
            }
          },
          on: {
            SORTING_COMPLETE: {
              target: 'step3_proactiveSupport',
              cond: 'sortingQualityAcceptable'
            },
            BACK_TO_COLLECTION: {
              target: 'step1_openGuidance'
            }
          }
        },
        // ... 其他步骤状态定义
      }
    });
  }

  // 启动引导流程
  async startGuidanceFlow(context: FlowInitContext): Promise<FlowSession> {
    const sessionId = generateSessionId();
    const flowContext: FlowContext = {
      sessionId,
      userId: context.userId,
      projectId: context.projectId,
      collectedData: {},
      stepHistory: [],
      qualityMetrics: {},
      startTime: new Date()
    };

    // 启动状态机
    const service = interpret(this.stateMachine.withContext(flowContext));
    service.start();

    // 持久化初始状态
    await this.stateStore.saveFlowSession(sessionId, {
      context: flowContext,
      state: service.state.value,
      timestamp: new Date()
    });

    return {
      sessionId,
      currentStep: service.state.value as string,
      context: flowContext,
      service
    };
  }

  // 处理流程事件
  async handleFlowEvent(
    sessionId: string, 
    event: FlowEvent
  ): Promise<FlowEventResult> {
    const session = await this.getFlowSession(sessionId);
    
    // 发送事件到状态机
    session.service.send(event);
    
    // 获取新状态
    const newState = session.service.state;
    
    // 持久化状态变更
    await this.stateStore.updateFlowSession(sessionId, {
      state: newState.value,
      context: newState.context,
      timestamp: new Date()
    });

    // 分析状态转换
    const transitionAnalysis = await this.analyzer.analyzeTransition(
      session.previousState,
      newState,
      event
    );

    return {
      newStep: newState.value as string,
      context: newState.context,
      transitionValid: !newState.matches('error'),
      analysis: transitionAnalysis,
      nextPossibleActions: this.getNextActions(newState)
    };
  }
}
```

### 流程验证器
```typescript
// lib/guidance/flow-validator.ts
export class FlowValidator {
  // 步骤验证
  async validateStepCompletion(
    step: FlowStep, 
    data: StepData, 
    context: FlowContext
  ): Promise<ValidationResult> {
    switch (step) {
      case 'step1_openGuidance':
        return this.validateOpenGuidance(data);
      case 'step2_intelligentSort':
        return this.validateIntelligentSort(data, context);
      case 'step3_proactiveSupport':
        return this.validateProactiveSupport(data);
      case 'step4_overallConfirm':
        return this.validateOverallConfirm(data);
      case 'step5_templateComplete':
        return this.validateTemplateComplete(data);
      default:
        throw new Error(`Unknown step: ${step}`);
    }
  }

  // 开放引导验证
  private async validateOpenGuidance(data: StepData): Promise<ValidationResult> {
    const ideas = data.collectedIdeas || [];
    const minIdeas = 3; // 至少需要3个创意点

    if (ideas.length < minIdeas) {
      return {
        valid: false,
        message: `需要至少${minIdeas}个创意想法才能进入下一步`,
        suggestions: ['尝试描述故事的世界背景', '想想主要角色的特点', '考虑故事想要表达的主题']
      };
    }

    // 检查创意的质量和多样性
    const qualityCheck = await this.assessIdeaQuality(ideas);
    
    return {
      valid: qualityCheck.score > 0.6,
      message: qualityCheck.score > 0.6 ? '收集的创意足够丰富' : '创意需要更多细节',
      quality: qualityCheck,
      nextStepReady: qualityCheck.score > 0.7
    };
  }

  // 智能归类验证
  private async validateIntelligentSort(
    data: StepData, 
    context: FlowContext
  ): Promise<ValidationResult> {
    const sortedData = data.sortedData as ThreeDimensionData;
    
    // 验证三维度数据完整性
    const completeness = {
      worldSetting: this.checkWorldSettingCompleteness(sortedData.world),
      themeSetting: this.checkThemeSettingCompleteness(sortedData.theme),
      characterSetting: this.checkCharacterSettingCompleteness(sortedData.character)
    };

    const overallCompleteness = Object.values(completeness)
      .reduce((sum, comp) => sum + comp.score, 0) / 3;

    return {
      valid: overallCompleteness > 0.5,
      completeness,
      overallScore: overallCompleteness,
      missingElements: this.identifyMissingElements(completeness),
      nextStepReady: overallCompleteness > 0.6
    };
  }
}
```

## 具体任务分解

### Task 8.2.1: 状态机引擎核心实现
**时间估算**: 6小时
- 实现基于XState的5步引导流程状态机
- 建立流程状态的定义和转换逻辑
- 实现状态机的事件处理和上下文管理
- 编写状态机的单元测试和状态验证

### Task 8.2.2: 流程状态持久化系统
**时间估算**: 4小时
- 实现Redis+PostgreSQL的双重状态存储
- 建立流程状态的序列化和反序列化机制
- 实现状态的增量更新和版本控制
- 添加状态恢复和数据一致性检查

### Task 8.2.3: 流程验证和质量控制
**时间估算**: 5小时
- 实现每个步骤的完整性验证逻辑
- 建立流程质量的评分和建议系统
- 实现流程异常的检测和自动修复
- 添加流程质量的实时监控

### Task 8.2.4: 流程分析和优化引擎
**时间估算**: 4小时
- 实现流程效率和用户行为的分析算法
- 建立流程瓶颈识别和优化建议系统
- 实现个性化流程路径的推荐机制
- 添加流程性能指标的收集和报告

### Task 8.2.5: 并发和实时同步机制
**时间估算**: 3小时
- 实现多用户流程状态的隔离和管理
- 建立实时状态同步的WebSocket机制
- 实现流程状态的冲突检测和解决
- 添加流程性能的监控和优化

## 流程状态数据模型

### 流程上下文数据
```typescript
interface FlowContext {
  // 会话基本信息
  sessionId: string;
  userId: string;
  projectId: string;
  
  // 收集的数据
  collectedData: {
    rawIdeas: UserIdea[];                    // 原始创意
    sortedData?: ThreeDimensionData;         // 归类后数据
    supplementedData?: ThreeDimensionData;   // 补充后数据
    confirmedData?: ThreeDimensionData;      // 确认后数据
    finalTemplates?: TemplateSet;            // 最终模板
  };
  
  // 流程状态
  stepHistory: StepHistoryEntry[];
  currentStepStartTime?: Date;
  qualityMetrics: QualityMetrics;
  userFeedback: UserFeedback[];
  
  // 流程配置
  flowConfig: {
    mode: 'quick' | 'standard' | 'deep';
    userExperienceLevel: 'beginner' | 'intermediate' | 'advanced';
    adaptiveGuidance: boolean;
  };
}
```

### 步骤历史记录
```typescript
interface StepHistoryEntry {
  step: FlowStep;
  enterTime: Date;
  exitTime?: Date;
  duration?: number;
  dataChanges: DataChange[];
  userActions: UserAction[];
  qualityScore: number;
  completionRate: number;
}
```

## 流程优化策略

### 自适应流程调整
```typescript
class AdaptiveFlowOptimizer {
  // 基于用户行为优化流程
  async optimizeFlowForUser(
    userId: string, 
    historicalData: FlowHistory[]
  ): Promise<FlowOptimization> {
    const userPatterns = await this.analyzeUserPatterns(historicalData);
    const bottlenecks = await this.identifyBottlenecks(userPatterns);
    
    return {
      recommendedStepAdjustments: this.generateStepAdjustments(bottlenecks),
      personalizedGuidance: this.generatePersonalizedGuidance(userPatterns),
      skipableSteps: this.identifySkipableSteps(userPatterns),
      focusAreas: this.identifyFocusAreas(userPatterns)
    };
  }

  // 实时流程调整
  async adjustFlowInRealtime(
    context: FlowContext, 
    currentPerformance: PerformanceMetrics
  ): Promise<FlowAdjustment> {
    if (currentPerformance.stepDuration > this.getExpectedDuration(context.currentStep)) {
      return {
        type: 'speed_up',
        adjustments: ['reduce_validation', 'provide_hints', 'auto_complete_obvious']
      };
    }
    
    if (currentPerformance.qualityScore < this.getQualityThreshold(context.currentStep)) {
      return {
        type: 'quality_focus',
        adjustments: ['add_examples', 'increase_guidance', 'request_more_detail']
      };
    }

    return { type: 'no_adjustment' };
  }
}
```

## 验证方式
1. **状态机测试**: 验证所有可能的状态转换路径
2. **并发测试**: 验证多用户同时进行流程的隔离性
3. **持久化测试**: 验证流程中断后的恢复准确性
4. **性能测试**: 验证流程响应时间和吞吐量
5. **用户体验测试**: 验证流程的直观性和流畅性

## 风险和应对策略
- **风险**: 状态机复杂度过高导致维护困难
  **应对**: 建立清晰的状态图文档和自动化测试体系
- **风险**: 流程状态数据过大影响性能
  **应对**: 实现状态数据的分层存储和压缩机制
- **风险**: 并发用户的状态冲突
  **应对**: 建立严格的状态隔离和锁机制
- **风险**: 流程中断导致数据丢失
  **应对**: 实现自动保存和多重备份机制