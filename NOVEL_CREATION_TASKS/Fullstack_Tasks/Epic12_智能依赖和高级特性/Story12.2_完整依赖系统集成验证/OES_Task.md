# Story 12.2: 完整依赖系统集成验证

## O (Objective)

### 功能目标
- 验证端到端依赖识别和引导流程的完整性
- 确保前后端协作的依赖系统无缝集成
- 测试整体用户体验的流畅性和准确性

### 技术目标  
- 系统集成测试覆盖率达到95%
- 端到端流程响应时间<500ms
- 99%的依赖识别准确率

### 协作目标
- 前后端数据流转完全正确
- API接口对接稳定可靠
- 用户体验达到产品设计预期

## E (Environment)

### 协作环境
- **前端**: React依赖提示UI + 用户体验增强组件
- **后端**: 依赖识别算法引擎 + 缓存优化系统
- **协作点**: 依赖检查API、实时状态更新、用户引导流程

### 测试环境
- 自动化测试框架 (Jest + Cypress)
- 性能测试工具 (Lighthouse + WebPageTest)
- API测试工具 (Postman + Newman)
- 用户体验测试环境

### 依赖环境
- 完整的4角色AI系统
- 文件操作和编辑功能
- 项目导入和管理系统
- PromptX MCP集成服务

## S (Success Criteria)

### 及格标准 (Must Have)
- **功能完整性**：所有依赖识别和引导功能正常工作
- **数据一致性**：前后端数据状态完全同步
- **错误处理**：异常情况能优雅降级并给出有用提示

### 优秀标准 (Should Have)  
- **性能达标**：所有性能指标达到设计要求
- **用户体验优秀**：用户测试反馈积极，流程顺畅
- **稳定性高**：压力测试下系统稳定运行

### 协作标准
- **接口稳定**：API接口对接无问题，数据格式完全兼容
- **实时同步**：依赖状态变更能实时反映到UI界面
- **端到端流畅**：完整业务流程用户体验流畅自然

## 前后端协作任务分解

### Task 12.2.1: 端到端功能集成测试

