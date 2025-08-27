# Story 11.2: 6步逻辑结构化创作引擎开发

## O (Objective)

### 功能目标
- 实现基于6步逻辑骨架的结构化小说内容创作引擎
- 建立智能篇幅分配算法系统（重点40%+标准30%+简化30%）
- 提供6步逻辑的质量检查和结构完整性验证
- 实现创作过程的智能引导和实时结构优化

### 技术目标  
- 设计可配置的6步逻辑创作流程引擎
- 实现基于戏剧理论的篇幅分配算法
- 建立内容结构的自动分析和验证系统
- 提供创作进度的实时跟踪和质量监控

### 业务目标
- 确保写手创作内容严格遵循6步逻辑结构
- 支持不同类型故事的结构化创作指导
- 实现创作质量的结构性保证和标准化输出
- 建立创作效率的智能优化和辅助机制

## E (Environment)

### 技术环境
- **基础依赖**: Story 11.1的写手角色管理系统
- **结构分析**: 自研内容结构分析引擎
- **篇幅算法**: 基于戏剧理论的分配算法
- **语言**: TypeScript + Node.js
- **NLP工具**: 文本结构分析和段落识别工具

### 依赖环境
- 写手角色已成功激活并具备文学创作能力
- 故事概要的6步逻辑模板已完成并验证
- 内容创作的基础数据结构已标准化
- Epic 5的记忆系统可提供创作历史和上下文

### 6步逻辑结构定义
```typescript
interface SixStepLogicStructure {
  // 6步骨架定义（不可改变）
  steps: {
    startingState: {
      name: '起始状态';
      description: '何人+何时+何地+何事 → 为什么会这样？';
      proportion: 15; // 占总篇幅15%
      priority: 'simplified'; // 简化30%类别
      contentType: ['background', 'setup', 'introduction'];
    };
    contradictionOccurs: {
      name: '矛盾发生';
      description: '何人+何时+何地+何事 → 对抗的根源是什么？';
      proportion: 15; // 占总篇幅15%
      priority: 'standard'; // 标准30%类别
      contentType: ['conflict_introduction', 'tension_building'];
    };
    conflictEscalates: {
      name: '冲突升级';
      description: '何人+何时+何地+何事 → 为什么矛盾加剧？';
      proportion: 20; // 占总篇幅20%
      priority: 'focus'; // 重点40%类别
      contentType: ['escalation', 'complications', 'rising_action'];
    };
    wisdomIntervenes: {
      name: '智慧介入';
      description: '何人+何时+何地+何事 → 主角如何运用智慧？';
      proportion: 20; // 占总篇幅20%
      priority: 'focus'; // 重点40%类别
      contentType: ['turning_point', 'realization', 'solution_attempt'];
    };
    problemResolved: {
      name: '问题解决';
      description: '何人+何时+何地+何事 → 为什么这样做有效？';
      proportion: 15; // 占总篇幅15%
      priority: 'standard'; // 标准30%类别
      contentType: ['resolution_action', 'outcome'];
    };
    resultState: {
      name: '结果状态';
      description: '何人+何时+何地+何事 → 这个结果如何引导下一篇？';
      proportion: 15; // 占总篇幅15%
      priority: 'simplified'; // 简化30%类别
      contentType: ['conclusion', 'transition', 'setup_next'];
    };
  };

  // 篇幅分配规则
  proportionRules: {
    simplified_steps: 30; // 简化步骤总占比30%
    standard_steps: 30;   // 标准步骤总占比30%
    focus_steps: 40;      // 重点步骤总占比40%
  };

  // 质量验证规则
  validationRules: {
    structural_integrity: boolean;  // 结构完整性
    logical_consistency: boolean;   // 逻辑一致性
    proportion_compliance: boolean; // 篇幅合规性
    content_depth: boolean;         // 内容深度
  };
}
```

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] 6步逻辑创作引擎能正确生成结构化内容
- [ ] 篇幅分配算法按40%-30%-30%正确分配
- [ ] 生成内容严格遵循6步逻辑骨架结构
- [ ] 基础的结构验证和质量检查功能正常

### 优秀标准 (Should Have)  
- [ ] 创作内容的结构完整性和逻辑一致性优秀
- [ ] 篇幅分配的戏剧效果和阅读体验良好
- [ ] 创作引擎能适应不同类型和风格的故事
- [ ] 结构优化建议准确且具有实用价值

### 卓越标准 (Nice to Have)
- [ ] 创作引擎具备学习和自我优化能力
- [ ] 能根据故事特点智能调整结构参数
- [ ] 创作过程的用户体验流畅且专业
- [ ] 结构化创作的效率和质量超出预期

## 核心实现架构

