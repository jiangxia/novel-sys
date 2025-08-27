# Story 7.1: 角色切换按钮组件开发

## O (Objective)

### 功能目标
- 开发4角色切换按钮UI组件
- 实现角色激活状态的视觉反馈
- 支持角色切换的交互操作

### 技术目标  
- 基于React + TypeScript构建可复用组件
- 实现响应式设计和无障碍访问
- 集成角色切换的状态管理机制

## E (Environment)

### 技术环境
- React 18 + TypeScript + TailwindCSS
- Zustand状态管理
- 角色图标和视觉设计资源
- 组件库基础设施

### 依赖环境
- 左侧交互区基础布局已实现
- 角色数据类型定义已确定
- 设计系统和UI组件规范已建立

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 4个角色按钮正确显示（总监、架构师、规划师、写手）
- ✅ 当前激活角色有明确的视觉标识
- ✅ 点击切换功能正常工作
- ✅ 响应式布局在不同屏幕尺寸下正常显示

### 优秀标准 (Should Have)  
- ✅ 角色按钮有悬停和点击的交互反馈
- ✅ 切换过程有流畅的动画效果
- ✅ 支持键盘导航和无障碍访问
- ✅ 角色专业特色在视觉设计中体现

### 卓越标准 (Nice to Have)
- ✅ 智能路由推荐时的视觉提示效果
- ✅ 角色使用频率的视觉统计展示
- ✅ 支持自定义角色按钮布局
- ✅ 精美的微动效和视觉细节

## 具体任务分解

### Task 7.1.1: 角色按钮基础组件开发

**技术实现**：
```typescript
// 角色按钮组件
interface RoleButtonProps {
  role: AIRole;
  isActive: boolean;
  isRecommended?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const RoleButton: React.FC<RoleButtonProps> = ({
  role, isActive, isRecommended, onClick, disabled
}) => {
  return (
    <button
      className={cn(
        'role-button',
        'flex flex-col items-center p-3 rounded-lg transition-all duration-200',
        'border-2 hover:shadow-md focus:outline-none focus:ring-2',
        {
          'border-blue-500 bg-blue-50 text-blue-700': isActive,
          'border-gray-300 bg-white text-gray-700 hover:border-gray-400': !isActive,
          'ring-yellow-300 border-yellow-400': isRecommended,
          'opacity-50 cursor-not-allowed': disabled
        }
      )}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
      title={role.description}
    >
      <RoleIcon roleId={role.id} className="w-8 h-8 mb-2" />
      <span className="text-sm font-medium">{role.name}</span>
      {isRecommended && (
        <Badge className="mt-1 text-xs bg-yellow-100 text-yellow-800">
          推荐
        </Badge>
      )}
    </button>
  );
};
```

### Task 7.1.2: 角色图标和视觉设计

**设计要求**：
- 总监：管理/统筹类图标，体现全局视野
- 架构师：建筑/设计类图标，体现构建能力
- 规划师：规划/流程类图标，体现逻辑性  
- 写手：笔/创作类图标，体现文学性

### Task 7.1.3: 角色切换组合组件

```typescript
// 角色切换器组合组件
const RoleSwitcher: React.FC = () => {
  const { currentRole, availableRoles } = useRoleStore();
  const [switchingState, setSwitchingState] = useState<'idle' | 'switching'>('idle');
  
  const handleRoleSwitch = async (roleId: string) => {
    if (switchingState === 'switching' || roleId === currentRole?.id) return;
    
    setSwitchingState('switching');
    
    try {
      await switchRole(roleId);
    } catch (error) {
      handleError(error);
    } finally {
      setSwitchingState('idle');
    }
  };
  
  return (
    <div className="role-switcher space-y-3 p-4">
      <h3 className="text-sm font-medium text-gray-600 mb-3">AI助手角色</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {availableRoles.map(role => (
          <RoleButton
            key={role.id}
            role={role}
            isActive={role.id === currentRole?.id}
            onClick={() => handleRoleSwitch(role.id)}
            disabled={switchingState === 'switching'}
          />
        ))}
      </div>
      
      {switchingState === 'switching' && (
        <div className="flex items-center justify-center py-2">
          <Spinner className="w-4 h-4 mr-2" />
          <span className="text-sm text-gray-500">切换中...</span>
        </div>
      )}
    </div>
  );
};
```

## 与后端协作接口

虽然这是前端任务，但需要明确与后端的协作接口：

```typescript
// 角色切换API接口（后端提供）
interface RoleSwitchAPI {
  switchRole(roleId: string): Promise<RoleSwitchResult>;
  getCurrentRole(): Promise<AIRole>;
  getAvailableRoles(): Promise<AIRole[]>;
}

// 前端状态管理
interface RoleStore {
  currentRole: AIRole | null;
  availableRoles: AIRole[];
  isLoading: boolean;
  switchRole: (roleId: string) => Promise<void>;
}
```

---

**注意**: 此前端任务可以与后端Epic7任务并行开发，通过Mock数据进行前端开发，最后集成对接。