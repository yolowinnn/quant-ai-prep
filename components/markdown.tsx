import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-quant">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