### 6步逻辑创作引擎
```typescript
// lib/creation/six-step-creation-engine.ts
export class SixStepCreationEngine {
  private structureAnalyzer: StructureAnalyzer;
  private proportionCalculator: ProportionCalculator;
  private contentGenerator: ContentGenerator;
  private qualityValidator: QualityValidator;

  constructor(
    private writerManager: WriterManager,
    private literaryKnowledge: LiteraryKnowledgeBase,
    private memoryManager: MemoryManager
  ) {
    this.initializeComponents();
  }

  // 结构化创作主流程
  async createStructuredContent(
    overview: StoryOverview,
    requirements: CreationRequirements
  ): Promise<StructuredCreationResult> {
    // 1. 分析概要结构
    const overviewAnalysis = await this.analyzeOverviewStructure(overview);
    
    // 2. 计算篇幅分配
    const proportionPlan = await this.calculateProportionPlan(
      overviewAnalysis,
      requirements.targetLength
    );
    
    // 3. 生成结构化内容
    const structuredContent = await this.generateBySteps(
      overview,
      proportionPlan,
      requirements
    );
    
    // 4. 验证结构完整性
    const validationResult = await this.validateStructure(structuredContent);
    
    // 5. 优化和调整
    const optimizedContent = await this.optimizeStructure(
      structuredContent,
      validationResult
    );

    return {
      content: optimizedContent,
      structureAnalysis: overviewAnalysis,
      proportionPlan: proportionPlan,
      validationResult: validationResult,
      qualityMetrics: await this.calculateQualityMetrics(optimizedContent)
    };
  }

  // 按步骤生成内容
  private async generateBySteps(
    overview: StoryOverview,
    proportionPlan: ProportionPlan,
    requirements: CreationRequirements
  ): Promise<SixStepContent> {
    const stepContents: Record<string, StepContent> = {};

    for (const [stepId, stepDefinition] of Object.entries(SIX_STEP_STRUCTURE.steps)) {
      const stepOverview = overview.stepDetails[stepId];
      const stepProportion = proportionPlan.stepAllocations[stepId];
      
      const stepContent = await this.generateStepContent({
        stepId,
        stepDefinition,
        overview: stepOverview,
        proportion: stepProportion,
        requirements: requirements,
        previousSteps: Object.keys(stepContents).map(id => stepContents[id])
      });

      stepContents[stepId] = stepContent;
    }

    return {
      steps: stepContents,
      overallFlow: this.analyzeOverallFlow(stepContents),
      totalLength: this.calculateTotalLength(stepContents),
      structuralCoherence: await this.assessStructuralCoherence(stepContents)
    };
  }

  // 单步骤内容生成
  private async generateStepContent(params: StepGenerationParams): Promise<StepContent> {
    const {
      stepId,
      stepDefinition,
      overview,
      proportion,
      requirements,
      previousSteps
    } = params;

    // 分析步骤创作上下文
    const stepContext = await this.buildStepContext(
      stepId,
      overview,
      previousSteps,
      requirements
    );

    // 计算目标长度
    const targetLength = Math.round(requirements.targetLength * (proportion.percentage / 100));

    // 获取创作指导
    const creationGuidance = await this.getStepCreationGuidance(
      stepDefinition,
      stepContext,
      requirements.style
    );

    // 生成内容
    const content = await this.writerManager.createStepContent({
      stepDefinition: stepDefinition,
      context: stepContext,
      guidance: creationGuidance,
      targetLength: targetLength,
      quality: requirements.quality
    });

    // 验证步骤内容
    const stepValidation = await this.validateStepContent(
      content,
      stepDefinition,
      targetLength
    );

    return {
      stepId,
      content: content.text,
      actualLength: content.text.length,
      targetLength: targetLength,
      quality: stepValidation.qualityScore,
      structuralCompliance: stepValidation.structuralCompliance,
      metadata: {
        creationTime: new Date(),
        guidance: creationGuidance,
        validation: stepValidation
      }
    };
  }
}
```

