# Story 10.5: 6步逻辑骨架验证引擎开发

## O (Objective)

### 功能目标
- 开发6步逻辑骨架的智能验证引擎
- 实现逻辑结构的完整性和连贯性检查
- 建立专业的叙事理论验证和优化机制

### 技术目标  
- 基于规则引擎和AI分析的双重验证系统
- 实现可配置的验证规则和动态检查策略
- 集成叙事理论知识库和专家系统

## E (Environment)

### 技术环境
- Node.js + TypeScript服务端框架
- 规则引擎（json-rules-engine）
- AI分析服务（Google Gemini API）
- 叙事理论知识库和模式匹配算法

### 依赖环境
- Epic 4：基础AI服务已建立
- Epic 5：PromptX MCP集成可用
- Story 10.4：规划师专业能力服务已实现
- 6步逻辑骨架的理论模型已确定

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 6步逻辑骨架验证引擎正常运行
- ✅ 基础的结构完整性检查功能完整
- ✅ 逻辑连贯性验证机制有效工作
- ✅ 验证结果清晰准确，提供具体问题指向

### 优秀标准 (Should Have)  
- ✅ 智能的验证规则配置和自定义功能
- ✅ 深层的叙事理论分析和专业建议
- ✅ 多维度的质量评估和分级报告
- ✅ 高效的批量验证和性能优化

### 卓越标准 (Nice to Have)
- ✅ 机器学习驱动的模式识别和预测
- ✅ 个性化的验证偏好和作家风格适配
- ✅ 协作验证和专家评审工作流
- ✅ 实时验证和动态反馈机制

## 具体任务分解

### Task 10.5.1: 核心验证引擎架构

```typescript
// 6步逻辑骨架验证引擎主类
class SixStepValidationEngine {
  private ruleEngine: RulesEngine;
  private aiAnalyzer: AILogicAnalyzer;
  private theoryValidator: NarrativeTheoryValidator;
  private patternMatcher: LogicPatternMatcher;
  
  constructor() {
    this.ruleEngine = new RulesEngine();
    this.aiAnalyzer = new AILogicAnalyzer();
    this.theoryValidator = new NarrativeTheoryValidator();
    this.patternMatcher = new LogicPatternMatcher();
    
    this.initializeValidationRules();
  }
  
  async validateLogicFramework(framework: LogicFramework): Promise<ValidationResult> {
    const validationSessions = await this.createValidationSessions(framework);
    const results: ValidationSessionResult[] = [];
    
    // 1. 结构验证 - 快速检查基础结构
    const structureResult = await this.validateStructure(framework);
    results.push(structureResult);
    
    // 2. 逻辑验证 - 深度分析逻辑关系
    if (structureResult.passed) {
      const logicResult = await this.validateLogic(framework);
      results.push(logicResult);
    }
    
    // 3. 叙事理论验证 - 专业理论检查
    if (results.every(r => r.passed)) {
      const theoryResult = await this.validateNarrativeTheory(framework);
      results.push(theoryResult);
    }
    
    // 4. 模式匹配验证 - 识别经典模式
    const patternResult = await this.validatePatterns(framework);
    results.push(patternResult);
    
    return this.compileValidationResults(results, framework);
  }
  
  private async validateStructure(framework: LogicFramework): Promise<ValidationSessionResult> {
    const rules = this.getStructureValidationRules();
    const facts = this.extractStructureFacts(framework);
    
    const engineResult = await this.ruleEngine.run(facts, rules);
    
    return {
      sessionType: 'structure',
      passed: engineResult.results.every(r => r.result === 'pass'),
      issues: engineResult.results.filter(r => r.result === 'fail'),
      details: engineResult.details,
      suggestions: this.generateStructureSuggestions(engineResult)
    };
  }
  
  private async validateLogic(framework: LogicFramework): Promise<ValidationSessionResult> {
    const logicAnalysis = await this.aiAnalyzer.analyzeLogicFlow(framework);
    
    const coherenceChecks = [
      this.checkCausalRelationships(framework),
      this.checkEmotionalProgression(framework),
      this.checkConflictEscalation(framework),
      this.checkResolutionLogic(framework)
    ];
    
    const results = await Promise.all(coherenceChecks);
    
    return {
      sessionType: 'logic',
      passed: results.every(r => r.valid),
      issues: results.filter(r => !r.valid).map(r => r.issue),
      details: logicAnalysis,
      suggestions: this.generateLogicSuggestions(results)
    };
  }
  
  private getStructureValidationRules(): ValidationRule[] {
    return [
      {
        name: 'complete_six_steps',
        condition: 'steps.length === 6',
        message: '必须包含完整的6个逻辑步骤',
        severity: 'error'
      },
      {
        name: 'step_content_completeness',
        condition: 'steps.every(step => step.content && step.content.length > 10)',
        message: '每个步骤都必须有充实的内容描述',
        severity: 'warning'
      },
      {
        name: 'step_sequence_validity',
        condition: 'steps.every((step, index) => step.order === index + 1)',
        message: '步骤顺序必须正确：1-6',
        severity: 'error'
      },
      {
        name: 'step_title_appropriateness',
        condition: 'validateStepTitles(steps)',
        message: '步骤标题必须符合6步逻辑框架要求',
        severity: 'warning'
      }
    ];
  }
}
```

