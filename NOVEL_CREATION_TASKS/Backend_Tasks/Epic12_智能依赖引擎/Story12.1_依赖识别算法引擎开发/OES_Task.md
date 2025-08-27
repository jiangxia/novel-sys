# Story 12.1: 依赖识别算法引擎开发

## O (Objective)

### 功能目标
- 实现智能的依赖关系分析算法
- 构建准确的依赖缺失检测逻辑
- 建立灵活的依赖层级计算系统

### 技术目标  
- 依赖识别准确率达到95%以上
- 单文件依赖检查时间<100ms
- 支持复杂的依赖关系网络分析

## E (Environment)

### 技术环境
- Node.js + Express框架
- 文件系统读写操作
- Markdown内容解析库
- 正则表达式和自然语言处理

### 依赖环境
- 全栈制定的依赖检查API规范
- 项目标准4目录结构
- 文件内容模板规范
- 依赖状态数据格式标准

### 外部依赖
- 文件监听库（chokidar）
- Markdown解析库（marked）
- 内容分析工具（可选：NLP库）

## S (Success Criteria)

### 及格标准 (Must Have)
- **基础依赖识别**：正确识别设定→大纲→概要→内容的基本依赖链
- **文件存在检查**：准确检测依赖文件是否存在
- **内容完整性检查**：基于模板验证文件内容完整性

### 优秀标准 (Should Have)  
- **智能依赖推理**：基于内容分析推断隐含依赖关系
- **部分满足识别**：识别依赖部分满足的情况
- **循环依赖检测**：发现并处理循环依赖问题

### 卓越标准 (Nice to Have)
- **语义依赖分析**：基于内容语义分析依赖关系
- **自适应依赖规则**：根据项目特点调整依赖规则
- **预测性依赖建议**：预测用户接下来需要的依赖

## 具体任务分解

### Task 12.1.1: 核心依赖识别算法

**依赖规则引擎设计**：
```javascript
// lib/dependency-rules.js
class DependencyRules {
  // 基础依赖规则定义
  static BASIC_RULES = {
    'content': {
      requires: ['summary', 'setting'],
      optional: ['outline'],
      weight: 1.0
    },
    'summary': {
      requires: ['outline', 'setting'],
      optional: [],
      weight: 0.8
    },
    'outline': {
      requires: ['setting'],
      optional: [],
      weight: 0.6
    },
    'setting': {
      requires: [],
      optional: [],
      weight: 0.4
    }
  };

  static evaluateDependency(fileType, availableFiles) {
    const rule = this.BASIC_RULES[fileType];
    const result = {
      required: [],
      missing: [],
      satisfied: true,
      score: 0
    };
    
    // 检查必需依赖
    rule.requires.forEach(depType => {
      const depFiles = availableFiles.filter(f => f.type === depType);
      if (depFiles.length === 0) {
        result.missing.push(depType);
        result.satisfied = false;
      } else {
        result.required.push({ type: depType, files: depFiles });
      }
    });
    
    return result;
  }
}
```

**智能依赖分析器**：
```javascript
// lib/dependency-analyzer.js
class DependencyAnalyzer {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.contentAnalyzer = new ContentAnalyzer();
  }

  async analyzeDependencies(fileId, fileType) {
    try {
      // 1. 获取项目文件列表
      const projectFiles = await this.getProjectFiles();
      
      // 2. 应用基础依赖规则
      const basicDeps = DependencyRules.evaluateDependency(fileType, projectFiles);
      
      // 3. 内容分析增强
      const contentDeps = await this.analyzeContentDependencies(fileId, projectFiles);
      
      // 4. 合并分析结果
      return this.mergeDependencyResults(basicDeps, contentDeps);
      
    } catch (error) {
      return this.handleAnalysisError(error, fileId, fileType);
    }
  }

  async analyzeContentDependencies(fileId, projectFiles) {
    // 基于文件内容的深度依赖分析
    const content = await this.readFileContent(fileId);
    return this.contentAnalyzer.analyze(content, projectFiles);
  }
}
```

### Task 12.1.2: 内容完整性检测算法

**模板匹配算法**：
```javascript
// lib/content-completeness.js
class ContentCompletenessChecker {
  
  // 设定文件完整性检查
  checkSettingCompleteness(content) {
    const requiredSections = [
      '故事世界', '故事主题', '故事角色'
    ];
    
    const requiredFields = {
      '故事世界': ['时空框架', '世界规则', '环境氛围'],
      '故事主题': ['作品定位', '核心价值观', '价值冲突'],
      '故事角色': ['主角设定', '重要配角', '人物关系']
    };
    
    const result = {
      completeness: 0,
      missingSections: [],
      partialSections: [],
      suggestions: []
    };
    
    // 检查各部分完整性
    requiredSections.forEach(section => {
      const sectionContent = this.extractSection(content, section);
      const fieldCompleteness = this.checkFields(sectionContent, requiredFields[section]);
      
      if (fieldCompleteness.score === 0) {
        result.missingSections.push(section);
      } else if (fieldCompleteness.score < 0.8) {
        result.partialSections.push({
          section,
          missing: fieldCompleteness.missing,
          score: fieldCompleteness.score
        });
      }
    });
    
    result.completeness = this.calculateOverallScore(result);
    result.suggestions = this.generateSuggestions(result);
    
    return result;
  }

  // 大纲完整性检查  
  checkOutlineCompleteness(content) {
    const requiredElements = [
      '背景设定', '主题立意', '核心事件', '价值意义'
    ];
    
    return this.checkTemplateElements(content, requiredElements);
  }

  // 概要完整性检查
  checkSummaryCompleteness(content) {
    const required6Steps = [
      '起始状态', '矛盾发生', '冲突升级', 
      '智慧介入', '问题解决', '结果状态'
    ];
    
    const result = this.checkTemplateElements(content, required6Steps);
    result.logicFlow = this.validateLogicFlow(content, required6Steps);
    
    return result;
  }
}
```

