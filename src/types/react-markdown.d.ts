declare module 'react-markdown' {
  import * as React from 'react';
  interface ReactMarkdownProps {
    children?: string | string[];
    className?: string;
  }
  const ReactMarkdown: React.FC<ReactMarkdownProps>;
  export default ReactMarkdown;
}