### Task 10.5.2: AI逻辑分析器

```typescript
// AI驱动的逻辑分析服务
class AILogicAnalyzer {
  private geminiClient: GeminiClient;
  private analysisCache: Map<string, AnalysisResult> = new Map();
  
  async analyzeLogicFlow(framework: LogicFramework): Promise<LogicAnalysisResult> {
    const cacheKey = this.generateCacheKey(framework);
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }
    
    const analysis = await this.performDeepLogicAnalysis(framework);
    this.analysisCache.set(cacheKey, analysis);
    
    return analysis;
  }
  
  private async performDeepLogicAnalysis(framework: LogicFramework): Promise<LogicAnalysisResult> {
    const analysisPrompt = this.buildLogicAnalysisPrompt(framework);
    
    const response = await this.geminiClient.chat([
      {
        role: 'system',
        content: `你是专业的叙事逻辑分析师，具备深厚的戏剧理论和故事结构知识。
                 请深入分析提供的6步逻辑骨架，重点检查：
                 1. 因果关系链的完整性和合理性
                 2. 情感发展的自然递进
                 3. 冲突与解决的逻辑性
                 4. 人物动机的一致性
                 5. 主题体现的深度和连贯性`
      },
      {
        role: 'user',
        content: analysisPrompt
      }
    ], {
      temperature: 0.3, // 保证分析的准确性
      maxTokens: 4000
    });
    
    return this.parseLogicAnalysis(response);
  }
  
  private buildLogicAnalysisPrompt(framework: LogicFramework): string {
    return `
请分析以下6步逻辑骨架：

${framework.steps.map((step, index) => `
第${index + 1}步：${step.title}
内容：${step.content}
关键要素：${JSON.stringify(step.keyElements)}
推理逻辑：${step.reasoning || '未提供'}
`).join('\n')}

请从以下维度进行分析：

1. **因果关系分析**
   - 每个步骤之间是否存在合理的因果联系
   - 是否存在逻辑跳跃或断层
   - 因果链是否形成完整闭环

2. **情感递进分析**
   - 情感发展是否自然流畅
   - 高潮点设置是否合理
   - 情感起伏是否符合人性

3. **冲突发展分析**
   - 矛盾是否有明确的触发点
   - 冲突升级是否有内在逻辑
   - 解决方案是否符合人物和情境

4. **主题一致性分析**
   - 各步骤是否都服务于中心主题
   - 主题体现是否深入而非表面
   - 价值观传递是否清晰有力

5. **人物动机分析**
   - 人物行为是否有充分动机支撑
   - 人物成长轨迹是否清晰
   - 人物反应是否符合性格设定

