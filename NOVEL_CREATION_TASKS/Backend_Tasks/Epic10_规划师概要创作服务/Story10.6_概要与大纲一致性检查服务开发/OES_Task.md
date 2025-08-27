# Story 10.6: 概要与大纲一致性检查服务开发

## O (Objective)

### 功能目标
- 开发概要与大纲之间的智能一致性检查服务
- 实现多维度的内容对比和差异分析算法
- 建立自动化的一致性修复和同步机制

### 技术目标  
- 基于文本分析和语义理解的对比算法
- 实现高精度的内容差异识别和分类
- 集成智能修复建议和批量同步功能

## E (Environment)

### 技术环境
- Node.js + TypeScript服务端框架
- 文本相似度算法（余弦相似度、编辑距离等）
- 语义分析服务（Google Gemini API）
- 差异标注和可视化数据结构

### 依赖环境
- Epic 9：规划师大纲数据结构和服务已完成
- Story 10.4：概要创作服务已实现
- Story 10.5：逻辑验证引擎可复用部分功能
- 一致性检查规范和标准已定义

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 一致性检查服务准确识别概要与大纲差异
- ✅ 提供清晰的差异分类和问题定位
- ✅ 基础的修复建议和同步操作功能
- ✅ 检查结果数据结构完整，支持前端展示

### 优秀标准 (Should Have)  
- ✅ 智能的语义层面差异分析
- ✅ 多种修复策略和批量处理能力
- ✅ 详细的一致性评分和质量报告
- ✅ 高性能的并发检查和缓存机制

### 卓越标准 (Nice to Have)
- ✅ 机器学习驱动的差异模式识别
- ✅ 个性化的一致性检查偏好配置
- ✅ 协作审核和版本同步工作流
- ✅ 实时一致性监控和预警系统

## 具体任务分解

### Task 10.6.1: 一致性检查核心引擎

```typescript
// 概要与大纲一致性检查核心引擎
class ConsistencyCheckEngine {
  private textAnalyzer: TextAnalyzer;
  private semanticAnalyzer: SemanticAnalyzer;
  private diffGenerator: DifferenceGenerator;
  private repairSuggester: RepairSuggester;
  
  constructor() {
    this.textAnalyzer = new TextAnalyzer();
    this.semanticAnalyzer = new SemanticAnalyzer();
    this.diffGenerator = new DifferenceGenerator();
    this.repairSuggester = new RepairSuggester();
  }
  
  async checkConsistency(request: ConsistencyCheckRequest): Promise<ConsistencyResult> {
    const { outline, summary, checkMode = 'comprehensive' } = request;
    
    // 1. 预处理和数据规范化
    const normalizedOutline = await this.normalizeOutlineData(outline);
    const normalizedSummary = await this.normalizeSummaryData(summary);
    
    // 2. 多维度一致性检查
    const consistencyChecks = await this.performConsistencyChecks(
      normalizedOutline, 
      normalizedSummary, 
      checkMode
    );
    
    // 3. 差异分析和分类
    const differences = await this.analyzeDifferences(consistencyChecks);
    
    // 4. 生成修复建议
    const repairSuggestions = await this.generateRepairSuggestions(differences);
    
    // 5. 计算一致性评分
    const consistencyScore = this.calculateConsistencyScore(consistencyChecks);
    
    return {
      overallScore: consistencyScore.overall,
      dimensionScores: consistencyScore.dimensions,
      differences,
      repairSuggestions,
      checkMode,
      timestamp: new Date().toISOString(),
      metadata: {
        outlineVersion: outline.version,
        summaryVersion: summary.version,
        checkDuration: Date.now() - request.startTime
      }
    };
  }
  
  private async performConsistencyChecks(
    outline: NormalizedOutline,
    summary: NormalizedSummary,
    checkMode: CheckMode
  ): Promise<ConsistencyCheckResult[]> {
    const checks: ConsistencyCheck[] = this.getChecksByMode(checkMode);
    const results: ConsistencyCheckResult[] = [];
    
    for (const check of checks) {
      const result = await this.executeConsistencyCheck(check, outline, summary);
      results.push(result);
    }
    
    return results;
  }
  
  private getChecksByMode(checkMode: CheckMode): ConsistencyCheck[] {
    const basicChecks = [
      { type: 'character_consistency', weight: 0.25 },
      { type: 'plot_consistency', weight: 0.25 },
      { type: 'theme_consistency', weight: 0.20 },
      { type: 'setting_consistency', weight: 0.15 }
    ];
    
    const comprehensiveChecks = [
      ...basicChecks,
      { type: 'timeline_consistency', weight: 0.10 },
      { type: 'tone_consistency', weight: 0.05 },
      { type: 'detail_consistency', weight: 0.10 }
    ];
    
    const deepChecks = [
      ...comprehensiveChecks,
      { type: 'semantic_consistency', weight: 0.15 },
      { type: 'emotional_consistency', weight: 0.10 },
      { type: 'symbolic_consistency', weight: 0.05 }
    ];
    
    switch (checkMode) {
      case 'basic': return basicChecks;
      case 'comprehensive': return comprehensiveChecks;
      case 'deep': return deepChecks;
      default: return comprehensiveChecks;
    }
  }
  
  private async executeConsistencyCheck(
    check: ConsistencyCheck,
    outline: NormalizedOutline,
    summary: NormalizedSummary
  ): Promise<ConsistencyCheckResult> {
    
    switch (check.type) {
      case 'character_consistency':
        return await this.checkCharacterConsistency(outline, summary);
      case 'plot_consistency':
        return await this.checkPlotConsistency(outline, summary);
      case 'theme_consistency':
        return await this.checkThemeConsistency(outline, summary);
      case 'setting_consistency':
        return await this.checkSettingConsistency(outline, summary);
      case 'timeline_consistency':
        return await this.checkTimelineConsistency(outline, summary);
      case 'semantic_consistency':
        return await this.checkSemanticConsistency(outline, summary);
      default:
        throw new Error(`Unsupported consistency check type: ${check.type}`);
    }
  }
}
```

