# Epic0：技术环境搭建

## Epic概述

**Epic目标**：搭建基础的前后端技术架构，确保项目能正常运行、构建和部署

**Epic范围**：
- 前端React+TypeScript+Vite环境初始化
- 后端Express+TypeScript环境初始化  
- 基础项目结构和开发脚本配置
- 前后端基础通信验证

**Epic边界**：
- ✅ 包含：基础框架搭建、Hello World验证、基础通信
- ❌ 不包含：业务逻辑、AI服务集成、UI组件库、WebSocket

**Epic成功标准**：
- `npm run dev` 启动前端开发服务器（3000端口）
- `npm run server` 启动后端API服务器（3001端口）
- `npm run build` 成功构建前后端代码
- 前端能请求后端API并获得响应
- TypeScript编译无错误

## Story拆解

### Story 1: 界面功能开发
**目标**：创建完整的前端目录结构和基础React+TypeScript环境

**开发内容**：
- 创建src/client/目录结构（components/、pages/、stores/、hooks/、services/）
- 配置前端package.json、tsconfig.json、vite.config.ts
- 在src/client/pages/创建Hello World首页组件
- 在src/client/components/创建基础组件
- 在src/client/services/创建API调用服务

**验收标准**：
- src/client/完整目录结构创建成功
- 前端项目能独立启动（npm run dev，3000端口）
- 页面显示"Hello World"和"Novel Creation System"标题
- 浏览器控制台无TypeScript错误
- 包含测试API调用功能

**AI工作状态**：
```
□ 待开始 - 准备创建前端项目结构
□ 进行中 - 正在配置React+TypeScript环境
□ 已完成 - 前端基础环境搭建完成，验收通过
```

---

### Story 2: 服务逻辑开发  
**目标**：创建完整的后端目录结构和基础Express+TypeScript环境

**开发内容**：
- 创建src/server/完整目录结构（api/、services/、core/、middleware/、models/）
- 创建src/server/services/子目录（ai/、memory/、project/、file/）
- 配置后端package.json、tsconfig.json、nodemon配置
- 在src/server/api/创建基础路由
- 在src/server/middleware/创建CORS和错误处理中间件
- 在src/server/app.ts创建服务器入口文件
- 实现健康检查接口 `/api/health`

**验收标准**：
- src/server/完整目录结构创建成功
- 后端服务能独立启动（npm run server，3001端口）
- `/api/health` 接口返回正常状态JSON
- CORS配置允许前端跨域访问
- TypeScript编译无错误，支持热重载

**AI工作状态**：
```
□ 待开始 - 准备创建后端项目结构  
□ 进行中 - 正在配置Express+TypeScript环境
□ 已完成 - 后端基础环境搭建完成，验收通过
```

---

### Story 3: 功能集成开发
**目标**：创建剩余目录结构，整合前后端项目，实现基础通信验证

**开发内容**：
- 创建src/shared/目录结构（types/、constants/、utils/、schemas/）
- 创建src/config/目录和配置管理
- 创建public/、tests/、scripts/目录
- 配置根目录package.json（concurrently并发启动）
- 创建.env.example环境变量模板
- 实现前端调用后端API的完整流程
- 在src/shared/types/定义公共类型

**验收标准**：  
- src/shared/、src/config/、public/、tests/、scripts/目录创建成功
- 根目录`npm install`能安装所有依赖
- 根目录`npm run dev`同时启动前后端服务
- 前端页面能成功调用后端`/api/health`接口
- 页面显示后端返回的状态信息
- 完整项目结构符合技术架构设计文档

**AI工作状态**：
```
□ 待开始 - 准备整合前后端项目
□ 进行中 - 正在配置项目结构和通信
□ 已完成 - 前后端集成完成，通信验证通过
```

---

### Story 4: 完整功能验证
**目标**：验证整个技术栈的完整性和构建流程

**开发内容**：
- 配置生产环境构建脚本
- 实现前端生产构建（npm run build）
- 实现后端生产构建和启动
- 完整的开发、测试、构建流程验证
- 基础错误处理和日志输出

**验收标准**：
- `npm run build` 成功构建前后端代码
- 构建产物可以正常运行
- 开发环境热重载正常工作
- 项目结构清晰，符合技术架构设计
- 所有npm scripts正常工作

**AI工作状态**：
```
□ 待开始 - 准备验证完整构建流程
□ 进行中 - 正在测试构建和部署流程  
□ 已完成 - Epic0全部完成，技术环境搭建成功
```

---

## Epic执行计划

### 开发顺序
严格按照 Story1 → Story2 → Story3 → Story4 顺序执行，前一个Story完全验收通过后才开始下一个。

### 技术栈确认
- **前端**：React 18 + TypeScript + Vite + Axios
- **后端**：Node.js + Express + TypeScript  
- **工具**：Concurrently（并发启动）+ Nodemon（开发热重载）

### 项目结构规划
根据【技术架构】系统设计方案.md的统一目录结构：

```
novel-sys/
├── src/                     # 新建：源代码目录
│   ├── client/              # 新建：前端代码
│   │   ├── components/      # 新建：React组件
│   │   ├── pages/           # 新建：页面组件
│   │   ├── stores/          # 新建：状态管理
│   │   ├── hooks/           # 新建：自定义Hook
│   │   └── services/        # 新建：前端服务
│   ├── server/              # 新建：后端代码
│   │   ├── api/             # 新建：API路由层
│   │   ├── services/        # 新建：业务服务层
│   │   │   ├── ai/          # 新建：AI服务(Gemini/PromptX)
│   │   │   ├── memory/      # 新建：记忆管理
│   │   │   ├── project/     # 新建：项目管理
│   │   │   └── file/        # 新建：文件操作
│   │   ├── core/            # 新建：核心业务逻辑
│   │   ├── middleware/      # 新建：中间件
│   │   ├── models/          # 新建：数据模型
│   │   └── app.ts           # 新建：服务器入口
│   ├── shared/              # 新建：前后端共享
│   │   ├── types/           # 新建：公共类型
│   │   ├── constants/       # 新建：公共常量
│   │   ├── utils/           # 新建：通用工具
│   │   └── schemas/         # 新建：数据验证
│   └── config/              # 新建：配置管理
├── public/                  # 新建：静态资源
├── tests/                   # 新建：测试
├── scripts/                 # 新建：构建脚本
├── package.json             # 新建：根目录配置
├── .env.example             # 新建：环境变量模板
├── docs/                    # 保留：现有文档目录（不动）
│   ├── NOVEL_CREATION_TASKS/ # 保留：现有任务目录（不动）
│   ├── 开发总结/             # 保留：现有开发总结目录（不动）
│   └── *.md                 # 保留：各种设计文档（不动）
└── README.md                # 保留：现有文档（不动）
```

**重要约束**：
- ✅ 新建完整的src/目录结构（包含所有子目录）
- ✅ 新建public/、tests/、scripts/目录
- ✅ 新建根目录配置文件（package.json、.env.example等）
- ❌ 不修改现有的docs/目录及其子目录和文件
- ❌ 不删除任何现有文件

### 防改错机制
- 每个Story内部记录完整的开发状态
- 严格按顺序执行，不跳跃，不并行
- 每个Story完成后立即更新状态记录
- 出现问题时回滚到上一个稳定状态

---

## Epic完成标志

当所有4个Story都标记为"已完成"状态，且最终验收全部通过时，Epic0技术环境搭建正式完成，可以开始Epic1项目导入引导流程的开发。