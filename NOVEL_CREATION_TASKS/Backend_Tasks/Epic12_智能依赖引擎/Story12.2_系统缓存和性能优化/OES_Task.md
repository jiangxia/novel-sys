# Story 12.2: 系统缓存和性能优化

## O (Objective)

### 功能目标
- 建立高效的依赖关系缓存机制
- 优化文件读取和内容分析性能
- 实现智能的内存使用管理策略

### 技术目标  
- 依赖检查平均响应时间降低70%
- 系统内存占用控制在合理范围内
- 实现99%的系统稳定性

## E (Environment)

### 技术环境
- Node.js 事件循环优化
- 内存管理和垃圾回收
- 文件系统I/O优化
- 数据结构和算法优化

### 依赖环境
- 依赖识别算法引擎
- 文件监听和变更检测
- 项目文件结构管理
- 错误处理和恢复机制

### 性能要求环境
- 支持100+文件的大型项目
- 实时依赖状态更新
- 多用户并发访问支持

## S (Success Criteria)

### 及格标准 (Must Have)
- **缓存命中率**：达到80%以上
- **响应时间**：平均依赖检查时间<50ms
- **内存控制**：系统稳态内存占用<100MB

### 优秀标准 (Should Have)  
- **智能预加载**：预测并预加载用户需要的依赖数据
- **增量更新**：支持文件变更的增量依赖更新
- **并发优化**：支持多请求并发处理不阻塞

### 卓越标准 (Nice to Have)
- **自适应优化**：基于使用模式自动调整缓存策略
- **内存压缩**：大数据集的内存压缩存储
- **异步后台处理**：非关键路径的异步处理优化

## 具体任务分解

### Task 12.2.1: 多层级缓存系统设计

**缓存架构设计**：
```javascript
// lib/cache/cache-manager.js
class CacheManager {
  constructor() {
    this.l1Cache = new Map(); // 内存缓存 - 热点数据
    this.l2Cache = new Map(); // 扩展缓存 - 常用数据  
    this.fileCache = new Map(); // 文件内容缓存
    this.dependencyCache = new Map(); // 依赖关系缓存
    
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  async get(key, type = 'dependency') {
    const cacheKey = `${type}:${key}`;
    
    // L1 缓存检查
    if (this.l1Cache.has(cacheKey)) {
      this.stats.hits++;
      return this.l1Cache.get(cacheKey);
    }
    
    // L2 缓存检查
    if (this.l2Cache.has(cacheKey)) {
      const data = this.l2Cache.get(cacheKey);
      // 提升到L1缓存
      this.promoteToL1(cacheKey, data);
      this.stats.hits++;
      return data;
    }
    
    this.stats.misses++;
    return null;
  }

  set(key, value, type = 'dependency', ttl = 300000) {
    const cacheKey = `${type}:${key}`;
    const entry = {
      data: value,
      timestamp: Date.now(),
      ttl,
      accessCount: 1
    };
    
    // 根据数据热度决定存储位置
    if (this.isHotData(key, type)) {
      this.setL1Cache(cacheKey, entry);
    } else {
      this.setL2Cache(cacheKey, entry);
    }
  }
}
```

**智能缓存策略**：
```javascript
// lib/cache/cache-strategy.js
class CacheStrategy {
  
  static LRU_WITH_FREQUENCY = class {
    constructor(maxSize = 1000) {
      this.cache = new Map();
      this.frequencies = new Map();
      this.maxSize = maxSize;
    }

    get(key) {
      if (this.cache.has(key)) {
        // 更新访问频率
        const freq = this.frequencies.get(key) || 0;
        this.frequencies.set(key, freq + 1);
        
        // LRU更新 - 重新插入到末尾
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        
        return value;
      }
      return null;
    }

    set(key, value) {
      if (this.cache.size >= this.maxSize) {
        this.evictLeastUseful();
      }
      
      this.cache.set(key, value);
      this.frequencies.set(key, 1);
    }

    evictLeastUseful() {
      // 综合考虑访问时间和频率
      let minScore = Infinity;
      let evictKey = null;
      
      for (const [key] of this.cache) {
        const freq = this.frequencies.get(key) || 1;
        const age = this.getKeyAge(key);
        const score = freq / Math.log(age + 1); // 频率除以对数年龄
        
        if (score < minScore) {
          minScore = score;
          evictKey = key;
        }
      }
      
      if (evictKey) {
        this.cache.delete(evictKey);
        this.frequencies.delete(evictKey);
      }
    }
  };
}
```

