import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
  Undo,
  Redo,
  Code,
  Eye,
} from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your description here...',
  disabled = false,
  minHeight = '180px',
  className = '',
}) => {
  const { prompt } = useDialog();
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRange = useRef<Range | null>(null);
  const [activeMode, setActiveMode] = useState<'visual' | 'code'>('visual');
  const [codeValue, setCodeValue] = useState<string>(value);
  const isUpdatingFromProp = useRef(false);

  // Normalize initial and incoming value to HTML if plain text with newlines
  const formatInitialHtml = useCallback((raw: string) => {
    if (!raw) return '';
    // If it already looks like HTML (has tags), return as is
    if (/<[a-z][\s\S]*>/i.test(raw)) {
      return raw;
    }
    // Otherwise convert newlines to paragraphs / breaks
    return raw
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }, []);

  // Sync prop value into the editor DOM
  useEffect(() => {
    if (editorRef.current && activeMode === 'visual') {
      const currentHtml = editorRef.current.innerHTML;
      const formattedProp = formatInitialHtml(value);
      if (currentHtml !== formattedProp && !isUpdatingFromProp.current) {
        editorRef.current.innerHTML = formattedProp;
      }
    }
    setCodeValue(value);
  }, [value, activeMode, formatInitialHtml]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    // Check if truly empty
    const textOnly = editorRef.current.innerText.trim();
    const finalVal = textOnly.length === 0 && !/<img|<video|<iframe/i.test(html) ? '' : html;
    isUpdatingFromProp.current = true;
    onChange(finalVal);
    setCodeValue(finalVal);
    setTimeout(() => {
      isUpdatingFromProp.current = false;
    }, 0);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCodeValue(val);
    onChange(val);
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (disabled || activeMode !== 'visual') return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleInsertLink = async () => {
    if (disabled || activeMode !== 'visual') return;
    
    // Save current text selection before dialog opens
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRange.current = sel.getRangeAt(0).cloneRange();
    }

    const url = await prompt({
      title: 'Insert Link',
      message: 'Enter the destination URL (e.g. https://legash.org):',
      defaultValue: 'https://',
      placeholder: 'https://example.com',
      confirmText: 'Insert Link',
      validate: (val) => {
        const clean = val.trim();
        if (!clean || clean === 'https://' || clean === 'http://') {
          return 'Please provide a valid URL.';
        }
        return null;
      },
    });

    if (url && url.trim().length > 0 && url !== 'https://') {
      if (editorRef.current) {
        editorRef.current.focus();
        if (savedSelectionRange.current && sel) {
          sel.removeAllRanges();
          sel.addRange(savedSelectionRange.current);
        }
      }
      document.execCommand('createLink', false, url.trim());
      handleInput();
    }
  };

  const handleHeading = (tag: string) => {
    executeCommand('formatBlock', `<${tag}>`);
  };

  // Calculate statistics
  const getStats = () => {
    const temp = document.createElement('div');
    temp.innerHTML = value || '';
    const text = temp.innerText || temp.textContent || '';
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    return { words, chars };
  };

  const { words, chars } = getStats();

  return (
    <div
      className={`border border-line-soft rounded-2xl bg-white shadow-xs overflow-hidden transition-all focus-within:border-crimson ${className}`}
    >
      {/* Top Toolbar */}
      <div className="bg-paper/80 border-b border-line-soft p-1.5 sm:p-2 flex flex-wrap items-center justify-between gap-1">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
          <ToolbarButton
            icon={<Bold size={15} />}
            title="Bold (Ctrl+B)"
            onClick={() => executeCommand('bold')}
            disabled={disabled || activeMode === 'code'}
          />
          <ToolbarButton
            icon={<Italic size={15} />}
            title="Italic (Ctrl+I)"
            onClick={() => executeCommand('italic')}
            disabled={disabled || activeMode === 'code'}
          />
          <ToolbarButton
            icon={<Underline size={15} />}
            title="Underline (Ctrl+U)"
            onClick={() => executeCommand('underline')}
            disabled={disabled || activeMode === 'code'}
          />
          <ToolbarButton
            icon={<Strikethrough size={15} />}
            title="Strikethrough"
            onClick={() => executeCommand('strikeThrough')}
            disabled={disabled || activeMode === 'code'}
          />

          <div className="w-[1px] h-5 bg-line-soft mx-0.5" />

          <ToolbarButton
            icon={<Heading1 size={15} />}
            title="Heading 1"
            onClick={() => handleHeading('h3')}
            disabled={disabled || activeMode === 'code'}
          />
          <ToolbarButton
            icon={<Heading2 size={15} />}
            title="Heading 2"
            onClick={() => handleHeading('h4')}
            disabled={disabled || activeMode === 'code'}
          />

          <div className="w-[1px] h-5 bg-line-soft mx-0.5" />

          <ToolbarButton
            icon={<List size={15} />}
            title="Bullet List"
            onClick={() => executeCommand('insertUnorderedList')}
            disabled={disabled || activeMode === 'code'}
          />
          <ToolbarButton
            icon={<ListOrdered size={15} />}
            title="Numbered List"
            onClick={() => executeCommand('insertOrderedList')}
            disabled={disabled || activeMode === 'code'}
          />
          <ToolbarButton
            icon={<Quote size={15} />}
            title="Blockquote"
            onClick={() => handleHeading('blockquote')}
            disabled={disabled || activeMode === 'code'}
          />
          <ToolbarButton
            icon={<Minus size={15} />}
            title="Horizontal Divider"
            onClick={() => executeCommand('insertHorizontalRule')}
            disabled={disabled || activeMode === 'code'}
          />

          <div className="w-[1px] h-5 bg-line-soft mx-0.5" />

          <ToolbarButton
            icon={<LinkIcon size={15} />}
            title="Insert Link"
            onClick={handleInsertLink}
            disabled={disabled || activeMode === 'code'}
          />
          <ToolbarButton
            icon={<Unlink size={15} />}
            title="Remove Link"
            onClick={() => executeCommand('unlink')}
            disabled={disabled || activeMode === 'code'}
          />
          <ToolbarButton
            icon={<RemoveFormatting size={15} />}
            title="Clear Formatting"
            onClick={() => executeCommand('removeFormat')}
            disabled={disabled || activeMode === 'code'}
          />

          <div className="w-[1px] h-5 bg-line-soft mx-0.5 hidden sm:block" />

          <ToolbarButton
            icon={<Undo size={15} />}
            title="Undo"
            onClick={() => executeCommand('undo')}
            disabled={disabled || activeMode === 'code'}
            className="hidden sm:inline-flex"
          />
          <ToolbarButton
            icon={<Redo size={15} />}
            title="Redo"
            onClick={() => executeCommand('redo')}
            disabled={disabled || activeMode === 'code'}
            className="hidden sm:inline-flex"
          />
        </div>

        {/* View Mode Toggle (Visual vs Code) */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-line-soft shrink-0">
          <button
            type="button"
            onClick={() => {
              if (activeMode === 'code' && editorRef.current) {
                editorRef.current.innerHTML = codeValue;
              }
              setActiveMode('visual');
            }}
            className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
              activeMode === 'visual'
                ? 'bg-crimson text-white shadow-xs'
                : 'text-ink-soft hover:text-ink'
            }`}
            title="Visual WYSIWYG Editor"
          >
            <Eye size={12} />
            <span className="hidden xs:inline">Visual</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (editorRef.current) {
                setCodeValue(editorRef.current.innerHTML);
              }
              setActiveMode('code');
            }}
            className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
              activeMode === 'code'
                ? 'bg-ink text-white shadow-xs'
                : 'text-ink-soft hover:text-ink'
            }`}
            title="HTML Source Code View"
          >
            <Code size={12} />
            <span className="hidden xs:inline">HTML</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeMode === 'visual' ? (
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleInput}
            onBlur={handleInput}
            style={{ minHeight }}
            className="p-4 sm:p-5 outline-none text-ink text-sm font-sans leading-relaxed rich-editor-content overflow-y-auto max-h-[360px]"
            data-placeholder={placeholder}
          />
          {(!value || value === '<p></p>' || value === '<br>') && (
            <div className="absolute top-4 sm:top-5 left-4 sm:left-5 pointer-events-none text-ink-soft/40 text-sm italic select-none">
              {placeholder}
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={codeValue}
          onChange={handleCodeChange}
          disabled={disabled}
          style={{ minHeight }}
          placeholder="<p>Enter HTML formatted event description...</p>"
          className="w-full p-4 sm:p-5 outline-none font-mono text-xs text-ink bg-paper/30 resize-none max-h-[360px]"
        />
      )}

      {/* Editor Footer / Stats */}
      <div className="px-4 py-2 bg-paper/40 border-t border-line-soft flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-ink-soft/60">
        <div className="flex items-center gap-3">
          <span>{words} word{words === 1 ? '' : 's'}</span>
          <span>{chars} character{chars === 1 ? '' : 's'}</span>
        </div>
        <span className="text-ink-soft/40 italic">
          Press Enter for new line • Shift+Enter for soft break
        </span>
      </div>
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  title,
  onClick,
  disabled = false,
  className = '',
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-lg text-ink-soft hover:text-crimson hover:bg-white active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all ${className}`}
  >
    {icon}
  </button>
);

export default RichTextEditor;
