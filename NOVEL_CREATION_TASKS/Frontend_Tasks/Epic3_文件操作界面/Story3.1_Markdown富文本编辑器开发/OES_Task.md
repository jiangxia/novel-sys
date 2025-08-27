# Story 3.1: Markdown富文本编辑器开发

## O (Objective)

### 功能目标
- 实现功能完整的Markdown富文本编辑器，支持小说创作的核心编辑需求
- 提供实时预览、字数统计、自动保存状态等用户体验功能
- 构建响应式的右侧内容区编辑界面，适配双层Tab结构

### 技术目标  
- 基于React构建高性能的文本编辑器组件
- 实现Markdown语法支持和实时渲染功能
- 集成文件状态管理，支持自动保存和手动保存
- 提供可扩展的编辑器插件架构

## E (Environment)

### 技术环境
- **前端框架**：React 18+ + TypeScript
- **编辑器核心**：Monaco Editor 或 CodeMirror 6
- **Markdown解析**：react-markdown + remark插件生态
- **样式方案**：TailwindCSS + 自定义编辑器样式
- **状态管理**：React Hook + Context API

### 依赖环境
- **文件状态服务**：依赖Epic3后端文件操作API
- **保存机制**：集成自动保存和手动保存功能
- **Tab系统**：适配右侧内容区的双层Tab架构
- **UI框架**：与主工作界面的设计系统保持一致

### 编辑器架构设计
```typescript
// 编辑器组件架构
components/
├── FileEditor/
│   ├── MarkdownEditor.tsx       // 主编辑器容器
│   ├── EditorToolbar.tsx        // 编辑器工具栏
│   ├── EditorCore.tsx           // 编辑器核心组件
│   ├── PreviewPanel.tsx         // 实时预览面板
│   ├── StatusBar.tsx            // 状态栏（字数、保存状态等）
│   └── EditorSettings.tsx       // 编辑器设置面板
├── MarkdownRenderer/
│   ├── MarkdownRenderer.tsx     // Markdown渲染器
│   ├── CustomComponents.tsx     // 自定义渲染组件
│   └── SyntaxHighlighter.tsx    // 代码高亮组件
└── hooks/
    ├── useFileContent.ts        // 文件内容管理Hook
    ├── useAutoSave.ts           // 自动保存Hook
    └── useEditorState.ts        // 编辑器状态管理
```

## S (Success Criteria)

### 及格标准 (Must Have)
- [ ] **基础编辑功能**：支持文本输入、删除、复制粘贴等基础编辑操作
- [ ] **Markdown语法**：支持标题、列表、链接、粗体斜体等常用Markdown语法
- [ ] **实时预览**：编辑内容实时渲染为HTML预览，支持分屏显示
- [ ] **字数统计**：实时显示字符数、词数统计信息
- [ ] **文件操作**：支持文件内容加载、编辑、保存等基础文件操作

### 优秀标准 (Should Have)
- [ ] **自动保存指示**：清晰显示文件保存状态（已保存、未保存、保存中）
- [ ] **编辑器工具栏**：提供常用Markdown格式化快捷按钮
- [ ] **语法高亮**：编辑器内Markdown语法高亮显示
- [ ] **快捷键支持**：支持Ctrl+S保存、Ctrl+Z撤销等快捷键
- [ ] **预览样式美化**：预览区域使用美观的Markdown渲染样式

### 卓越标准 (Nice to Have)
- [ ] **分屏模式**：支持编辑/预览分屏、纯编辑、纯预览多种显示模式
- [ ] **代码块高亮**：预览区域代码块语法高亮支持
- [ ] **表格编辑**：Markdown表格的可视化编辑支持
- [ ] **图片处理**：本地图片拖拽插入和预览支持
- [ ] **搜索替换**：编辑器内文本搜索和替换功能

## 具体任务分解

### Task 3.1.1: 编辑器核心组件搭建 (4-5小时)
- 创建MarkdownEditor主容器组件
- 集成Monaco Editor或CodeMirror编辑器核心
- 实现基础的文本编辑功能和事件处理
- 配置编辑器基础样式和主题

### Task 3.1.2: Markdown解析和预览实现 (3-4小时)
- 集成react-markdown和相关插件
- 开发PreviewPanel实时预览组件
- 实现编辑内容到HTML的实时渲染
- 配置Markdown渲染样式和自定义组件

### Task 3.1.3: 文件状态管理和保存机制 (3-4小时)
- 开发useFileContent文件内容管理Hook
- 实现文件加载、编辑状态跟踪
- 集成手动保存和自动保存触发机制
- 开发StatusBar保存状态显示组件

### Task 3.1.4: 编辑器工具栏和交互功能 (2-3小时)
- 开发EditorToolbar编辑器工具栏
- 实现常用Markdown格式化快捷按钮
- 添加字数统计和文档信息显示
- 实现编辑器快捷键和键盘交互

