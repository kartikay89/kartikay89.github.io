import { useEffect, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = code;
      hljs.highlightElement(ref.current);
    }
  }, [code, language]);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{language || "text"}</span>
      </div>
      <pre className="m-0 p-4 overflow-x-auto text-sm leading-relaxed bg-gray-900">
        <code ref={ref} className={`language-${language}`} />
      </pre>
    </div>
  );
}
