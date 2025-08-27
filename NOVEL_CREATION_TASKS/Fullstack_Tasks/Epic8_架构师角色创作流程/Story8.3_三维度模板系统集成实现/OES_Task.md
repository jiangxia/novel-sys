# Story 8.3: 三维度模板系统集成实现

## O (Objective)

### 功能目标
- 实现故事世界、故事主题、故事角色三维度模板系统
- 建立模板数据与Markdown文件的双向同步机制
- 实现设定完整性检查和质量评估功能

### 技术目标  
- 构建灵活可扩展的模板引擎架构
- 实现模板数据的动态渲染和实时预览
- 建立高效的本地文件同步和版本管理机制

### 协作目标
- 与5步引导流程无缝集成验证
- 确保模板数据在前后端间的一致性同步
- 建立模板系统与文件操作的完整协作机制

## E (Environment)

### 协作环境
- **前端**: React + TypeScript + 模板渲染组件
- **后端**: Node.js + 文件系统操作 + 模板生成引擎
- **协作点**: 模板数据同步、文件生成保存、实时预览更新

### 技术环境
- 基于Story 8.1的模板数据格式规范
- Markdown模板引擎和文件操作库
- 前端动态表单和预览组件系统
- 文件监听和自动同步机制

### 依赖环境
- Story 8.1：架构师接口协议和模板数据格式已定义
- Epic 3：文件操作和本地同步机制已实现
- 前端编辑器和预览组件基础设施已建立
- 设定完整性检查算法设计已完成

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 三个维度的模板可以正确渲染和编辑
- ✅ 模板数据与Markdown文件实现双向同步
- ✅ 设定完整性检查功能正常工作
- ✅ 用户可以实时预览生成的模板文件效果

### 优秀标准 (Should Have)  
- ✅ 模板系统支持字段级别的细粒度编辑
- ✅ 完整性检查提供详细的改进建议
- ✅ 文件同步机制高效且不影响用户操作
- ✅ 模板预览支持多种显示格式切换

### 卓越标准 (Nice to Have)
- ✅ 模板系统支持用户自定义字段和布局
- ✅ 智能检查可识别设定间的逻辑冲突
- ✅ 支持模板版本历史和回滚功能
- ✅ 提供设定质量评分和专业建议

### 协作标准
- ✅ 与5步引导流程的数据流转完全一致
- ✅ 前后端模板数据格式转换无损失
- ✅ 文件操作与现有系统完全兼容
- ✅ 异常处理机制完善且用户体验友好

## 三维度模板系统详细实现

### 1. 故事世界模板组件实现

**前端组件架构**：
```typescript
// 故事世界模板编辑器
const StoryWorldEditor: React.FC = () => {
  const [worldData, setWorldData] = useState<StoryWorldTemplate>();
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'form' | 'markdown'>('form');
  
  return (
    <div className="story-world-editor">
      <EditorHeader 
        title="故事世界" 
        onModeSwitch={setPreviewMode}
        onSave={handleSave}
      />
      
      {previewMode === 'form' ? (
        <WorldFormEditor 
          data={worldData}
          onChange={setWorldData}
          onValidate={validateWorldData}
        />
      ) : (
        <MarkdownPreview 
          template={worldData}
          templateType="world"
        />
      )}
    </div>
  );
};

// 时空框架编辑区块
const TimeframeSection: React.FC = () => (
  <EditorSection title="时空框架">
    <FormField 
      label="时间设定"
      value={worldData.timeframe.timeSetting}
      onChange={handleTimeSettingChange}
      placeholder="具体时间跨度和历史背景"
      required
    />
    <FormField 
      label="空间设定"
      value={worldData.timeframe.spaceSetting}
      onChange={handleSpaceSettingChange}
      placeholder="主要活动地点和地理环境"
      required
    />
    <FormField 
      label="时代特征"
      value={worldData.timeframe.eraCharacteristics}
      onChange={handleEraCharacteristicsChange}
      placeholder="每个时期的社会文化特点"
      type="textarea"
    />
  </EditorSection>
);
```

**后端模板引擎实现**：
```typescript
// 模板生成引擎
class TemplateEngine {
  generateWorldMarkdown(data: StoryWorldTemplate): string {
    return `# 故事世界

## 时空框架
- **时间设定**：${data.timeframe.timeSetting}
- **空间设定**：${data.timeframe.spaceSetting}
- **时代特征**：${data.timeframe.eraCharacteristics}

## 世界规则
- **核心设定**：${data.worldRules.coreSettings}
- **运行机制**：${data.worldRules.operationMechanism}
- **边界限制**：${data.worldRules.boundaryLimits}

