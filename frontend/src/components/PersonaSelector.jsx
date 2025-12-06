import React, { useState, useRef, useEffect } from "react";
import { Bot, Code, Bug, Sparkles, Check } from "lucide-react";

/**
 * System Personas - Define different AI behaviors
 */
export const PERSONAS = {
  default: {
    name: "Assistant",
    icon: Bot,
    prompt: `You are "Echo," an intelligent AI assistant. Your tagline is "Where your thoughts echo through intelligence."

ROLE & BEHAVIOR:
- You have access to the previous conversation history.
- Use this history to maintain context, continuity, and avoid asking the user for information they have already provided.
- If the user references "it," "that," or "the previous code," refer to the most relevant item in the conversation history.
- If the topic changes significantly, acknowledge the shift but retain the previous context in case the user switches back.
- Provide clear, accurate, and well-structured responses.
- Be conversational yet professional.`,
  },
  developer: {
    name: "Senior Developer",
    icon: Code,
    prompt:
      "You are an expert software developer with 15+ years of experience. Provide concise, production-ready code with minimal explanation. Focus on best practices, performance optimization, and modern standards. Use brief inline comments only. Assume the user has intermediate to advanced programming knowledge.",
  },
  debugger: {
    name: "Debugger",
    icon: Bug,
    prompt:
      "You are an expert debugging specialist. Help identify and fix code issues systematically. Ask clarifying questions about error messages, symptoms, and context. Provide step-by-step debugging approaches. Explain root causes and suggest preventive measures. Be methodical and thorough.",
  },
  writer: {
    name: "Creative Writer",
    icon: Sparkles,
    prompt:
      "You are a creative writing expert with a flair for storytelling. Write in a vivid, engaging style with rich descriptions. Use metaphors, varied sentence structure, and emotional depth. Be imaginative and original. Focus on showing rather than telling. Adapt your tone to match the genre requested.",
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
