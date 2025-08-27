# Story 3.1: 文件操作接口设计和协议制定

## O (Objective)

### 功能目标
- 制定完整的前后端文件操作API接口规范和协议标准
- 定义文件读取、保存、同步等核心操作的数据格式和流程
- 为前后端独立开发提供统一的文件操作接口契约

### 技术目标
- 设计RESTful风格的文件操作API接口规范
- 制定标准化的文件数据格式、错误处理、状态管理协议
- 定义双重保存机制（手动+自动）的接口设计
- 建立文件版本管理和冲突处理的协议规范

### 协作目标
- 确保前后端开发人员对文件操作接口理解一致
- 提供详细的接口文档和示例代码
- 建立文件操作的安全性和数据完整性保障机制

## E (Environment)

### 协作环境
- **前端技术栈**：React + TypeScript + File API
- **后端技术栈**：Node.js + Express + File System
- **协作接口点**：HTTP REST API + JSON数据格式
- **文档工具**：Markdown文档 + 接口示例

### 技术环境
- **API设计规范**：RESTful API设计原则
- **文件操作规范**：文件系统安全访问和路径处理
- **数据格式**：JSON标准格式 + 文件内容编码
- **错误处理**：统一错误响应格式和错误分类

### 依赖环境
- **业务需求**：小说创作工具的文件编辑保存需求
- **技术约束**：本地文件系统访问限制和安全要求
- **性能要求**：大文件读写性能和并发处理能力
- **安全要求**：文件路径安全性和数据完整性保护

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] **核心接口定义**：完整定义文件读取、保存、列表等核心接口
- [ ] **数据格式规范**：明确文件内容、元数据、状态等核心数据结构
- [ ] **错误处理协议**：定义文件操作各种错误场景的处理规范
- [ ] **路径安全规范**：制定安全的文件路径访问和验证机制
- [ ] **接口文档完整**：提供清晰的API文档和使用示例

### 优秀标准 (Should Have)
- [ ] **双重保存协议**：定义手动保存和自动保存的完整协议
- [ ] **文件状态管理**：建立文件读写状态、锁定状态的管理机制
- [ ] **版本冲突处理**：定义文件并发编辑和冲突处理协议
- [ ] **性能优化规范**：大文件分块读写和缓存策略协议
- [ ] **批量操作支持**：支持批量文件操作的接口设计

### 卓越标准 (Nice to Have)
- [ ] **文件监控协议**：定义文件变更监控和实时同步机制
- [ ] **备份恢复协议**：文件备份和恢复操作的接口设计
- [ ] **权限控制规范**：文件访问权限和安全控制协议
- [ ] **扩展性设计**：为未来功能扩展预留的接口设计空间
- [ ] **监控日志规范**：文件操作监控和审计日志规范

### 协作标准
- [ ] **前后端接口对接成功**：接口规范能够指导前后端成功对接
- [ ] **数据流转正常**：定义的数据格式能够正确传递和解析
- [ ] **错误处理协调一致**：前后端错误处理逻辑一致
- [ ] **安全性保障**：文件操作安全机制前后端协调一致

## 具体任务分解

### Task 3.1.1: 核心文件操作接口设计 (3-4小时)
- 设计文件读取接口（GET /api/files/read）
- 设计文件保存接口（POST /api/files/save）
- 设计文件列表接口（GET /api/files/list）
- 设计文件元数据接口（GET /api/files/metadata）

### Task 3.1.2: 数据模型和格式规范 (2-3小时)
- 定义File文件数据模型和字段规范
- 定义FileContent文件内容数据格式
- 定义FileMetadata文件元数据结构
- 制定统一的API响应格式规范

### Task 3.1.3: 错误处理和安全协议 (2-3小时)
- 设计HTTP状态码使用规范
- 定义文件操作错误码分类和错误信息格式
- 制定文件路径安全验证和访问控制协议
- 设计文件冲突和并发访问处理机制

### Task 3.1.4: 保存机制和状态管理协议 (2-3小时)
- 定义手动保存和自动保存的触发协议
- 设计文件保存状态跟踪和反馈机制
- 制定文件锁定和解锁的状态管理协议
- 设计保存失败恢复和重试机制

### Task 3.1.5: 接口文档和示例编写 (2小时)
- 编写完整的API接口文档
- 提供详细的请求/响应示例
- 创建常见使用场景的代码示例
- 制定接口变更和版本管理规范

## 接口设计规范

### 1. 文件读取接口

#### 接口定义
```
GET /api/files/read
```

#### 请求参数
```typescript
interface ReadFileRequest {
  path: string;                       // 必填：文件相对路径
  encoding?: string;                  // 可选：文件编码，默认'utf-8'
  range?: {                           // 可选：分块读取
    start: number;
    end: number;
  };
}
```