### Task 10.6.2: 多维度一致性检查算法

```typescript
// 多维度一致性检查实现
class MultiDimensionalConsistencyChecker {
  
  async checkCharacterConsistency(
    outline: NormalizedOutline,
    summary: NormalizedSummary
  ): Promise<ConsistencyCheckResult> {
    const outlineCharacters = this.extractCharacters(outline);
    const summaryCharacters = this.extractCharacters(summary);
    
    const characterDifferences: CharacterDifference[] = [];
    
    // 1. 检查人物是否缺失或多余
    const missingCharacters = outlineCharacters.filter(
      oc => !summaryCharacters.find(sc => this.isSameCharacter(oc, sc))
    );
    
    const extraCharacters = summaryCharacters.filter(
      sc => !outlineCharacters.find(oc => this.isSameCharacter(oc, sc))
    );
    
    // 2. 检查人物属性一致性
    for (const outlineChar of outlineCharacters) {
      const summaryChar = summaryCharacters.find(sc => 
        this.isSameCharacter(outlineChar, sc)
      );
      
      if (summaryChar) {
        const attributeDiffs = await this.compareCharacterAttributes(
          outlineChar, 
          summaryChar
        );
        characterDifferences.push(...attributeDiffs);
      }
    }
    
    const consistencyScore = this.calculateCharacterConsistencyScore({
      missingCharacters,
      extraCharacters,
      characterDifferences
    });
    
    return {
      type: 'character_consistency',
      score: consistencyScore,
      differences: [
        ...this.createMissingCharacterDiffs(missingCharacters),
        ...this.createExtraCharacterDiffs(extraCharacters),
        ...characterDifferences
      ],
      details: {
        totalOutlineCharacters: outlineCharacters.length,
        totalSummaryCharacters: summaryCharacters.length,
        matchedCharacters: outlineCharacters.length - missingCharacters.length
      }
    };
  }
  
  async checkPlotConsistency(
    outline: NormalizedOutline,
    summary: NormalizedSummary
  ): Promise<ConsistencyCheckResult> {
    const outlinePlot = this.extractPlotPoints(outline);
    const summaryPlot = this.extractPlotPoints(summary);
    
    const plotDifferences: PlotDifference[] = [];
    
    // 1. 检查主要情节点是否对应
    const plotPointMatches = await this.matchPlotPoints(outlinePlot, summaryPlot);
    
    for (const match of plotPointMatches) {
      if (match.similarity < 0.7) {
        const difference = await this.analyzePlotPointDifference(
          match.outlinePoint, 
          match.summaryPoint
        );
        plotDifferences.push(difference);
      }
    }
    
    // 2. 检查情节发展逻辑
    const logicConsistency = await this.checkPlotLogicConsistency(
      outlinePlot, 
      summaryPlot
    );
    
    // 3. 检查关键冲突点
    const conflictConsistency = await this.checkConflictConsistency(
      outline, 
      summary
    );
    
    const consistencyScore = this.calculatePlotConsistencyScore({
      plotPointMatches,
      logicConsistency,
      conflictConsistency
    });
    
    return {
      type: 'plot_consistency',
      score: consistencyScore,
      differences: plotDifferences,
      details: {
        plotPointMatches: plotPointMatches.length,
        averageSimilarity: plotPointMatches.reduce((sum, m) => sum + m.similarity, 0) / plotPointMatches.length,
        logicConsistency,
        conflictConsistency
      }
    };
  }
  
  async checkSemanticConsistency(
    outline: NormalizedOutline,
    summary: NormalizedSummary
  ): Promise<ConsistencyCheckResult> {
    // 使用AI进行深层语义分析
    const semanticAnalysisPrompt = `
    请对比分析以下大纲和概要的语义一致性：
    
    **大纲内容:**
    ${this.formatOutlineForSemanticAnalysis(outline)}
    
    **概要内容:**
    ${this.formatSummaryForSemanticAnalysis(summary)}
    
    请从以下维度进行语义一致性分析：
    1. 核心主题表达是否一致
    2. 情感基调是否匹配
    3. 价值观念是否统一
    4. 关键概念是否对应
    5. 叙事风格是否协调
    
    请为每个维度提供：
    - 一致性评分（0-100）
    - 具体差异描述
    - 改进建议
    `;
    
    const analysis = await this.semanticAnalyzer.analyze(semanticAnalysisPrompt);
    const semanticResult = this.parseSemanticAnalysis(analysis);
    
    return {
      type: 'semantic_consistency',
      score: semanticResult.overallScore,
      differences: semanticResult.differences,
      details: semanticResult.dimensionScores
    };
  }
}
```

