# Epic1：项目导入引导流程

## Epic概述

**Epic目标**：实现用户打开网站后的项目导入引导，作为整个应用的入口，确保用户能够顺利导入符合规范的本地项目或创建标准项目结构

**Epic范围**：
- 欢迎页面和目录选择界面设计
- File System Access API集成和目录读取
- 智能目录结构验证和创建机制
- 导入状态管理和主界面切换

**Epic边界**：
- ✅ 包含：欢迎引导、目录选择、结构验证、自动创建
- ❌ 不包含：主界面功能、AI服务、具体创作功能

**Epic成功标准**：
- 用户能够成功选择或创建符合规范的项目目录
- File System Access API在主流浏览器中正常工作
- 目录结构验证准确率≥95%
- 导入流程用户体验流畅，完成时间≤3分钟

## 📋 开发状态（AI必读必写）
### 当前进度
- [ ] Story 1.1: 项目导入引导界面功能开发 - 状态：未开始
- [ ] Story 1.2: 项目导入引导服务逻辑开发 - 状态：未开始
- [ ] Story 1.3: 项目导入引导功能集成开发 - 状态：未开始
- [ ] Story 1.4: 项目导入引导完整功能验证 - 状态：未开始

### 正在进行的工作
- **当前Story**：待开始
- **具体任务**：待分配
- **修改文件**：待确定
- **预期完成**：待规划

### 关键决策和约束
- **技术决策**：使用File System Access API，降级到传统文件上传
- **API设计**：RESTful风格，统一响应格式
- **数据结构**：项目配置使用JSON格式存储
- **限制条件**：浏览器兼容性限制，需要权限处理

### 依赖关系和约束
#### 来自前置Epic的关键约束
- Epic0约束1：必须使用统一的API响应格式 `{success, data, error, timestamp}`
- Epic0约束2：前端组件必须使用Shadcn/ui和黑白灰配色
- Epic0约束3：后端服务必须支持CORS和标准错误处理

#### 本Epic产出的关键决策（影响后续Epic）
- [待完成后填写]：本Epic确定的设计决策和约束

## Story拆解

### Story 1.1: 项目导入引导界面功能开发

**目标**：创建用户友好的项目导入引导界面，包括欢迎页面、目录选择器、验证结果展示等组件

**开发内容**：
- 在src/client/pages/创建Welcome.tsx欢迎页面
- 在src/client/components/import/创建DirectoryPicker.tsx组件
- 在src/client/components/import/创建ValidationResults.tsx组件
- 在src/client/components/import/创建DirectoryStructurePreview.tsx组件
- 在src/client/hooks/创建useFileSystemAccess.ts自定义Hook

**验收标准**：
- 欢迎页面显示系统介绍和目录结构规范
- 目录选择器支持File System Access API和降级方案
- 验证结果清晰显示通过/失败状态和修复建议
- 响应式设计在不同屏幕尺寸下正常显示
- TypeScript编译无错误，ESLint检查通过

**AI工作状态**：
```
□ 待开始 - 准备创建项目导入界面组件
□ 进行中 - 正在开发界面组件和交互逻辑
□ 已完成 - 界面功能开发完成，验收通过
```

---

### Story 1.2: 项目导入引导服务逻辑开发

**目标**：实现项目导入相关的后端服务逻辑，包括目录验证、项目配置管理等API接口

**开发内容**：
- 在src/server/api/创建project-import路由
- 在src/server/services/project/创建ProjectImportService类
- 在src/server/services/file/创建DirectoryValidator类
- 在src/server/middleware/创建文件操作权限验证中间件
- 实现项目配置文件(.novel-project.json)的读写逻辑

**验收标准**：
- `/api/project/validate`接口正确验证目录结构
- `/api/project/create-structure`接口能创建标准目录结构
- `/api/project/save-config`接口正确保存项目配置
- 错误处理完善，返回用户友好的错误信息
- 接口响应时间<1s，支持大型项目目录扫描

**AI工作状态**：
```
□ 待开始 - 准备创建项目导入服务逻辑
□ 进行中 - 正在开发API接口和业务逻辑
□ 已完成 - 服务逻辑开发完成，验收通过
```

---

### Story 1.3: 项目导入引导功能集成开发

**目标**：完成界面与服务的集成，实现完整的项目导入流程

**开发内容**：
- 在src/client/services/创建ProjectImportService类
- 在src/client/stores/创建importStore.ts状态管理
- 实现前端调用后端API的完整流程
- 集成File System Access API与后端验证逻辑
- 实现导入成功后的状态保存和界面跳转

**验收标准**：
- 完整导入流程从选择目录到验证成功无缝连接
- 前后端数据传输格式统一，错误处理完善
- 导入状态在前端正确管理和显示
- 支持中断和重新开始导入流程
- 项目信息正确保存到本地存储和配置文件

**AI工作状态**：
```
□ 待开始 - 准备整合前后端导入功能
□ 进行中 - 正在集成API调用和状态管理
□ 已完成 - 功能集成完成，导入流程验证通过
```

---

### Story 1.4: 项目导入引导完整功能验证

**目标**：验证完整的项目导入功能从用户界面到业务服务的端到端流程

**开发内容**：
- 执行完整用户流程测试（不同类型项目目录）
- 验证异常场景处理（权限错误、网络中断、无效目录）
- 测试浏览器兼容性（Chrome、Firefox、Edge）
- 验证性能表现（大型项目、慢速网络）
- 完成用户体验评估和优化

**验收标准**：
- 5个不同类型测试项目都能成功导入
- 异常场景都有合适的错误提示和恢复机制
- 主流浏览器兼容性≥95%
- 1000个文件的项目扫描时间<3秒
- 用户完成导入流程时间≤3分钟

**AI工作状态**：
```
□ 待开始 - 准备验证完整导入功能
□ 进行中 - 正在执行端到端测试和优化
□ 已完成 - Epic1全部完成，项目导入功能验证通过
```

---

## Epic执行计划

### 开发顺序
严格按照 Story1.1 → Story1.2 → Story1.3 → Story1.4 顺序执行，前一个Story完全验收通过后才开始下一个。

### 技术栈确认
- **前端**：React 18 + TypeScript + Zustand + Shadcn/ui
- **后端**：Node.js + Express + TypeScript
- **核心API**：File System Access API + 传统文件上传降级

### 关键依赖
- File System Access API浏览器支持
- 用户授权目录访问权限
- 项目目录结构规范定义

### 防改错机制
- 每个Story内部记录完整的开发状态
- 严格按顺序执行，不跳跃，不并行
- 每个Story完成后立即更新状态记录
- 出现问题时回滚到上一个稳定状态

---

## Epic完成标志

当所有4个Story都标记为"已完成"状态，且最终验收全部通过时，Epic1项目导入引导流程正式完成，可以开始Epic2主工作界面搭建的开发。