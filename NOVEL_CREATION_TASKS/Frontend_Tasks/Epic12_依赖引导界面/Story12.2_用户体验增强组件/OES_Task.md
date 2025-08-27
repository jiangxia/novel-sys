# Story 12.2: 用户体验增强组件

## O (Objective)

### 功能目标
- 实现智能创作引导流程组件
- 开发用户操作体验优化功能
- 构建界面响应性能提升机制

### 技术目标  
- 用户操作响应时间<50ms
- 界面动画流畅度60FPS
- 组件加载时间<200ms

## E (Environment)

### 技术环境
- React 18 + TypeScript
- Framer Motion (动画库)
- React Hook Form (表单处理)
- TailwindCSS + 自定义CSS动画

### 依赖环境
- 依赖提示UI组件
- 项目文件导航系统
- AI角色切换机制
- 文件编辑器状态管理

### 设计环境
- 微信聊天界面交互模式
- 渐进式引导设计原则
- 极简主义视觉风格
- 移动端优先设计思路

## S (Success Criteria)

### 及格标准 (Must Have)
- **智能引导完整**：新用户能通过引导快速上手创作流程
- **操作反馈及时**：所有用户操作都有即时视觉反馈
- **性能表现稳定**：界面响应流畅，无明显卡顿

### 优秀标准 (Should Have)  
- **个性化体验**：基于用户习惯调整界面行为
- **预测性交互**：预测用户需求并提供快捷操作
- **情感化设计**：通过微交互提升用户满意度

### 卓越标准 (Nice to Have)
- **自适应学习**：系统学习用户偏好并自动优化体验
- **沉浸式创作**：减少认知负担，让用户专注创作本身
- **社交化元素**：适当的成就感和进度激励

## 具体任务分解

### Task 12.2.1: 智能创作引导系统

**新手引导流程**：
```typescript
// components/guide/OnboardingGuide.tsx
interface OnboardingGuideProps {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  currentStep?: number;
  onComplete: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  userLevel,
  currentStep = 0,
  onComplete
}) => {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  
  const guideSteps = useMemo(() => 
    generateGuideSteps(userLevel), 
    [userLevel]
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="onboarding-guide"
      >
        <GuideStep
          step={guideSteps[activeStep]}
          stepNumber={activeStep + 1}
          totalSteps={guideSteps.length}
          userProgress={userProgress}
          onNext={() => handleStepNext()}
          onPrevious={() => handleStepPrevious()}
          onSkip={() => handleSkipGuide()}
          onComplete={onComplete}
        />
      </motion.div>
    </AnimatePresence>
  );
};

// 引导步骤组件
const GuideStep: React.FC<GuideStepProps> = ({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onPrevious,
  onSkip
}) => {
  const [completed, setCompleted] = useState(false);
  
  // 检测用户是否完成了当前步骤的任务
  useEffect(() => {
    if (step.autoDetectCompletion) {
      const checkCompletion = () => {
        const isCompleted = step.completionChecker();
        setCompleted(isCompleted);
      };
      
      const interval = setInterval(checkCompletion, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="guide-step">
      {/* 步骤头部 */}
      <div className="guide-header">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{step.title}</h2>
          <span className="text-sm text-gray-500">
            {stepNumber} / {totalSteps}
          </span>
        </div>
        
        <ProgressBar 
          current={stepNumber} 
          total={totalSteps}
          className="mt-2"
        />
      </div>
      
      {/* 步骤内容 */}
      <div className="guide-content mt-6">
        <p className="text-gray-700 mb-4">{step.description}</p>
        
        {/* 交互式演示 */}
        {step.interactive && (
          <InteractiveDemo 
            type={step.interactiveType}
            config={step.interactiveConfig}
            onInteraction={(data) => handleInteraction(data)}
          />
        )}
        
        {/* 操作提示 */}
        {step.actionHints && (
          <div className="action-hints mt-4">
            {step.actionHints.map((hint, index) => (
              <ActionHint key={index} hint={hint} />
            ))}
          </div>
        )}
      </div>
      
      {/* 步骤控制 */}
      <div className="guide-controls mt-8 flex justify-between">
        <div className="flex space-x-2">
          {stepNumber > 1 && (
            <Button variant="secondary" onClick={onPrevious}>
              上一步
            </Button>
          )}
          
          <Button variant="ghost" onClick={onSkip}>
            跳过引导
          </Button>
        </div>
        
        <Button 
          onClick={onNext}
          disabled={step.requiresCompletion && !completed}
        >
          {completed ? '继续' : step.nextButtonText || '下一步'}
        </Button>
      </div>
    </div>
  );
};

// 生成个性化引导步骤
function generateGuideSteps(userLevel: UserLevel): GuideStep[] {
  const baseSteps = [
    {
      id: 'welcome',
      title: '欢迎来到小说创作工具',
      description: '这个工具会帮助你通过AI协作创作优质小说',
      interactive: false
    },
    {
      id: 'project_setup',
      title: '创建你的第一个项目',
      description: '首先我们需要导入一个项目目录',
      interactive: true,
      interactiveType: 'project_import',
      requiresCompletion: true,
      completionChecker: () => checkProjectImported()
    }
  ];
  
  // 根据用户水平调整步骤
  if (userLevel === 'beginner') {
    baseSteps.push(
      {
        id: 'understand_structure',
        title: '理解项目结构',
        description: '让我们了解小说创作的四个阶段：设定、大纲、概要、内容',
        interactive: true,
        interactiveType: 'structure_exploration'
      },
      {
        id: 'ai_roles_intro',
        title: '认识AI角色助手',
        description: '四个专业角色会在不同阶段协助你：架构师、规划师、写手、总监',
        interactive: true,
        interactiveType: 'role_introduction'
      }
    );
  }
  
  return baseSteps;
}
```

