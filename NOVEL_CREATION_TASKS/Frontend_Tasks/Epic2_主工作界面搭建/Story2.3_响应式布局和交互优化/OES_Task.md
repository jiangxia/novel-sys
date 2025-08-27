# Story 2.3: 响应式布局和交互优化

## O (Objective)
### 功能目标
- 实现主工作界面的完整响应式适配
- 优化移动端和平板设备的交互体验
- 建立统一的动画和过渡效果系统

### 技术目标  
- 确保在不同屏幕尺寸下的最佳用户体验
- 实现流畅的布局切换和组件动画
- 建立可维护的响应式设计系统

## E (Environment)
### 技术环境
- React 19 + TypeScript + TailwindCSS
- Framer Motion动画库 + 响应式断点系统
- 支持设备：桌面(>1024px)、平板(768-1024px)、手机(<768px)

### 依赖环境
- 左侧交互区和右侧内容区组件已完成
- TailwindCSS响应式工具类支持
- 触摸事件和手势识别库

## S (Success Criteria)

### 及格标准
- 桌面端(>1024px)布局正常，左右双栏显示
- 平板端(768-1024px)适配良好，可以正常使用
- 移动端(<768px)布局合理，核心功能可用

### 优秀标准
- 所有断点下的交互体验流畅自然
- 布局切换动画效果优秀
- 移动端操作便捷，符合移动交互规范

## 具体任务分解

### Task 2.3.1: 响应式断点系统设计
**预估时间**: 1.5小时
**具体内容**:
- 定义标准响应式断点和布局规则
- 建立组件级别的响应式适配机制
- 设计不同屏幕下的布局方案

**响应式系统**:
```tsx
// hooks/useResponsive.ts
export interface BreakpointConfig {
  sm: number  // 640px
  md: number  // 768px  
  lg: number  // 1024px
  xl: number  // 1280px
  '2xl': number // 1536px
}

export const breakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const current = useMemo(() => {
    const { width } = windowSize
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  }, [windowSize])

  return {
    ...windowSize,
    current,
    isDesktop: windowSize.width >= breakpoints.lg,
    isTablet: windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg,
    isMobile: windowSize.width < breakpoints.md,
    isMobileOrTablet: windowSize.width < breakpoints.lg
  }
}

// components/layout/ResponsiveLayout.tsx
export const ResponsiveLayout: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { current, isMobile, isTablet, isDesktop } = useResponsive()
  
  return (
    <div className={cn(
      "h-screen flex transition-all duration-300",
      {
        // 桌面端：左右双栏
        "": isDesktop,
        // 平板端：可切换单栏
        "flex-col": isTablet,
        // 移动端：单栏 + 底部导航
        "flex-col": isMobile
      }
    )}>
      {children}
    </div>
  )
}
```

### Task 2.3.2: 移动端布局适配
**预估时间**: 2.5小时
**具体内容**:
- 开发移动端专用的导航系统
- 实现左侧面板的抽屉式弹出
- 优化触摸操作和手势交互

