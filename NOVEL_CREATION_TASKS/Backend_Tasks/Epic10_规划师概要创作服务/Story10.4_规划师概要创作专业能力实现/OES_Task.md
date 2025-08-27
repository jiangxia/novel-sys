# Story 10.4: 规划师概要创作专业能力实现

## O (Objective)

### 功能目标
- 实现规划师角色的概要创作专业AI能力
- 基于6步逻辑骨架提供智能概要生成服务
- 建立专业的概要质量评估和优化机制

### 技术目标  
- 基于PromptX MCP构建规划师专业角色服务
- 实现概要创作的多种生成策略和模式
- 集成概要质量检查和智能优化算法

## E (Environment)

### 技术环境
- Node.js + TypeScript服务端框架
- PromptX MCP客户端集成
- Google Gemini API原生调用
- 文件系统操作和数据持久化

### 依赖环境
- Epic 5：PromptX MCP集成基础已建立
- Epic 7：规划师角色系统已实现
- Epic 9：大纲数据结构和服务已完成
- 6步逻辑骨架的专业规范已定义

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 规划师概要创作AI服务正常工作
- ✅ 基于6步逻辑骨架的概要生成功能完整
- ✅ 与大纲数据的一致性检查机制有效
- ✅ 概要质量评估和基础优化功能正常

### 优秀标准 (Should Have)  
- ✅ 多种概要生成策略和个性化配置
- ✅ 智能的概要结构优化建议
- ✅ 专业的叙事理论指导和创作建议
- ✅ 高效的批量处理和并发控制

### 卓越标准 (Nice to Have)
- ✅ AI驱动的创意启发和灵感建议
- ✅ 不同小说类型的专业模板支持
- ✅ 协作创作和版本管理功能
- ✅ 性能监控和智能调优机制

## 具体任务分解

### Task 10.4.1: 规划师概要创作核心服务

```typescript
// 规划师概要创作服务主类
class PlannerSummaryService {
  private mcpClient: MCPClient;
  private geminiClient: GeminiClient;
  private memoryManager: MemoryManager;
  
  constructor() {
    this.mcpClient = new MCPClient();
    this.geminiClient = new GeminiClient();
    this.memoryManager = new MemoryManager('planner');
  }
  
  async generateSummary(request: SummaryGenerationRequest): Promise<SummaryResult> {
    // 1. 激活规划师角色
    await this.activatePlannerRole(request.context);
    
    // 2. 分析大纲和逻辑骨架
    const analysis = await this.analyzeSourceData(request);
    
    // 3. 生成概要内容
    const summary = await this.createSummaryContent(analysis, request.preferences);
    
    // 4. 质量检查和优化
    const optimizedSummary = await this.optimizeSummary(summary, analysis);
    
    // 5. 一致性验证
    await this.validateConsistency(optimizedSummary, request.outlineData);
    
    return {
      summary: optimizedSummary,
      analysis,
      qualityMetrics: await this.assessQuality(optimizedSummary),
      suggestions: await this.generateSuggestions(optimizedSummary)
    };
  }
  
  private async activatePlannerRole(context: CreationContext): Promise<void> {
    await this.mcpClient.callTool('promptx_action', {
      action: 'activate_role',
      role: 'planner',
      context: {
        project: context.projectId,
        phase: 'summary_creation',
        dependencies: ['outline', 'settings']
      }
    });
    
    // 加载规划师记忆
    const plannerMemory = await this.mcpClient.callTool('promptx_recall', {
      role: 'planner',
      context: 'summary_creation',
      limit: 10
    });
    
    this.memoryManager.loadMemory(plannerMemory);
  }
  
  private async analyzeSourceData(request: SummaryGenerationRequest): Promise<SourceAnalysis> {
    const prompt = this.buildAnalysisPrompt(request.outlineData, request.logicFramework);
    
    const analysis = await this.geminiClient.chat([
      {
        role: 'system',
        content: `你是一位专业的故事规划师，具备深厚的叙事理论基础。
                 请分析提供的大纲和逻辑骨架，为概要创作提供专业指导。`
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.3,
      maxTokens: 2000
    });
    
    return this.parseAnalysisResult(analysis);
  }
  
  private async createSummaryContent(
    analysis: SourceAnalysis, 
    preferences: SummaryPreferences
  ): Promise<SummaryContent> {
    const strategy = this.selectGenerationStrategy(preferences.mode);
    
    switch (strategy) {
      case 'structured':
        return await this.generateStructuredSummary(analysis, preferences);
      case 'narrative':
        return await this.generateNarrativeSummary(analysis, preferences);
      case 'hybrid':
        return await this.generateHybridSummary(analysis, preferences);
      default:
        throw new Error(`Unsupported generation strategy: ${strategy}`);
    }
  }
}
```