### Task 12.2.2: 文件I/O性能优化

**批量文件读取优化**：
```javascript
// lib/performance/file-io-optimizer.js
class FileIOOptimizer {
  constructor() {
    this.readQueue = [];
    this.processing = false;
    this.fileCache = new Map();
  }

  async batchReadFiles(filePaths, options = {}) {
    const { 
      maxConcurrency = 10,
      cacheResults = true,
      timeout = 5000 
    } = options;
    
    // 分离缓存命中和未命中的文件
    const { cached, uncached } = this.separateCachedFiles(filePaths);
    
    if (uncached.length === 0) {
      return cached;
    }
    
    // 批量并发读取未缓存文件
    const batchResults = await this.concurrentRead(uncached, maxConcurrency);
    
    // 合并结果
    const allResults = { ...cached, ...batchResults };
    
    // 缓存新读取的文件
    if (cacheResults) {
      this.cacheFileResults(batchResults);
    }
    
    return allResults;
  }

  async concurrentRead(filePaths, maxConcurrency) {
    const results = {};
    const semaphore = new Semaphore(maxConcurrency);
    
    const readPromises = filePaths.map(async (filePath) => {
      await semaphore.acquire();
      
      try {
        const content = await this.optimizedFileRead(filePath);
        results[filePath] = {
          content,
          size: content.length,
          readTime: Date.now(),
          cached: false
        };
      } catch (error) {
        results[filePath] = {
          error: error.message,
          cached: false
        };
      } finally {
        semaphore.release();
      }
    });
    
    await Promise.all(readPromises);
    return results;
  }

  async optimizedFileRead(filePath) {
    const fs = require('fs').promises;
    const stats = await fs.stat(filePath);
    
    // 大文件采用流式读取
    if (stats.size > 10 * 1024 * 1024) { // 10MB
      return this.streamRead(filePath);
    }
    
    // 小文件直接读取
    return fs.readFile(filePath, 'utf8');
  }
}

class Semaphore {
  constructor(permits) {
    this.permits = permits;
    this.queue = [];
  }

  async acquire() {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  release() {
    this.permits++;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      this.permits--;
      resolve();
    }
  }
}
```

### Task 12.2.3: 内存管理和垃圾回收优化

**内存池管理**：
```javascript
// lib/performance/memory-manager.js
class MemoryManager {
  constructor() {
    this.pools = {
      small: [], // < 1KB
      medium: [], // 1KB - 10KB  
      large: [] // > 10KB
    };
    
    this.stats = {
      allocated: 0,
      deallocated: 0,
      poolHits: 0,
      poolMisses: 0
    };
    
    this.gcThreshold = 50 * 1024 * 1024; // 50MB触发GC
  }

  allocateBuffer(size) {
    const pool = this.getPoolBySize(size);
    
    // 尝试从池中获取
    if (pool.length > 0) {
      this.stats.poolHits++;
      return pool.pop();
    }
    
    // 池中无可用，创建新缓冲区
    this.stats.poolMisses++;
    this.stats.allocated += size;
    
    // 检查是否需要GC
    if (this.stats.allocated > this.gcThreshold) {
      this.triggerGC();
    }
    
    return Buffer.allocUnsafe(size);
  }

  deallocateBuffer(buffer) {
    const pool = this.getPoolBySize(buffer.length);
    
    // 清零缓冲区并回收到池
    buffer.fill(0);
    pool.push(buffer);
    
    this.stats.deallocated += buffer.length;
    
    // 限制池大小防止内存泄漏
    if (pool.length > 100) {
      pool.splice(0, 50); // 移除一半旧缓冲区
    }
  }

  triggerGC() {
    // 强制垃圾回收
    if (global.gc) {
      global.gc();
    }
    
    // 清理过期缓存
    this.cleanupExpiredCaches();
    
    this.stats.allocated = 0; // 重置计数器
  }
}
```