#### 响应格式
```typescript
// 成功响应
interface ReadFileResponse {
  success: true;
  data: {
    content: string;                  // 文件内容
    path: string;                     // 文件路径
    encoding: string;                 // 文件编码
    metadata: {
      size: number;                   // 文件大小（字节）
      lastModified: string;           // 最后修改时间（ISO格式）
      created: string;                // 创建时间
      isDirectory: boolean;           // 是否为目录
      permissions: string;            // 文件权限
    };
  };
}

// 错误响应
interface FileErrorResponse {
  success: false;
  error: {
    code: string;                     // 错误码
    message: string;                  // 错误描述
    path?: string;                    // 相关文件路径
    details?: any;                    // 错误详细信息
  };
}
```

### 2. 文件保存接口

#### 接口定义
```
POST /api/files/save
```

#### 请求格式
```typescript
interface SaveFileRequest {
  path: string;                       // 必填：文件路径
  content: string;                    // 必填：文件内容
  encoding?: string;                  // 可选：编码格式，默认'utf-8'
  options?: {
    createDir?: boolean;              // 自动创建目录
    backup?: boolean;                 // 创建备份文件
    atomic?: boolean;                 // 原子写入（临时文件+重命名）
  };
  metadata?: {                        // 可选：元数据
    lastModified?: string;            // 客户端最后修改时间
    checksum?: string;                // 内容校验和
  };
}
```

#### 响应格式
```typescript
// 成功响应
interface SaveFileResponse {
  success: true;
  data: {
    path: string;                     // 保存的文件路径
    size: number;                     // 文件大小
    lastModified: string;             // 服务器端最后修改时间
    checksum: string;                 // 内容校验和
    backup?: string;                  // 备份文件路径（如果创建了备份）
  };
}
```

### 3. 文件列表接口

#### 接口定义
```
GET /api/files/list
```

#### 请求参数
```typescript
interface ListFilesRequest {
  path?: string;                      // 可选：目录路径，默认根目录
  recursive?: boolean;                // 可选：递归列出子目录
  filter?: {                          // 可选：过滤条件
    extension?: string[];             // 文件扩展名过滤
    pattern?: string;                 // 文件名模式匹配
    type?: 'file' | 'directory' | 'all'; // 类型过滤
  };
}
```

#### 响应格式
```typescript
interface ListFilesResponse {
  success: true;
  data: {
    path: string;                     // 当前路径
    items: FileItem[];                // 文件列表
    total: number;                    // 文件总数
  };
}

interface FileItem {
  name: string;                       // 文件名
  path: string;                       // 完整路径
  type: 'file' | 'directory';        // 类型
  size: number;                       // 大小
  lastModified: string;               // 最后修改时间
  extension?: string;                 // 文件扩展名
  isHidden: boolean;                  // 是否为隐藏文件
}
```

### 4. 错误码体系

```typescript
const FILE_ERROR_CODES = {
  // 路径相关错误 (4001-4099)
  INVALID_PATH: 'INVALID_PATH',               // 无效路径
  PATH_NOT_FOUND: 'PATH_NOT_FOUND',           // 路径不存在
  PATH_ACCESS_DENIED: 'PATH_ACCESS_DENIED',   // 路径访问被拒绝
  PATH_OUTSIDE_ROOT: 'PATH_OUTSIDE_ROOT',     // 路径超出根目录范围
  
  // 文件操作错误 (4101-4199)
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',           // 文件不存在
  FILE_ACCESS_DENIED: 'FILE_ACCESS_DENIED',   // 文件访问被拒绝
  FILE_ALREADY_EXISTS: 'FILE_ALREADY_EXISTS', // 文件已存在
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',           // 文件过大
  FILE_READ_ERROR: 'FILE_READ_ERROR',         // 文件读取错误
  FILE_WRITE_ERROR: 'FILE_WRITE_ERROR',       // 文件写入错误
  FILE_LOCKED: 'FILE_LOCKED',                 // 文件被锁定
  
  // 内容相关错误 (4201-4299)
  INVALID_ENCODING: 'INVALID_ENCODING',       // 无效编码
  CONTENT_TOO_LARGE: 'CONTENT_TOO_LARGE',     // 内容过大
  CONTENT_CHECKSUM_MISMATCH: 'CONTENT_CHECKSUM_MISMATCH', // 校验和不匹配
  
  // 系统错误 (5xxx)
  DISK_SPACE_INSUFFICIENT: 'DISK_SPACE_INSUFFICIENT', // 磁盘空间不足
  SYSTEM_IO_ERROR: 'SYSTEM_IO_ERROR',         // 系统IO错误
  PERMISSION_DENIED: 'PERMISSION_DENIED'      // 权限不足
};
```

### 5. 文件路径安全规范

