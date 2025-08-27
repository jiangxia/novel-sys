// API响应的统一格式
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// 健康检查响应
export interface HealthResponse {
  message: string
  version: string
  epic: string
}

// AI角色类型
export type RoleType = 'director' | 'architect' | 'planner' | 'writer'

// 项目类型
export interface ProjectInfo {
  name: string
  path: string
  structure: {
    settings: string[]    // 0-小说设定
    outlines: string[]    // 1-故事大纲
    summaries: string[]   // 2-故事概要
    contents: string[]    // 3-小说内容
  }
}