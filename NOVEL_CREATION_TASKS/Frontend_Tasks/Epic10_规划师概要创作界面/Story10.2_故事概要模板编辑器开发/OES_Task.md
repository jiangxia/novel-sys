# Story 10.2: 故事概要模板编辑器开发

## O (Objective)

### 功能目标
- 开发基于4要素大纲的故事概要模板编辑器
- 实现结构化概要编辑和智能内容填充功能
- 建立概要模板的版本管理和复用机制

### 技术目标  
- 基于React + TypeScript构建模块化编辑器组件
- 实现富文本编辑和结构化数据管理
- 集成模板预设和自定义模板功能

## E (Environment)

### 技术环境
- React 18 + TypeScript + TailwindCSS
- 富文本编辑器（TinyMCE/Quill）
- Zustand状态管理
- 模板引擎和数据绑定系统

### 依赖环境
- Epic 9：规划师大纲数据作为概要创作基础
- Story 10.1：6步逻辑骨架数据作为模板填充内容
- 概要模板的设计规范已确定
- 4要素大纲结构已定义

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 概要模板编辑器UI界面完整展示
- ✅ 支持基于4要素大纲的结构化编辑
- ✅ 实现模板的创建、编辑、保存功能
- ✅ 与6步逻辑骨架数据的无缝集成

### 优秀标准 (Should Have)  
- ✅ 智能内容提示和自动填充功能
- ✅ 模板预设库和个性化定制功能
- ✅ 实时预览和格式化输出功能
- ✅ 支持模板版本管理和历史回退

### 卓越标准 (Nice to Have)
- ✅ 协作编辑和评论批注功能
- ✅ 模板分享和社区功能
- ✅ AI辅助写作和创意建议
- ✅ 多种输出格式支持（Word/PDF等）

## 具体任务分解

### Task 10.2.1: 概要模板编辑器主界面

```typescript
// 故事概要模板编辑器主组件
const SummaryTemplateEditor: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState<SummaryTemplate>();
  const [editMode, setEditMode] = useState<'template' | 'content'>('content');
  const [outlineData] = useOutlineData(); // 来自Epic 9
  const [logicFramework] = useLogicFramework(); // 来自Story 10.1
  
  return (
    <div className="summary-template-editor">
      <EditorHeader 
        title="故事概要编辑器" 
        subtitle="基于4要素大纲的专业概要创作"
      />
      
      <EditorToolbar>
        <TemplateSwitcher 
          templates={availableTemplates}
          activeTemplate={activeTemplate}
          onSwitch={setActiveTemplate}
        />
        
        <EditModeToggle 
          mode={editMode}
          onChange={setEditMode}
        />
        
        <EditorActions 
          onSave={handleSave}
          onPreview={handlePreview}
          onExport={handleExport}
        />
      </EditorToolbar>
      
      <div className="editor-layout">
        <StructureSidebar>
          <OutlineContext data={outlineData} />
          <LogicFrameworkSummary data={logicFramework} />
          <TemplateStructure template={activeTemplate} />
        </StructureSidebar>
        
        <MainEditingArea>
          {editMode === 'template' ? (
            <TemplateStructureEditor 
              template={activeTemplate}
              onStructureChange={handleTemplateChange}
            />
          ) : (
            <ContentEditor 
              template={activeTemplate}
              outlineData={outlineData}
              logicData={logicFramework}
              onContentChange={handleContentChange}
            />
          )}
        </MainEditingArea>
        
        <PreviewPanel>
          <SummaryPreview 
            template={activeTemplate}
            content={currentContent}
          />
        </PreviewPanel>
      </div>
    </div>
  );
};
```

### Task 10.2.2: 4要素大纲结构化编辑器

```typescript
// 4要素大纲结构化编辑组件
const FourElementsEditor: React.FC = () => {
  const [elementsData, setElementsData] = useState<FourElementsData>({});
  
  const elements = [
    { 
      id: 'characters', 
      title: '人物要素', 
      description: '主要角色的设定、性格、关系网络'
    },
    { 
      id: 'environment', 
      title: '环境要素', 
      description: '故事发生的时空背景、社会环境'
    },
    { 
      id: 'events', 
      title: '事件要素', 
      description: '核心情节线、关键转折点'
    },
    { 
      id: 'theme', 
      title: '主题要素', 
      description: '故事要传达的核心价值和意义'
    }
  ];
  
  return (
    <div className="four-elements-editor">
      <ElementsOverview elements={elements} data={elementsData} />
      
      <ElementsGrid>
        {elements.map(element => (
          <ElementEditor
            key={element.id}
            element={element}
            data={elementsData[element.id]}
            onChange={(data) => updateElementData(element.id, data)}
            outlineContext={useOutlineData()}
            logicContext={useLogicFramework()}
          />
        ))}
      </ElementsGrid>
      
      <ElementsIntegration 
        elementsData={elementsData}
        onGenerateIntegration={handleGenerateIntegration}
      />
    </div>
  );
};

// 单个要素编辑器
const ElementEditor: React.FC<ElementEditorProps> = ({
  element, data, onChange, outlineContext, logicContext
}) => (
  <div className="element-editor-card">
    <ElementHeader element={element} />
    
    <ContextReferences>
      <OutlineReference data={outlineContext} element={element.id} />
      <LogicReference data={logicContext} element={element.id} />
    </ContextReferences>
    
    <ElementContent>
      <RichTextEditor
        value={data?.content || ''}
        onChange={(content) => onChange({ ...data, content })}
        placeholder={`详细描述${element.title}...`}
        toolbar={getElementToolbar(element.id)}
      />
      
      <ElementTags>
        <TagInput 
          tags={data?.tags || []}
          onChange={(tags) => onChange({ ...data, tags })}
          suggestions={getElementSuggestions(element.id)}
        />
      </ElementTags>
    </ElementContent>
    
    <ElementActions>
      <Button onClick={() => generateElementSuggestions(element.id)}>
        AI建议
      </Button>
      <Button onClick={() => validateElement(element.id)}>
        一致性检查
      </Button>
    </ElementActions>
  </div>
);
```