请为每个维度提供：
- 问题识别和具体指向
- 严重程度评估（高/中/低）
- 具体的改进建议
- 正面肯定的优秀之处
    `;
  }
  
  async checkCausalRelationships(framework: LogicFramework): Promise<CausalityCheckResult> {
    const causalityPrompt = `
    分析以下逻辑步骤的因果关系：
    ${this.formatStepsForCausality(framework.steps)}
    
    请检查：
    1. 每个步骤是否是前一步骤的合理结果
    2. 是否存在缺失的中间环节
    3. 因果逻辑是否符合常理和故事内在逻辑
    `;
    
    const analysis = await this.geminiClient.chat([
      { role: 'system', content: '你是因果关系逻辑专家' },
      { role: 'user', content: causalityPrompt }
    ]);
    
    return this.parseCausalityAnalysis(analysis);
  }
  
  async checkEmotionalProgression(framework: LogicFramework): Promise<EmotionalCheckResult> {
    const emotionalPrompt = `
    分析以下逻辑骨架的情感递进：
    ${this.formatStepsForEmotion(framework.steps)}
    
    请分析：
    1. 情感强度的变化曲线是否合理
    2. 情感转折点是否有充分铺垫
    3. 高潮的情感冲击力是否足够
    4. 结局的情感收束是否满意
    `;
    
    const analysis = await this.geminiClient.chat([
      { role: 'system', content: '你是情感发展分析专家' },
      { role: 'user', content: emotionalPrompt }
    ]);
    
    return this.parseEmotionalAnalysis(analysis);
  }
}
```

### Task 10.5.3: 叙事理论验证器