## 环境氛围
- **典型场景**：${data.environmentAtmosphere.typicalScenes}
- **时代质感**：${data.environmentAtmosphere.eraTexture}
- **文化背景**：${data.environmentAtmosphere.culturalBackground}`;
  }
  
  parseWorldMarkdown(markdown: string): StoryWorldTemplate {
    // 解析Markdown内容返回结构化数据
    return this.parseMarkdownTemplate(markdown, 'world');
  }
}
```

### 2. 故事主题模板组件实现

**前端组件架构**：
```typescript
// 故事主题模板编辑器
const StoryThemeEditor: React.FC = () => {
  const [themeData, setThemeData] = useState<StoryThemeTemplate>();
  
  return (
    <div className="story-theme-editor">
      <WorkPositioningSection data={themeData.workPositioning} />
      <CoreValuesSection data={themeData.coreValues} />
      <ValueConflictsSection data={themeData.valueConflicts} />
      <CulturalHeritageSection data={themeData.culturalHeritage} />
    </div>
  );
};

// 核心价值观编辑区块
const CoreValuesSection: React.FC = () => (
  <EditorSection title="核心价值观">
    <FormField 
      label="主题内核"
      value={themeData.coreValues.themeCore}
      onChange={handleThemeCoreChange}
      placeholder="一句话概括的故事主旨"
      required
      maxLength={100}
    />
    <FormField 
      label="价值体系"
      value={themeData.coreValues.valueSystem}
      onChange={handleValueSystemChange}
      placeholder="支撑故事的核心价值观念"
      type="textarea"
    />
    <FormField 
      label="时代意义"
      value={themeData.coreValues.contemporarySignificance}
      onChange={handleContemporarySignificanceChange}
      placeholder="主题的现实意义和启发价值"
      type="textarea"
    />
  </EditorSection>
);
```

### 3. 故事角色模板组件实现

**前端组件架构**：
```typescript
// 故事角色模板编辑器
const StoryCharacterEditor: React.FC = () => {
  const [characterData, setCharacterData] = useState<StoryCharacterTemplate>();
  
  return (
    <div className="story-character-editor">
      <ProtagonistSection data={characterData.protagonistSetting} />
      <SupportingCharactersSection 
        characters={characterData.importantSupportingCharacters}
        onAdd={handleAddSupportingCharacter}
        onRemove={handleRemoveSupportingCharacter}
      />
      <CharacterRelationshipsSection data={characterData.characterRelationships} />
    </div>
  );
};

// 动态配角管理组件
const SupportingCharactersSection: React.FC = () => (
  <EditorSection title="重要配角">
    {characters.map((character, index) => (
      <CharacterCard key={index}>
        <FormField 
          label="角色姓名"
          value={character.characterName}
          onChange={(value) => handleCharacterChange(index, 'characterName', value)}
          required
        />
        <FormField 
          label="角色定位"
          value={character.rolePositioning}
          onChange={(value) => handleCharacterChange(index, 'rolePositioning', value)}
          placeholder="在故事中的功能作用"
        />
        <FormField 
          label="基本信息"
          value={character.basicInfo}
          onChange={(value) => handleCharacterChange(index, 'basicInfo', value)}
          placeholder="简要背景信息"
        />
        <FormField 
          label="关系设定"
          value={character.relationshipSetting}
          onChange={(value) => handleCharacterChange(index, 'relationshipSetting', value)}
          placeholder="与主角的关系"
        />
        <Button onClick={() => onRemove(index)} variant="danger">删除角色</Button>
      </CharacterCard>
    ))}
    <Button onClick={onAdd} variant="primary">添加配角</Button>
  </EditorSection>
);
```

### 4. 设定完整性检查实现

