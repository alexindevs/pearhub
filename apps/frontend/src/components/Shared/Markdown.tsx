'use client';

import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Table,
  Eye,
  Edit,
} from 'lucide-react';

interface MarkdownFormatterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  rows?: number;
}

export function MarkdownFormatter({
  value,
  onChange,
  className,
  placeholder = 'Write your markdown content here...',
  rows = 15,
}: MarkdownFormatterProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (
    startChars: string,
    endChars: string = startChars,
    placeholder: string = ''
  ) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    const textToInsert = selectedText ? selectedText : placeholder;
    const newText =
      textarea.value.substring(0, start) +
      startChars +
      textToInsert +
      endChars +
      textarea.value.substring(end);

    onChange(newText);

    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      if (!selectedText && placeholder) {
        textarea.setSelectionRange(
          start + startChars.length,
          start + startChars.length + placeholder.length
        );
      } else {
        textarea.setSelectionRange(
          start + startChars.length + textToInsert.length + endChars.length,
          start + startChars.length + textToInsert.length + endChars.length
        );
      }
    }, 0);
  };

  const handleHeading = (level: number) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    let lineStart = start;

    // Find the beginning of the current line
    while (lineStart > 0 && textarea.value.charAt(lineStart - 1) !== '\n') {
      lineStart--;
    }

    // Check if there's already a heading at this level
    const currentLine = textarea.value.substring(
      lineStart,
      textarea.value.indexOf('\n', lineStart) >= 0
        ? textarea.value.indexOf('\n', lineStart)
        : textarea.value.length
    );

    const prefix = '#'.repeat(level) + ' ';

    // If there's already a heading, remove it or replace it with the correct level
    if (currentLine.startsWith('#')) {
      const newText =
        textarea.value.substring(0, lineStart) +
        prefix +
        currentLine.replace(/^#+\s/, '') +
        textarea.value.substring(lineStart + currentLine.length);

      onChange(newText);
    } else {
      // If not, add the heading prefix
      const newText =
        textarea.value.substring(0, lineStart) + prefix + textarea.value.substring(lineStart);

      onChange(newText);
    }

    // Position cursor after the heading prefix
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
    }, 0);
  };

  const handleList = (ordered: boolean) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    // If text is selected, format each line with list markers
    if (selectedText) {
      const lines = selectedText.split('\n');
      const formattedLines = lines.map((line, index) => {
        if (line.trim() === '') return line;
        return ordered
          ? `${index + 1}. ${line.replace(/^\d+\.\s|^\-\s/, '')}`
          : `- ${line.replace(/^\d+\.\s|^\-\s/, '')}`;
      });

      const newText =
        textarea.value.substring(0, start) +
        formattedLines.join('\n') +
        textarea.value.substring(end);

      onChange(newText);
    } else {
      // If no text selected, just insert a list marker at cursor
      const prefix = ordered ? '1. ' : '- ';
      insertMarkdown(prefix, '', 'List item');
    }
  };

  const handleLink = () => {
    insertMarkdown('[', '](url)', 'link text');
  };

  const handleImage = () => {
    insertMarkdown('![', '](image-url)', 'alt text');
  };

  const handleTable = () => {
    const tableTemplate =
      '| Header 1 | Header 2 | Header 3 |\n' +
      '| -------- | -------- | -------- |\n' +
      '| Cell 1   | Cell 2   | Cell 3   |\n' +
      '| Cell 4   | Cell 5   | Cell 6   |';

    insertMarkdown(tableTemplate, '');
  };

  const handleInsertCode = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    // If selection is on a single line, use inline code format
    if (!selectedText.includes('\n')) {
      insertMarkdown('`', '`', 'code');
    } else {
      // For multi-line selection, use code block
      insertMarkdown('```\n', '\n```', selectedText || 'code block');
    }
  };

  return (
    <div className="w-full">
      <Tabs
        defaultValue="write"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'write' | 'preview')}
        className="w-full"
      >
        <TabsList className="mb-2">
          <TabsTrigger value="write" className="flex items-center gap-1">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Write</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="w-full">
          <div className="border border-input rounded-md mb-2">
            <div className="flex flex-wrap items-center gap-0.5 p-1 bg-muted/30 border-b border-input">
              <ToolbarButton onClick={() => insertMarkdown('**', '**', 'bold text')} tooltip="Bold">
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertMarkdown('*', '*', 'italic text')}
                tooltip="Italic"
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertMarkdown('~~', '~~', 'strikethrough text')}
                tooltip="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton onClick={() => handleHeading(1)} tooltip="Heading 1">
                <Heading1 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => handleHeading(2)} tooltip="Heading 2">
                <Heading2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => handleHeading(3)} tooltip="Heading 3">
                <Heading3 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton onClick={() => handleList(false)} tooltip="Bullet List">
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => handleList(true)} tooltip="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => insertMarkdown('> ', '', 'Blockquote')}
                tooltip="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton onClick={handleLink} tooltip="Link">
                <Link className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={handleImage} tooltip="Image">
                <Image className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={handleInsertCode} tooltip="Code">
                <Code className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={handleTable} tooltip="Table">
                <Table className="w-4 h-4" />
              </ToolbarButton>
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className={cn(
                'w-full rounded-b-md px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono',
                className
              )}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Tip: Use the toolbar above or standard Markdown syntax for formatting.
          </div>
        </TabsContent>

        <TabsContent value="preview" className="w-full">
          <div className="rounded-md border border-input px-4 py-3 min-h-[200px] prose prose-sm max-w-none dark:prose-invert">
            {value ? (
              <MarkdownDisplayer content={value} />
            ) : (
              <p className="text-muted-foreground">Nothing to preview yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const ToolbarButton = ({
  onClick,
  tooltip,
  children,
}: {
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded hover:bg-muted/80 transition-colors"
      title={tooltip}
    >
      {children}
    </button>
  );
};

const ToolbarDivider = () => {
  return <div className="w-px h-6 bg-border mx-0.5" />;
};

interface MarkdownDisplayerProps {
  content: string;
  className?: string;
}

export function MarkdownDisplayer({ content, className }: MarkdownDisplayerProps) {
  return (
    <div
      className={cn('prose prose-sm max-h-[200px] overflow-scroll dark:prose-invert', className)}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