### 篇幅分配算法系统
```typescript
// lib/creation/proportion-calculator.ts
export class ProportionCalculator {
  // 基础篇幅分配规则
  private readonly PROPORTION_RULES = {
    simplified: 0.30,  // 简化步骤：起始状态+结果状态
    standard: 0.30,    // 标准步骤：矛盾发生+问题解决  
    focus: 0.40        // 重点步骤：冲突升级+智慧介入
  };

  // 计算篇幅分配方案
  async calculateProportionPlan(
    overviewAnalysis: OverviewAnalysis,
    targetLength: number
  ): Promise<ProportionPlan> {
    // 1. 基础分配计算
    const baseAllocation = this.calculateBaseAllocation(targetLength);
    
    // 2. 根据内容复杂度调整
    const complexityAdjustment = await this.calculateComplexityAdjustment(
      overviewAnalysis,
      baseAllocation
    );
    
    // 3. 戏剧效果优化
    const dramaticOptimization = await this.optimizeForDramaticEffect(
      complexityAdjustment,
      overviewAnalysis.dramaticStructure
    );
    
    // 4. 最终验证和平衡
    const finalPlan = this.balanceAndValidate(dramaticOptimization);

    return finalPlan;
  }

  // 基础分配计算
  private calculateBaseAllocation(targetLength: number): BaseAllocation {
    const simplifiedTotal = Math.round(targetLength * this.PROPORTION_RULES.simplified);
    const standardTotal = Math.round(targetLength * this.PROPORTION_RULES.standard);
    const focusTotal = Math.round(targetLength * this.PROPORTION_RULES.focus);

    return {
      startingState: Math.round(simplifiedTotal * 0.5),    // 简化类的50%
      resultState: Math.round(simplifiedTotal * 0.5),      // 简化类的50%
      contradictionOccurs: Math.round(standardTotal * 0.5), // 标准类的50%
      problemResolved: Math.round(standardTotal * 0.5),     // 标准类的50%
      conflictEscalates: Math.round(focusTotal * 0.5),      // 重点类的50%
      wisdomIntervenes: Math.round(focusTotal * 0.5),       // 重点类的50%
      totalLength: targetLength
    };
  }

  // 复杂度调整
  private async calculateComplexityAdjustment(
    analysis: OverviewAnalysis,
    baseAllocation: BaseAllocation
  ): Promise<ComplexityAdjustedAllocation> {
    const adjustmentFactors = {
      conflictComplexity: analysis.conflictComplexity,      // 冲突复杂度
      characterDepth: analysis.characterDepth,             // 人物深度
      thematicRichness: analysis.thematicRichness,         // 主题丰富度
      plotIntricacy: analysis.plotIntricacy                // 情节复杂度
    };

    // 根据复杂度调整各步骤分配
    const adjustedAllocation = { ...baseAllocation };

    // 冲突复杂时，增加"冲突升级"篇幅，减少"起始状态"
    if (adjustmentFactors.conflictComplexity > 0.7) {
      const transfer = Math.round(baseAllocation.startingState * 0.2);
      adjustedAllocation.startingState -= transfer;
      adjustedAllocation.conflictEscalates += transfer;
    }

    // 人物深度高时，增加"智慧介入"篇幅
    if (adjustmentFactors.characterDepth > 0.8) {
      const transfer = Math.round(baseAllocation.resultState * 0.15);
      adjustedAllocation.resultState -= transfer;
      adjustedAllocation.wisdomIntervenes += transfer;
    }

    return adjustedAllocation;
  }

  // 戏剧效果优化
  private async optimizeForDramaticEffect(
    allocation: ComplexityAdjustedAllocation,
    dramaticStructure: DramaticStructure
  ): Promise<DramaticallyOptimizedAllocation> {
    const optimized = { ...allocation };

    // 根据戏剧高潮位置调整
    if (dramaticStructure.climaxPosition === 'early') {
      // 早高潮：增加"问题解决"和"结果状态"
      const transfer = Math.round(allocation.conflictEscalates * 0.1);
      optimized.conflictEscalates -= transfer;
      optimized.problemResolved += Math.round(transfer * 0.6);
      optimized.resultState += Math.round(transfer * 0.4);
    } else if (dramaticStructure.climaxPosition === 'late') {
      // 晚高潮：增加"冲突升级"和"智慧介入"
      const transfer = Math.round(allocation.startingState * 0.1);
      optimized.startingState -= transfer;
      optimized.conflictEscalates += Math.round(transfer * 0.6);
      optimized.wisdomIntervenes += Math.round(transfer * 0.4);
    }

    return optimized;
  }
}
```

## 具体任务分解

### Task 11.2.1: 6步逻辑引擎核心实现
**时间估算**: 6小时
- 实现SixStepCreationEngine核心创作引擎
- 建立6步逻辑的结构定义和验证规则
- 实现按步骤的内容生成流程控制
- 编写引擎的单元测试和结构验证

### Task 11.2.2: 智能篇幅分配算法
**时间估算**: 5小时
- 实现ProportionCalculator篇幅分配算法
- 建立40%-30%-30%的分配规则和调整机制
- 实现基于内容复杂度的动态调整算法
- 添加戏剧效果的优化和平衡机制

### Task 11.2.3: 内容结构分析和验证
**时间估算**: 4小时
- 实现内容结构的自动分析算法
- 建立结构完整性和逻辑一致性检查
- 实现篇幅合规性的验证和纠偏机制
- 添加结构质量的评估和改进建议

