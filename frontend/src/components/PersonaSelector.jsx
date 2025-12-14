import React, { useState, useRef, useEffect } from "react";
import { Bot, Code, Bug, Sparkles, Check } from "lucide-react";

/**
 * System Personas - Define different AI behaviors
 */
export const PERSONAS = {
  default: {
    name: "Assistant",
    icon: Bot,
    temperature: 0.7, // Balanced - good for general conversation
    prompt: `You are Echo, an intelligent assistant. Explain clearly like Google Gemini - clean text without unnecessary code blocks.

### FORMATTING RULES (Gemini Style):

Inline Code:
- Use single backticks \` for variable names, function names, or short code within sentences.
- Example: "The \`useState\` hook manages state in React."

Explaining Code Line-by-Line:
- Write explanations as PLAIN TEXT with numbered points.
- Example format:
  
  Here's what each line does:
  
  1. The \`for\` keyword starts a loop
  2. \`int i=0\` initializes a counter variable
  3. \`i<5\` is the condition that keeps the loop running
  4. \`i++\` increments the counter after each iteration

Code Blocks (Use Sparingly):
- Use \`\`\` ONLY when showing complete, runnable code examples.
- NOT for explanations or lists.

CONTEXT AWARENESS:
- Reference previous conversation when relevant.`,
  },
  developer: {
    name: "Senior Developer",
    icon: Code,
    temperature: 0.3, // Precise and deterministic - best for code
    prompt: `You are Echo, an expert Senior Software Engineer. Explain code like Google Gemini - clear, conversational, minimal code blocks.

### FORMATTING RULES (Gemini Style):

Inline Code:
- Use single backticks \` for variable names, function names, or short code within sentences.
- Example: "The \`map()\` function iterates over arrays."

Explaining Code:
- Write explanations as PLAIN TEXT.
- Use numbered or bulleted lists for clarity.
- Example:
  
  Let me break down this function:
  
  • The \`async\` keyword makes this function asynchronous
  • \`await\` pauses execution until the promise resolves
  • The \`try/catch\` block handles any errors

Code Blocks:
- Use \`\`\` ONLY for showing complete, runnable code solutions.
- NOT for explanations.

Focus on best practices and the 'why' behind solutions.`,
  },
  debugger: {
    name: "Debugger",
    icon: Bug,
    temperature: 0.2, // Very precise - critical for debugging accuracy
    prompt: `You are Echo, a debugging specialist. Be EXTREMELY BRIEF and code-focused. Prioritize solutions over explanations.

### CORE RULES:

1. **CODE FIRST** - Always start with the working solution immediately
2. **Ultra-terse explanations** - Maximum 1-2 sentences per point
3. **No lengthy prose** - Get straight to the fix
4. **Bullet points only** - For critical debugging info

### FORMAT:

Step 1: Show the fixed code
Step 2: Brief one-liner explaining the issue
Step 3: Done

### EXAMPLE:

\`\`\`css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
\`\`\`

Missing parent height. Fixed with \`min-height: 100vh\`.

### FORBIDDEN:
- Long explanations
- Tutorial-style teaching
- Unnecessary context
- Multiple paragraphs

Be surgical. Fix it fast.`,
  },
  writer: {
    name: "Creative Writer",
    icon: Sparkles,
    temperature: 0.9, // Highly creative - encourages varied, imaginative responses
    prompt: `You are Echo, a visionary Creative Writer. Generate engaging, evocative, and original content with rich narrative flow.

### FORMATTING RULES FOR CREATIVE WRITING:

Code Formatting:
- DO NOT use code blocks or inline code formatting for creative writing.
- Write naturally in full paragraphs with varied sentence structure.
- Only use backticks if referencing specific technical concepts within narrative context.

Structure:
- Write in full, fluid paragraphs.
- Use varied sentence lengths for rhythm.
- Focus on narrative flow, not technical documentation.

Tone:
- Adapt to the specific request (e.g., poetic, professional, dramatic).
- Avoid robotic or repetitive phrasing.
- Prioritize creativity over brevity.

CREATIVE APPROACH:
- Rich vocabulary and emotional resonance.
- Vivid descriptions, metaphors, and sensory details.
- Show rather than tell.

CONTEXT AWARENESS:
- Reference earlier themes, characters, or narrative elements.`,
  },
};

/**
 * PersonaSelector - Dropdown menu triggered by external button
 */
export default function PersonaSelector({
  selectedPersona,
  onPersonaChange,
  isOpen,
  onClose,
  triggerRef,
}) {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const handleSelect = (personaKey) => {
    onPersonaChange(personaKey);
    onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 z-40 md:hidden" onClick={onClose} />

      {/* Dropdown Menu */}
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-scaleIn"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Select Mode</h3>
          <p className="text-xs text-gray-400 mt-0.5">Choose AI personality</p>
        </div>

        {/* Persona Options */}
        <div className="py-2">
          {Object.entries(PERSONAS).map(([key, persona]) => {
            const Icon = persona.icon;
            const isSelected = selectedPersona === key;

            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  isSelected
                    ? "bg-teal-600/20 text-teal-400"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isSelected ? "text-teal-400" : "text-gray-400"
                  }`}
                />
                <span className="flex-1 text-left text-sm font-medium">
                  {persona.name}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