### Task 10.2.3: 智能模板系统

```typescript
// 智能模板管理系统
const TemplateManagementSystem: React.FC = () => {
  const [templates, setTemplates] = useState<SummaryTemplate[]>([]);
  const [customTemplate, setCustomTemplate] = useState<CustomTemplate>();
  
  const defaultTemplates = [
    {
      id: 'classic-novel',
      name: '经典小说模板',
      structure: {
        opening: '开篇设定',
        development: '情节发展', 
        climax: '高潮转折',
        resolution: '结局收束'
      }
    },
    {
      id: 'modern-story',
      name: '现代故事模板',
      structure: {
        background: '背景介绍',
        conflict: '矛盾展开',
        resolution: '问题解决',
        meaning: '价值升华'
      }
    }
  ];
  
  return (
    <div className="template-management">
      <TemplateLibrary>
        <DefaultTemplates 
          templates={defaultTemplates}
          onSelect={handleSelectTemplate}
        />
        <CustomTemplates 
          templates={templates}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
        />
      </TemplateLibrary>
      
      <TemplateBuilder>
        <TemplateStructureDesigner 
          template={customTemplate}
          onChange={setCustomTemplate}
        />
        <TemplatePreview 
          template={customTemplate}
          sampleData={getSampleData()}
        />
      </TemplateBuilder>
      
      <TemplateActions>
        <Button onClick={handleSaveTemplate}>
          保存模板
        </Button>
        <Button onClick={handleShareTemplate}>
          分享模板
        </Button>
        <Button onClick={handleExportTemplate}>
          导出模板
        </Button>
      </TemplateActions>
    </div>
  );
};

// 模板结构设计器
const TemplateStructureDesigner: React.FC = ({ template, onChange }) => {
  const [draggedSection, setDraggedSection] = useState<string>();
  
  return (
    <div className="template-structure-designer">
      <SectionLibrary>
        <h3>可用章节</h3>
        {availableSections.map(section => (
          <SectionItem
            key={section.id}
            section={section}
            draggable
            onDragStart={() => setDraggedSection(section.id)}
          />
        ))}
      </SectionLibrary>
      
      <TemplateCanvas
        onDrop={handleDropSection}
        onDragOver={(e) => e.preventDefault()}
      >
        <h3>模板结构</h3>
        {template?.sections?.map((section, index) => (
          <TemplateSectionEditor
            key={`${section.id}-${index}`}
            section={section}
            index={index}
            onChange={(updatedSection) => 
              handleSectionChange(index, updatedSection)
            }
            onRemove={() => handleRemoveSection(index)}
          />
        ))}
      </TemplateCanvas>
    </div>
  );
};
```

## 状态管理和数据流

```typescript
// 概要模板编辑器状态管理
interface TemplateEditorStore {
  activeTemplate?: SummaryTemplate;
  currentContent: SummaryContent;
  elementsData: FourElementsData;
  editHistory: EditHistory[];
  
  setActiveTemplate: (template: SummaryTemplate) => void;
  updateContent: (content: SummaryContent) => void;
  updateElements: (elements: FourElementsData) => void;
  saveVersion: () => void;
  undo: () => void;
  redo: () => void;
}

const useTemplateEditorStore = create<TemplateEditorStore>((set, get) => ({
  currentContent: {},
  elementsData: {},
  editHistory: [],
  
  setActiveTemplate: (template) => set({ activeTemplate: template }),
  
  updateContent: (content) => {
    const { editHistory } = get();
    set({ 
      currentContent: content,
      editHistory: [...editHistory, { content, timestamp: Date.now() }]
    });
  },
  
  updateElements: (elements) => set({ elementsData: elements }),
  
  saveVersion: () => {
    const { currentContent, activeTemplate } = get();
    // 保存当前版本逻辑
  },
  
  undo: () => {
    const { editHistory } = get();
    if (editHistory.length > 1) {
      const previousVersion = editHistory[editHistory.length - 2];
      set({ 
        currentContent: previousVersion.content,
        editHistory: editHistory.slice(0, -1)
      });
    }
  },
  
  redo: () => {
    // 重做逻辑
  }
}));
```

---

**注意**: 此模板编辑器任务专注于结构化概要编辑，需要与Story 10.1的逻辑骨架数据和Epic 9的大纲数据紧密集成。