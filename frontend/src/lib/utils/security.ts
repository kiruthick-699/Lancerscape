/**
 * Frontend security helpers for input validation and sanitization
 * No external dependencies - uses native JavaScript/TypeScript
 */

/**
 * Sanitize text input by removing potentially dangerous characters
 * Useful for user-generated content like project titles, descriptions, etc.
 * @param input - Raw text input
 * @returns Sanitized text safe for display
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters (except newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Trim whitespace
    .trim()
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ');
}

/**
 * Validate if a string is a valid URL
 * Checks for http/https protocols and basic URL structure
 * @param input - URL string to validate
 * @returns true if valid URL, false otherwise
 */
export function isValidURL(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  // Basic URL pattern with http/https only
  const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  
  if (!urlPattern.test(input)) {
    return false;
  }

  // Additional validation using URL constructor
  try {
    const url = new URL(input);
    // Only allow http and https protocols
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Strip dangerous HTML tags and attributes from input
 * Removes script tags, event handlers, and potentially dangerous elements
 * Allows basic safe formatting tags (b, i, em, strong, p, br)
 * @param input - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function stripDangerousHTML(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  
  // Remove event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol from attributes
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove vbscript: protocol
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  // Remove dangerous tags entirely (keep content)
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'form', 'input', 'button'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    sanitized = sanitized.replace(new RegExp(`</${tag}>`, 'gi'), '');
  });

  return sanitized.trim();
}

/**
 * Validate if text contains only alphanumeric characters and basic punctuation
 * Useful for usernames, project names, etc.
 * @param input - Text to validate
 * @param allowSpaces - Whether to allow spaces (default: true)
 * @returns true if valid, false otherwise
 */
export function isAlphanumeric(input: string, allowSpaces: boolean = true): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const pattern = allowSpaces 
    ? /^[a-zA-Z0-9\s\-_.,!?'"()]+$/
    : /^[a-zA-Z0-9\-_.,!?'"()]+$/;
  
  return pattern.test(input);
}

/**
 * Truncate text to a maximum length with ellipsis
 * Safe for display to prevent layout issues
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 100)
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Escape special characters for safe display in HTML
 * Prevents XSS by converting special chars to HTML entities
 * @param text - Text to escape
 * @returns Escaped text
 */
export function escapeHTML(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}