### Task 10.6.3: 差异分析和分类系统

```typescript
// 差异分析和分类服务
class DifferenceAnalyzer {
  
  async analyzeDifferences(checkResults: ConsistencyCheckResult[]): Promise<CategorizedDifference[]> {
    const allDifferences = checkResults.flatMap(result => result.differences);
    
    // 1. 差异分类
    const categorizedDiffs = await this.categorizeDifferences(allDifferences);
    
    // 2. 差异优先级排序
    const prioritizedDiffs = this.prioritizeDifferences(categorizedDiffs);
    
    // 3. 差异影响分析
    const analyzedDiffs = await this.analyzeDifferenceImpacts(prioritizedDiffs);
    
    return analyzedDiffs;
  }
  
  private async categorizeDifferences(differences: Difference[]): Promise<CategorizedDifference[]> {
    const categories = {
      CRITICAL: {
        name: '关键性差异',
        description: '严重影响故事逻辑和完整性的差异',
        priority: 1
      },
      MAJOR: {
        name: '重要差异',
        description: '影响故事质量和一致性的差异',
        priority: 2
      },
      MINOR: {
        name: '轻微差异',
        description: '不影响核心逻辑但需要注意的差异',
        priority: 3
      },
      STYLISTIC: {
        name: '风格差异',
        description: '表达方式或细节描述的差异',
        priority: 4
      }
    };
    
    const categorized: CategorizedDifference[] = [];
    
    for (const diff of differences) {
      const category = await this.determineDifferenceCategory(diff);
      categorized.push({
        ...diff,
        category: category.name,
        priority: category.priority,
        impact: await this.assessDifferenceImpact(diff),
        repairComplexity: this.assessRepairComplexity(diff)
      });
    }
    
    return categorized;
  }
  
  private async determineDifferenceCategory(difference: Difference): Promise<DifferenceCategory> {
    const categoryPrompt = `
    请分析以下内容差异的重要程度和影响级别：
    
    差异类型：${difference.type}
    差异描述：${difference.description}
    涉及内容：${JSON.stringify(difference.content)}
    
    请从以下角度评估：
    1. 对故事逻辑完整性的影响
    2. 对读者理解的影响
    3. 对情节发展的影响
    4. 修复的紧急程度
    
    请选择分类：CRITICAL, MAJOR, MINOR, STYLISTIC
    `;
    
    const analysis = await this.semanticAnalyzer.analyze(categoryPrompt);
    return this.parseCategoryAnalysis(analysis);
  }
  
  async generateDifferenceVisualization(differences: CategorizedDifference[]): Promise<DifferenceVisualization> {
    return {
      summary: {
        total: differences.length,
        byCategory: this.groupByCategory(differences),
        byType: this.groupByType(differences),
        byPriority: this.groupByPriority(differences)
      },
      heatmap: await this.generateDifferenceHeatmap(differences),
      timeline: this.generateDifferenceTimeline(differences),
      relationships: this.analyzeDifferenceRelationships(differences)
    };
  }
  
  private generateDifferenceHeatmap(differences: CategorizedDifference[]): DifferenceHeatmap {
    // 按章节/段落位置生成热力图数据
    const sectionDiffs = this.groupDifferencesBySections(differences);
    
    return {
      sections: Object.keys(sectionDiffs),
      intensities: Object.values(sectionDiffs).map(diffs => ({
        count: diffs.length,
        severity: this.calculateSectionSeverity(diffs),
        types: [...new Set(diffs.map(d => d.type))]
      }))
    };
  }
}
```