**完整业务流程测试套件**：
```typescript
// tests/integration/dependency-flow.test.ts
describe('依赖系统端到端流程测试', () => {
  let testProject: TestProject;
  let browser: Browser;
  let page: Page;
  
  beforeAll(async () => {
    // 准备测试环境
    testProject = await createTestProject();
    browser = await chromium.launch();
    page = await browser.newPage();
    
    // 启动测试服务器
    await startTestServer();
  });

  describe('新项目创建依赖流程', () => {
    it('应该正确检测空项目的依赖状态', async () => {
      // 1. 导入空项目
      await page.goto('/');
      await importProject(page, testProject.emptyProjectPath);
      
      // 2. 尝试直接创建内容文件
      await page.click('[data-testid="create-content"]');
      
      // 3. 验证依赖提示出现
      const dependencyAlert = await page.waitForSelector('[data-testid="dependency-alert"]');
      expect(dependencyAlert).toBeTruthy();
      
      // 4. 验证提示内容正确
      const alertText = await dependencyAlert.textContent();
      expect(alertText).toContain('建议先完成前置依赖');
      
      // 5. 验证推荐的创作顺序
      const recommendations = await page.$$('[data-testid="dependency-recommendation"]');
      expect(recommendations).toHaveLength(3); // 设定、大纲、概要
      
      // 6. 测试点击推荐项能正确导航
      await recommendations[0].click();
      await page.waitForSelector('[data-testid="setting-editor"]');
      expect(await page.url()).toContain('setting');
    });

    it('应该支持依赖后置创作模式', async () => {
      // 1. 选择继续创作而非完成依赖
      await page.click('[data-testid="continue-anyway"]');
      
      // 2. 验证进入内容编辑器
      await page.waitForSelector('[data-testid="content-editor"]');
      
      // 3. 验证依赖状态标记
      const dependencyStatus = await page.$('[data-testid="dependency-status"]');
      expect(await dependencyStatus.textContent()).toContain('草稿');
      
      // 4. 创建一些内容
      await page.fill('[data-testid="content-input"]', '这是测试内容');
      await page.click('[data-testid="save-button"]');
      
      // 5. 验证保存成功
      await page.waitForSelector('[data-testid="save-success"]');
    });
  });

  describe('智能依赖识别流程', () => {
    it('应该准确识别部分完成的依赖', async () => {
      // 1. 创建部分设定内容
      await createPartialSetting(testProject);
      
      // 2. 尝试创建大纲
      await page.goto('/outline');
      
      // 3. 验证部分依赖检测
      const dependencyCheck = await page.waitForSelector('[data-testid="dependency-check"]');
      const status = await dependencyCheck.getAttribute('data-status');
      expect(status).toBe('partial');
      
      // 4. 验证具体缺失提示
      const missingItems = await page.$$('[data-testid="missing-dependency-item"]');
      expect(missingItems.length).toBeGreaterThan(0);
      
      // 5. 测试补全依赖功能
      await page.click('[data-testid="complete-dependency"]');
      await page.waitForNavigation();
      expect(await page.url()).toContain('setting');
    });

    it('应该正确处理循环依赖情况', async () => {
      // 1. 模拟创建循环依赖的内容
      await createCircularDependencyScenario(testProject);
      
      // 2. 触发依赖检查
      await page.goto('/summary');
      
      // 3. 验证循环依赖检测
      await page.waitForSelector('[data-testid="circular-dependency-warning"]');
      
      // 4. 验证提供解决方案
      const solutions = await page.$$('[data-testid="dependency-solution"]');
      expect(solutions.length).toBeGreaterThan(0);
    });
  });

  describe('实时依赖状态同步', () => {
    it('应该实时更新依赖状态', async () => {
      // 1. 打开两个相关文件的页面
      const page1 = await browser.newPage();
      const page2 = await browser.newPage();
      
      await page1.goto('/setting');
      await page2.goto('/outline');
      
      // 2. 在设定页面完成内容
      await page1.fill('[data-testid="world-setting-input"]', '完整的世界设定内容');
      await page1.click('[data-testid="save-button"]');
      
      // 3. 验证大纲页面依赖状态自动更新
      await page2.waitForFunction(() => {
        const status = document.querySelector('[data-testid="dependency-status"]');
        return status?.getAttribute('data-status') === 'satisfied';
      });
      
      // 4. 验证UI视觉反馈更新
      const dependencyIndicator = await page2.$('[data-testid="dependency-indicator"]');
      const indicatorClass = await dependencyIndicator.getAttribute('class');
      expect(indicatorClass).toContain('status-satisfied');
    });
  });
});
```

### Task 12.2.2: 性能和稳定性压力测试

