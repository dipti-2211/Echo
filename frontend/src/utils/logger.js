/**
 * Conditional logger utility
 * Only logs in development mode to keep production clean
 */

const isDev = import.meta.env.DEV;

/**
 * Development-only logger
 * All log methods are no-ops in production
 */
export const logger = {
    log: isDev ? console.log.bind(console) : () => { },
    info: isDev ? console.info.bind(console) : () => { },
    warn: isDev ? console.warn.bind(console) : () => { },
    error: console.error.bind(console), // Always log errors
    debug: isDev ? console.debug.bind(console) : () => { },

    // Grouped logging for related operations
    group: isDev ? console.group.bind(console) : () => { },
    groupEnd: isDev ? console.groupEnd.bind(console) : () => { },
    groupCollapsed: isDev ? console.groupCollapsed.bind(console) : () => { },

    // Table logging for structured data
    table: isDev ? console.table.bind(console) : () => { },

    // Time tracking
    time: isDev ? console.time.bind(console) : () => { },
    timeEnd: isDev ? console.timeEnd.bind(console) : () => { },
};

export default logger;