### Task 12.1.3: 依赖层级计算系统

**依赖图构建算法**：
```javascript
// lib/dependency-graph.js
class DependencyGraph {
  constructor() {
    this.nodes = new Map(); // 文件节点
    this.edges = new Map(); // 依赖关系
  }

  buildGraph(projectFiles) {
    // 构建依赖关系图
    projectFiles.forEach(file => {
      this.addNode(file);
      const dependencies = this.calculateFileDependencies(file);
      dependencies.forEach(dep => {
        this.addEdge(file.id, dep.id, dep.weight);
      });
    });
    
    return this.validateGraph();
  }

  calculateDependencyLevels() {
    // 拓扑排序计算依赖层级
    const levels = new Map();
    const visited = new Set();
    const visiting = new Set();
    
    const dfs = (nodeId, currentLevel = 0) => {
      if (visiting.has(nodeId)) {
        throw new Error(`循环依赖检测到: ${nodeId}`);
      }
      
      if (visited.has(nodeId)) {
        return levels.get(nodeId);
      }
      
      visiting.add(nodeId);
      
      const dependencies = this.getNodeDependencies(nodeId);
      let maxDepLevel = 0;
      
      dependencies.forEach(depId => {
        const depLevel = dfs(depId, currentLevel + 1);
        maxDepLevel = Math.max(maxDepLevel, depLevel + 1);
      });
      
      levels.set(nodeId, maxDepLevel);
      visited.add(nodeId);
      visiting.delete(nodeId);
      
      return maxDepLevel;
    };
    
    this.nodes.forEach((node, nodeId) => {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    });
    
    return levels;
  }

  findOptimalCreationOrder() {
    // 基于依赖层级推荐创作顺序
    const levels = this.calculateDependencyLevels();
    const ordered = Array.from(levels.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([nodeId, level]) => ({
        fileId: nodeId,
        level,
        node: this.nodes.get(nodeId)
      }));
    
    return this.generateCreationRecommendations(ordered);
  }
}
```

### Task 12.1.4: 性能优化和错误处理

**缓存策略**：
```javascript
// lib/dependency-cache.js
class DependencyCache {
  constructor() {
    this.cache = new Map();
    this.fileChecksums = new Map();
  }

  async getCachedDependency(fileId) {
    const cached = this.cache.get(fileId);
    if (!cached) return null;
    
    // 检查文件是否被修改
    const currentChecksum = await this.calculateChecksum(fileId);
    if (currentChecksum !== this.fileChecksums.get(fileId)) {
      this.invalidateCache(fileId);
      return null;
    }
    
    return cached.data;
  }

  setCachedDependency(fileId, data) {
    this.calculateChecksum(fileId).then(checksum => {
      this.fileChecksums.set(fileId, checksum);
      this.cache.set(fileId, {
        data,
        timestamp: Date.now()
      });
    });
  }
}
```

**错误恢复机制**：
```javascript
// lib/error-handler.js
class DependencyErrorHandler {
  
  static handleAnalysisError(error, context) {
    const errorType = this.classifyError(error);
    
    switch (errorType) {
      case 'FILE_NOT_FOUND':
        return this.createFallbackResult('missing', context);
      
      case 'PARSE_ERROR':
        return this.createFallbackResult('parsing_failed', context);
      
      case 'TIMEOUT':
        return this.createFallbackResult('timeout', context);
      
      default:
        return this.createFallbackResult('unknown_error', context);
    }
  }

  static createFallbackResult(errorReason, context) {
    return {
      success: false,
      canProceed: true, // 降级允许继续
      dependencies: [],
      error: errorReason,
      warningMessage: `依赖检查失败(${errorReason})，请手动确认依赖关系`,
      recommendations: [
        {
          action: 'manual_check',
          description: '手动检查前置内容是否完整',
          priority: 'high'
        }
      ]
    };
  }
}
```

## 技术实现要点

### 算法性能要求
- **单文件依赖检查**: <100ms
- **项目全量检查**: <2s (100个文件)
- **内存占用**: <50MB (大型项目)
- **缓存命中率**: >80%

### 准确性指标
- **基础依赖识别**: 100%准确(文件存在性)
- **内容完整性检查**: 95%准确(基于模板)
- **智能依赖推理**: 85%准确(基于内容分析)

### 可扩展性设计
- 支持插件式依赖规则扩展
- 支持自定义内容检查规则
- 支持多语言内容分析

## 验收标准

### 功能验收
- [ ] 准确识别所有基础依赖关系
- [ ] 正确检测文件缺失和内容不完整
- [ ] 提供合理的创作顺序建议

### 性能验收  
- [ ] 响应时间满足性能要求
- [ ] 内存使用控制在合理范围
- [ ] 缓存机制有效提升性能

### 错误处理验收
- [ ] 优雅处理所有异常情况
- [ ] 提供有用的错误信息和建议
- [ ] 支持降级使用模式