import { useState, useEffect } from 'react'

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('检查中...')

  useEffect(() => {
    // 测试后端连接
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealthStatus(`后端连接正常: ${data.message}`)
      })
      .catch(() => {
        setHealthStatus('后端连接失败')
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          小说创作系统
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          基于AI驱动的本地化小说创作平台
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">系统状态:</p>
          <p className="text-lg font-medium text-gray-900 mt-2">
            {healthStatus}
          </p>
        </div>
        <div className="mt-8 text-sm text-gray-400">
          版本: 0.0.1-alpha | Epic 0: 技术环境搭建
        </div>
      </div>
    </div>
  )
}

export default App