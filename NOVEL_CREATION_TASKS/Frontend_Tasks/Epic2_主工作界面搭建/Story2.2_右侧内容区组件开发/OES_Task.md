# Story 2.2: 右侧内容区组件开发

## O (Objective)
### 功能目标
- 实现右侧内容区(自适应宽度)的完整布局
- 开发顶层Tab栏系统，支持文件Tab管理
- 构建内层Tab栏，显示智能依赖链条
- 集成Markdown富文本编辑器和预览功能

### 技术目标  
- 建立可扩展的多层Tab系统架构
- 实现高性能的Markdown编辑和实时预览
- 确保大文档编辑的流畅性和稳定性

## E (Environment)
### 技术环境
- React 19 + TypeScript + TailwindCSS
- @radix-ui/react-tabs + 拖拽库(dnd-kit)
- Markdown编辑器(Monaco Editor或CodeMirror)
- 右侧自适应宽度，最小宽度600px

### 依赖环境
- 左侧交互区的状态同步
- Fullstack Story2.1的协作规范
- 文件系统API的基础接口

## S (Success Criteria)

### 及格标准
- 右侧内容区布局正确，自适应宽度变化
- 顶层Tab支持最多8个，可关闭和拖拽
- 内层Tab正确显示依赖链条
- Markdown编辑器基础功能正常

### 优秀标准
- Tab操作流畅，拖拽体验优秀
- Markdown编辑器性能优秀，支持大文档
- 实时预览功能稳定，同步准确
- 字数统计和自动保存状态准确显示

## 具体任务分解

### Task 2.2.1: 右侧内容区布局框架
**预估时间**: 1小时
**具体内容**:
- 建立右侧内容区的响应式布局容器
- 实现自适应宽度和最小宽度限制
- 添加与左侧交互区的协调机制

**布局框架**:
```tsx
// components/layout/RightContentArea.tsx
export interface RightContentAreaProps {
  className?: string
  minWidth?: number
}

export const RightContentArea: React.FC<RightContentAreaProps> = ({
  className,
  minWidth = 600
}) => {
  return (
    <div 
      className={cn(
        "flex-1 h-full bg-background flex flex-col",
        `min-w-[${minWidth}px]`,
        className
      )}
    >
      {/* 顶层Tab栏 */}
      <TopLevelTabBar />
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        <TabContentArea />
      </div>
    </div>
  )
}
```

### Task 2.2.2: 顶层Tab栏系统
**预估时间**: 3小时
**具体内容**:
- 开发可拖拽的Tab栏组件
- 实现Tab的增加、删除、重排序功能
- 添加Tab溢出处理和滚动机制

**顶层Tab系统**:
```tsx
// components/tabs/TopLevelTabBar.tsx
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'

interface TabItem {
  id: string
  title: string
  type: 'setting' | 'outline' | 'summary' | 'content'
  filePath: string
  isDirty: boolean
}

export const TopLevelTabBar: React.FC = () => {
  const [tabs, setTabs] = useState<TabItem[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)

  const addTab = (file: TabItem) => {
    // 检查是否已存在
    const existingTab = tabs.find(tab => tab.filePath === file.filePath)
    if (existingTab) {
      setActiveTabId(existingTab.id)
      return
    }

    // 检查数量限制
    if (tabs.length >= 8) {
      // 显示警告提示
      return
    }

    const newTab = { ...file, id: generateId() }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  const closeTab = (tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId)
      // 处理关闭当前激活Tab的情况
      if (activeTabId === tabId) {
        const closedIndex = prev.findIndex(tab => tab.id === tabId)
        const nextTab = newTabs[closedIndex] || newTabs[closedIndex - 1]
        setActiveTabId(nextTab?.id || null)
      }
      return newTabs
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setTabs(prev => {
        const oldIndex = prev.findIndex(tab => tab.id === active.id)
        const newIndex = prev.findIndex(tab => tab.id === over?.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="border-b border-border bg-muted/30 min-h-[48px] flex items-center">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tabs.map(t => t.id)} strategy={horizontalListSortingStrategy}>
          <ScrollArea className="flex-1">
            <div className="flex items-center min-w-fit px-2">
              {tabs.map((tab) => (
                <DraggableTab
                  key={tab.id}
                  tab={tab}
                  isActive={activeTabId === tab.id}
                  onSelect={() => setActiveTabId(tab.id)}
                  onClose={() => closeTab(tab.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </SortableContext>
      </DndContext>
      
      {/* Tab操作按钮 */}
      <div className="px-2 border-l border-border">
        <TabActions />
      </div>
    </div>
  )
}

// components/tabs/DraggableTab.tsx
interface DraggableTabProps {
  tab: TabItem
  isActive: boolean
  onSelect: () => void
  onClose: () => void
}

export const DraggableTab: React.FC<DraggableTabProps> = ({
  tab,
  isActive,
  onSelect,
  onClose
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: tab.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm border-r border-border cursor-pointer select-none",
        "hover:bg-accent min-w-0 max-w-48",
        isActive ? "bg-background" : "bg-transparent"
      )}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <FileTypeIcon type={tab.type} className="h-4 w-4 flex-shrink-0" />
      <span className="truncate flex-1">{tab.title}</span>
      {tab.isDirty && <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="w-4 h-4 flex items-center justify-center hover:bg-muted rounded flex-shrink-0"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
```

### Task 2.2.3: 内层Tab栏和依赖链条
**预估时间**: 2小时
**具体内容**:
- 开发内层Tab栏组件
- 实现智能依赖链条显示逻辑
- 添加依赖Tab的快速跳转功能

