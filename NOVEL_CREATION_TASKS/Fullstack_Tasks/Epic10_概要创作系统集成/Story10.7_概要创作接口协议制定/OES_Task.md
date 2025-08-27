# Story 10.7: 概要创作接口协议制定

## O (Objective)

### 功能目标
- 制定前后端概要创作数据交换的标准协议
- 建立完整的API接口规范和数据模型定义
- 确保前后端开发团队的协作一致性

### 技术目标  
- 定义RESTful API接口标准和规范
- 建立TypeScript类型定义和数据契约
- 制定错误处理和状态管理协议

## E (Environment)

### 技术环境
- 前端：React + TypeScript + Axios
- 后端：Node.js + Express + TypeScript
- 数据交换：JSON格式 + RESTful API
- 文档：OpenAPI 3.0规范

### 依赖环境
- Frontend Story 10.1-10.3：前端组件接口需求已明确
- Backend Story 10.4-10.6：后端服务功能已设计完成
- 通用的API设计规范和错误处理标准已建立
- TypeScript类型系统作为契约保障机制

## S (Success Criteria)

### 及格标准 (Must Have)
- ✅ 完整的API接口规范文档和示例
- ✅ 标准化的数据模型和类型定义
- ✅ 明确的错误处理和状态码规范
- ✅ 前后端开发可以基于协议并行开发

### 优秀标准 (Should Have)  
- ✅ 详细的接口测试用例和Mock数据
- ✅ 完善的版本管理和兼容性策略
- ✅ 自动化的API文档生成和更新
- ✅ 性能监控和调用统计规范

### 卓越标准 (Nice to Have)
- ✅ 实时API变更通知和协作机制
- ✅ 多环境配置和灰度发布支持
- ✅ API安全认证和权限控制规范
- ✅ 国际化和多语言支持协议

## 具体任务分解

### Task 10.7.1: 核心数据模型定义

```typescript
// 共享的TypeScript类型定义文件
// types/summary-creation.types.ts

// 基础数据模型
export interface ProjectContext {
  projectId: string;
  projectName: string;
  version: string;
  lastUpdated: string;
  settings?: ProjectSettings;
}

export interface OutlineData {
  id: string;
  version: string;
  themeAnalysis: ThemeAnalysisResult;
  backgroundMatch: BackgroundOption;
  eventsStructure: EventsStructure;
  valueRefinement: ValueResult;
  lastModified: string;
}

export interface LogicFramework {
  id: string;
  version: string;
  steps: LogicStep[];
  coherenceAnalysis?: CoherenceAnalysis;
  qualityMetrics?: QualityMetrics;
  lastModified: string;
}

export interface LogicStep {
  id: number; // 1-6
  title: string;
  description: string;
  content: string;
  reasoning?: string;
  keyElements: StepElement[];
  status: 'draft' | 'completed' | 'validated';
  guidance?: AIGuidance;
}

export interface StepElement {
  type: 'who' | 'when' | 'where' | 'what' | 'why' | 'how';
  value: string;
  confidence: number; // 0-1
}

export interface SummaryContent {
  id: string;
  version: string;
  template?: SummaryTemplate;
  elements: FourElementsData;
  generated: boolean;
  quality?: QualityReport;
  lastModified: string;
}

export interface FourElementsData {
  characters?: ElementData;
  environment?: ElementData;
  events?: ElementData;
  theme?: ElementData;
}

export interface ElementData {
  content: string;
  tags: string[];
  references: Reference[];
  confidence: number;
  lastUpdated: string;
}

// API请求/响应模型
export interface SummaryGenerationRequest {
  projectContext: ProjectContext;
  outlineData: OutlineData;
  logicFramework: LogicFramework;
  preferences: SummaryPreferences;
  mode: 'structured' | 'narrative' | 'hybrid';
}

export interface SummaryGenerationResponse {
  success: boolean;
  data?: {
    summary: SummaryContent;
    analysis: SourceAnalysis;
    qualityMetrics: QualityMetrics;
    suggestions: CreativeSuggestions;
  };
  error?: APIError;
  metadata: ResponseMetadata;
}

// 一致性检查模型
export interface ConsistencyCheckRequest {
  outlineData: OutlineData;
  summaryData: SummaryContent;
  checkMode: 'basic' | 'comprehensive' | 'deep';
  options?: ConsistencyCheckOptions;
}

export interface ConsistencyCheckResponse {
  success: boolean;
  data?: {
    overallScore: number;
    dimensionScores: Record<string, number>;
    differences: CategorizedDifference[];
    repairSuggestions: RepairSuggestion[];
    visualization: DifferenceVisualization;
  };
  error?: APIError;
  metadata: ResponseMetadata;
}

// 验证相关模型
export interface ValidationRequest {
  framework: LogicFramework;
  options?: ValidationOptions;
}

export interface ValidationResponse {
  success: boolean;
  data?: {
    overallScore: number;
    passed: boolean;
    sessionResults: ValidationSessionResult[];
    criticalIssues: CriticalIssue[];
    recommendations: Recommendation[];
    detailedReport: DetailedValidationReport;
  };
  error?: APIError;
  metadata: ResponseMetadata;
}

// 通用模型
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId: string;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  duration: number;
  version: string;
  debugInfo?: Record<string, any>;
}
```

