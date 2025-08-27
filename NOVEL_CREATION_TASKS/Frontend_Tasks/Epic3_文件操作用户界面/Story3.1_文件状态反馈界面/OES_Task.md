# Story 3.1: 文件状态反馈界面

## O (Objective)
### 功能目标
- 实现直观的文件操作状态反馈系统
- 提供文件读写进度的实时可视化
- 构建用户友好的错误提示和处理机制

### 协作目标
- 与Backend文件操作引擎无缝对接
- 为用户提供透明的文件操作体验
- 支持批量文件操作的状态管理

## E (Environment)
### 协作环境
- **前端**: React 19 + TypeScript + TailwindCSS组件开发
- **状态管理**: Zustand文件状态store集成
- **协作点**: 文件状态同步、错误处理、用户反馈展示

### 依赖环境
- Epic 2主工作界面Tab系统已完成
- Backend文件操作引擎API接口已定义
- 基础UI组件库(Radix UI)已配置

## S (Success Criteria)

### 及格标准
- 文件读写状态实时反馈正常显示
- 进度条和加载指示器工作准确
- 错误信息提示清晰易懂

### 优秀标准
- 支持多文件并发操作状态管理
- 提供操作历史和撤销重做反馈
- 响应式设计适配各种设备尺寸

### 协作标准
- 与Backend状态同步延迟<100ms
- 界面状态更新流畅无卡顿
- 错误处理覆盖率达到95%

## 前端开发任务分解

### Task 3.1.1: 文件操作状态组件开发
**预估时间**: 3小时  
**具体内容**:
- 开发文件状态指示器组件
- 实现进度条和加载动画
- 创建文件操作历史面板

**核心组件实现**:
```typescript
// components/FileOperationStatus.tsx

import { useEffect, useState } from 'react'
import { useFileOperationStore } from '@/stores/fileOperationStore'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FileOperationStatus {
  id: string
  type: 'read' | 'write' | 'save' | 'autosave' | 'sync'
  fileName: string
  status: 'pending' | 'loading' | 'success' | 'error' | 'cancelled'
  progress: number
  message?: string
  startTime: number
  endTime?: number
}

export interface FileOperationStatusProps {
  className?: string
  maxVisible?: number
  showHistory?: boolean
}

export const FileOperationStatusPanel: React.FC<FileOperationStatusProps> = ({
  className,
  maxVisible = 5,
  showHistory = false
}) => {
  const { 
    operations, 
    removeOperation, 
    clearCompletedOperations,
    getActiveOperations,
    getOperationHistory
  } = useFileOperationStore()
  
  const [collapsed, setCollapsed] = useState(false)
  
  const activeOperations = getActiveOperations()
  const historyOperations = showHistory ? getOperationHistory() : []
  const displayOperations = showHistory 
    ? [...activeOperations, ...historyOperations].slice(0, maxVisible)
    : activeOperations.slice(0, maxVisible)

  if (displayOperations.length === 0) {
    return null
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-50",
      collapsed && "h-12",
      className
    )}>
      {/* 状态面板头部 */}
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center space-x-2">
          <Loader2 className={cn(
            "h-4 w-4",
            activeOperations.length > 0 ? "animate-spin text-blue-500" : "text-gray-400"
          )} />
          <span className="text-sm font-medium">
            文件操作 {activeOperations.length > 0 && `(${activeOperations.length})`}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {activeOperations.length === 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearCompletedOperations()
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="清除历史记录"
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* 操作列表 */}
      {!collapsed && (
        <div className="max-h-64 overflow-y-auto">
          {displayOperations.map(operation => (
            <FileOperationItem
              key={operation.id}
              operation={operation}
              onRemove={() => removeOperation(operation.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const FileOperationItem: React.FC<{
  operation: FileOperationStatus
  onRemove: () => void
}> = ({ operation, onRemove }) => {
  const getStatusIcon = () => {
    switch (operation.status) {
      case 'loading':
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getOperationTypeText = () => {
    const typeMap = {
      read: '读取',
      write: '写入', 
      save: '保存',
      autosave: '自动保存',
      sync: '同步'
    }
    return typeMap[operation.type] || operation.type
  }

  const formatDuration = () => {
    if (!operation.endTime) return ''
    const duration = operation.endTime - operation.startTime
    return `${(duration / 1000).toFixed(1)}s`
  }

  return (
    <div className="p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {operation.fileName}
            </div>
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <span>{getOperationTypeText()}</span>
              {operation.endTime && (
                <span>• {formatDuration()}</span>
              )}
            </div>
          </div>
        </div>
        
        {(operation.status === 'success' || operation.status === 'error') && (
          <button
            onClick={onRemove}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3 text-gray-500" />
          </button>
        )}
      </div>

      {/* 进度条 */}
      {operation.status === 'loading' && (
        <div className="mt-2">
          <Progress value={operation.progress} className="h-1" />
          <div className="text-xs text-gray-500 mt-1">
            {operation.progress}%
          </div>
        </div>
      )}

      {/* 错误信息 */}
      {operation.status === 'error' && operation.message && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
          {operation.message}
        </div>
      )}
    </div>
  )
}
```

