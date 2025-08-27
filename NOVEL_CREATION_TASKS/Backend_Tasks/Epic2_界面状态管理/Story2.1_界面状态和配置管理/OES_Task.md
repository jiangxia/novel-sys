# Story 2.1: 界面状态和配置管理

## O (Objective)
### 功能目标
- 开发界面状态管理核心逻辑
- 实现Tab数据的持久化和恢复机制
- 建立用户界面偏好设置系统

### 技术目标  
- 设计高效的状态管理架构
- 实现可靠的数据持久化方案
- 确保状态同步的一致性和性能

## E (Environment)
### 技术环境
- Zustand状态管理库 + localStorage API
- TypeScript类型定义 + Immer不可变更新
- React状态同步机制

### 依赖环境
- Fullstack Story2.1的状态管理协议
- 浏览器localStorage兼容性
- 前端组件的状态接口需求

## S (Success Criteria)

### 及格标准
- Tab状态管理功能正常，增删改查操作稳定
- 界面配置能够正确持久化和恢复
- 状态更新性能良好，无明显卡顿

### 优秀标准
- 状态管理架构清晰，易于扩展维护
- 数据持久化机制可靠，支持异常恢复
- 内存使用优化，大量Tab场景下性能稳定

## 具体任务分解

### Task 2.1.1: 核心状态管理存储
**预估时间**: 2小时
**具体内容**:
- 设计主界面的状态管理架构
- 实现Tab状态的增删改查逻辑
- 建立状态更新的订阅通知机制

**状态管理架构**:
```typescript
// stores/interfaceStore.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

export interface TabItem {
  id: string
  title: string
  type: 'setting' | 'outline' | 'summary' | 'content'
  filePath: string
  isDirty: boolean
  lastModified: number
  content?: string
  cursorPosition?: number
  scrollPosition?: number
}

export interface LayoutState {
  // 左侧面板状态
  leftPanel: {
    activeTab: 'chat' | 'project'
    collapsed: boolean
    width: number
  }
  
  // 右侧内容区状态
  rightPanel: {
    tabs: TabItem[]
    activeTabId: string | null
    maxTabs: number
    tabOrder: string[]
  }
  
  // 响应式状态
  responsive: {
    breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
  }
  
  // 用户偏好设置
  preferences: {
    theme: 'light' | 'dark' | 'system'
    fontSize: number
    autoSave: boolean
    autoSaveInterval: number
    showLineNumbers: boolean
    wordWrap: boolean
  }
}

interface InterfaceStore extends LayoutState {
  // Tab操作方法
  addTab: (tab: Omit<TabItem, 'id' | 'lastModified'>) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTab: (tabId: string, updates: Partial<TabItem>) => void
  reorderTabs: (oldIndex: number, newIndex: number) => void
  closeAllTabs: () => void
  closeOtherTabs: (keepTabId: string) => void
  
  // 面板操作方法
  setLeftPanelTab: (tab: 'chat' | 'project') => void
  toggleLeftPanelCollapsed: () => void
  setLeftPanelWidth: (width: number) => void
  
  // 响应式状态更新
  updateResponsiveState: (state: Partial<LayoutState['responsive']>) => void
  
  // 偏好设置方法
  updatePreferences: (preferences: Partial<LayoutState['preferences']>) => void
  resetPreferences: () => void
}

const defaultState: LayoutState = {
  leftPanel: {
    activeTab: 'chat',
    collapsed: false,
    width: 320
  },
  rightPanel: {
    tabs: [],
    activeTabId: null,
    maxTabs: 8,
    tabOrder: []
  },
  responsive: {
    breakpoint: 'xl',
    isMobile: false,
    isTablet: false,
    isDesktop: true
  },
  preferences: {
    theme: 'system',
    fontSize: 14,
    autoSave: true,
    autoSaveInterval: 30000,
    showLineNumbers: true,
    wordWrap: true
  }
}

export const useInterfaceStore = create<InterfaceStore>()(
  persist(
    immer((set, get) => ({
      ...defaultState,

      // Tab操作实现
      addTab: (tabData) => {
        set((state) => {
          const { tabs, maxTabs } = state.rightPanel
          
          // 检查是否已存在
          const existingTab = tabs.find(tab => tab.filePath === tabData.filePath)
          if (existingTab) {
            state.rightPanel.activeTabId = existingTab.id
            return
          }

          // 检查数量限制
          if (tabs.length >= maxTabs) {
            // 关闭最老的Tab
            const oldestTab = tabs.reduce((oldest, current) => 
              current.lastModified < oldest.lastModified ? current : oldest
            )
            state.rightPanel.tabs = tabs.filter(tab => tab.id !== oldestTab.id)
            state.rightPanel.tabOrder = state.rightPanel.tabOrder.filter(id => id !== oldestTab.id)
          }

          // 添加新Tab
          const newTab: TabItem = {
            ...tabData,
            id: generateId(),
            lastModified: Date.now(),
            isDirty: false
          }
          
          state.rightPanel.tabs.push(newTab)
          state.rightPanel.tabOrder.push(newTab.id)
          state.rightPanel.activeTabId = newTab.id
        })
      },

      removeTab: (tabId) => {
        set((state) => {
          const { tabs, activeTabId, tabOrder } = state.rightPanel
          const tabIndex = tabs.findIndex(tab => tab.id === tabId)
          
          if (tabIndex === -1) return

          // 移除Tab
          state.rightPanel.tabs = tabs.filter(tab => tab.id !== tabId)
          state.rightPanel.tabOrder = tabOrder.filter(id => id !== tabId)

          // 处理激活Tab的切换
          if (activeTabId === tabId) {
            const remainingTabs = state.rightPanel.tabs
            if (remainingTabs.length > 0) {
              // 激活下一个或上一个Tab
              const nextTab = remainingTabs[tabIndex] || remainingTabs[tabIndex - 1]
              state.rightPanel.activeTabId = nextTab.id
            } else {
              state.rightPanel.activeTabId = null
            }
          }
        })
      },

      setActiveTab: (tabId) => {
        set((state) => {
          const tab = state.rightPanel.tabs.find(tab => tab.id === tabId)
          if (tab) {
            state.rightPanel.activeTabId = tabId
            tab.lastModified = Date.now()
          }
        })
      },

      updateTab: (tabId, updates) => {
        set((state) => {
          const tab = state.rightPanel.tabs.find(tab => tab.id === tabId)
          if (tab) {
            Object.assign(tab, updates)
            tab.lastModified = Date.now()
          }
        })
      },

      reorderTabs: (oldIndex, newIndex) => {
        set((state) => {
          const { tabOrder } = state.rightPanel
          const [removed] = tabOrder.splice(oldIndex, 1)
          tabOrder.splice(newIndex, 0, removed)
        })
      },

      // 面板操作实现
      setLeftPanelTab: (tab) => {
        set((state) => {
          state.leftPanel.activeTab = tab
        })
      },

      toggleLeftPanelCollapsed: () => {
        set((state) => {
          state.leftPanel.collapsed = !state.leftPanel.collapsed
        })
      },

      updateResponsiveState: (responsiveState) => {
        set((state) => {
          Object.assign(state.responsive, responsiveState)
        })
      },

      updatePreferences: (preferences) => {
        set((state) => {
          Object.assign(state.preferences, preferences)
        })
      }
    })),
    {
      name: 'novel-interface-store',
      partialize: (state) => ({
        leftPanel: state.leftPanel,
        preferences: state.preferences,
        // 不持久化tabs和responsive状态
      })
    }
  )
)

// 工具函数
const generateId = () => `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
```

### Task 2.1.2: 数据持久化管理
**预估时间**: 1.5小时
**具体内容**:
- 实现界面状态的本地存储机制
- 建立配置数据的备份和恢复功能
- 添加数据版本控制和迁移逻辑

**持久化管理**:
```typescript
// utils/persistenceManager.ts
export class PersistenceManager {
  private readonly storageKey = 'novel-app-state'
  private readonly version = '1.0.0'

