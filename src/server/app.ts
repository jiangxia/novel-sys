import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件配置
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 健康检查路由
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: '小说创作系统后端服务正常运行',
    timestamp: new Date().toISOString(),
    version: '0.0.1-alpha',
    epic: 'Epic 0: 技术环境搭建'
  })
})

// API路由占位
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: '小说创作系统 API',
    version: '0.0.1-alpha',
    endpoints: {
      health: '/api/health',
      ai: '/api/ai/*',
      project: '/api/project/*', 
      file: '/api/file/*'
    }
  })
})

// 全局错误处理
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('错误:', err.stack)
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    timestamp: new Date().toISOString()
  })
})

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    path: req.path,
    timestamp: new Date().toISOString()
  })
})

app.listen(PORT, () => {
  console.log(`🚀 小说创作系统后端服务启动成功`)
  console.log(`📍 服务地址: http://localhost:${PORT}`)
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`)
  console.log(`🎯 Epic: Epic 0 - 技术环境搭建`)
})