### Task 10.7.2: RESTful API接口规范

```yaml
# openapi.yaml - API接口规范文档
openapi: 3.0.0
info:
  title: 概要创作系统API
  version: 1.0.0
  description: 规划师角色概要创作的完整API接口规范
  contact:
    name: 开发团队
    email: dev@example.com

servers:
  - url: http://localhost:3000/api
    description: 本地开发环境
  - url: https://api-dev.example.com
    description: 开发环境
  - url: https://api.example.com
    description: 生产环境

paths:
  # 6步逻辑骨架相关接口
  /logic-framework/generate:
    post:
      summary: 生成6步逻辑骨架引导
      description: 基于大纲数据生成6步逻辑骨架的引导内容
      tags: [LogicFramework]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LogicFrameworkGenerationRequest'
      responses:
        '200':
          description: 成功生成逻辑骨架引导
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LogicFrameworkResponse'
        '400':
          description: 请求参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /logic-framework/validate:
    post:
      summary: 验证6步逻辑骨架
      description: 对构建的6步逻辑骨架进行完整性和逻辑性验证
      tags: [LogicFramework]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ValidationRequest'
      responses:
        '200':
          description: 验证完成
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationResponse'

  /logic-framework/optimize:
    post:
      summary: 优化逻辑骨架
      description: 基于验证结果优化和改进逻辑骨架
      tags: [LogicFramework]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OptimizationRequest'
      responses:
        '200':
          description: 优化完成
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OptimizationResponse'

  # 概要创作相关接口
  /summary/generate:
    post:
      summary: 生成故事概要
      description: 基于6步逻辑骨架和大纲数据生成详细的故事概要
      tags: [SummaryCreation]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SummaryGenerationRequest'
      responses:
        '200':
          description: 概要生成成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SummaryGenerationResponse'
        '400':
          description: 请求参数错误
        '500':
          description: 服务器内部错误

  /summary/templates:
    get:
      summary: 获取概要模板列表
      description: 获取可用的概要模板和预设配置
      tags: [SummaryCreation]
      parameters:
        - name: category
          in: query
          description: 模板分类筛选
          schema:
            type: string
            enum: [classic, modern, fantasy, scifi]
      responses:
        '200':
          description: 模板列表获取成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TemplateListResponse'

    post:
      summary: 创建自定义模板
      description: 创建新的概要模板配置
      tags: [SummaryCreation]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TemplateCreationRequest'
      responses:
        '201':
          description: 模板创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TemplateResponse'

  # 一致性检查相关接口
  /consistency/check:
    post:
      summary: 执行一致性检查
      description: 检查概要与大纲之间的一致性
      tags: [ConsistencyCheck]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ConsistencyCheckRequest'
      responses:
        '200':
          description: 一致性检查完成
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ConsistencyCheckResponse'

  /consistency/repair:
    post:
      summary: 执行一致性修复
      description: 根据修复建议执行自动或半自动修复
      tags: [ConsistencyCheck]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RepairExecutionRequest'
      responses:
        '200':
          description: 修复执行完成
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RepairExecutionResponse'

  # 质量评估接口
  /quality/assess:
    post:
      summary: 概要质量评估
      description: 对生成的概要进行多维度质量评估
      tags: [QualityAssessment]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/QualityAssessmentRequest'
      responses:
        '200':
          description: 质量评估完成
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QualityAssessmentResponse'

components:
  schemas:
    # 在这里定义所有的数据模型
    LogicFrameworkGenerationRequest:
      type: object
      required:
        - outlineData
        - projectContext
      properties:
        outlineData:
          $ref: '#/components/schemas/OutlineData'
        projectContext:
          $ref: '#/components/schemas/ProjectContext'
        preferences:
          $ref: '#/components/schemas/GenerationPreferences'

    # 其他schema定义...
    ErrorResponse:
      type: object
      required:
        - success
        - error
      properties:
        success:
          type: boolean
          example: false
        error:
          $ref: '#/components/schemas/APIError'
        metadata:
          $ref: '#/components/schemas/ResponseMetadata'

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []

tags:
  - name: LogicFramework
    description: 6步逻辑骨架相关操作
  - name: SummaryCreation  
    description: 概要创作相关操作
  - name: ConsistencyCheck
    description: 一致性检查相关操作
  - name: QualityAssessment
    description: 质量评估相关操作
```

