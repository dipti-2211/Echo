/**
 * Utility functions for the chat application
 */

/**
 * Truncates text to a specified length and adds ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation (default: 50)
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Generates a unique chat ID
 * @returns {string} - Unique identifier for a chat
 */
export const generateChatId = () => {
    return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Formats a timestamp for display
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} - Formatted time string
 */
export const formatTimestamp = (timestamp) => {
    try {
        return new Date(timestamp).toLocaleTimeString();
    } catch {
        return '';
    }
};

/**
 * Safely parses JSON with a fallback
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} - Parsed JSON or fallback
 */
export const safeJsonParse = (jsonString, fallback = null) => {
    try {
        return JSON.parse(jsonString);
    } catch {
        return fallback;
    }
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
