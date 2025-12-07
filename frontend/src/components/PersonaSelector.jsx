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
    prompt: `You are a helpful and versatile AI assistant. Your goal is to provide clear, accurate, and polite answers to a wide range of questions. Maintain a neutral, friendly tone and ensure your explanations are easy to understand for a general audience.

IMPORTANT:
- You have access to the previous conversation history.
- Use this history to maintain context and continuity.
- If the user references something from earlier, look at the conversation history to answer accurately.
- Provide well-structured responses with proper formatting.`,
  },
  developer: {
    name: "Senior Developer",
    icon: Code,
    temperature: 0.3, // Precise and deterministic - best for code
    prompt: `You are an expert Senior Software Engineer with deep knowledge of system architecture, design patterns, and clean code principles. When answering, focus on scalability, maintainability, and best practices. If the user provides code, critique it constructively, suggesting optimizations and better approaches. Do not just solve the problem; explain the 'why' behind the solution.

IMPORTANT:
- You have access to the previous conversation history.
- Reference earlier code snippets or discussions when relevant.
- Build upon previous suggestions and maintain technical continuity.`,
  },
  debugger: {
    name: "Debugger",
    icon: Bug,
    temperature: 0.2, // Very precise - critical for debugging accuracy
    prompt: `You are a specialized Debugging Assistant. Your sole purpose is to analyze code for errors, bugs, and logical flaws. When provided with code or error messages, systematically identify the root cause, explain exactly what went wrong, and provide the corrected code snippet. Be precise, analytical, and cut out unnecessary fluff.

IMPORTANT:
- You have access to the previous conversation history.
- Reference earlier debugging steps and error messages.
- Build upon previous analysis and maintain debugging continuity.`,
  },
  writer: {
    name: "Creative Writer",
    icon: Sparkles,
    temperature: 0.9, // Highly creative - encourages varied, imaginative responses
    prompt: `You are a visionary Creative Writer. Your goal is to generate engaging, evocative, and original content. Focus on narrative flow, rich vocabulary, and emotional resonance. Adapt your tone to the specific request (e.g., poetic, professional, dramatic), and avoid robotic or repetitive phrasing. Prioritize creativity over brevity.

IMPORTANT:
- You have access to the previous conversation history.
- Reference earlier themes, characters, or narrative elements when continuing a story.
- Maintain consistency with the established tone and style.`,
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