### Task 10.7.3: 前端API客户端封装

```typescript
// services/api-client.ts - 前端API客户端封装
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  SummaryGenerationRequest,
  SummaryGenerationResponse,
  ConsistencyCheckRequest,
  ConsistencyCheckResponse,
  ValidationRequest,
  ValidationResponse,
  LogicFramework,
  SummaryContent,
  APIError
} from '../types/summary-creation.types';

// API客户端基类
class APIClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加请求ID用于追踪
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        // 添加认证token
        const token = localStorage.getItem('auth-token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 处理认证过期
          this.handleAuthExpired();
        }
        
        return Promise.reject(this.formatError(error));
      }
    );
  }
  
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private formatError(error: any): APIError {
    return {
      code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
      message: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error?.details,
      timestamp: new Date().toISOString(),
      requestId: error.config?.headers['X-Request-ID'] || ''
    };
  }
  
  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    config?: any
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.request({
      method,
      url: endpoint,
      data,
      ...config
    });
    
    return response.data;
  }
}

// 概要创作API客户端
export class SummaryCreationAPI extends APIClient {
  constructor(baseURL: string = '/api') {
    super(baseURL);
  }
  
  // 6步逻辑骨架相关接口
  async generateLogicFramework(outlineData: any, preferences?: any): Promise<LogicFramework> {
    return this.request<LogicFramework>('POST', '/logic-framework/generate', {
      outlineData,
      preferences
    });
  }
  
  async validateLogicFramework(request: ValidationRequest): Promise<ValidationResponse> {
    return this.request<ValidationResponse>('POST', '/logic-framework/validate', request);
  }
  
  async optimizeLogicFramework(framework: LogicFramework, suggestions?: any): Promise<LogicFramework> {
    return this.request<LogicFramework>('POST', '/logic-framework/optimize', {
      framework,
      suggestions
    });
  }
  
  // 概要创作相关接口
  async generateSummary(request: SummaryGenerationRequest): Promise<SummaryGenerationResponse> {
    return this.request<SummaryGenerationResponse>('POST', '/summary/generate', request);
  }
  
  async getSummaryTemplates(category?: string): Promise<any> {
    const params = category ? { category } : {};
    return this.request<any>('GET', '/summary/templates', undefined, { params });
  }
  
  async createSummaryTemplate(template: any): Promise<any> {
    return this.request<any>('POST', '/summary/templates', template);
  }
  
  // 一致性检查相关接口
  async checkConsistency(request: ConsistencyCheckRequest): Promise<ConsistencyCheckResponse> {
    return this.request<ConsistencyCheckResponse>('POST', '/consistency/check', request);
  }
  
  async executeRepair(repairPlan: any): Promise<any> {
    return this.request<any>('POST', '/consistency/repair', repairPlan);
  }
  
  // 质量评估接口
  async assessQuality(summary: SummaryContent): Promise<any> {
    return this.request<any>('POST', '/quality/assess', { summary });
  }
  
  // 批量操作接口
  async batchValidate(frameworks: LogicFramework[]): Promise<ValidationResponse[]> {
    return this.request<ValidationResponse[]>('POST', '/logic-framework/batch-validate', {
      frameworks
    });
  }
  
  async batchConsistencyCheck(requests: ConsistencyCheckRequest[]): Promise<ConsistencyCheckResponse[]> {
    return this.request<ConsistencyCheckResponse[]>('POST', '/consistency/batch-check', {
      requests
    });
  }
}

// React Hook封装
export const useSummaryCreationAPI = () => {
  const api = new SummaryCreationAPI();
  
  return {
    // 基础操作
    generateLogicFramework: api.generateLogicFramework.bind(api),
    validateLogicFramework: api.validateLogicFramework.bind(api),
    generateSummary: api.generateSummary.bind(api),
    checkConsistency: api.checkConsistency.bind(api),
    
    // 模板操作
    getSummaryTemplates: api.getSummaryTemplates.bind(api),
    createSummaryTemplate: api.createSummaryTemplate.bind(api),
    
    // 质量评估
    assessQuality: api.assessQuality.bind(api),
    
    // 批量操作
    batchValidate: api.batchValidate.bind(api),
    batchConsistencyCheck: api.batchConsistencyCheck.bind(api)
  };
};
```

