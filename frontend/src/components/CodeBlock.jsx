import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

export default function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);

  // Extract language from className (format: language-javascript)
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  // Inline code (like `variable`)
  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 bg-gray-800/50 text-teal-400 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }

  // Block code with syntax highlighting
  return (
    <div className="my-4 rounded-md overflow-hidden border border-gray-700/50">
      {/* Top Bar - Language & Copy Button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2f2f2f] border-b border-gray-700/50">
        <span className="text-xs text-gray-400 font-mono">
          {language || "plaintext"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <SyntaxHighlighter
        language={language || "plaintext"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          backgroundColor: "#0d0d0d",
          fontSize: "0.875rem",
          lineHeight: "1.5",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          },
        }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}