**系统性能基准测试**：
```typescript
// tests/performance/dependency-performance.test.ts
describe('依赖系统性能测试', () => {
  
  describe('响应时间基准测试', () => {
    it('单文件依赖检查应在100ms内完成', async () => {
      const startTime = performance.now();
      
      const response = await fetch('/api/dependencies/content/test-file.md');
      const result = await response.json();
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(100);
      expect(result.dependencies).toBeDefined();
    });

    it('大项目全量检查应在2s内完成', async () => {
      // 创建包含100个文件的大项目
      const largeProject = await createLargeTestProject(100);
      
      const startTime = performance.now();
      
      const response = await fetch('/api/dependencies/project/status', {
        method: 'POST',
        body: JSON.stringify({ projectPath: largeProject.path })
      });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('缓存机制应显著提升重复查询性能', async () => {
      const testFile = 'performance-test.md';
      
      // 首次查询（无缓存）
      const firstCallStart = performance.now();
      await fetch(`/api/dependencies/content/${testFile}`);
      const firstCallTime = performance.now() - firstCallStart;
      
      // 第二次查询（有缓存）
      const secondCallStart = performance.now();
      await fetch(`/api/dependencies/content/${testFile}`);
      const secondCallTime = performance.now() - secondCallStart;
      
      // 缓存应至少提升50%性能
      expect(secondCallTime).toBeLessThan(firstCallTime * 0.5);
    });
  });

  describe('并发性能测试', () => {
    it('应支持50个并发依赖检查请求', async () => {
      const concurrentRequests = 50;
      const requests = Array.from({ length: concurrentRequests }, (_, i) => 
        fetch(`/api/dependencies/content/test-${i}.md`)
      );
      
      const startTime = performance.now();
      const responses = await Promise.all(requests);
      const endTime = performance.now();
      
      // 所有请求都应成功
      responses.forEach(response => {
        expect(response.ok).toBeTruthy();
      });
      
      // 平均每个请求应在合理时间内完成
      const averageTime = (endTime - startTime) / concurrentRequests;
      expect(averageTime).toBeLessThan(200);
    });

    it('高频率依赖检查不应导致内存泄漏', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 执行1000次依赖检查
      for (let i = 0; i < 1000; i++) {
        await fetch('/api/dependencies/content/memory-test.md');
        
        // 每100次检查一次内存
        if (i % 100 === 0) {
          const currentMemory = process.memoryUsage().heapUsed;
          const memoryGrowth = currentMemory - initialMemory;
          
          // 内存增长应保持在合理范围内(50MB)
          expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
        }
      }
    });
  });

  describe('前端性能测试', () => {
    it('依赖UI组件渲染应保持60FPS', async () => {
      const page = await browser.newPage();
      
      // 开始性能监控
      await page.tracing.start({
        path: 'dependency-ui-trace.json',
        screenshots: true
      });
      
      await page.goto('/dependencies-test');
      
      // 触发复杂依赖UI更新
      await page.click('[data-testid="trigger-complex-dependency-update"]');
      
      // 等待动画完成
      await page.waitForTimeout(2000);
      
      await page.tracing.stop();
      
      // 分析性能数据
      const traceData = JSON.parse(
        fs.readFileSync('dependency-ui-trace.json', 'utf8')
      );
      
      const frameRates = analyzeFrameRates(traceData);
      const averageFPS = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
      
      expect(averageFPS).toBeGreaterThan(55); // 允许小幅波动
    });
  });
});

// 长期稳定性测试
describe('依赖系统稳定性测试', () => {
  it('应在长时间运行后保持稳定', async () => {
    const testDuration = 30 * 60 * 1000; // 30分钟
    const startTime = Date.now();
    const errors = [];
    
    while (Date.now() - startTime < testDuration) {
      try {
        // 随机执行各种依赖操作
        await performRandomDependencyOperations();
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errors.push({
          timestamp: Date.now(),
          error: error.message
        });
      }
    }
    
    // 错误率应低于1%
    const totalOperations = Math.floor(testDuration / 1000);
    const errorRate = errors.length / totalOperations;
    expect(errorRate).toBeLessThan(0.01);
    
    // 系统应仍能响应
    const response = await fetch('/api/health');
    expect(response.ok).toBeTruthy();
  });
});
```

### Task 12.2.3: 用户体验完整性验证

