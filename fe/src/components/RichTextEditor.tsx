import React, { useImperativeHandle, forwardRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  showToolbar?: boolean;
  toolbarPosition?: "top" | "bottom";
  debounceMs?: number;
  context?: "title" | "description" | "content";
}

const RichTextEditor = forwardRef<any, RichTextEditorProps>(
  (
    {
      content,
      onChange,
      placeholder = "Start typing...",
      className = "",
      style,
      showToolbar = true,
      toolbarPosition = "top",
      context = "content",
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
        }),
      ],
      content,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange(html);
      },
      editable: true,
      onFocus: () => setIsFocused(true),
      onBlur: () => {
        setTimeout(() => {
          if (!editor?.isFocused) {
            setIsFocused(false);
          }
        }, 10);
      },
    });

    // Expose editor methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getContent: () => editor?.getHTML() || "",
        setContent: (newContent: string) => {
          editor?.commands.setContent(newContent);
        },
        focus: () => {
          editor?.chain().focus().run();
        },
        clearContent: () => {
          editor?.commands.clearContent();
        },
        editor: editor,
      }),
      [editor],
    );

    // Enhanced toolbar component with smaller, professional buttons
    const Toolbar = () => (
      <div
        className="flex flex-wrap gap-0.5 p-1 h-8"
        onMouseDown={(e) => e.preventDefault()}
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor?.chain().focus().toggleBold().run();
          }}
          className={`min-w-[32px] min-h-[32px] p-1.5 rounded hover:bg-gray-100 text-xs font-medium transition-colors duration-150 ${editor?.isActive("bold") ? "text-blue-600 bg-blue-50" : "text-gray-600"}`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor?.chain().focus().toggleItalic().run();
          }}
          className={`min-w-[32px] min-h-[32px] p-1.5 rounded hover:bg-gray-100 text-xs font-medium transition-colors duration-150 ${editor?.isActive("italic") ? "text-blue-600 bg-blue-50 italic" : "text-gray-600"}`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor?.chain().focus().toggleUnderline().run();
          }}
          className={`min-w-[32px] min-h-[32px] p-1.5 rounded hover:bg-gray-100 text-xs font-medium transition-colors duration-150 ${editor?.isActive("underline") ? "text-blue-600 bg-blue-50 underline" : "text-gray-600"}`}
          title="Underline"
        >
          U
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor?.chain().focus().toggleLink().run();
          }}
          className={`min-w-[32px] min-h-[32px] p-1.5 rounded hover:bg-gray-100 text-xs font-medium transition-colors duration-150 ${editor?.isActive("link") ? "text-blue-600 bg-blue-50" : "text-gray-600"}`}
          title="Link"
        >
          🔗
        </button>
      </div>
    );

    // Get context-based minimum height
    const getMinHeight = () => {
      switch (context) {
        case "title":
          return "min-h-[20px]";
        case "description":
          return "min-h-[16px]";
        default:
          return "";
      }
    };

    return (
      <>
        <style>
          {`
            .ProseMirror-focused {
              outline: none !important;
            }
            .ProseMirror:focus {
              outline: none !important;
            }
          `}
        </style>
        <div
          className={`relative transition-all duration-200 ${className}`}
          style={style}
        >
          {showToolbar && toolbarPosition === "top" && isFocused && <Toolbar />}

          <div
            className={`border-b-2 transition-colors duration-200 ${
              isFocused ? "border-blue-500" : "border-transparent"
            }`}
          >
            <EditorContent
              editor={editor}
              className={`prose prose-sm max-w-none [&>*]:my-1 !border-0 [&_*]:!border-0 ${getMinHeight()}`}
            />
          </div>

          {showToolbar && toolbarPosition === "bottom" && isFocused && (
            <Toolbar />
          )}

          {!editor?.isFocused && content === "" && (
            <div className="absolute top-1 left-2 text-gray-400 pointer-events-none text-sm">
              {placeholder}
            </div>
          )}
        </div>
      </>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