```typescript
// 路径安全验证规则
const PATH_SECURITY_RULES = {
  // 允许的路径模式
  ALLOWED_PATTERNS: [
    /^[0-9]-小说设定\/.*\.md$/,
    /^[0-9]-故事大纲\/.*\.md$/,
    /^[0-9]-故事概要\/.*\.md$/,
    /^[0-9]-小说内容\/.*\.md$/
  ],
  
  // 禁止的路径字符
  FORBIDDEN_CHARS: ['..', '\\', '<', '>', '|', '*', '?'],
  
  // 路径长度限制
  MAX_PATH_LENGTH: 260,
  
  // 文件名长度限制  
  MAX_FILENAME_LENGTH: 100
};

// 路径验证函数示例
function validateFilePath(path: string): { valid: boolean; error?: string } {
  // 检查路径长度
  if (path.length > PATH_SECURITY_RULES.MAX_PATH_LENGTH) {
    return { valid: false, error: '路径过长' };
  }
  
  // 检查禁止字符
  for (const char of PATH_SECURITY_RULES.FORBIDDEN_CHARS) {
    if (path.includes(char)) {
      return { valid: false, error: `路径包含非法字符: ${char}` };
    }
  }
  
  // 检查路径模式
  const isAllowed = PATH_SECURITY_RULES.ALLOWED_PATTERNS.some(
    pattern => pattern.test(path)
  );
  
  if (!isAllowed) {
    return { valid: false, error: '路径不符合项目目录结构规范' };
  }
  
  return { valid: true };
}
```

## 双重保存机制协议

### 自动保存协议
```typescript
// 自动保存触发条件
const AUTO_SAVE_CONFIG = {
  INTERVAL: 30000,                    // 30秒间隔
  MIN_CHANGES: 10,                    // 最小变更字符数
  DEBOUNCE_DELAY: 2000,               // 防抖延迟2秒
  MAX_RETRIES: 3                      // 最大重试次数
};

// 自动保存状态管理
interface AutoSaveState {
  enabled: boolean;                   // 是否启用自动保存
  lastSaveTime: number;               // 上次保存时间戳
  pendingChanges: boolean;            // 是否有待保存的更改
  saveInProgress: boolean;            // 是否正在保存中
  errorCount: number;                 // 连续错误次数
}
```

### 手动保存协议
```typescript
// 手动保存触发方式
const MANUAL_SAVE_TRIGGERS = {
  KEYBOARD_SHORTCUT: 'Ctrl+S',        // 快捷键
  BUTTON_CLICK: 'save-button',        // 保存按钮
  TAB_SWITCH: 'tab-blur',             // 切换标签页时
  WINDOW_BEFOREUNLOAD: 'window-unload' // 窗口关闭前
};

// 保存冲突处理策略
enum ConflictResolution {
  OVERWRITE = 'overwrite',            // 覆盖服务器版本
  MERGE = 'merge',                    // 尝试合并
  CREATE_BACKUP = 'create_backup',    // 创建备份文件
  ASK_USER = 'ask_user'               // 询问用户选择
}
```

## 前端集成指导

### 文件操作API客户端
```typescript
// 文件操作API客户端类
class FileAPI {
  private baseURL = '/api/files';

  async readFile(path: string, options?: ReadFileOptions): Promise<FileContent> {
    const params = new URLSearchParams({ path, ...options });
    const response = await fetch(`${this.baseURL}/read?${params}`);
    
    if (!response.ok) {
      throw new FileError(await response.json());
    }
    
    return response.json();
  }

  async saveFile(path: string, content: string, options?: SaveFileOptions): Promise<SaveResult> {
    const response = await fetch(`${this.baseURL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content, ...options })
    });
    
    if (!response.ok) {
      throw new FileError(await response.json());
    }
    
    return response.json();
  }

  async listFiles(path?: string, options?: ListFilesOptions): Promise<FileList> {
    const params = new URLSearchParams({ path: path || '', ...options });
    const response = await fetch(`${this.baseURL}/list?${params}`);
    
    if (!response.ok) {
      throw new FileError(await response.json());
    }
    
    return response.json();
  }
}

// 文件错误处理类
class FileError extends Error {
  code: string;
  path?: string;
  details?: any;

  constructor(errorResponse: FileErrorResponse) {
    super(errorResponse.error.message);
    this.name = 'FileError';
    this.code = errorResponse.error.code;
    this.path = errorResponse.error.path;
    this.details = errorResponse.error.details;
  }
}
```

## 后端实现指导

### 文件操作路由示例
```javascript
// routes/files.js
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const FileService = require('../services/file-service');

const router = express.Router();

// 文件读取路由
router.get('/read', async (req, res, next) => {
  try {
    const { path: filePath, encoding = 'utf-8', range } = req.query;
    
    // 路径安全验证
    const validation = FileService.validatePath(filePath);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PATH',
          message: validation.error,
          path: filePath
        }
      });
    }
    
    // 读取文件
    const result = await FileService.readFile(filePath, { encoding, range });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 文件保存路由
router.post('/save', async (req, res, next) => {
  try {
    const { path: filePath, content, encoding, options } = req.body;
    
    // 请求验证
    if (!filePath || content === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '文件路径和内容不能为空'
        }
      });
    }
    
    // 保存文件
    const result = await FileService.saveFile(filePath, content, { encoding, ...options });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

## 验收标准
1. **接口规范完整性**：所有需要的文件操作接口都有明确定义
2. **文档清晰性**：前后端开发人员能够根据文档独立开发
3. **安全性设计**：文件路径安全和访问控制机制完善
4. **错误处理完善性**：各种错误场景都有明确的处理协议
5. **扩展性保证**：接口设计支持未来功能扩展需求