**用户体验测试套件**：
```typescript
// tests/ux/dependency-user-experience.test.ts
describe('依赖系统用户体验测试', () => {
  
  describe('新手引导体验', () => {
    it('新手应能通过引导理解依赖概念', async () => {
      // 1. 模拟新手用户
      await page.goto('/?newUser=true');
      
      // 2. 验证引导流程启动
      await page.waitForSelector('[data-testid="onboarding-guide"]');
      
      // 3. 逐步完成引导
      const guideSteps = await page.$$('[data-testid="guide-step"]');
      expect(guideSteps.length).toBeGreaterThan(3);
      
      // 4. 测试每个步骤的理解度
      for (let i = 0; i < guideSteps.length; i++) {
        await page.click('[data-testid="next-step"]');
        
        // 验证用户能理解当前步骤
        const stepContent = await page.$('[data-testid="step-content"]');
        const text = await stepContent.textContent();
        expect(text.length).toBeGreaterThan(50); // 有足够的说明文字
      }
      
      // 5. 验证引导完成后用户能独立操作
      await page.click('[data-testid="complete-onboarding"]');
      await page.waitForSelector('[data-testid="main-workspace"]');
      
      // 用户应能找到创建内容的入口
      const createButtons = await page.$$('[data-testid*="create"]');
      expect(createButtons.length).toBeGreaterThan(0);
    });

    it('依赖提示应使用易懂的语言', async () => {
      await triggerDependencyAlert(page);
      
      const alertText = await page.textContent('[data-testid="dependency-alert"]');
      
      // 验证语言友好性
      expect(alertText).not.toContain('API');
      expect(alertText).not.toContain('NULL');
      expect(alertText).not.toContain('ERROR');
      
      // 应包含引导性语言
      expect(alertText).toMatch(/建议|推荐|可以/);
    });
  });

  describe('交互反馈体验', () => {
    it('所有操作应有即时反馈', async () => {
      const actions = [
        '[data-testid="check-dependencies"]',
        '[data-testid="create-setting"]',
        '[data-testid="save-content"]',
        '[data-testid="navigate-dependency"]'
      ];
      
      for (const selector of actions) {
        // 执行操作
        await page.click(selector);
        
        // 验证在500ms内有反馈
        await page.waitForSelector('[data-testid*="feedback"]', { timeout: 500 });
        
        // 清理反馈状态
        await page.waitForTimeout(100);
      }
    });

    it('加载状态应有友好的视觉指示', async () => {
      // 触发需要时间的依赖检查
      await page.click('[data-testid="complex-dependency-check"]');
      
      // 验证加载指示器出现
      await page.waitForSelector('[data-testid="loading-indicator"]');
      
      // 验证加载文案友好
      const loadingText = await page.textContent('[data-testid="loading-text"]');
      expect(loadingText).toMatch(/正在|检查中|分析中/);
      
      // 验证加载完成后指示器消失
      await page.waitForSelector('[data-testid="loading-indicator"]', { 
        state: 'hidden' 
      });
    });
  });

  describe('个性化体验验证', () => {
    it('应能学习和适应用户习惯', async () => {
      // 1. 模拟用户重复行为模式
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="setting-first"]');
        await page.waitForTimeout(500);
        await page.click('[data-testid="outline-next"]');
        await page.waitForTimeout(500);
      }
      
      // 2. 验证系统学习到了模式
      await page.reload();
      
      // 3. 检查是否有个性化推荐
      const recommendations = await page.$$('[data-testid="personalized-recommendation"]');
      expect(recommendations.length).toBeGreaterThan(0);
      
      // 4. 验证推荐内容相关
      const firstRec = recommendations[0];
      const recText = await firstRec.textContent();
      expect(recText).toMatch(/设定|大纲/);
    });
  });

  describe('错误处理体验', () => {
    it('网络错误应有优雅降级', async () => {
      // 1. 模拟网络中断
      await page.setOfflineMode(true);
      
      // 2. 尝试依赖检查
      await page.click('[data-testid="check-dependencies"]');
      
      // 3. 验证友好错误提示
      await page.waitForSelector('[data-testid="offline-message"]');
      const message = await page.textContent('[data-testid="offline-message"]');
      expect(message).toContain('网络');
      expect(message).toContain('稍后重试');
      
      // 4. 验证功能降级可用
      await page.click('[data-testid="continue-offline"]');
      const editor = await page.$('[data-testid="content-editor"]');
      expect(editor).toBeTruthy();
      
      // 5. 恢复网络后功能正常
      await page.setOfflineMode(false);
      await page.click('[data-testid="retry-online"]');
      await page.waitForSelector('[data-testid="dependency-status"]');
    });
  });
});
```