### Task 10.6.4: 智能修复建议系统

```typescript
// 智能修复建议生成器
class IntelligentRepairSuggester {
  
  async generateRepairSuggestions(differences: CategorizedDifference[]): Promise<RepairSuggestion[]> {
    const suggestions: RepairSuggestion[] = [];
    
    // 按优先级分组处理
    const groupedDiffs = this.groupDifferencesByPriority(differences);
    
    for (const [priority, diffs] of Object.entries(groupedDiffs)) {
      const prioritySuggestions = await this.generatePrioritySuggestions(
        parseInt(priority), 
        diffs
      );
      suggestions.push(...prioritySuggestions);
    }
    
    return this.optimizeSuggestionOrder(suggestions);
  }
  
  private async generatePrioritySuggestions(
    priority: number, 
    differences: CategorizedDifference[]
  ): Promise<RepairSuggestion[]> {
    const suggestions: RepairSuggestion[] = [];
    
    for (const diff of differences) {
      const suggestion = await this.generateSingleRepairSuggestion(diff);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
    
    return suggestions;
  }
  
  private async generateSingleRepairSuggestion(
    difference: CategorizedDifference
  ): Promise<RepairSuggestion | null> {
    
    switch (difference.type) {
      case 'missing_character':
        return await this.suggestCharacterAddition(difference);
      
      case 'inconsistent_plot':
        return await this.suggestPlotAlignment(difference);
      
      case 'theme_mismatch':
        return await this.suggestThemeAdjustment(difference);
      
      case 'timeline_conflict':
        return await this.suggestTimelineCorrection(difference);
      
      case 'detail_inconsistency':
        return await this.suggestDetailUpdate(difference);
      
      default:
        return await this.generateGenericSuggestion(difference);
    }
  }
  
  private async suggestCharacterAddition(difference: CategorizedDifference): Promise<RepairSuggestion> {
    const character = difference.content.character;
    
    return {
      id: `add_character_${character.name}`,
      type: 'add_content',
      title: `添加人物：${character.name}`,
      description: `在概要中添加缺失的人物 "${character.name}"`,
      targetLocation: difference.location,
      repairAction: {
        type: 'insert',
        content: await this.generateCharacterDescription(character),
        position: this.suggestCharacterInsertionPosition(difference)
      },
      impact: 'high',
      effort: 'medium',
      confidence: 0.9
    };
  }
  
  private async suggestPlotAlignment(difference: CategorizedDifference): Promise<RepairSuggestion> {
    const plotDiscrepancy = difference.content;
    
    const alignmentSuggestion = await this.generatePlotAlignmentText(plotDiscrepancy);
    
    return {
      id: `align_plot_${difference.id}`,
      type: 'modify_content',
      title: '调整情节描述',
      description: `修正概要中的情节描述以与大纲保持一致`,
      targetLocation: difference.location,
      repairAction: {
        type: 'replace',
        currentContent: plotDiscrepancy.summaryVersion,
        suggestedContent: alignmentSuggestion,
        reason: '确保情节发展与大纲设定一致'
      },
      impact: 'high',
      effort: 'medium',
      confidence: 0.85
    };
  }
  
  async generateBulkRepairPlan(suggestions: RepairSuggestion[]): Promise<BulkRepairPlan> {
    const plan = {
      id: `bulk_repair_${Date.now()}`,
      suggestions,
      totalEffort: this.calculateTotalEffort(suggestions),
      estimatedDuration: this.estimateRepairDuration(suggestions),
      dependencyGraph: this.analyzeSuggestionDependencies(suggestions),
      executionOrder: this.optimizeExecutionOrder(suggestions)
    };
    
    return plan;
  }
  
  async executeBulkRepair(plan: BulkRepairPlan): Promise<BulkRepairResult> {
    const results: RepairExecutionResult[] = [];
    const failedRepairs: FailedRepair[] = [];
    
    for (const suggestion of plan.executionOrder) {
      try {
        const result = await this.executeRepairSuggestion(suggestion);
        results.push(result);
        
        if (!result.success) {
          failedRepairs.push({
            suggestion,
            error: result.error,
            retryable: result.retryable
          });
        }
      } catch (error) {
        failedRepairs.push({
          suggestion,
          error: error.message,
          retryable: true
        });
      }
    }
    
    return {
      planId: plan.id,
      totalSuggestions: plan.suggestions.length,
      successfulRepairs: results.filter(r => r.success).length,
      failedRepairs,
      executionTime: Date.now() - plan.startTime,
      finalConsistencyScore: await this.assessPostRepairConsistency()
    };
  }
}
```

## API接口设计

```typescript
// 一致性检查API路由
router.post('/api/consistency/check', async (req, res) => {
  try {
    const request: ConsistencyCheckRequest = {
      ...req.body,
      startTime: Date.now()
    };
    
    const engine = new ConsistencyCheckEngine();
    const result = await engine.checkConsistency(request);
    
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

router.post('/api/consistency/repair/suggestions', async (req, res) => {
  try {
    const { differences } = req.body;
    const suggester = new IntelligentRepairSuggester();
    const suggestions = await suggester.generateRepairSuggestions(differences);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/api/consistency/repair/execute', async (req, res) => {
  try {
    const { suggestions } = req.body;
    const suggester = new IntelligentRepairSuggester();
    const plan = await suggester.generateBulkRepairPlan(suggestions);
    const result = await suggester.executeBulkRepair(plan);
    
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

router.get('/api/consistency/history/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const history = await ConsistencyCheckHistory.getByProjectId(projectId);
    
    res.json({
      success: true,
      data: history
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

**注意**: 此一致性检查服务需要处理大量文本对比分析，要注重性能优化和缓存策略，同时确保检查结果的准确性和实用性。