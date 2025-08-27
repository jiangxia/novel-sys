# Story 5.1: 记忆状态指示器组件开发

## O (Objective)

### 功能目标
- 实现记忆功能的状态可视化组件
- 提供用户友好的记忆操作反馈
- 显示角色激活状态和记忆系统工作状态
- 集成到左侧对话区域的界面中

### 技术目标  
- 开发可复用的React状态指示器组件
- 实现实时的记忆状态更新机制
- 提供优雅的加载和错误状态展示
- 确保组件的响应式适配

## E (Environment)

### 技术环境
- **前端框架**: React 18+ with TypeScript
- **样式方案**: TailwindCSS
- **状态管理**: React Context + useReducer
- **UI组件**: 自研组件（符合产品简约风格）
- **图标资源**: Heroicons或自定义SVG

### 依赖环境
- 左侧对话区组件已实现（Epic 2完成）
- 后端记忆API接口已定义（Fullstack Story 5.1完成）
- 产品设计规范：黑白灰配色，极简视觉风格

### 界面集成位置
```
左侧交互区 - 对话Tab
┌─────────────────┐
│  [对话] [项目]   │
├─────────────────┤
│ ┌─角色状态─────┐ │
│ │ 🤖总监 ●激活  │ │ <- 新增记忆状态指示
│ │ 💾记忆 ●工作  │ │
│ └─────────────┘ │
│ ┌─对话区域─────┐ │
│ │   消息内容   │ │
│ └─────────────┘ │
│ ┌─输入框───────┐ │
│ └─────────────┘ │
└─────────────────┘
```

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] 角色激活状态准确显示（总监/架构师/规划师/写手）
- [ ] 记忆系统工作状态实时更新（工作中/空闲/错误）
- [ ] 组件响应式适配，在320px宽度下正常显示
- [ ] 基础的加载动画和错误状态提示

### 优秀标准 (Should Have)  
- [ ] 流畅的状态切换动画效果
- [ ] 鼠标悬停显示详细状态信息（Tooltip）
- [ ] 记忆保存成功的视觉反馈
- [ ] 角色切换时的平滑过渡效果

### 卓越标准 (Nice to Have)
- [ ] 记忆系统的工作量可视化（保存/回忆次数）
- [ ] 个性化的角色状态图标
- [ ] 可折叠的详细状态面板
- [ ] 无障碍访问支持（ARIA标签）

## 核心组件设计

### 记忆状态指示器组件
```tsx
// components/MemoryStatusIndicator.tsx
interface MemoryStatusIndicatorProps {
  currentRole: RoleType | null;
  memoryStatus: MemoryStatus;
  onRoleChange?: (role: RoleType) => void;
}

export const MemoryStatusIndicator: React.FC<MemoryStatusIndicatorProps> = ({
  currentRole,
  memoryStatus,
  onRoleChange
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">AI状态</span>
        <StatusDot status={memoryStatus.connectionStatus} />
      </div>
      
      <RoleIndicator 
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />
      
      <MemoryIndicator 
        status={memoryStatus.workingStatus}
        lastAction={memoryStatus.lastAction}
      />
    </div>
  );
};
```

### 角色指示组件
```tsx
// components/RoleIndicator.tsx
interface RoleIndicatorProps {
  currentRole: RoleType | null;
  onRoleChange?: (role: RoleType) => void;
}

const ROLES = [
  { type: 'supervisor', name: '总监', icon: '👨‍💼', color: 'text-blue-600' },
  { type: 'architect', name: '架构师', icon: '🏗️', color: 'text-green-600' },
  { type: 'planner', name: '规划师', icon: '📋', color: 'text-yellow-600' },
  { type: 'writer', name: '写手', icon: '✍️', color: 'text-purple-600' }
] as const;
```