### Task 3.1.2: 文件错误处理界面
**预估时间**: 2小时
**具体内容**:
- 开发错误提示弹窗组件
- 实现错误恢复操作界面
- 创建文件冲突解决对话框

**错误处理组件**:
```typescript
// components/FileErrorHandler.tsx

import { useState } from 'react'
import { useFileOperationStore } from '@/stores/fileOperationStore'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Download, Upload } from 'lucide-react'

export interface FileError {
  id: string
  type: 'read_error' | 'write_error' | 'conflict' | 'permission' | 'network' | 'corruption'
  fileName: string
  message: string
  details?: string
  recoveryOptions: FileErrorRecoveryOption[]
}

export interface FileErrorRecoveryOption {
  type: 'retry' | 'ignore' | 'overwrite' | 'merge' | 'backup' | 'restore'
  label: string
  description: string
  dangerous?: boolean
}

export const FileErrorDialog: React.FC<{
  error: FileError | null
  onResolve: (option: FileErrorRecoveryOption) => void
  onDismiss: () => void
}> = ({ error, onResolve, onDismiss }) => {
  const [selectedOption, setSelectedOption] = useState<FileErrorRecoveryOption | null>(null)
  
  if (!error) return null

  const getErrorIcon = () => {
    switch (error.type) {
      case 'conflict':
        return <Upload className="h-8 w-8 text-yellow-500" />
      case 'permission':
        return <AlertCircle className="h-8 w-8 text-red-500" />
      case 'corruption':
        return <AlertCircle className="h-8 w-8 text-orange-500" />
      default:
        return <AlertCircle className="h-8 w-8 text-red-500" />
    }
  }

  const getErrorTitle = () => {
    const titleMap = {
      read_error: '文件读取失败',
      write_error: '文件保存失败', 
      conflict: '文件冲突检测',
      permission: '权限不足',
      network: '网络连接错误',
      corruption: '文件损坏'
    }
    return titleMap[error.type] || '文件操作错误'
  }

  return (
    <AlertDialog open={true} onOpenChange={onDismiss}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            {getErrorIcon()}
            <div>
              <AlertDialogTitle>{getErrorTitle()}</AlertDialogTitle>
              <div className="text-sm text-gray-600 mt-1">{error.fileName}</div>
            </div>
          </div>
          <AlertDialogDescription className="mt-4">
            {error.message}
            {error.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">查看详细信息</summary>
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                  {error.details}
                </div>
              </details>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <div className="text-sm font-medium">选择解决方案:</div>
          {error.recoveryOptions.map((option, index) => (
            <label
              key={index}
              className={cn(
                "flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50",
                selectedOption === option && "border-blue-500 bg-blue-50",
                option.dangerous && "border-red-200"
              )}
            >
              <input
                type="radio"
                name="recovery-option"
                checked={selectedOption === option}
                onChange={() => setSelectedOption(option)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className={cn(
                  "font-medium",
                  option.dangerous && "text-red-700"
                )}>
                  {option.label}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDismiss}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (selectedOption) {
                onResolve(selectedOption)
              }
            }}
            disabled={!selectedOption}
            className={cn(
              selectedOption?.dangerous && "bg-red-600 hover:bg-red-700"
            )}
          >
            {selectedOption?.dangerous ? '强制执行' : '应用方案'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Task 3.1.3: 文件操作状态Store
**预估时间**: 2小时
**具体内容**:
- 实现Zustand文件操作状态管理
- 集成Backend API调用和状态同步
- 提供文件操作历史记录功能

**状态管理Store**:
```typescript
// stores/fileOperationStore.ts

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { FileOperationStatus, FileError } from '@/types/fileOperation'
import { fileOperationAPI } from '@/api/fileOperation'

