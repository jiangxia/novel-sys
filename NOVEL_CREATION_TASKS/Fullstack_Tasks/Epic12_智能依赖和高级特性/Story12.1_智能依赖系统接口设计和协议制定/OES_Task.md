# Story 12.1: 智能依赖系统接口设计和协议制定

## O (Objective)

### 功能目标
- 设计完整的智能依赖识别系统接口规范
- 制定依赖状态管理和传递协议
- 建立前后端依赖交互的数据格式标准

### 技术目标  
- 定义可扩展的依赖识别API架构
- 建立高效的依赖状态缓存机制
- 制定依赖错误处理和降级策略

### 协作目标
- 为前端依赖UI提供标准数据格式
- 为后端依赖算法提供统一接口规范
- 建立依赖系统的完整技术边界

## E (Environment)

### 协作环境
- **前端**: React + TailwindCSS + 状态管理
- **后端**: Node.js + Express + 文件系统操作
- **协作点**: 依赖检查API、依赖状态推送、实时依赖更新

### 技术环境
- REST API设计规范
- WebSocket实时通信（可选）
- 文件系统依赖分析
- JSON数据格式标准

### 依赖环境
- 项目文件结构解析能力
- 内容类型识别算法
- 依赖关系计算逻辑
- 文件变更监听机制

## S (Success Criteria)

### 及格标准 (Must Have)
- **API接口规范完整**：所有依赖相关API接口定义清楚
- **数据格式统一**：前后端数据交互格式完全一致
- **错误处理协议**：异常情况处理机制明确定义

### 优秀标准 (Should Have)  
- **可扩展性设计**：支持未来新的依赖类型扩展
- **性能考虑**：接口设计考虑高并发和缓存优化
- **实时性支持**：支持依赖状态的实时更新推送

### 协作标准
- **前后端零歧义**：接口文档详细到前后端开发无需额外沟通
- **数据格式验证**：提供完整的数据格式校验规则
- **测试用例提供**：提供标准的接口测试用例

## 前后端协作任务分解

### Task 12.1.1: 核心依赖识别API设计

**接口规范定义**：
```javascript
// 获取文件依赖状态
GET /api/dependencies/{fileType}/{fileName}
Response: {
  dependencies: [
    {
      type: "setting|outline|summary",
      status: "satisfied|missing|partial",
      requiredFiles: ["故事世界.md", "故事主题.md"],
      suggestions: "建议先完成小说设定中的故事世界构建"
    }
  ],
  canProceed: boolean,
  warningMessage: string,
  recommendations: []
}

// 批量检查项目依赖状态  
GET /api/dependencies/project/status
Response: {
  overallStatus: "healthy|warning|error",
  dependencyMap: {
    "articles": {
      "第一章": {
        "setting": "satisfied",
        "outline": "missing", 
        "summary": "partial",
        "content": "not_started"
      }
    }
  }
}
```

### Task 12.1.2: 依赖状态数据格式标准

**标准数据结构**：
```typescript
interface DependencyStatus {
  fileId: string;
  fileType: 'setting' | 'outline' | 'summary' | 'content';
  status: 'satisfied' | 'missing' | 'partial' | 'not_started';
  dependencies: DependencyRequirement[];
  lastChecked: timestamp;
  checksum: string; // 文件内容校验
}

interface DependencyRequirement {
  type: string;
  description: string;
  priority: 'required' | 'recommended' | 'optional';
  files: string[];
  satisfied: boolean;
  partialReason?: string;
}

interface DependencyRecommendation {
  action: 'create' | 'update' | 'complete';
  targetFile: string;
  reason: string;
  estimatedTime: string;
  priority: number;
}
```

### Task 12.1.3: 依赖检查触发机制设计

**触发点定义**：
- 用户打开文件时自动检查
- 文件保存后自动重新检查
- 用户手动请求依赖检查
- 项目导入后全量检查

**实时更新机制**：
```javascript
// WebSocket实时依赖状态推送（可选）
WebSocket: /ws/dependencies
Message Format: {
  event: "dependency_updated",
  fileId: string,
  newStatus: DependencyStatus,
  affectedFiles: string[] // 影响到的其他文件
}
```

### Task 12.1.4: 错误处理和降级策略

**错误处理协议**：
```javascript
// 标准错误响应格式
{
  success: false,
  error: {
    code: "DEPENDENCY_CHECK_FAILED",
    message: "依赖检查失败：文件读取错误", 
    details: {
      failedFile: "story.md",
      reason: "文件不存在或无权限访问"
    }
  },
  fallback: {
    canProceed: true, // 降级为允许继续
    warningMessage: "无法检查依赖，请手动确认前置内容完整"
  }
}
```

**降级策略**：
1. **依赖检查失败** → 警告提示，允许继续操作
2. **文件读取异常** → 标记为未知状态，提示用户检查
3. **算法计算超时** → 使用缓存结果，后台继续计算

## 技术实现指导

### 核心架构设计
```javascript
// backend/lib/dependency-manager.js
class DependencyManager {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.cache = new Map(); // 依赖状态缓存
    this.analyzer = new ContentAnalyzer();
  }

  async checkDependencies(fileId, fileType) {
    // 1. 检查缓存
    // 2. 分析文件依赖
    // 3. 更新缓存
    // 4. 返回标准格式结果
  }

  async getProjectDependencyMap() {
    // 生成整个项目的依赖关系图
  }
}

// backend/lib/content-analyzer.js  
class ContentAnalyzer {
  analyzeSettingDependencies(content) {
    // 分析设定文件的完整性
    return {
      worldSetting: this.checkWorldSetting(content),
      themeSetting: this.checkThemeSetting(content),
      characterSetting: this.checkCharacterSetting(content)
    };
  }

  analyzeOutlineDependencies(content, settings) {
    // 基于设定分析大纲依赖
  }
}
```

### 前端集成接口
```javascript
// frontend/lib/dependency-client.js
class DependencyClient {
  async checkFileDependencies(fileId, fileType) {
    const response = await fetch(`/api/dependencies/${fileType}/${fileId}`);
    return response.json();
  }

  async subscribeToUpdates(callback) {
    // WebSocket订阅依赖状态更新
  }
}
```

## 验收标准

### 接口完整性验证
- [ ] 所有API接口文档完整，包含请求/响应示例
- [ ] 数据格式定义清晰，包含TypeScript类型定义
- [ ] 错误处理机制完整，覆盖所有异常情况

### 前后端协作验证  
- [ ] 前端可以根据接口文档完成所有UI开发
- [ ] 后端可以根据接口文档完成所有API开发
- [ ] 数据格式在前后端实现中完全一致

### 可扩展性验证
- [ ] 新增依赖类型不需要修改核心接口
- [ ] 支持不同粒度的依赖检查（文章级/章节级）
- [ ] 支持自定义依赖规则配置