**内层Tab系统**:
```tsx
// components/tabs/InnerTabBar.tsx
interface DependencyChainItem {
  type: 'setting' | 'outline' | 'summary' | 'current'
  title: string
  filePath?: string
  isAvailable: boolean
  isCurrent: boolean
}

export const InnerTabBar: React.FC<{ currentFile: TabItem }> = ({ currentFile }) => {
  const dependencyChain = useMemo(() => {
    return generateDependencyChain(currentFile)
  }, [currentFile])

  const handleDependencyClick = (item: DependencyChainItem) => {
    if (!item.isAvailable || item.isCurrent) return
    
    // 打开依赖文件
    openFileInTopLevelTab(item.filePath!)
  }

  return (
    <div className="border-b border-border bg-background/50 min-h-[40px] flex items-center px-4">
      <div className="flex items-center gap-1 text-sm">
        {dependencyChain.map((item, index) => (
          <Fragment key={`${item.type}-${index}`}>
            <button
              onClick={() => handleDependencyClick(item)}
              disabled={!item.isAvailable}
              className={cn(
                "px-2 py-1 rounded transition-colors",
                item.isCurrent 
                  ? "bg-primary text-primary-foreground font-medium"
                  : item.isAvailable
                    ? "hover:bg-accent text-foreground cursor-pointer"
                    : "text-muted-foreground cursor-not-allowed"
              )}
            >
              {item.title}
            </button>
            {index < dependencyChain.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

// utils/dependencyChain.ts
export const generateDependencyChain = (currentFile: TabItem): DependencyChainItem[] => {
  const chain: DependencyChainItem[] = []
  
  // 始终包含设定
  chain.push({
    type: 'setting',
    title: '设定',
    filePath: '/0-小说设定/故事世界.md',
    isAvailable: checkFileExists('/0-小说设定/故事世界.md'),
    isCurrent: currentFile.type === 'setting'
  })

  // 根据当前文件类型添加依赖
  if (currentFile.type === 'summary' || currentFile.type === 'content') {
    const outlinePath = getCorrespondingOutlinePath(currentFile.filePath)
    chain.push({
      type: 'outline',
      title: '大纲',
      filePath: outlinePath,
      isAvailable: checkFileExists(outlinePath),
      isCurrent: currentFile.type === 'outline'
    })
  }

  if (currentFile.type === 'content') {
    const summaryPath = getCorrespondingSummaryPath(currentFile.filePath)
    chain.push({
      type: 'summary',
      title: '概要',
      filePath: summaryPath,
      isAvailable: checkFileExists(summaryPath),
      isCurrent: currentFile.type === 'summary'
    })
  }

  // 添加当前文件
  chain.push({
    type: 'current',
    title: '当前',
    isAvailable: true,
    isCurrent: true
  })

  return chain
}
```

### Task 2.2.4: Markdown编辑器集成
**预估时间**: 2小时
**具体内容**:
- 集成Markdown编辑器组件
- 实现实时预览和分屏显示
- 添加字数统计和自动保存指示

**编辑器组件**:
```tsx
// components/editor/MarkdownEditor.tsx
import { Editor } from '@monaco-editor/react'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  readOnly?: boolean
  placeholder?: string
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  readOnly = false,
  placeholder = '开始写作...'
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSplitMode, setIsSplitMode] = useState(false)

  return (
    <div className="h-full flex flex-col">
      {/* 编辑器工具栏 */}
      <EditorToolbar
        isPreviewMode={isPreviewMode}
        isSplitMode={isSplitMode}
        onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
        onSplitToggle={() => setIsSplitMode(!isSplitMode)}
      />

      {/* 编辑器内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 编辑器面板 */}
        {(!isPreviewMode || isSplitMode) && (
          <div className={cn("flex-1 border-r border-border", isSplitMode && "w-1/2")}>
            <Editor
              height="100%"
              defaultLanguage="markdown"
              value={content}
              onChange={(value) => onChange(value || '')}
              options={{
                readOnly,
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                fontSize: 14,
                lineHeight: 1.6,
                padding: { top: 16, bottom: 16 }
              }}
            />
          </div>
        )}

        {/* 预览面板 */}
        {(isPreviewMode || isSplitMode) && (
          <div className={cn("flex-1 overflow-auto", isSplitMode && "w-1/2")}>
            <MarkdownPreview content={content} />
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <EditorStatusBar content={content} />
    </div>
  )
}

// components/editor/EditorStatusBar.tsx
interface EditorStatusBarProps {
  content: string
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({ content }) => {
  const stats = useMemo(() => {
    const characters = content.length
    const charactersNoSpaces = content.replace(/\s/g, '').length
    const words = content.trim().split(/\s+/).length
    const lines = content.split('\n').length
    
    return { characters, charactersNoSpaces, words, lines }
  }, [content])

  return (
    <div className="h-6 px-4 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>字符: {stats.characters}</span>
        <span>字符(无空格): {stats.charactersNoSpaces}</span>
        <span>单词: {stats.words}</span>
        <span>行数: {stats.lines}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <AutoSaveIndicator />
        <span>Markdown</span>
      </div>
    </div>
  )
}
```

## 验收标准
1. 右侧内容区布局完整，自适应宽度正常
2. 顶层Tab支持最多8个，拖拽和关闭功能正常
3. 内层Tab正确显示依赖链条，快速跳转可用
4. Markdown编辑器功能完整，预览和分屏正常
5. 字数统计准确，自动保存状态清晰显示
6. 大文档编辑性能良好，响应流畅

## 依赖关系
- 需要左侧交互区的状态同步
- 需要Fullstack Story2.1的协作规范
- 为文件操作功能提供界面基础