### Task 10.4.2: 6步逻辑骨架处理引擎

```typescript
// 6步逻辑骨架处理服务
class SixStepLogicProcessor {
  private stepDefinitions: StepDefinition[];
  
  constructor() {
    this.stepDefinitions = [
      {
        id: 1,
        name: '起始状态',
        purpose: '建立故事的初始平衡状态',
        keyElements: ['人物现状', '环境背景', '潜在矛盾'],
        prompts: {
          analysis: '分析起始状态的设定合理性',
          generation: '基于大纲创建吸引人的开篇状态',
          validation: '检查起始状态与角色设定的一致性'
        }
      },
      {
        id: 2,
        name: '矛盾发生',
        purpose: '引入打破平衡的核心冲突',
        keyElements: ['触发事件', '冲突性质', '影响范围'],
        prompts: {
          analysis: '分析矛盾的戏剧张力和逻辑性',
          generation: '设计引人入胜的矛盾触发点',
          validation: '确保矛盾与主题和人物性格匹配'
        }
      },
      // ... 其他4个步骤的详细定义
    ];
  }
  
  async processLogicFramework(framework: LogicFramework): Promise<ProcessedFramework> {
    const processedSteps: ProcessedStep[] = [];
    
    for (const step of framework.steps) {
      const definition = this.stepDefinitions.find(def => def.id === step.id);
      if (!definition) {
        throw new Error(`Unknown step ID: ${step.id}`);
      }
      
      const processedStep = await this.processStep(step, definition, framework);
      processedSteps.push(processedStep);
    }
    
    // 检查步骤间的逻辑连贯性
    const coherenceCheck = await this.validateStepCoherence(processedSteps);
    
    return {
      steps: processedSteps,
      coherenceAnalysis: coherenceCheck,
      overallQuality: this.assessFrameworkQuality(processedSteps)
    };
  }
  
  private async processStep(
    step: LogicStep, 
    definition: StepDefinition,
    context: LogicFramework
  ): Promise<ProcessedStep> {
    // 分析步骤内容
    const analysis = await this.analyzeStepContent(step, definition);
    
    // 生成优化建议
    const suggestions = await this.generateStepSuggestions(step, definition, context);
    
    // 验证步骤质量
    const validation = await this.validateStep(step, definition, context);
    
    return {
      ...step,
      analysis,
      suggestions,
      validation,
      qualityScore: this.calculateStepQuality(analysis, validation)
    };
  }
  
  private async validateStepCoherence(steps: ProcessedStep[]): Promise<CoherenceAnalysis> {
    const coherencePrompt = `
      分析以下6步逻辑骨架的连贯性：
      ${steps.map(step => `${step.id}. ${step.title}: ${step.content}`).join('\n')}
      
      请检查：
      1. 因果关系是否清晰
      2. 逻辑发展是否合理
      3. 情感递进是否自然
      4. 主题体现是否一致
    `;
    
    const analysis = await this.geminiClient.chat([
      { role: 'system', content: '你是专业的叙事结构分析师' },
      { role: 'user', content: coherencePrompt }
    ]);
    
    return this.parseCoherenceAnalysis(analysis);
  }
}
```

### Task 10.4.3: 概要质量评估系统