**上下文感知帮助系统**：
```typescript
// components/guide/ContextualHelp.tsx
interface ContextualHelpProps {
  context: {
    currentPage: string;
    currentAction: string;
    userStuck: boolean;
    timeOnPage: number;
  };
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({ context }) => {
  const [helpCards, setHelpCards] = useState<HelpCard[]>([]);
  const [showFloatingHelper, setShowFloatingHelper] = useState(false);
  
  // 基于上下文生成帮助内容
  useEffect(() => {
    const cards = generateContextualHelp(context);
    setHelpCards(cards);
    
    // 用户在页面停留过久且无操作，显示浮动助手
    if (context.timeOnPage > 30000 && context.userStuck) {
      setShowFloatingHelper(true);
    }
  }, [context]);

  return (
    <>
      {/* 上下文帮助卡片 */}
      <div className="contextual-help">
        <AnimatePresence>
          {helpCards.map(card => (
            <HelpCard
              key={card.id}
              card={card}
              onDismiss={() => dismissHelpCard(card.id)}
              onAction={(action) => handleHelpAction(card.id, action)}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* 浮动助手 */}
      <AnimatePresence>
        {showFloatingHelper && (
          <FloatingHelper
            context={context}
            onClose={() => setShowFloatingHelper(false)}
            onGetHelp={() => triggerDetailedHelp()}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const FloatingHelper: React.FC<FloatingHelperProps> = ({ 
  context, 
  onClose, 
  onGetHelp 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="floating-helper fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">需要帮助吗？</h4>
          <p className="text-sm text-gray-600 mt-1">
            我注意到你在这个页面停留了一段时间，需要一些指导吗？
          </p>
          
          <div className="flex space-x-2 mt-3">
            <Button size="sm" onClick={onGetHelp}>
              获取帮助
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              不用了
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
```

### Task 12.2.2: 操作反馈和微交互