### 记忆工作状态组件
```tsx
// components/MemoryIndicator.tsx
interface MemoryIndicatorProps {
  status: 'idle' | 'saving' | 'recalling' | 'error';
  lastAction?: {
    type: 'save' | 'recall';
    timestamp: Date;
    success: boolean;
  };
}

const STATUS_CONFIG = {
  idle: { label: '空闲', color: 'text-gray-500', icon: '💤' },
  saving: { label: '保存中', color: 'text-blue-500', icon: '💾' },
  recalling: { label: '回忆中', color: 'text-green-500', icon: '🧠' },
  error: { label: '错误', color: 'text-red-500', icon: '⚠️' }
} as const;
```

## 具体任务分解

### Task 5.1.1: 基础状态指示器组件
**时间估算**: 3小时
- 实现MemoryStatusIndicator主组件
- 建立基础的状态数据接口
- 实现简单的状态dot和文字显示
- 基础样式和布局实现

### Task 5.1.2: 角色状态显示和切换
**时间估算**: 4小时
- 实现RoleIndicator组件
- 4角色的图标和状态显示
- 角色切换交互逻辑
- 激活状态的视觉反馈

### Task 5.1.3: 记忆工作状态和动画
**时间估算**: 4小时
- 实现MemoryIndicator组件
- 记忆保存/回忆状态的动画效果
- 最后操作时间和成功/失败提示
- 错误状态的详细信息展示

### Task 5.1.4: 组件集成和状态管理
**时间估算**: 3小时
- 将组件集成到左侧对话区
- 实现状态数据的Context管理
- 连接后端API的状态数据
- 响应式适配和测试

## 状态数据接口设计

### 记忆状态数据结构
```typescript
interface MemoryStatus {
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  workingStatus: 'idle' | 'saving' | 'recalling' | 'error';
  currentRole: RoleType | null;
  lastAction?: {
    type: 'save' | 'recall' | 'activate_role';
    timestamp: Date;
    success: boolean;
    details?: string;
  };
  stats?: {
    totalMemories: number;
    todayActions: number;
  };
}

type RoleType = 'supervisor' | 'architect' | 'planner' | 'writer';
```

### 状态更新Hook
```typescript
// hooks/useMemoryStatus.ts
export const useMemoryStatus = () => {
  const [status, setStatus] = useState<MemoryStatus>(initialStatus);
  
  const updateMemoryStatus = useCallback((update: Partial<MemoryStatus>) => {
    setStatus(prev => ({ ...prev, ...update }));
  }, []);

  const activateRole = useCallback(async (role: RoleType) => {
    setStatus(prev => ({ ...prev, workingStatus: 'activating', currentRole: role }));
    // 调用API
  }, []);

  return { status, updateMemoryStatus, activateRole };
};
```

## 视觉设计规范

### 颜色规范
- **连接状态**: 绿色●(连接) / 黄色●(连接中) / 红色●(断开)
- **角色图标**: 每个角色有独特的颜色标识
- **背景**: 浅灰色背景（bg-gray-50），深灰色边框

### 动画规范
- **状态切换**: 200ms的fadeIn/fadeOut
- **工作指示**: 脉冲动画（animate-pulse）
- **成功反馈**: 绿色闪烁后恢复常态

### 响应式规范
- **桌面端**: 完整状态信息显示
- **移动端**: 简化显示，点击展开详细信息

## 验证方式
1. **视觉测试**: 在不同状态下组件显示正确
2. **交互测试**: 角色切换和状态反馈正常
3. **响应式测试**: 320px和1920px下均正常显示
4. **集成测试**: 与后端API数据联动正确
5. **性能测试**: 状态频繁更新时无明显延迟

## 风险和应对策略
- **风险**: 状态更新频率过高影响性能
  **应对**: 实现状态更新节流和合并机制
- **风险**: 组件在小屏幕下信息过于拥挤
  **应对**: 实现分层展示和可折叠设计
- **风险**: 角色切换时的状态混乱
  **应对**: 严格的状态管理和加载状态