  // 保存状态到本地存储
  async saveState(state: Partial<LayoutState>): Promise<void> {
    try {
      const stateWithMetadata = {
        version: this.version,
        timestamp: Date.now(),
        data: state
      }
      
      const serialized = JSON.stringify(stateWithMetadata)
      localStorage.setItem(this.storageKey, serialized)
      
      // 同时保存到IndexedDB作为备份
      await this.saveToIndexedDB(stateWithMetadata)
    } catch (error) {
      console.error('Failed to save state:', error)
      throw new Error('状态保存失败')
    }
  }

  // 从本地存储恢复状态
  async loadState(): Promise<Partial<LayoutState> | null> {
    try {
      // 优先从localStorage读取
      const localData = this.loadFromLocalStorage()
      if (localData) return localData

      // 备用方案：从IndexedDB读取
      const indexedData = await this.loadFromIndexedDB()
      if (indexedData) {
        // 恢复到localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(indexedData))
        return indexedData.data
      }

      return null
    } catch (error) {
      console.error('Failed to load state:', error)
      return null
    }
  }

  // 清除存储的状态
  async clearState(): Promise<void> {
    localStorage.removeItem(this.storageKey)
    await this.clearIndexedDB()
  }

  // 导出配置
  exportConfiguration(): string {
    const data = localStorage.getItem(this.storageKey)
    if (!data) throw new Error('没有可导出的配置')
    
    return btoa(data) // Base64编码
  }

  // 导入配置
  async importConfiguration(configData: string): Promise<void> {
    try {
      const decoded = atob(configData)
      const parsed = JSON.parse(decoded)
      
      // 验证数据结构
      if (!this.validateStateStructure(parsed)) {
        throw new Error('配置数据格式不正确')
      }

      // 保存导入的配置
      await this.saveState(parsed.data)
    } catch (error) {
      console.error('Failed to import configuration:', error)
      throw new Error('配置导入失败')
    }
  }