```typescript
// 叙事理论验证服务
class NarrativeTheoryValidator {
  private theoryRules: NarrativeTheoryRule[];
  private knowledgeBase: NarrativeKnowledgeBase;
  
  constructor() {
    this.theoryRules = this.loadNarrativeTheoryRules();
    this.knowledgeBase = new NarrativeKnowledgeBase();
  }
  
  async validateNarrativeTheory(framework: LogicFramework): Promise<TheoryValidationResult> {
    const validationResults: TheoryRuleResult[] = [];
    
    for (const rule of this.theoryRules) {
      const result = await this.applyTheoryRule(rule, framework);
      validationResults.push(result);
    }
    
    return {
      overallScore: this.calculateTheoryScore(validationResults),
      ruleResults: validationResults,
      theoreticalAnalysis: await this.generateTheoreticalAnalysis(framework),
      recommendations: this.generateTheoryRecommendations(validationResults)
    };
  }
  
  private loadNarrativeTheoryRules(): NarrativeTheoryRule[] {
    return [
      {
        name: 'aristotelian_dramatic_structure',
        description: '亚里士多德戏剧结构理论验证',
        validator: this.validateAristotelianStructure.bind(this)
      },
      {
        name: 'heros_journey_pattern',
        description: '英雄之旅模式匹配度检查',
        validator: this.validateHerosJourney.bind(this)
      },
      {
        name: 'three_act_structure',
        description: '三幕剧结构原理验证',
        validator: this.validateThreeActStructure.bind(this)
      },
      {
        name: 'freytag_pyramid',
        description: '弗莱塔格金字塔结构分析',
        validator: this.validateFreytagPyramid.bind(this)
      },
      {
        name: 'character_arc_theory',
        description: '人物弧光理论符合度检查',
        validator: this.validateCharacterArc.bind(this)
      },
      {
        name: 'conflict_theory',
        description: '冲突理论应用验证',
        validator: this.validateConflictTheory.bind(this)
      }
    ];
  }
  
  private async validateAristotelianStructure(framework: LogicFramework): Promise<TheoryRuleResult> {
    // 亚里士多德的戏剧理论：开端-中间-结尾，统一性原则
    const analysis = {
      unity_of_action: this.checkActionUnity(framework),
      unity_of_time: this.checkTimeUnity(framework),
      unity_of_place: this.checkPlaceUnity(framework),
      catharsis_potential: this.assessCatharsisPotential(framework)
    };
    
    const score = Object.values(analysis).reduce((sum, val) => sum + val, 0) / 4;
    
    return {
      ruleName: 'aristotelian_dramatic_structure',
      score,
      passed: score >= 0.7,
      details: analysis,
      suggestions: this.generateAristotelianSuggestions(analysis)
    };
  }
  
  private async validateHerosJourney(framework: LogicFramework): Promise<TheoryRuleResult> {
    // 坎贝尔英雄之旅模式检查
    const heroJourneyStages = {
      ordinary_world: this.identifyOrdinaryWorld(framework),
      call_to_adventure: this.identifyCallToAdventure(framework),
      refusal_of_call: this.identifyRefusalOfCall(framework),
      meeting_mentor: this.identifyMentor(framework),
      crossing_threshold: this.identifyCrossingThreshold(framework),
      tests_allies_enemies: this.identifyTests(framework),
      ordeal: this.identifyOrdeal(framework),
      reward: this.identifyReward(framework),
      road_back: this.identifyRoadBack(framework),
      resurrection: this.identifyResurrection(framework),
      return_with_elixir: this.identifyReturn(framework)
    };
    
    const matchedStages = Object.values(heroJourneyStages).filter(stage => stage.present).length;
    const score = matchedStages / Object.keys(heroJourneyStages).length;
    
    return {
      ruleName: 'heros_journey_pattern',
      score,
      passed: score >= 0.6, // 英雄之旅不是所有故事的必要模式
      details: heroJourneyStages,
      suggestions: this.generateHeroJourneySuggestions(heroJourneyStages)
    };
  }
  
  private async validateThreeActStructure(framework: LogicFramework): Promise<TheoryRuleResult> {
    // 三幕剧结构分析
    const actBreakdown = this.identifyThreeActs(framework);
    
    const structureAnalysis = {
      act1_setup: this.analyzeAct1Setup(actBreakdown.act1),
      act2_confrontation: this.analyzeAct2Confrontation(actBreakdown.act2),
      act3_resolution: this.analyzeAct3Resolution(actBreakdown.act3),
      act_proportions: this.analyzeActProportions(actBreakdown),
      plot_points: this.identifyPlotPoints(framework)
    };
    
    const score = this.calculateThreeActScore(structureAnalysis);
    
    return {
      ruleName: 'three_act_structure',
      score,
      passed: score >= 0.75,
      details: structureAnalysis,
      suggestions: this.generateThreeActSuggestions(structureAnalysis)
    };
  }
  
  private async generateTheoreticalAnalysis(framework: LogicFramework): Promise<TheoreticalAnalysis> {
    const analysisPrompt = `
    作为叙事理论专家，请对以下6步逻辑骨架进行深入的理论分析：
    
    ${this.formatFrameworkForTheoryAnalysis(framework)}
    
    请从以下理论角度进行分析：
    1. 戏剧理论（亚里士多德、布莱希特等）
    2. 叙事学理论（普罗普、格雷马斯等）
    3. 心理学理论（弗洛伊德、荣格等）
    4. 社会学理论（价值观、社会结构等）
    5. 文学批评理论（形式主义、结构主义等）
    
    请提供：
    - 理论符合度分析
    - 理论应用的优秀之处
    - 理论缺失或薄弱环节
    - 基于理论的改进建议
    `;
    
    const analysis = await this.geminiClient.chat([
      { role: 'system', content: '你是顶级的叙事理论专家和文学批评家' },
      { role: 'user', content: analysisPrompt }
    ], {
      temperature: 0.4,
      maxTokens: 5000
    });
    
    return this.parseTheoreticalAnalysis(analysis);
  }
}
```

### Task 10.5.4: 验证结果处理和报告

