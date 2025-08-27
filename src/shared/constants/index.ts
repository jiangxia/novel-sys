// 应用常量
export const APP_CONFIG = {
  NAME: '小说创作系统',
  VERSION: '0.0.1-alpha',
  EPIC: 'Epic 0: 技术环境搭建'
} as const

// API端点
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  AI: '/api/ai',
  PROJECT: '/api/project', 
  FILE: '/api/file'
} as const

// 项目目录结构
export const PROJECT_STRUCTURE = {
  SETTINGS: '0-小说设定',
  OUTLINES: '1-故事大纲',
  SUMMARIES: '2-故事概要',
  CONTENTS: '3-小说内容'
} as const

// AI角色映射
export const AI_ROLES = {
  DIRECTOR: 'director',   // 总监
  ARCHITECT: 'architect', // 架构师
  PLANNER: 'planner',     // 规划师
  WRITER: 'writer'        // 写手
} as const

// 角色中文名映射
export const ROLE_NAMES = {
  [AI_ROLES.DIRECTOR]: '总监',
  [AI_ROLES.ARCHITECT]: '架构师', 
  [AI_ROLES.PLANNER]: '规划师',
  [AI_ROLES.WRITER]: '写手'
} as const