### Task 10.7.4: 错误处理和状态管理协议

```typescript
// protocols/error-handling.protocol.ts
export interface APIErrorProtocol {
  // 错误分类
  categories: {
    CLIENT_ERROR: '客户端错误';
    SERVER_ERROR: '服务器错误';  
    BUSINESS_ERROR: '业务逻辑错误';
    VALIDATION_ERROR: '数据验证错误';
    AUTHENTICATION_ERROR: '认证错误';
    AUTHORIZATION_ERROR: '授权错误';
    RATE_LIMIT_ERROR: '频率限制错误';
    TIMEOUT_ERROR: '请求超时错误';
  };
  
  // 标准错误码
  errorCodes: {
    // 通用错误 (1000-1999)
    UNKNOWN_ERROR: 1000;
    INVALID_REQUEST: 1001;
    MISSING_PARAMETER: 1002;
    INVALID_PARAMETER: 1003;
    
    // 认证相关 (2000-2999) 
    INVALID_TOKEN: 2001;
    TOKEN_EXPIRED: 2002;
    INSUFFICIENT_PERMISSIONS: 2003;
    
    // 业务逻辑 (3000-3999)
    OUTLINE_DATA_MISSING: 3001;
    LOGIC_FRAMEWORK_INVALID: 3002;
    SUMMARY_GENERATION_FAILED: 3003;
    CONSISTENCY_CHECK_FAILED: 3004;
    VALIDATION_FAILED: 3005;
    
    // 服务器错误 (5000-5999)
    INTERNAL_SERVER_ERROR: 5000;
    DATABASE_ERROR: 5001;
    EXTERNAL_API_ERROR: 5002;
    AI_SERVICE_UNAVAILABLE: 5003;
  };
  
  // 错误响应格式
  errorResponseFormat: {
    success: false;
    error: {
      code: string;
      message: string;
      details?: Record<string, any>;
      timestamp: string;
      requestId: string;
      stack?: string; // 仅开发环境
    };
    metadata: ResponseMetadata;
  };
}

// protocols/state-management.protocol.ts
export interface StateManagementProtocol {
  // 前端状态管理规范
  frontend: {
    // Zustand Store结构
    storeStructure: {
      // 逻辑骨架状态
      logicFramework: {
        current?: LogicFramework;
        validation?: ValidationResult;
        isGenerating: boolean;
        isValidating: boolean;
        error?: APIError;
      };
      
      // 概要创作状态
      summaryCreation: {
        current?: SummaryContent;
        templates: SummaryTemplate[];
        isGenerating: boolean;
        qualityReport?: QualityReport;
        error?: APIError;
      };
      
      // 一致性检查状态
      consistencyCheck: {
        lastResult?: ConsistencyResult;
        isChecking: boolean;
        differences: CategorizedDifference[];
        repairSuggestions: RepairSuggestion[];
        error?: APIError;
      };
      
      // UI状态
      ui: {
        currentStep: number;
        activeTab: string;
        isLoading: boolean;
        notifications: Notification[];
      };
    };
    
    // 状态更新规范
    stateUpdateRules: {
      // 异步操作状态管理
      asyncOperations: {
        start: (operationType: string) => void;
        success: (operationType: string, data: any) => void;
        failure: (operationType: string, error: APIError) => void;
        reset: (operationType: string) => void;
      };
      
      // 乐观更新策略
      optimisticUpdates: {
        enabled: boolean;
        rollbackOnError: boolean;
        maxRetries: number;
      };
    };
  };
  
  // 后端状态管理规范
  backend: {
    // 会话状态管理
    sessionState: {
      structure: {
        sessionId: string;
        userId: string;
        projectId: string;
        currentOperation?: string;
        operationStartTime?: string;
        cache: Record<string, any>;
      };
      
      // 会话生命周期
      lifecycle: {
        create: (userId: string, projectId: string) => string;
        update: (sessionId: string, data: any) => void;
        destroy: (sessionId: string) => void;
        cleanup: (olderThan: Date) => void;
      };
    };
    
    // 缓存策略
    caching: {
      // 缓存层级
      levels: {
        memory: 'Redis内存缓存';
        disk: '文件系统缓存';
        database: '数据库缓存';
      };
      
      // 缓存键命名规范
      keyNaming: {
        pattern: 'namespace:type:identifier:version';
        examples: {
          logicFramework: 'lf:validation:project123:v1.0';
          summaryGeneration: 'sg:result:outline456:v2.1';
          consistencyCheck: 'cc:report:summary789:v1.5';
        };
      };
      
      // 过期策略
      expiration: {
        logicFramework: '30 minutes';
        summaryGeneration: '1 hour';
        consistencyCheck: '15 minutes';
        qualityAssessment: '45 minutes';
      };
    };
  };
}

// protocols/api-versioning.protocol.ts
export interface APIVersioningProtocol {
  // 版本策略
  versioningStrategy: 'URL_PATH' | 'HEADER' | 'QUERY_PARAMETER';
  
  // 版本格式
  versionFormat: {
    pattern: 'v{major}.{minor}.{patch}';
    example: 'v1.2.3';
  };
  
  // 版本兼容性
  compatibility: {
    // 向后兼容规则
    backwardCompatibility: {
      major: '不保证兼容性';
      minor: '新增功能，保持向后兼容';
      patch: '问题修复，完全兼容';
    };
    
    // 废弃策略
    deprecationPolicy: {
      notice: '至少提前3个月通知';
      support: '废弃后继续支持6个月';
      removal: '支持期结束后移除';
    };
  };
  
  // API变更日志
  changelog: {
    format: {
      version: string;
      releaseDate: string;
      changes: {
        added: string[];
        changed: string[];
        deprecated: string[];
        removed: string[];
        fixed: string[];
      };
    };
  };
}
```

