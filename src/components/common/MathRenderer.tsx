import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch (err) {
      console.error('KaTeX error:', err);
      return `<span>${math}</span>`;
    }
  }, [math, block]);

  return (
    <span
      className={`${block ? 'block my-2 overflow-x-auto py-1 text-center' : 'inline-block align-middle'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
