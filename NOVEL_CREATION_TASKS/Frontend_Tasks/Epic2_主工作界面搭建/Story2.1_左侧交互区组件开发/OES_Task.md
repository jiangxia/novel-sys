# Story 2.1: 左侧交互区组件开发

## O (Objective)
### 功能目标
- 实现左侧交互区(320px)的完整布局框架
- 开发[对话]|[项目]双Tab切换系统
- 构建AI角色对话区和项目导航区组件

### 技术目标  
- 建立可复用的Tab组件系统
- 实现流畅的Tab切换动画效果
- 确保组件状态管理清晰可维护

## E (Environment)
### 技术环境
- React 19 + TypeScript + TailwindCSS
- Zustand状态管理 + Radix UI组件库
- 左侧固定宽度320px，响应式适配

### 依赖环境
- Fullstack Story2.1的组件协作规范
- Epic 1的项目导入成功状态
- AI角色系统的基础接口（后续集成）

## S (Success Criteria)

### 及格标准
- 左侧交互区布局正确渲染，宽度固定320px
- [对话]|[项目]Tab切换功能正常
- 两个Tab内容区域可以正确展示和隐藏

### 优秀标准
- Tab切换动画流畅，用户体验优秀  
- 组件结构清晰，易于扩展和维护
- 适配不同屏幕尺寸，移动端友好

## 具体任务分解

### Task 2.1.1: 左侧交互区布局框架
**预估时间**: 1.5小时
**具体内容**:
- 建立左侧交互区的基础布局容器
- 实现固定宽度和响应式适配
- 添加基础的边界和分割线样式

**组件架构**:
```tsx
// components/layout/LeftSidebar.tsx
export interface LeftSidebarProps {
  className?: string
  defaultTab?: 'chat' | 'project'
  onTabChange?: (tab: 'chat' | 'project') => void
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  className,
  defaultTab = 'chat',
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'project'>(defaultTab)
  
  const handleTabChange = (tab: 'chat' | 'project') => {
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  return (
    <div className={cn(
      "w-80 h-full bg-background border-r border-border flex flex-col",
      className
    )}>
      <SidebarTabHeader 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <SidebarTabContent activeTab={activeTab} />
    </div>
  )
}
```

### Task 2.1.2: Tab切换系统实现
**预估时间**: 2小时
**具体内容**:
- 开发Tab头部切换组件
- 实现Tab内容区域的条件渲染
- 添加Tab切换的动画过渡效果

**Tab系统核心**:
```tsx
// components/layout/SidebarTabHeader.tsx
interface SidebarTabHeaderProps {
  activeTab: 'chat' | 'project'
  onTabChange: (tab: 'chat' | 'project') => void
}

export const SidebarTabHeader: React.FC<SidebarTabHeaderProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'chat', label: '对话', icon: MessageCircle },
    { id: 'project', label: '项目', icon: FolderOpen }
  ] as const

  return (
    <div className="flex border-b border-border bg-muted/30">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            activeTab === tab.id 
              ? "bg-background text-foreground border-b-2 border-primary" 
              : "text-muted-foreground"
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// components/layout/SidebarTabContent.tsx
interface SidebarTabContentProps {
  activeTab: 'chat' | 'project'
}

export const SidebarTabContent: React.FC<SidebarTabContentProps> = ({
  activeTab
}) => {
  return (
    <div className="flex-1 overflow-hidden">
      <AnimatePresence mode="wait">
        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <ChatTabContent />
          </motion.div>
        )}
        {activeTab === 'project' && (
          <motion.div
            key="project" 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <ProjectTabContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### Task 2.1.3: 对话Tab内容组件
**预估时间**: 2.5小时
**具体内容**:
- 开发AI角色对话区界面
- 实现消息滚动区域和输入框
- 添加4角色切换按钮组件

**对话组件结构**:
```tsx
// components/chat/ChatTabContent.tsx
export const ChatTabContent: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* 当前角色指示 */}
      <ChatRoleIndicator />
      
      {/* 消息滚动区域 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <ChatMessageList />
        </ScrollArea>
      </div>
      
      {/* 角色切换按钮 */}
      <ChatRoleSelector />
      
      {/* 消息输入区 */}
      <ChatInputArea />
    </div>
  )
}

// components/chat/ChatRoleSelector.tsx
export const ChatRoleSelector: React.FC = () => {
  const roles = [
    { id: 'director', name: '总监', icon: Crown },
    { id: 'architect', name: '架构师', icon: Building },
    { id: 'planner', name: '规划师', icon: Map },
    { id: 'writer', name: '写手', icon: PenTool }
  ] as const

  const [activeRole, setActiveRole] = useState('director')

  return (
    <div className="p-3 border-t border-border bg-muted/30">
      <div className="grid grid-cols-2 gap-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
              activeRole === role.id
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-accent"
            )}
          >
            <role.icon className="h-4 w-4" />
            {role.name}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Task 2.1.4: 项目Tab内容组件  
**预估时间**: 2小时
**具体内容**:
- 开发项目导航树组件
- 实现4类型导航(设定/大纲/概要/内容)
- 添加文件列表和依赖状态指示

**项目导航组件**:
```tsx
// components/project/ProjectTabContent.tsx
export const ProjectTabContent: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* 项目信息头部 */}
      <ProjectHeader />
      
      {/* 4类型导航 */}
      <ProjectTypeNavigation />
      
      {/* 文件列表区域 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <ProjectFileList />
        </ScrollArea>
      </div>
    </div>
  )
}

// components/project/ProjectTypeNavigation.tsx
export const ProjectTypeNavigation: React.FC = () => {
  const [activeType, setActiveType] = useState('setting')
  
  const types = [
    { id: 'setting', name: '设定', icon: Settings },
    { id: 'outline', name: '大纲', icon: List },
    { id: 'summary', name: '概要', icon: FileText },
    { id: 'content', name: '内容', icon: BookOpen }
  ] as const

  return (
    <div className="p-3 border-b border-border">
      <div className="grid grid-cols-2 gap-2">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
              activeType === type.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-accent"
            )}
          >
            <type.icon className="h-4 w-4" />
            {type.name}
          </button>
        ))}
      </div>
    </div>
  )
}
```

## 验收标准
1. 左侧交互区布局完整，宽度严格320px
2. [对话]|[项目]Tab切换流畅，动画效果自然
3. 对话Tab显示角色选择和消息区域
4. 项目Tab显示类型导航和文件列表
5. 组件结构清晰，TypeScript类型定义完整
6. 响应式适配良好，移动端体验友好

## 依赖关系
- 需要Fullstack Story2.1的协作规范指导
- 为右侧内容区提供状态同步支持
- 后续与AI角色系统和文件系统集成