## 协议验证和测试

```typescript
// tests/api-protocol.test.ts - API协议验证测试
import { SummaryCreationAPI } from '../services/api-client';
import { validateAPIResponse } from '../utils/api-validation';

describe('概要创作API协议测试', () => {
  const api = new SummaryCreationAPI();
  
  describe('数据契约验证', () => {
    test('逻辑骨架生成请求响应格式', async () => {
      const mockRequest = {
        outlineData: mockOutlineData,
        preferences: mockPreferences
      };
      
      const response = await api.generateLogicFramework(
        mockRequest.outlineData,
        mockRequest.preferences
      );
      
      expect(validateAPIResponse(response, 'LogicFrameworkResponse')).toBe(true);
      expect(response).toHaveProperty('steps');
      expect(response.steps).toHaveLength(6);
    });
    
    test('概要生成请求响应格式', async () => {
      const mockRequest = {
        projectContext: mockProjectContext,
        outlineData: mockOutlineData,
        logicFramework: mockLogicFramework,
        preferences: mockSummaryPreferences,
        mode: 'structured' as const
      };
      
      const response = await api.generateSummary(mockRequest);
      
      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('summary');
      expect(response.data).toHaveProperty('qualityMetrics');
      expect(response.metadata).toHaveProperty('requestId');
    });
    
    test('错误响应格式标准化', async () => {
      try {
        await api.generateLogicFramework(null as any);
      } catch (error) {
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('timestamp');
        expect(error).toHaveProperty('requestId');
      }
    });
  });
  
  describe('API版本兼容性测试', () => {
    test('v1.0 API向后兼容性', async () => {
      // 测试旧版本请求格式仍然可用
      const legacyRequest = {
        outline: mockOutlineData, // 旧字段名
        logic: mockLogicFramework  // 旧字段名
      };
      
      // 应该能够正常处理或给出明确的兼容性提示
      expect(() => {
        validateLegacyRequestFormat(legacyRequest);
      }).not.toThrow();
    });
  });
});
```

---

**注意**: 此接口协议文档需要与前后端团队共同review和确认，确保所有数据结构和接口定义准确无误，支持并行开发。