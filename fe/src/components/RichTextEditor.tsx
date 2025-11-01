import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  showToolbar?: boolean;
  toolbarPosition?: 'top' | 'bottom';
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // Prevent toolbar from losing focus
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="flex items-center gap-1 p-2 bg-white border border-gray-200 rounded-md shadow-sm"
      onMouseDown={handleMouseDown}
    >
      <button
        onMouseDown={handleMouseDown}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive('bold')
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
        title="Bold"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z" />
        </svg>
      </button>
      <button
        onMouseDown={handleMouseDown}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive('italic')
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
        title="Italic"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z" />
        </svg>
      </button>
      <button
        onMouseDown={handleMouseDown}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive('underline')
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
        title="Underline"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5,21H19V19H5V21M12,17A6,6 0 0,0 18,11V3H15.5V11A3.5,3.5 0 0,1 12,14.5A3.5,3.5 0 0,1 8.5,11V3H6V11A6,6 0 0,0 12,17Z" />
        </svg>
      </button>
      <button
        onMouseDown={handleMouseDown}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded transition-colors ${
          editor.isActive('strike')
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
        title="Strikethrough"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23,12V14H18.61C19.61,16.14 19.56,22 12.38,22C4.05,22.05 4.37,15.5 4.37,15.5L8.34,15.55C8.34,15.55 8.14,18.82 11.5,18.82C14.86,18.82 15.12,16.5 14.5,14H1V12H23M3.41,10H20.59C20.59,10 20.75,5.12 15.39,5.05C10.03,4.96 9.92,9.17 9.92,9.17L5.96,9.12C5.96,9.12 5.39,1.62 13.29,2C19.7,2.31 21.82,7.05 21.82,7.05L17.86,7.08C17.86,7.08 16.95,5.03 14.5,5.03C12.05,5.03 11.5,7.08 11.5,7.08L3.41,7.05V10Z" />
        </svg>
      </button>
      <button
        onMouseDown={handleMouseDown}
        onClick={setLink}
        className={`p-2 rounded transition-colors ${
          editor.isActive('link')
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
        title="Link"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z" />
        </svg>
      </button>
    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing...',
  className = '',
  style = {},
  showToolbar = true,
  toolbarPosition = 'top'
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[40px] outline-none',
        style: {
          fontSize: 'inherit',
          color: 'inherit',
          fontWeight: 'inherit',
          lineHeight: 'inherit',
        }
      }
    }
  });

  // Update editor content when prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  // Add custom styles to prevent Tiptap conflicts
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ProseMirror {
        outline: none !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        background: transparent !important;
        font-size: inherit !important;
        color: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        min-height: 40px !important;
      }
      .ProseMirror p {
        margin: 0 !important;
        padding: 0 !important;
      }
      .ProseMirror:focus {
        outline: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className={`relative ${className}`}
      style={style}
    >
      {/* Toolbar */}
      {showToolbar && isFocused && toolbarPosition === 'top' && (
        <div style={{ marginBottom: '8px' }}>
          <MenuBar editor={editor} />
        </div>
      )}

      {/* Editor */}
      <div
        className={`
          transition-all duration-200
          ${style?.border === 'none' && !style?.borderBottom ? '' : `
            ${style?.border ? '' : 'border rounded-md'}
            ${isFocused && style?.border !== 'none'
              ? 'border-purple-400 ring-2 ring-purple-400 ring-opacity-20'
              : style?.border !== 'none'
              ? 'border-gray-200 hover:border-gray-300'
              : ''
            }
          `}
        `}
        style={{
          padding: style?.padding || '8px',
          background: style?.background || 'white',
          cursor: 'text',
          minHeight: '60px',
          border: style?.border,
          borderBottom: style?.borderBottom,
          borderRadius: style?.border === 'none' ? '0' : undefined,
        }}
      >
        <div style={{ fontSize: style?.fontSize, color: style?.color }}>
          <EditorContent
            editor={editor}
          />
        </div>
        {!editor.getText() && (
          <div
            className="absolute pointer-events-none text-gray-400"
            style={{
              top: style?.padding === '8px 0' ? '8px' :
                  style?.padding === '12px 0' ? '12px' : '8px',
              left: style?.padding?.includes('0') ? '0' : '8px',
              fontSize: style?.fontSize,
              fontWeight: style?.fontWeight,
              color: style?.color,
            }}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* Bottom Toolbar */}
      {showToolbar && isFocused && toolbarPosition === 'bottom' && (
        <div style={{ marginTop: '8px' }}>
          <MenuBar editor={editor} />
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;