**移动端适配**:
```tsx
// components/mobile/MobileLayout.tsx
export const MobileLayout: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [activeView, setActiveView] = useState<'editor' | 'chat' | 'project'>('editor')

  return (
    <div className="h-screen flex flex-col lg:hidden">
      {/* 移动端顶部导航 */}
      <MobileHeader 
        onMenuToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        activeView={activeView}
      />

      {/* 主内容区 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 编辑器视图 */}
        <AnimatePresence>
          {activeView === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <MobileEditorView />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 侧边抽屉 */}
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeView={activeView === 'chat' ? 'chat' : 'project'}
        />
      </div>

      {/* 底部导航 */}
      <MobileBottomNavigation
        activeView={activeView}
        onViewChange={setActiveView}
      />
    </div>
  )
}

// components/mobile/MobileDrawer.tsx
interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeView: 'chat' | 'project'
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeView
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black z-40"
          />
          
          {/* 抽屉内容 */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute left-0 top-0 bottom-0 w-80 bg-background border-r border-border z-50"
          >
            <div className="h-full flex flex-col">
              {/* 抽屉头部 */}
              <div className="h-12 border-b border-border flex items-center justify-between px-4">
                <h2 className="font-medium">
                  {activeView === 'chat' ? 'AI对话' : '项目文件'}
                </h2>
                <button onClick={onClose}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* 抽屉内容 */}
              <div className="flex-1 overflow-hidden">
                {activeView === 'chat' ? <ChatTabContent /> : <ProjectTabContent />}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

### Task 2.3.3: 平板端混合布局
**预估时间**: 2小时
**具体内容**:
- 开发平板端的可折叠侧边栏
- 实现横竖屏切换的布局适配
- 优化平板端的触摸和键盘操作

**平板端适配**:
```tsx
// components/tablet/TabletLayout.tsx
export const TabletLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }
    
    checkOrientation()
    window.addEventListener('orientationchange', checkOrientation)
    window.addEventListener('resize', checkOrientation)
    
    return () => {
      window.removeEventListener('orientationchange', checkOrientation)
      window.removeEventListener('resize', checkOrientation)
    }
  }, [])

  return (
    <div className="h-screen flex hidden md:flex lg:hidden">
      {/* 可折叠侧边栏 */}
      <motion.div
        animate={{ width: sidebarCollapsed ? 60 : 320 }}
        transition={{ duration: 0.3 }}
        className="bg-background border-r border-border flex flex-col"
      >
        {/* 侧边栏头部 */}
        <div className="h-12 border-b border-border flex items-center px-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded"
          >
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
          {!sidebarCollapsed && <span className="ml-2 font-medium">工作区</span>}
        </div>

        {/* 侧边栏内容 */}
        <div className="flex-1 overflow-hidden">
          {sidebarCollapsed ? (
            <CollapsedSidebar />
          ) : (
            <LeftSidebar defaultTab="project" />
          )}
        </div>
      </motion.div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {orientation === 'portrait' && (
          <TabletPortraitToolbar />
        )}
        <RightContentArea />
      </div>
    </div>
  )
}

// components/tablet/CollapsedSidebar.tsx
export const CollapsedSidebar: React.FC = () => {
  return (
    <div className="p-2 space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="w-full h-10 flex items-center justify-center hover:bg-accent rounded">
              <MessageCircle className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">对话</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="w-full h-10 flex items-center justify-center hover:bg-accent rounded">
              <FolderOpen className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">项目</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
```

### Task 2.3.4: 动画和过渡系统
**预估时间**: 2小时
**具体内容**:
- 建立统一的动画配置和时长标准
- 实现布局切换的流畅过渡动画
- 添加加载状态和反馈动画

**动画系统**:
```tsx
// utils/animations.ts
export const animations = {
  // 基础动画配置
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5
  },
  
  // 缓动函数
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },

  // 预设动画
  presets: {
    slideInLeft: {
      initial: { x: '-100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-100%', opacity: 0 }
    },
    slideInRight: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 0 }
    },
    fadeInUp: {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 }
    },
    scaleIn: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 }
    }
  }
}

// components/common/AnimatedWrapper.tsx
interface AnimatedWrapperProps {
  children: React.ReactNode
  animation?: keyof typeof animations.presets
  duration?: keyof typeof animations.duration
  delay?: number
  className?: string
}

export const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animation = 'fadeInUp',
  duration = 'normal',
  delay = 0,
  className
}) => {
  const preset = animations.presets[animation]
  
  return (
    <motion.div
      initial={preset.initial}
      animate={preset.animate}
      exit={preset.exit}
      transition={{
        duration: animations.duration[duration],
        delay,
        ease: animations.easing.easeOut
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// hooks/useLayoutTransition.ts
export const useLayoutTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const triggerTransition = useCallback(async (callback: () => void) => {
    setIsTransitioning(true)
    
    // 等待一帧以触发动画
    await new Promise(resolve => requestAnimationFrame(resolve))
    
    callback()
    
    // 等待动画完成
    setTimeout(() => {
      setIsTransitioning(false)
    }, animations.duration.normal * 1000)
  }, [])

  return {
    isTransitioning,
    triggerTransition
  }
}
```

## 验收标准
1. 桌面端(>1024px)：左右双栏布局完美显示
2. 平板端(768-1024px)：可折叠侧边栏，横竖屏适配良好
3. 移动端(<768px)：抽屉导航，底部Tab，触摸体验优秀
4. 所有断点切换流畅，无布局错乱
5. 动画过渡自然，性能表现良好
6. 触摸操作响应准确，手势识别正常

## 依赖关系
- 依赖左侧交互区和右侧内容区组件
- 需要Fullstack Story2.1的状态管理支持
- 为后续功能提供完善的界面基础