```typescript
// 概要质量评估服务
class SummaryQualityAssessment {
  private qualityCriteria: QualityCriterion[];
  
  constructor() {
    this.qualityCriteria = [
      {
        name: '结构完整性',
        weight: 0.25,
        evaluator: this.evaluateStructuralIntegrity.bind(this)
      },
      {
        name: '逻辑连贯性',
        weight: 0.25,
        evaluator: this.evaluateLogicalCoherence.bind(this)
      },
      {
        name: '内容丰富度',
        weight: 0.20,
        evaluator: this.evaluateContentRichness.bind(this)
      },
      {
        name: '一致性匹配',
        weight: 0.15,
        evaluator: this.evaluateConsistencyMatch.bind(this)
      },
      {
        name: '创意独特性',
        weight: 0.15,
        evaluator: this.evaluateCreativity.bind(this)
      }
    ];
  }
  
  async assessQuality(summary: SummaryContent): Promise<QualityReport> {
    const evaluations: QualityEvaluation[] = [];
    
    for (const criterion of this.qualityCriteria) {
      const evaluation = await criterion.evaluator(summary);
      evaluations.push({
        criterion: criterion.name,
        score: evaluation.score,
        details: evaluation.details,
        suggestions: evaluation.suggestions,
        weight: criterion.weight
      });
    }
    
    const overallScore = this.calculateOverallScore(evaluations);
    const recommendations = this.generateRecommendations(evaluations);
    
    return {
      overallScore,
      evaluations,
      recommendations,
      summary: this.generateQualitySummary(evaluations)
    };
  }
  
  private async evaluateStructuralIntegrity(summary: SummaryContent): Promise<EvaluationResult> {
    const prompt = `
      评估以下概要的结构完整性：
      ${JSON.stringify(summary, null, 2)}
      
      检查要点：
      1. 是否包含完整的6步逻辑结构
      2. 各部分内容是否充实
      3. 结构层次是否清晰
      4. 关键要素是否齐全
    `;
    
    const evaluation = await this.geminiClient.chat([
      { 
        role: 'system', 
        content: '你是专业的文学结构分析师，请客观评估概要结构质量' 
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.2
    });
    
    return this.parseEvaluationResult(evaluation, 'structural_integrity');
  }
  
  private async evaluateLogicalCoherence(summary: SummaryContent): Promise<EvaluationResult> {
    // 逻辑连贯性评估实现
    const coherenceAnalysis = await this.analyzeLogicalFlow(summary);
    
    return {
      score: coherenceAnalysis.coherenceScore,
      details: coherenceAnalysis.issues,
      suggestions: coherenceAnalysis.improvements
    };
  }
  
  private async evaluateContentRichness(summary: SummaryContent): Promise<EvaluationResult> {
    // 内容丰富度评估实现
    const richnessMetrics = {
      characterDepth: this.analyzeCharacterDevelopment(summary),
      plotComplexity: this.analyzePlotComplexity(summary),
      themeDepth: this.analyzeThemeDepth(summary),
      worldBuilding: this.analyzeWorldBuilding(summary)
    };
    
    const overallRichness = Object.values(richnessMetrics)
      .reduce((sum, score) => sum + score, 0) / Object.keys(richnessMetrics).length;
    
    return {
      score: overallRichness,
      details: richnessMetrics,
      suggestions: this.generateRichnessSuggestions(richnessMetrics)
    };
  }
  
  private async evaluateConsistencyMatch(summary: SummaryContent): Promise<EvaluationResult> {
    // 一致性匹配评估实现
    // 需要与大纲数据进行对比
    const consistencyCheck = await this.checkConsistencyWithOutline(summary);
    
    return {
      score: consistencyCheck.matchScore,
      details: consistencyCheck.mismatches,
      suggestions: consistencyCheck.corrections
    };
  }
  
  private async evaluateCreativity(summary: SummaryContent): Promise<EvaluationResult> {
    // 创意独特性评估实现
    const creativityAnalysis = await this.analyzeCreativity(summary);
    
    return {
      score: creativityAnalysis.creativityScore,
      details: creativityAnalysis.uniqueElements,
      suggestions: creativityAnalysis.enhancementIdeas
    };
  }
}
```

### Task 10.4.4: 概要优化和建议系统