### Task 11.2.4: 创作过程智能引导
**时间估算**: 4小时
- 实现步骤创作的智能引导和提示系统
- 建立创作进度的实时跟踪和状态管理
- 实现创作质量的动态监控和预警
- 添加创作效率的优化和加速机制

### Task 11.2.5: 结构优化和自适应调整
**时间估算**: 3小时
- 实现结构的自动优化和调整算法
- 建立基于质量反馈的结构改进机制
- 实现不同故事类型的结构适应能力
- 添加用户偏好的学习和个性化调整

## 6步逻辑实现细节

### 步骤内容生成策略
```typescript
interface StepGenerationStrategy {
  // 起始状态生成策略
  startingState: {
    focus: ['background_setup', 'character_introduction', 'scene_establishment'];
    techniques: ['in_medias_res', 'descriptive_opening', 'dialogue_opening'];
    length_range: [0.12, 0.18]; // 12%-18%的篇幅范围
    quality_emphasis: 'clarity_and_engagement';
  };

  // 矛盾发生生成策略
  contradictionOccurs: {
    focus: ['conflict_introduction', 'tension_building', 'stakes_establishment'];
    techniques: ['dramatic_irony', 'foreshadowing', 'character_motivation'];
    length_range: [0.13, 0.17]; // 13%-17%的篇幅范围
    quality_emphasis: 'tension_and_intrigue';
  };

  // 冲突升级生成策略（重点）
  conflictEscalates: {
    focus: ['escalating_complications', 'rising_stakes', 'character_pressure'];
    techniques: ['mounting_obstacles', 'time_pressure', 'emotional_intensity'];
    length_range: [0.18, 0.22]; // 18%-22%的篇幅范围
    quality_emphasis: 'dramatic_intensity';
  };

  // 智慧介入生成策略（重点）  
  wisdomIntervenes: {
    focus: ['turning_point', 'character_realization', 'solution_attempt'];
    techniques: ['epiphany', 'strategic_thinking', 'moral_choice'];
    length_range: [0.18, 0.22]; // 18%-22%的篇幅范围
    quality_emphasis: 'character_growth';
  };

  // 问题解决生成策略
  problemResolved: {
    focus: ['resolution_action', 'outcome_delivery', 'consequence_show'];
    techniques: ['climactic_action', 'resolution_surprise', 'justice_served'];
    length_range: [0.13, 0.17]; // 13%-17%的篇幅范围
    quality_emphasis: 'satisfying_resolution';
  };

  // 结果状态生成策略
  resultState: {
    focus: ['conclusion', 'character_change', 'next_setup'];
    techniques: ['denouement', 'reflection', 'future_implication'];
    length_range: [0.12, 0.18]; // 12%-18%的篇幅范围
    quality_emphasis: 'completion_and_transition';
  };
}
```

### 质量验证标准
```typescript
interface StructuralQualityStandards {
  // 结构完整性标准
  structuralIntegrity: {
    allStepsPresent: boolean;           // 所有步骤都存在
    logicalProgression: number;         // 逻辑发展评分 >0.8
    coherentFlow: number;               // 连贯流畅评分 >0.7
    proportionBalance: number;          // 篇幅平衡评分 >0.75
  };

  // 内容深度标准
  contentDepth: {
    characterDevelopment: number;       // 人物发展深度 >0.7
    conflictComplexity: number;         // 冲突复杂度 >0.6
    thematicResonance: number;          // 主题共鸣度 >0.65
    emotionalImpact: number;            // 情感冲击力 >0.7
  };

  // 文学品质标准
  literaryQuality: {
    languageRichness: number;           // 语言丰富性 >0.75
    stylisticConsistency: number;       // 风格一致性 >0.8
    narrativeTechnique: number;         // 叙事技巧 >0.7
    readabilityScore: number;           // 可读性评分 >0.8
  };
}
```

## 验证方式
1. **结构完整性测试**: 验证生成内容的6步逻辑结构完整性
2. **篇幅分配测试**: 验证40%-30%-30%分配规则的准确执行
3. **内容质量测试**: 验证各步骤内容的文学品质和戏剧效果
4. **逻辑一致性测试**: 验证步骤间的逻辑连贯性和因果关系
5. **用户体验测试**: 验证结构化创作的用户满意度和效率
6. **性能压力测试**: 验证创作引擎在大量内容生成时的稳定性

## 风险和应对策略
- **风险**: 篇幅分配过于死板导致创作僵化
  **应对**: 实现分配规则的灵活性配置和动态调整机制
- **风险**: 6步逻辑过于机械化影响文学性
  **应对**: 在结构约束内最大化创作自由度和艺术表达
- **风险**: 复杂算法导致创作引擎性能问题
  **应对**: 实现算法优化和分步处理机制
- **风险**: 结构验证过于严格影响创作流畅性
  **应对**: 建立渐进式验证和用户可选的严格度级别