```typescript
// 验证结果处理和报告生成器
class ValidationResultProcessor {
  async compileValidationResults(
    sessionResults: ValidationSessionResult[], 
    framework: LogicFramework
  ): Promise<ComprehensiveValidationResult> {
    
    const overallScore = this.calculateOverallScore(sessionResults);
    const criticalIssues = this.identifyCriticalIssues(sessionResults);
    const recommendations = this.generateComprehensiveRecommendations(sessionResults);
    
    return {
      framework,
      overallScore,
      passed: overallScore >= 0.7 && criticalIssues.length === 0,
      sessionResults,
      criticalIssues,
      recommendations,
      improvementPlan: await this.generateImprovementPlan(sessionResults),
      detailedReport: await this.generateDetailedReport(sessionResults, framework)
    };
  }
  
  private calculateOverallScore(sessionResults: ValidationSessionResult[]): number {
    const weights = {
      structure: 0.3,
      logic: 0.4,
      theory: 0.2,
      pattern: 0.1
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const result of sessionResults) {
      const weight = weights[result.sessionType] || 0;
      totalScore += result.score * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }
  
  private identifyCriticalIssues(sessionResults: ValidationSessionResult[]): CriticalIssue[] {
    const criticalIssues: CriticalIssue[] = [];
    
    for (const result of sessionResults) {
      const critical = result.issues.filter(issue => 
        issue.severity === 'error' || issue.severity === 'critical'
      );
      
      criticalIssues.push(...critical.map(issue => ({
        ...issue,
        sessionType: result.sessionType,
        impact: this.assessIssueImpact(issue, result.sessionType)
      })));
    }
    
    return criticalIssues.sort((a, b) => b.impact - a.impact);
  }
  
  private async generateImprovementPlan(
    sessionResults: ValidationSessionResult[]
  ): Promise<ImprovementPlan> {
    const allIssues = sessionResults.flatMap(r => r.issues);
    const groupedIssues = this.groupIssuesByCategory(allIssues);
    
    const improvements: ImprovementAction[] = [];
    
    for (const [category, issues] of Object.entries(groupedIssues)) {
      const action = await this.createImprovementAction(category, issues);
      improvements.push(action);
    }
    
    return {
      actions: improvements.sort((a, b) => b.priority - a.priority),
      estimatedEffort: this.estimateImprovementEffort(improvements),
      expectedImpact: this.estimateImprovementImpact(improvements),
      implementationOrder: this.optimizeImplementationOrder(improvements)
    };
  }
  
  private async generateDetailedReport(
    sessionResults: ValidationSessionResult[],
    framework: LogicFramework
  ): Promise<DetailedValidationReport> {
    return {
      executionSummary: this.generateExecutionSummary(sessionResults),
      sessionDetails: sessionResults,
      frameworkAnalysis: await this.analyzeFrameworkStrengthsWeaknesses(framework),
      comparativeAnalysis: await this.generateComparativeAnalysis(framework),
      recommendations: {
        immediate: this.getImmediateRecommendations(sessionResults),
        shortTerm: this.getShortTermRecommendations(sessionResults),
        longTerm: this.getLongTermRecommendations(sessionResults)
      },
      appendices: {
        theoreticalReferences: this.gatherTheoreticalReferences(),
        methodologyNotes: this.getMethodologyNotes(),
        validationCriteria: this.getValidationCriteria()
      }
    };
  }
  
  async exportValidationReport(
    result: ComprehensiveValidationResult,
    format: 'json' | 'pdf' | 'html' = 'json'
  ): Promise<ExportedReport> {
    switch (format) {
      case 'json':
        return this.exportAsJson(result);
      case 'pdf':
        return await this.exportAsPdf(result);
      case 'html':
        return await this.exportAsHtml(result);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}
```

## API接口设计

```typescript
// 验证引擎API路由
router.post('/api/validation/six-step/validate', async (req, res) => {
  try {
    const { framework, options = {} } = req.body;
    const engine = new SixStepValidationEngine();
    const result = await engine.validateLogicFramework(framework, options);
    
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

router.post('/api/validation/six-step/batch', async (req, res) => {
  try {
    const { frameworks, options = {} } = req.body;
    const engine = new SixStepValidationEngine();
    
    const results = await Promise.all(
      frameworks.map(framework => 
        engine.validateLogicFramework(framework, options)
      )
    );
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/api/validation/rules', async (req, res) => {
  try {
    const engine = new SixStepValidationEngine();
    const rules = await engine.getValidationRules();
    
    res.json({
      success: true,
      data: rules
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

**注意**: 此验证引擎需要深度集成叙事理论知识，确保验证结果的专业性和准确性。同时要保持高性能，支持批量验证操作。