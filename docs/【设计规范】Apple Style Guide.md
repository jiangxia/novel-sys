# 【设计规范】Apple Style Design Guide

## 概述

本文档定义了小说创作系统的Apple Style设计规范，确保界面设计符合苹果设计原则：**清晰（Clarity）**、**内容优先（Deference）**、**简洁（Simplicity）**。

## 核心设计原则

### 1. 清晰性（Clarity）
- **文字清晰可读**：使用足够大的字体尺寸，确保在任何设备上都能轻松阅读
- **视觉层次分明**：通过字重、颜色、间距建立清晰的信息层级
- **交互元素明确**：按钮、链接等交互元素有明确的视觉反馈

### 2. 内容优先（Deference）
- **内容为王**：界面元素服务于内容，而非抢夺注意力
- **留白运用**：充分使用留白来突出重要内容
- **去除干扰**：移除不必要的装饰性元素

### 3. 简洁性（Simplicity）
- **奥卡姆剃刀**：每个界面元素都有明确目的，去除冗余
- **一致性设计**：统一的设计语言和交互模式
- **渐进式披露**：按需显示信息，避免一次性展示过多内容

## 具体设计规范

### 字体系统

**主要字体**：
- 中文：苹果系统字体（PingFang SC）
- 英文：San Francisco
- 等宽字体：Monaco

**字体大小层级**：
```css
/* 标题层级 */
--text-4xl: 2.25rem;    /* 36px - 主标题 */
--text-3xl: 1.875rem;   /* 30px - 次标题 */
--text-2xl: 1.5rem;     /* 24px - 章节标题 */
--text-xl: 1.25rem;     /* 20px - 小标题 */

/* 正文层级 */
--text-lg: 1.125rem;    /* 18px - 大正文 */
--text-base: 1rem;      /* 16px - 标准正文 */
--text-sm: 0.875rem;    /* 14px - 小正文 */
--text-xs: 0.75rem;     /* 12px - 辅助信息 */
```

### 颜色系统

**语义化颜色**：
```css
/* 基础颜色 */
--color-background: #ffffff;          /* 背景白 */
--color-foreground: #1d1d1f;          /* 主文字黑 */
--color-muted: #86868b;               /* 辅助文字灰 */

/* 功能颜色 */
--color-primary: #007aff;             /* 主要操作蓝 */
--color-success: #34c759;             /* 成功绿 */
--color-warning: #ff9500;             /* 警告橙 */
--color-error: #ff3b30;               /* 错误红 */

/* 边框和分割线 */
--color-border: #e5e5e7;              /* 边框灰 */
--color-divider: #f2f2f7;             /* 分割线灰 */
```

### 间距系统

**统一间距单位**：
```css
/* 基础间距 */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
```

**应用场景**：
- 组件内边距：space-4 (16px)
- 组件间距：space-6 (24px)
- 区块间距：space-8 (32px)
- 页面边距：space-12 (48px)

### 响应式设计

**断点定义**：
```css
/* 移动优先响应式断点 */
--breakpoint-sm: 640px;    /* 小屏幕 */
--breakpoint-md: 768px;    /* 中等屏幕 */
--breakpoint-lg: 1024px;   /* 大屏幕 */
--breakpoint-xl: 1280px;   /* 超大屏幕 */
--breakpoint-2xl: 1536px;  /* 超超大屏幕 */
```

**布局规则**：
- 小屏幕（<768px）：单栏布局，左侧栏隐藏或抽屉式
- 中等屏幕（768px-1024px）：双栏布局，左侧栏可收起
- 大屏幕（>1024px）：完整双栏布局

## 界面布局规范

### 整体布局

**双栏响应式布局**：
```css
.main-layout {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 3fr;
  gap: 0;
  height: 100vh;
}

@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}
```

### 左侧交互区

**基本结构**：
- Tab切换区：对话 | 项目
- 内容区：根据选中Tab显示对应内容
- 底部操作区：角色切换按钮等

**设计要求**：
- 最小宽度：280px
- 背景：纯白色
- 边框：右侧1px分割线
- 内容间距：统一16px

### 右侧内容区

**设计原则**：
- **内容优先**：去除复杂的多层Tab结构
- **单一专注**：一次只编辑一个文件
- **清晰标识**：文件名Tab清晰标识当前文件

**布局结构**：
```
┌─文件名Tab─────────────────────┐
│ 📄 story-chapter-01.md    × │
└─────────────────────────────┘
┌─────────────────────────────┐
│                             │
│        编辑器区域             │
│      （专注内容创作）          │
│                             │
└─────────────────────────────┘
```

## 组件设计规范

### 按钮组件

**主要按钮**：
```css
.button-primary {
  background: var(--color-primary);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  min-height: 44px; /* 触摸友好 */
}
```

**次要按钮**：
```css
.button-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  min-height: 44px;
}
```

### Tab组件

**简洁Tab设计**：
- 去除复杂的嵌套结构
- 使用简洁的下划线指示活跃状态
- 统一的关闭按钮位置

### 输入组件

**文本输入框**：
```css
.input {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 16px; /* 防止iOS缩放 */
  background: white;
}

.input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}
```

### 对话组件

**消息气泡**：
- 用户消息：右对齐，蓝色背景
- AI消息：左对齐，灰色背景
- 圆角：12px
- 最大宽度：70%

## 动效规范

### 基础动效参数

```css
/* 动画持续时间 */
--duration-fast: 150ms;      /* 快速交互 */
--duration-normal: 300ms;    /* 标准动画 */
--duration-slow: 500ms;      /* 慢速转场 */

/* 缓动函数 */
--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);
```

### 交互动效

**按钮交互**：
- Hover：轻微放大（scale: 1.02）
- Active：轻微缩小（scale: 0.98）
- 持续时间：150ms

**Tab切换**：
- 淡入淡出过渡
- 持续时间：300ms

**模态弹窗**：
- 从中心放大出现
- 背景遮罩淡入
- 持续时间：300ms

## 可访问性规范

### 颜色对比

- 正文文字与背景对比度 ≥ 4.5:1
- 大号文字与背景对比度 ≥ 3:1
- 交互元素与背景对比度 ≥ 3:1

### 触摸目标

- 最小触摸区域：44px × 44px
- 按钮间最小间距：8px

### 键盘导航

- 所有交互元素支持Tab导航
- 清晰的焦点指示器
- 合理的Tab顺序

## 实施指南

### 开发实施

1. **使用Tailwind CSS变量**：将设计token转换为CSS变量
2. **组件库统一**：基于Shadcn/ui进行定制
3. **响应式优先**：移动设备优先设计
4. **性能优化**：避免过度动画和视觉效果

### 质量检查

**设计一致性检查清单**：
- [ ] 字体大小符合规范层级
- [ ] 颜色使用符合语义化要求
- [ ] 间距使用统一的spacing系统
- [ ] 响应式布局在各断点正常工作
- [ ] 交互状态清晰可见
- [ ] 满足可访问性要求

### 设计评审

**评审关键点**：
1. **清晰性**：信息是否容易理解和使用
2. **内容优先**：界面是否突出了最重要的内容
3. **简洁性**：是否移除了不必要的元素
4. **一致性**：是否遵循了统一的设计语言
5. **响应式**：是否在不同设备上都有良好体验

## 总结

Apple Style设计的核心是**内容为王**和**用户体验优先**。通过遵循这些设计规范，我们能够创造出既美观又实用的小说创作界面，让用户专注于最重要的事情：创作优秀的内容。

**设计理念**：**Less is More** - 通过减少视觉干扰，让用户更专注于创作本身。