  private loadFromLocalStorage(): Partial<LayoutState> | null {
    const data = localStorage.getItem(this.storageKey)
    if (!data) return null

    try {
      const parsed = JSON.parse(data)
      if (parsed.version !== this.version) {
        // 处理版本迁移
        return this.migrateState(parsed)
      }
      return parsed.data
    } catch {
      return null
    }
  }

  private async saveToIndexedDB(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NovelAppDB', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['state'], 'readwrite')
        const store = transaction.objectStore('state')
        
        store.put({ id: 'current', ...data })
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      }
      
      request.onupgradeneeded = () => {
        const db = request.result
        db.createObjectStore('state', { keyPath: 'id' })
      }
    })
  }

  private async loadFromIndexedDB(): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NovelAppDB', 1)
      
      request.onerror = () => resolve(null)
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['state'], 'readonly')
        const store = transaction.objectStore('state')
        const getRequest = store.get('current')
        
        getRequest.onsuccess = () => resolve(getRequest.result)
        getRequest.onerror = () => resolve(null)
      }
    })
  }

  private validateStateStructure(data: any): boolean {
    return data && 
           typeof data === 'object' &&
           data.version &&
           data.timestamp &&
           data.data
  }

  private migrateState(oldState: any): Partial<LayoutState> {
    // 根据版本执行相应的迁移逻辑
    console.log('Migrating state from version:', oldState.version)
    
    // 这里实现具体的迁移逻辑
    return oldState.data
  }
}

export const persistenceManager = new PersistenceManager()
```

### Task 2.1.3: 性能优化和内存管理
**预估时间**: 1.5小时
**具体内容**:
- 实现状态更新的批处理和防抖机制
- 建立内存使用监控和清理策略
- 优化大量Tab场景下的性能表现

**性能优化**:
```typescript
// utils/performanceOptimizer.ts
export class PerformanceOptimizer {
  private updateQueue: Array<() => void> = []
  private isProcessing = false
  private readonly batchDelay = 16 // ~60fps

  // 批处理状态更新
  batchUpdate(updateFn: () => void): void {
    this.updateQueue.push(updateFn)
    
    if (!this.isProcessing) {
      this.isProcessing = true
      requestAnimationFrame(() => this.processBatch())
    }
  }

  private processBatch(): void {
    const updates = this.updateQueue.splice(0)
    
    // 执行所有批处理的更新
    updates.forEach(update => {
      try {
        update()
      } catch (error) {
        console.error('Batch update failed:', error)
      }
    })
    
    this.isProcessing = false
    
    // 如果还有待处理的更新，继续处理
    if (this.updateQueue.length > 0) {
      requestAnimationFrame(() => this.processBatch())
    }
  }

  // 防抖函数
  debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  // 节流函数
  throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastExecuted = 0
    
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastExecuted >= delay) {
        func(...args)
        lastExecuted = now
      }
    }
  }

  // 内存监控
  monitorMemoryUsage(): {
    usedMemory: number
    totalMemory: number
    percentage: number
  } {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        usedMemory: memory.usedJSHeapSize,
        totalMemory: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }
    }
    
    return { usedMemory: 0, totalMemory: 0, percentage: 0 }
  }

  // Tab内存清理策略
  cleanupInactiveTabs(tabs: TabItem[], maxInactive: number = 5): string[] {
    const sortedTabs = tabs
      .filter(tab => tab.content) // 只处理有内容的Tab
      .sort((a, b) => b.lastModified - a.lastModified) // 按最后修改时间排序

    const inactiveTabs = sortedTabs.slice(maxInactive)
    const cleanupIds: string[] = []

    inactiveTabs.forEach(tab => {
      if (tab.content && !tab.isDirty) {
        cleanupIds.push(tab.id)
      }
    })

    return cleanupIds
  }
}

export const performanceOptimizer = new PerformanceOptimizer()

// hooks/usePerformanceOptimizedStore.ts
export const usePerformanceOptimizedStore = () => {
  const store = useInterfaceStore()
  
  // 优化后的更新方法
  const optimizedUpdateTab = useMemo(
    () => performanceOptimizer.debounce(store.updateTab, 300),
    [store.updateTab]
  )

  // 批处理的Tab添加
  const batchAddTab = useCallback((tab: Omit<TabItem, 'id' | 'lastModified'>) => {
    performanceOptimizer.batchUpdate(() => store.addTab(tab))
  }, [store.addTab])

  return {
    ...store,
    updateTab: optimizedUpdateTab,
    addTab: batchAddTab
  }
}
```

## 验收标准
1. Tab状态管理功能完整，增删改查操作稳定可靠
2. 界面配置持久化正常，重启应用后状态正确恢复
3. 性能优化效果明显，大量Tab场景下响应流畅
4. 内存使用合理，长时间使用无内存泄漏
5. 错误处理完善，异常情况下能够优雅降级
6. 代码架构清晰，类型定义完整，易于维护

## 依赖关系
- 需要Fullstack Story2.1的状态管理协议规范
- 为前端组件提供状态管理支撑
- 与文件系统模块协作处理文件状态