**统一反馈系统**：
```typescript
// components/feedback/FeedbackSystem.tsx
interface FeedbackSystemProps {
  children: React.ReactNode;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(new Map());
  
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [...prev, { ...notification, id: Date.now().toString() }]);
    
    // 自动移除通知
    setTimeout(() => {
      removeNotification(notification.id);
    }, notification.duration || 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <FeedbackContext.Provider value={{
      addNotification,
      removeNotification,
      setLoading: (key: string, loading: boolean) => {
        setLoadingStates(prev => new Map(prev.set(key, loading)));
      },
      isLoading: (key: string) => loadingStates.get(key) || false
    }}>
      {children}
      
      {/* 通知容器 */}
      <NotificationContainer 
        notifications={notifications}
        onDismiss={removeNotification}
      />
      
      {/* 全局加载指示器 */}
      <GlobalLoadingIndicator states={loadingStates} />
    </FeedbackContext.Provider>
  );
};

// 通知组件
const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onDismiss
}) => {
  return (
    <div className="notification-container fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onDismiss={() => onDismiss(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onDismiss
}) => {
  const getNotificationStyle = (type: string) => {
    const styles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    return styles[type] || styles.info;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`notification-card border rounded-lg p-4 max-w-sm ${getNotificationStyle(notification.type)}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{notification.title}</h4>
          {notification.message && (
            <p className="text-sm mt-1 opacity-90">{notification.message}</p>
          )}
        </div>
        
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
```

**按钮和交互增强**：
```typescript
// components/ui/EnhancedButton.tsx
interface EnhancedButtonProps extends ButtonProps {
  hapticFeedback?: boolean;
  successState?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  hapticFeedback = true,
  successState = false,
  loadingText = '处理中...',
  successText = '完成',
  errorText = '失败',
  loading,
  disabled,
  onClick,
  ...props
}) => {
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [rippleEffects, setRippleEffects] = useState<RippleEffect[]>([]);
  
  const handleClick = async (event: React.MouseEvent) => {
    if (disabled || loading) return;
    
    // 触觉反馈
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // 涟漪效果
    addRippleEffect(event);
    
    // 执行点击处理
    if (onClick) {
      try {
        setButtonState('loading');
        await onClick(event);
        setButtonState('success');
        
        // 成功状态持续一段时间后重置
        setTimeout(() => setButtonState('idle'), 2000);
      } catch (error) {
        setButtonState('error');
        setTimeout(() => setButtonState('idle'), 3000);
      }
    }
  };

  const addRippleEffect = (event: React.MouseEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ripple: RippleEffect = {
      id: Date.now(),
      x,
      y,
      size: Math.max(rect.width, rect.height) * 2
    };
    
    setRippleEffects(prev => [...prev, ripple]);
    
    // 移除涟漪效果
    setTimeout(() => {
      setRippleEffects(prev => prev.filter(r => r.id !== ripple.id));
    }, 600);
  };

  const getButtonContent = () => {
    switch (buttonState) {
      case 'loading': return (
        <span className="flex items-center">
          <Spinner className="w-4 h-4 mr-2" />
          {loadingText}
        </span>
      );
      case 'success': return (
        <span className="flex items-center">
          <CheckIcon className="w-4 h-4 mr-2" />
          {successText}
        </span>
      );
      case 'error': return (
        <span className="flex items-center">
          <XMarkIcon className="w-4 h-4 mr-2" />
          {errorText}
        </span>
      );
      default: return children;
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      className={`enhanced-button relative overflow-hidden ${props.className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* 涟漪效果 */}
      {rippleEffects.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white bg-opacity-30 animate-ping pointer-events-none"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            animationDuration: '0.6s'
          }}
        />
      ))}
      
      {/* 按钮内容 */}
      <span className="relative z-10">
        {getButtonContent()}
      </span>
    </motion.button>
  );
};
```

### Task 12.2.3: 个性化用户体验

**用户偏好学习系统**：
```typescript
// hooks/usePersonalization.ts
interface UserPreferences {
  guideLevel: 'minimal' | 'normal' | 'detailed';
  preferredFileOrder: string[];
  frequentActions: Map<string, number>;
  dismissedTips: Set<string>;
  workingHours: { start: number; end: number };
  lastActiveFiles: string[];
}

export const usePersonalization = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => 
    loadUserPreferences()
  );
  
  // 记录用户行为
  const recordUserAction = useCallback((action: UserAction) => {
    setPreferences(prev => {
      const newFrequentActions = new Map(prev.frequentActions);
      const currentCount = newFrequentActions.get(action.type) || 0;
      newFrequentActions.set(action.type, currentCount + 1);
      
      const updated = {
        ...prev,
        frequentActions: newFrequentActions,
        lastActiveFiles: updateLastActiveFiles(prev.lastActiveFiles, action.fileId)
      };
      
      saveUserPreferences(updated);
      return updated;
    });
  }, []);
  
  // 获取个性化建议
  const getPersonalizedSuggestions = useCallback((context: Context) => {
    const suggestions: Suggestion[] = [];
    
    // 基于频繁操作的建议
    const topActions = Array.from(preferences.frequentActions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    topActions.forEach(([actionType, frequency]) => {
      if (isRelevantAction(actionType, context)) {
        suggestions.push({
          type: 'frequent_action',
          actionType,
          confidence: Math.min(frequency / 10, 1),
          description: `你经常进行"${getActionDescription(actionType)}"操作`
        });
      }
    });
    
    // 基于工作时间的建议
    const currentHour = new Date().getHours();
    if (isInWorkingHours(currentHour, preferences.workingHours)) {
      suggestions.push({
        type: 'optimal_time',
        confidence: 0.8,
        description: '现在是你的高效工作时间'
      });
    }
    
    return suggestions;
  }, [preferences]);
  
  // 自适应界面配置
  const getAdaptiveUIConfig = useCallback(() => {
    return {
      showDetailedGuide: preferences.guideLevel === 'detailed',
      showQuickActions: preferences.frequentActions.size > 5,
      preferredFileOrder: preferences.preferredFileOrder,
      recentFiles: preferences.lastActiveFiles.slice(0, 5)
    };
  }, [preferences]);
  
  return {
    preferences,
    recordUserAction,
    getPersonalizedSuggestions,
    getAdaptiveUIConfig,
    updatePreference: (key: keyof UserPreferences, value: any) => {
      setPreferences(prev => {
        const updated = { ...prev, [key]: value };
        saveUserPreferences(updated);
        return updated;
      });
    }
  };
};

// 个性化推荐组件
const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  context
}) => {
  const { getPersonalizedSuggestions } = usePersonalization();
  const [recommendations, setRecommendations] = useState<Suggestion[]>([]);
  
  useEffect(() => {
    const suggestions = getPersonalizedSuggestions(context);
    setRecommendations(suggestions.filter(s => s.confidence > 0.6));
  }, [context, getPersonalizedSuggestions]);
  
  if (recommendations.length === 0) return null;
  
  return (
    <div className="personalized-recommendations">
      <h4 className="font-medium text-sm text-gray-700 mb-2">为你推荐</h4>
      
      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <RecommendationCard
            key={index}
            recommendation={rec}
            onAccept={() => handleAcceptRecommendation(rec)}
            onDismiss={() => handleDismissRecommendation(rec)}
          />
        ))}
      </div>
    </div>
  );
};
```

### Task 12.2.4: 性能优化和流畅度提升

**虚拟滚动和懒加载**：
```typescript
// components/performance/VirtualizedList.tsx
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight: number;
  overscan?: number;
}

const VirtualizedList = <T,>({
  items,
  itemHeight,
  renderItem,
  containerHeight,
  overscan = 5
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 计算可见范围
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight),
      items.length
    );
    
    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);
  
  // 处理滚动事件
  const handleScroll = useCallback(
    throttle((e: React.UIEvent) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, 16), // 60fps
    []
  );
  
  // 渲染可见项目
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      result.push({
        index: i,
        item: items[i],
        top: i * itemHeight
      });
    }
    return result;
  }, [items, visibleRange, itemHeight]);
  
  return (
    <div
      ref={containerRef}
      className="virtualized-list relative overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* 总高度占位 */}
      <div style={{ height: items.length * itemHeight }}>
        {/* 渲染可见项目 */}
        {visibleItems.map(({ index, item, top }) => (
          <div
            key={index}
            className="absolute w-full"
            style={{ top, height: itemHeight }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// 图像懒加载组件
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Intersection Observer 检测元素是否进入视口
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} className={`lazy-image ${className}`}>
      {inView && (
        <>
          {!loaded && placeholder && (
            <div className="placeholder">
              {placeholder}
            </div>
          )}
          
          <img
            src={src}
            alt={alt}
            onLoad={() => setLoaded(true)}
            className={`transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            {...props}
          />
        </>
      )}
    </div>
  );
};
```

**智能预加载和缓存**：
```typescript
// hooks/useSmartPreloading.ts
export const useSmartPreloading = () => {
  const [preloadQueue, setPreloadQueue] = useState<PreloadItem[]>([]);
  const [cache, setCache] = useState<Map<string, CacheItem>>(new Map());
  
  // 预测用户下一步操作
  const predictNextAction = useCallback((currentContext: Context) => {
    const predictions: Prediction[] = [];
    
    // 基于用户历史行为模式
    if (currentContext.fileType === 'setting') {
      predictions.push({
        action: 'navigate_to_outline',
        probability: 0.8,
        resources: ['outline_files', 'outline_templates']
      });
    }
    
    // 基于依赖关系
    const dependencies = getDependencies(currentContext.currentFile);
    dependencies.forEach(dep => {
      predictions.push({
        action: 'open_dependency',
        probability: 0.6,
        resources: [dep.fileId],
        data: dep
      });
    });
    
    return predictions;
  }, []);
  
  // 智能预加载
  const performSmartPreloading = useCallback((predictions: Prediction[]) => {
    predictions
      .filter(p => p.probability > 0.7)
      .slice(0, 3) // 限制预加载数量
      .forEach(prediction => {
        prediction.resources.forEach(resource => {
          if (!cache.has(resource)) {
            schedulePreload(resource, prediction.probability);
          }
        });
      });
  }, [cache]);
  
  // 后台预加载执行
  useEffect(() => {
    if (preloadQueue.length === 0) return;
    
    const processQueue = async () => {
      const item = preloadQueue[0];
      try {
        const data = await loadResource(item.resource);
        setCache(prev => new Map(prev.set(item.resource, {
          data,
          timestamp: Date.now(),
          hits: 0
        })));
      } catch (error) {
        console.warn('预加载失败:', item.resource, error);
      }
      
      setPreloadQueue(prev => prev.slice(1));
    };
    
    // 使用 requestIdleCallback 在浏览器空闲时执行
    if ('requestIdleCallback' in window) {
      requestIdleCallback(processQueue);
    } else {
      setTimeout(processQueue, 100);
    }
  }, [preloadQueue]);
  
  return {
    predictNextAction,
    performSmartPreloading,
    getCachedData: (resource: string) => cache.get(resource)?.data,
    cacheHit: (resource: string) => {
      setCache(prev => {
        const item = prev.get(resource);
        if (item) {
          prev.set(resource, { ...item, hits: item.hits + 1 });
        }
        return new Map(prev);
      });
    }
  };
};
```

## 验收标准

### 用户体验验收
- [ ] 新手引导流程完整清晰
- [ ] 操作反馈及时准确
- [ ] 个性化推荐相关有效

### 性能验收  
- [ ] 界面响应时间<50ms
- [ ] 动画流畅度60FPS
- [ ] 长列表滚动无卡顿

### 质量验收
- [ ] 无障碍访问支持完善
- [ ] 移动端适配良好
- [ ] 兼容性测试通过