interface FileOperationStore {
  // 状态数据
  operations: Map<string, FileOperationStatus>
  errors: Map<string, FileError>
  history: FileOperationStatus[]
  
  // 操作方法
  addOperation: (operation: Omit<FileOperationStatus, 'id' | 'startTime'>) => string
  updateOperation: (id: string, updates: Partial<FileOperationStatus>) => void
  removeOperation: (id: string) => void
  clearCompletedOperations: () => void
  
  // 错误处理
  addError: (error: Omit<FileError, 'id'>) => string
  resolveError: (id: string, resolution: any) => void
  dismissError: (id: string) => void
  
  // 查询方法
  getActiveOperations: () => FileOperationStatus[]
  getOperationHistory: () => FileOperationStatus[]
  getOperationById: (id: string) => FileOperationStatus | undefined
  
  // 文件操作API调用
  readFile: (filePath: string, options?: any) => Promise<string>
  writeFile: (filePath: string, content: string, options?: any) => Promise<void>
  saveFile: (filePath: string, content: string, options?: any) => Promise<void>
}

export const useFileOperationStore = create<FileOperationStore>()(
  subscribeWithSelector((set, get) => ({
    operations: new Map(),
    errors: new Map(),
    history: [],
    
    addOperation: (operation) => {
      const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const fullOperation: FileOperationStatus = {
        ...operation,
        id,
        startTime: Date.now(),
        progress: 0,
        status: 'pending'
      }
      
      set(state => ({
        operations: new Map(state.operations).set(id, fullOperation)
      }))
      
      return id
    },
    
    updateOperation: (id, updates) => {
      set(state => {
        const operations = new Map(state.operations)
        const existing = operations.get(id)
        if (existing) {
          const updated = { ...existing, ...updates }
          
          // 如果操作完成，移动到历史记录
          if (updated.status === 'success' || updated.status === 'error' || updated.status === 'cancelled') {
            updated.endTime = Date.now()
            operations.delete(id)
            
            return {
              operations,
              history: [updated, ...state.history].slice(0, 100) // 保留最近100条历史
            }
          } else {
            operations.set(id, updated)
          }
        }
        
        return { operations }
      })
    },
    
    removeOperation: (id) => {
      set(state => {
        const operations = new Map(state.operations)
        operations.delete(id)
        return { operations }
      })
    },
    
    clearCompletedOperations: () => {
      set(state => ({
        history: []
      }))
    },
    
    addError: (error) => {
      const id = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const fullError: FileError = { ...error, id }
      
      set(state => ({
        errors: new Map(state.errors).set(id, fullError)
      }))
      
      return id
    },
    
    resolveError: (id, resolution) => {
      const error = get().errors.get(id)
      if (error) {
        // 根据解决方案执行相应操作
        fileOperationAPI.resolveError(error, resolution)
        
        set(state => {
          const errors = new Map(state.errors)
          errors.delete(id)
          return { errors }
        })
      }
    },
    
    dismissError: (id) => {
      set(state => {
        const errors = new Map(state.errors)
        errors.delete(id)
        return { errors }
      })
    },
    
    getActiveOperations: () => {
      return Array.from(get().operations.values())
        .sort((a, b) => b.startTime - a.startTime)
    },
    
    getOperationHistory: () => {
      return get().history
    },
    
    getOperationById: (id) => {
      return get().operations.get(id)
    },
    
    // 文件操作API
    readFile: async (filePath, options) => {
      const operationId = get().addOperation({
        type: 'read',
        fileName: filePath.split('/').pop() || filePath,
        status: 'loading',
        progress: 0
      })
      
      try {
        const result = await fileOperationAPI.readFile(filePath, {
          ...options,
          onProgress: (progress: number) => {
            get().updateOperation(operationId, { progress })
          }
        })
        
        get().updateOperation(operationId, { 
          status: 'success', 
          progress: 100 
        })
        
        return result
      } catch (error) {
        get().updateOperation(operationId, { 
          status: 'error', 
          message: error.message 
        })
        
        // 添加错误处理
        get().addError({
          type: 'read_error',
          fileName: filePath,
          message: error.message,
          recoveryOptions: [
            {
              type: 'retry',
              label: '重试',
              description: '重新尝试读取文件'
            },
            {
              type: 'ignore',
              label: '忽略',
              description: '跳过此文件继续操作'
            }
          ]
        })
        
        throw error
      }
    },
    
    writeFile: async (filePath, content, options) => {
      const operationId = get().addOperation({
        type: 'write',
        fileName: filePath.split('/').pop() || filePath,
        status: 'loading',
        progress: 0
      })
      
      try {
        await fileOperationAPI.writeFile(filePath, content, {
          ...options,
          onProgress: (progress: number) => {
            get().updateOperation(operationId, { progress })
          }
        })
        
        get().updateOperation(operationId, { 
          status: 'success', 
          progress: 100 
        })
      } catch (error) {
        get().updateOperation(operationId, { 
          status: 'error', 
          message: error.message 
        })
        
        get().addError({
          type: 'write_error',
          fileName: filePath,
          message: error.message,
          recoveryOptions: [
            {
              type: 'retry',
              label: '重试',
              description: '重新尝试保存文件'
            },
            {
              type: 'backup',
              label: '创建备份',
              description: '将内容保存为备份文件'
            }
          ]
        })
        
        throw error
      }
    },
    
    saveFile: async (filePath, content, options) => {
      return get().writeFile(filePath, content, { ...options, type: 'save' })
    }
  }))
)

// 订阅器设置
useFileOperationStore.subscribe(
  (state) => state.errors,
  (errors) => {
    // 当有新错误时，自动显示错误对话框
    const errorArray = Array.from(errors.values())
    if (errorArray.length > 0) {
      // 触发错误处理UI显示
      window.dispatchEvent(new CustomEvent('fileOperationError', {
        detail: errorArray[errorArray.length - 1] // 显示最新错误
      }))
    }
  }
)
```

## 验收标准
1. 文件操作状态实时反馈系统100%工作正常
2. 错误处理对话框覆盖所有异常情况
3. 状态管理Store与Backend API集成无缝
4. 用户界面响应流畅，无明显延迟
5. 支持并发文件操作的状态管理

## 交付输出
- 文件状态反馈面板组件
- 错误处理对话框组件系统
- 完整的文件操作状态管理Store
- 组件使用文档和集成指南

## 依赖关系
- 依赖Backend文件操作引擎API
- 集成Epic 2的Tab系统和界面状态
- 为Epic 4-12的创作功能提供文件操作反馈基础