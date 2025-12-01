import { useState, useEffect, useRef } from 'react';

/**
 * High-performance typewriter hook with chunking for streaming effect
 * @param {string} text - The full text to display
 * @param {number} baseSpeed - Base typing speed in milliseconds (default: 8ms)
 * @param {number} chunkSize - Characters to reveal per interval (default: 4)
 * @returns {Object} - { displayedText, isTyping }
 */
export const useTypewriter = (text, baseSpeed = 8, chunkSize = 4) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const indexRef = useRef(0);
    const timerRef = useRef(null);

    useEffect(() => {
        // Reset when text changes
        indexRef.current = 0;
        setDisplayedText('');
        setIsTyping(true);

        // Clear any existing timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // If text is empty, don't type
        if (!text) {
            setIsTyping(false);
            return;
        }

        // Adaptive speed: For very long text (>500 chars), speed up
        const textLength = text.length;
        const adaptiveSpeed = textLength > 500 ? baseSpeed * 0.7 : baseSpeed;
        const adaptiveChunk = textLength > 1000 ? chunkSize + 2 : chunkSize;

        // Start streaming effect with chunking
        timerRef.current = setInterval(() => {
            if (indexRef.current < textLength) {
                // Reveal multiple characters at once (chunk)
                const nextIndex = Math.min(indexRef.current + adaptiveChunk, textLength);
                setDisplayedText(text.slice(0, nextIndex));
                indexRef.current = nextIndex;
            } else {
                // Finished streaming
                setIsTyping(false);
                clearInterval(timerRef.current);
            }
        }, adaptiveSpeed);

        // Cleanup on unmount or text change
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setIsTyping(false);
        };
    }, [text, baseSpeed, chunkSize]);

    return { displayedText, isTyping };
};