### Task 12.2.4: 安全性和数据完整性验证

**安全性测试**：
```typescript
// tests/security/dependency-security.test.ts
describe('依赖系统安全性测试', () => {
  
  describe('API安全性', () => {
    it('应防止路径遍历攻击', async () => {
      const maliciousRequests = [
        '/api/dependencies/../../../etc/passwd',
        '/api/dependencies/content/../config.json',
        '/api/dependencies/project/../../../../root/.ssh/id_rsa'
      ];
      
      for (const path of maliciousRequests) {
        const response = await fetch(path);
        expect(response.status).toBe(400); // Bad Request
      }
    });

    it('应限制文件访问权限', async () => {
      const restrictedFiles = [
        '/api/dependencies/system/password.txt',
        '/api/dependencies/config/database.conf',
        '/api/dependencies/logs/error.log'
      ];
      
      for (const file of restrictedFiles) {
        const response = await fetch(file);
        expect(response.status).toBe(403); // Forbidden
      }
    });
  });

  describe('数据完整性', () => {
    it('依赖状态更新应具有原子性', async () => {
      // 1. 开始事务性更新
      const updatePromise = updateDependencyStatus('test-file', 'partial');
      
      // 2. 同时查询状态
      const statusPromise = getDependencyStatus('test-file');
      
      // 3. 等待两个操作完成
      const [updateResult, statusResult] = await Promise.all([
        updatePromise, 
        statusPromise
      ]);
      
      // 4. 验证数据一致性
      expect(updateResult.success).toBeTruthy();
      expect(statusResult.status).toBe('partial');
    });

    it('并发更新应避免竞态条件', async () => {
      const concurrentUpdates = Array.from({ length: 10 }, (_, i) =>
        updateDependencyStatus('concurrent-test', `status-${i}`)
      );
      
      const results = await Promise.all(concurrentUpdates);
      
      // 只有一个更新应该成功，其他应该被序列化处理
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBe(1);
      
      // 最终状态应该是确定的
      const finalStatus = await getDependencyStatus('concurrent-test');
      expect(finalStatus.status).toMatch(/^status-\d$/);
    });
  });
});
```

## 集成测试自动化脚本

```bash
#!/bin/bash
# scripts/run-integration-tests.sh

echo "🚀 开始 Epic 12 依赖系统集成验证..."

# 启动测试服务器
echo "📡 启动测试服务器..."
npm run test:server &
SERVER_PID=$!

# 等待服务器启动
sleep 5

# 运行端到端测试
echo "🔄 运行端到端功能测试..."
npm run test:e2e:dependencies

# 运行性能测试
echo "⚡ 运行性能基准测试..."
npm run test:performance:dependencies

# 运行用户体验测试
echo "👤 运行用户体验测试..."
npm run test:ux:dependencies

# 运行安全性测试
echo "🔐 运行安全性测试..."
npm run test:security:dependencies

# 生成测试报告
echo "📊 生成集成测试报告..."
npm run test:report:integration

# 清理测试环境
echo "🧹 清理测试环境..."
kill $SERVER_PID

echo "✅ Epic 12 依赖系统集成验证完成！"
echo "📋 测试报告已生成：reports/epic12-integration-report.html"
```

## 验收标准

### 功能完整性验收
- [ ] 端到端依赖识别流程100%通过
- [ ] 前后端数据同步无延迟无错误
- [ ] 所有异常情况都有适当处理

### 性能标准验收  
- [ ] 单文件依赖检查<100ms
- [ ] 大项目全量检查<2s
- [ ] 前端UI渲染保持60FPS
- [ ] 缓存命中率>80%

### 用户体验验收
- [ ] 新手引导完成率>90%
- [ ] 用户操作满意度>4.5分
- [ ] 错误恢复成功率>95%

### 稳定性验收
- [ ] 30分钟压力测试无致命错误
- [ ] 内存使用无泄漏
- [ ] 并发50用户无性能降级