### Task 3.1.5: 界面集成和用户体验优化 (2-3小时)
- 集成编辑器到右侧内容区双层Tab系统
- 优化编辑器响应式布局和移动端适配
- 完善错误处理和用户提示机制
- 进行编辑器性能优化和测试

## 开发参考

### Monaco Editor集成参考
```typescript
// EditorCore.tsx - Monaco Editor集成
import * as monaco from 'monaco-editor';
import { useRef, useEffect } from 'react';

interface EditorCoreProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
}

const EditorCore: React.FC<EditorCoreProps> = ({ 
  value, 
  onChange, 
  language = 'markdown',
  theme = 'vs-dark' 
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language,
        theme,
        automaticLayout: true,
        wordWrap: 'on',
        fontSize: 14,
        lineHeight: 22,
        minimap: { enabled: false }
      });

      editorRef.current.onDidChangeModelContent(() => {
        const newValue = editorRef.current?.getValue() || '';
        onChange(newValue);
      });
    }

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
};
```

### 实时预览组件参考
```typescript
// PreviewPanel.tsx - Markdown预览组件
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface PreviewPanelProps {
  content: string;
  className?: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ content, className }) => {
  return (
    <div className={`prose prose-gray max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
```

### 文件状态管理Hook参考
```typescript
// hooks/useFileContent.ts - 文件内容管理
import { useState, useEffect, useCallback } from 'react';

interface UseFileContentProps {
  filePath: string;
  autoSaveInterval?: number;
}

export const useFileContent = ({ 
  filePath, 
  autoSaveInterval = 30000 
}: UseFileContentProps) => {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const isDirty = content !== originalContent;

  // 加载文件内容
  const loadFile = useCallback(async () => {
    try {
      const response = await fetch(`/api/files/read?path=${encodeURIComponent(filePath)}`);
      const data = await response.json();
      setContent(data.content);
      setOriginalContent(data.content);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  }, [filePath]);

  // 保存文件
  const saveFile = useCallback(async () => {
    if (!isDirty) return;
    
    setSaveStatus('saving');
    try {
      await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content })
      });
      
      setOriginalContent(content);
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    } catch (error) {
      setSaveStatus('unsaved');
      console.error('Failed to save file:', error);
    }
  }, [filePath, content, isDirty]);

  // 内容变更处理
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setSaveStatus('unsaved');
  }, []);

  // 自动保存
  useEffect(() => {
    if (!isDirty) return;

    const autoSaveTimer = setTimeout(() => {
      saveFile();
    }, autoSaveInterval);

    return () => clearTimeout(autoSaveTimer);
  }, [content, isDirty, autoSaveInterval, saveFile]);

  return {
    content,
    saveStatus,
    lastSavedAt,
    isDirty,
    loadFile,
    saveFile,
    handleContentChange
  };
};
```

### 状态栏组件参考
```typescript
// StatusBar.tsx - 编辑器状态栏
interface StatusBarProps {
  content: string;
  saveStatus: 'saved' | 'unsaved' | 'saving';
  lastSavedAt: Date | null;
  onSave: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({
  content,
  saveStatus,
  lastSavedAt,
  onSave
}) => {
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.length;

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saved':
        return lastSavedAt ? `已保存 ${formatTime(lastSavedAt)}` : '已保存';
      case 'unsaved':
        return '未保存';
      case 'saving':
        return '保存中...';
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-100 text-sm text-gray-600">
      <div className="flex items-center space-x-4">
        <span>字数: {wordCount}</span>
        <span>字符: {charCount}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className={`
          ${saveStatus === 'saved' ? 'text-green-600' : ''}
          ${saveStatus === 'unsaved' ? 'text-orange-600' : ''}
          ${saveStatus === 'saving' ? 'text-blue-600' : ''}
        `}>
          {getSaveStatusText()}
        </span>
        
        {saveStatus === 'unsaved' && (
          <button
            onClick={onSave}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            保存
          </button>
        )}
      </div>
    </div>
  );
};
```

## API接口需求

### 文件操作接口
```typescript
// 文件读取接口
GET /api/files/read?path=<filePath>
Response: {
  success: boolean;
  data: {
    content: string;
    metadata: {
      size: number;
      lastModified: string;
      encoding: string;
    };
  };
}

// 文件保存接口  
POST /api/files/save
Body: {
  path: string;
  content: string;
}
Response: {
  success: boolean;
  message: string;
}
```

## 验收标准
1. **编辑功能完整性**：所有基础文本编辑功能正常工作
2. **Markdown支持度**：常用Markdown语法正确解析和预览
3. **性能表现**：大文件编辑流畅，实时预览响应及时
4. **用户体验**：界面友好，状态反馈清晰，操作符合直觉
5. **集成兼容性**：与整体应用界面和后端API良好集成