**智能预加载机制**：
```javascript
// lib/performance/preloader.js
class DependencyPreloader {
  constructor(cacheManager) {
    this.cache = cacheManager;
    this.userPatterns = new Map(); // 用户行为模式
    this.preloadQueue = [];
  }

  analyzeUserBehavior(action) {
    // 分析用户访问模式
    const pattern = {
      timestamp: Date.now(),
      action: action.type,
      fileId: action.fileId,
      context: action.context
    };
    
    this.updateUserPatterns(pattern);
    this.predictNextActions(pattern);
  }

  updateUserPatterns(pattern) {
    const key = `${pattern.action}:${pattern.fileId}`;
    
    if (!this.userPatterns.has(key)) {
      this.userPatterns.set(key, []);
    }
    
    const patterns = this.userPatterns.get(key);
    patterns.push(pattern);
    
    // 只保留最近100条记录
    if (patterns.length > 100) {
      patterns.splice(0, patterns.length - 100);
    }
  }

  predictNextActions(currentPattern) {
    // 基于历史模式预测下一步操作
    const predictions = this.calculatePredictions(currentPattern);
    
    // 预加载高概率的依赖数据
    predictions
      .filter(p => p.probability > 0.7)
      .slice(0, 5) // 只预加载前5个
      .forEach(prediction => {
        this.schedulePreload(prediction);
      });
  }

  async schedulePreload(prediction) {
    // 防重复预加载
    if (this.cache.has(prediction.fileId)) {
      return;
    }
    
    // 添加到预加载队列
    this.preloadQueue.push({
      fileId: prediction.fileId,
      priority: prediction.probability,
      scheduledAt: Date.now()
    });
    
    // 异步执行预加载
    setImmediate(() => this.processPreloadQueue());
  }

  async processPreloadQueue() {
    if (this.preloadQueue.length === 0) return;
    
    // 按优先级排序
    this.preloadQueue.sort((a, b) => b.priority - a.priority);
    
    const task = this.preloadQueue.shift();
    
    try {
      await this.performPreload(task.fileId);
    } catch (error) {
      // 预加载失败不影响主流程
      console.warn('预加载失败:', error.message);
    }
    
    // 继续处理队列
    if (this.preloadQueue.length > 0) {
      setTimeout(() => this.processPreloadQueue(), 100);
    }
  }
}
```

### Task 12.2.4: 监控和自动优化

**性能监控系统**：
```javascript
// lib/performance/monitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      responseTime: [],
      memoryUsage: [],
      cacheHitRate: [],
      errorRate: []
    };
    
    this.thresholds = {
      responseTime: 100, // ms
      memoryUsage: 100 * 1024 * 1024, // 100MB
      cacheHitRate: 0.8,
      errorRate: 0.05
    };
  }

  recordMetric(type, value) {
    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }
    
    this.metrics[type].push({
      value,
      timestamp: Date.now()
    });
    
    // 只保留最近1000条记录
    if (this.metrics[type].length > 1000) {
      this.metrics[type].splice(0, 100);
    }
    
    // 检查阈值并触发优化
    this.checkThresholds(type, value);
  }

  checkThresholds(type, value) {
    const threshold = this.thresholds[type];
    
    if (type === 'responseTime' && value > threshold) {
      this.triggerOptimization('response_time', value);
    } else if (type === 'memoryUsage' && value > threshold) {
      this.triggerOptimization('memory_usage', value);
    } else if (type === 'cacheHitRate' && value < threshold) {
      this.triggerOptimization('cache_performance', value);
    }
  }

  generatePerformanceReport() {
    const report = {};
    
    Object.keys(this.metrics).forEach(type => {
      const data = this.metrics[type];
      if (data.length === 0) return;
      
      const values = data.map(d => d.value);
      report[type] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
        trend: this.calculateTrend(values.slice(-10)) // 最近10个数据点的趋势
      };
    });
    
    return report;
  }
}
```

## 性能基准和目标

### 响应时间目标
- **单文件依赖检查**: <50ms (优化前: <100ms)
- **项目全量检查**: <1s (优化前: <2s)  
- **缓存命中检查**: <5ms
- **批量文件读取**: <200ms/10文件

### 内存使用目标
- **稳态内存占用**: <100MB (大型项目)
- **内存增长率**: <10MB/小时 (长期运行)
- **缓存内存比例**: <30% 总内存
- **GC频率**: <1次/小时

### 并发性能目标
- **并发用户支持**: 50+用户同时访问
- **请求队列长度**: <100
- **平均等待时间**: <20ms

## 验收标准

### 性能验收
- [ ] 所有性能目标达成
- [ ] 在压力测试下系统稳定运行
- [ ] 长时间运行无内存泄漏

### 功能验收  
- [ ] 缓存机制正确处理数据一致性
- [ ] 预加载不影响主要功能性能
- [ ] 优化不影响数据准确性

### 监控验收
- [ ] 性能监控覆盖所有关键指标  
- [ ] 自动优化机制正常触发
- [ ] 性能报告准确反映系统状态