```typescript
// 概要优化建议服务
class SummaryOptimizationService {
  async optimizeSummary(summary: SummaryContent, analysis: SourceAnalysis): Promise<OptimizedSummary> {
    const optimizations = await this.identifyOptimizations(summary, analysis);
    const appliedOptimizations = await this.applyOptimizations(summary, optimizations);
    
    return {
      originalSummary: summary,
      optimizedSummary: appliedOptimizations.result,
      optimizations: appliedOptimizations.applied,
      improvementMetrics: appliedOptimizations.metrics
    };
  }
  
  private async identifyOptimizations(
    summary: SummaryContent, 
    analysis: SourceAnalysis
  ): Promise<Optimization[]> {
    const optimizations: Optimization[] = [];
    
    // 1. 结构优化机会
    const structuralOpts = await this.identifyStructuralOptimizations(summary);
    optimizations.push(...structuralOpts);
    
    // 2. 内容增强机会
    const contentOpts = await this.identifyContentEnhancements(summary, analysis);
    optimizations.push(...contentOpts);
    
    // 3. 逻辑改进机会
    const logicOpts = await this.identifyLogicImprovements(summary);
    optimizations.push(...logicOpts);
    
    // 4. 创意提升机会
    const creativityOpts = await this.identifyCreativityEnhancements(summary);
    optimizations.push(...creativityOpts);
    
    return this.prioritizeOptimizations(optimizations);
  }
  
  async generateSuggestions(summary: SummaryContent): Promise<CreativeSuggestions> {
    const prompt = `
      作为专业的故事规划师，为以下概要提供创作建议：
      ${this.formatSummaryForPrompt(summary)}
      
      请提供：
      1. 情节发展建议
      2. 人物塑造建议  
      3. 冲突升级建议
      4. 主题深化建议
      5. 创意亮点建议
    `;
    
    const suggestions = await this.geminiClient.chat([
      { 
        role: 'system', 
        content: '你是富有创造力的故事规划师，专门为作者提供专业的创作指导' 
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.7, // 提高创造性
      maxTokens: 3000
    });
    
    return this.parseSuggestions(suggestions);
  }
  
  async generateAlternativeVersions(summary: SummaryContent, count: number = 3): Promise<AlternativeVersion[]> {
    const alternatives: AlternativeVersion[] = [];
    
    for (let i = 0; i < count; i++) {
      const prompt = `
        基于以下概要，创作一个不同风格的替代版本：
        ${this.formatSummaryForPrompt(summary)}
        
        版本${i + 1}要求：
        ${this.getAlternativeRequirements(i)}
      `;
      
      const alternative = await this.geminiClient.chat([
        { role: 'system', content: '你是创意丰富的故事规划师' },
        { role: 'user', content: prompt }
      ], {
        temperature: 0.8,
        maxTokens: 2500
      });
      
      alternatives.push({
        version: i + 1,
        style: this.getAlternativeStyle(i),
        content: this.parseAlternativeContent(alternative),
        differences: await this.identifyDifferences(summary, alternative)
      });
    }
    
    return alternatives;
  }
  
  private getAlternativeRequirements(index: number): string {
    const requirements = [
      '更加戏剧化和紧张的节奏',
      '更注重人物内心世界的探索',
      '更具现代感和时代特色'
    ];
    
    return requirements[index] || '保持原有特色但增加独特元素';
  }
}
```

## API接口设计

```typescript
// 规划师概要创作API路由
router.post('/api/planner/summary/generate', async (req, res) => {
  try {
    const request: SummaryGenerationRequest = req.body;
    const service = new PlannerSummaryService();
    const result = await service.generateSummary(request);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/api/planner/summary/optimize', async (req, res) => {
  try {
    const { summary, preferences } = req.body;
    const service = new SummaryOptimizationService();
    const optimized = await service.optimizeSummary(summary, preferences);
    
    res.json({
      success: true,
      data: optimized
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/api/planner/summary/assess', async (req, res) => {
  try {
    const { summary } = req.body;
    const assessment = new SummaryQualityAssessment();
    const report = await assessment.assessQuality(summary);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

**注意**: 此服务需要与PromptX MCP深度集成，确保规划师角色的专业能力得到充分发挥，同时与前端界面保持良好的数据交互。