**后端完整性检查引擎**：
```typescript
// 设定完整性检查服务
class CompletenessValidationService {
  validateWorldSettings(world: StoryWorldTemplate): ValidationResult {
    const requiredFields = [
      'timeframe.timeSetting',
      'timeframe.spaceSetting', 
      'worldRules.coreSettings',
      'environmentAtmosphere.typicalScenes'
    ];
    
    const missingFields = requiredFields.filter(field => 
      !this.getNestedValue(world, field)
    );
    
    const qualityScore = this.calculateQualityScore(world);
    const completeness = (requiredFields.length - missingFields.length) / requiredFields.length;
    
    return {
      completeness,
      missingFields: missingFields.map(this.getFieldDisplayName),
      qualityScore,
      recommendations: this.generateRecommendations(world, missingFields)
    };
  }
  
  validateThemeSettings(theme: StoryThemeTemplate): ValidationResult {
    // 主题设定验证逻辑
    return this.performValidation(theme, this.getThemeRequiredFields());
  }
  
  validateCharacterSettings(character: StoryCharacterTemplate): ValidationResult {
    // 角色设定验证逻辑
    return this.performValidation(character, this.getCharacterRequiredFields());
  }
  
  validateLogicalConsistency(settings: WorldSettings): ConsistencyResult {
    const issues = [];
    
    // 检查时间设定与角色年龄的一致性
    if (this.hasTimeConsistencyIssue(settings.world, settings.character)) {
      issues.push({
        type: 'time_inconsistency',
        message: '故事时间设定与主角年龄不匹配',
        suggestion: '请调整主角年龄或故事时间背景'
      });
    }
    
    // 检查主题与世界观的匹配度
    if (this.hasThemeWorldMismatch(settings.theme, settings.world)) {
      issues.push({
        type: 'theme_world_mismatch', 
        message: '故事主题与世界观设定存在冲突',
        suggestion: '请确保主题内核与世界规则相互支撑'
      });
    }
    
    return {
      isConsistent: issues.length === 0,
      issues,
      overallScore: this.calculateConsistencyScore(issues)
    };
  }
}
```

**前端验证结果展示**：
```typescript
// 完整性检查结果展示组件
const ValidationResultsPanel: React.FC = () => {
  const [validationResults, setValidationResults] = useState<CompletenessValidation>();
  
  return (
    <div className="validation-results">
      <OverallScoreCard score={validationResults.overallScore} />
      
      <div className="dimension-scores">
        <DimensionScoreCard 
          title="故事世界"
          result={validationResults.worldSettings}
          onImprove={() => navigateToWorldEditor()}
        />
        <DimensionScoreCard 
          title="故事主题"  
          result={validationResults.themeSettings}
          onImprove={() => navigateToThemeEditor()}
        />
        <DimensionScoreCard 
          title="故事角色"
          result={validationResults.characterSettings}
          onImprove={() => navigateToCharacterEditor()}
        />
      </div>
      
      <RecommendationsList 
        recommendations={validationResults.recommendations}
        onApplyRecommendation={handleApplyRecommendation}
      />
    </div>
  );
};
```

### 5. 文件同步和版本管理

**双向同步机制**：
```typescript
// 文件同步服务
class TemplateSyncService {
  async syncTemplateToFile(templateData: WorldSettings): Promise<SyncResult> {
    const files = [
      { path: '0-小说设定/故事世界.md', data: templateData.world },
      { path: '0-小说设定/故事主题.md', data: templateData.theme },
      { path: '0-小说设定/故事角色.md', data: templateData.character }
    ];
    
    const results = await Promise.all(
      files.map(file => this.saveTemplateFile(file.path, file.data))
    );
    
    return {
      success: results.every(r => r.success),
      files: results,
      timestamp: new Date().toISOString()
    };
  }
  
  async syncFileToTemplate(filePath: string): Promise<TemplateData> {
    const markdown = await this.readFileContent(filePath);
    const templateType = this.detectTemplateType(filePath);
    
    return this.templateEngine.parseMarkdown(markdown, templateType);
  }
  
  // 文件监听和自动同步
  setupFileWatcher(projectPath: string): void {
    const watcher = chokidar.watch(`${projectPath}/0-小说设定/*.md`);
    
    watcher.on('change', async (filePath) => {
      const templateData = await this.syncFileToTemplate(filePath);
      this.eventBus.emit('template-updated', { filePath, data: templateData });
    });
  }
}
```

## 集成测试和验证

### 端到端集成测试
- [ ] 5步引导流程生成的数据可以正确渲染到三维度模板
- [ ] 模板编辑的修改可以实时同步到本地文件
- [ ] 文件修改可以正确反映到模板编辑器中
- [ ] 完整性检查结果准确且建议有用

### 用户体验测试  
- [ ] 模板编辑器界面直观易用
- [ ] 表单验证反馈及时且友好
- [ ] 预览功能实时更新且格式正确
- [ ] 错误处理不影响用户操作流程

### 性能和稳定性测试
- [ ] 大量数据下模板渲染性能稳定
- [ ] 文件同步不阻塞用户界面操作
- [ ] 并发编辑下数据一致性保证
- [ ] 异常情况下数据不丢失

---

**注意**: 本任务与Story 8.2并行实现，需要确保模板系统与5步引导流程的完美集成，最终通过端到端测试验证整个架构师创作流程的完整性。