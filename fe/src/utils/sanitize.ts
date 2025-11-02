import DOMPurify from 'dompurify';

// Basic HTML sanitization with safe tags only
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'strong', 'em', 'u', 'i', 'b',
      'ul', 'ol', 'li',
      'span', 'div',
      'a'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'class'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'link', 'meta', 'base'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
  });
}

// Extended HTML sanitization for rich content (allows more formatting)
export function sanitizeRichHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'del', 'ins', 'sub', 'sup',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'span', 'div',
      'a',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'class', 'style',
      'colspan', 'rowspan'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'link', 'meta', 'base', 'form', 'input', 'button', 'select', 'textarea'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress']
  });
}

// Check if content contains HTML tags
export function containsHTML(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const htmlPattern = /<[^>]+>/;
  return htmlPattern.test(text);
}

// Convert plain text to HTML (preserving line breaks)
export function textToHTML(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Escape HTML entities first
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Convert line breaks to <br> tags and double line breaks to paragraphs
  return escaped
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

// Sanitize content and convert to HTML if it's plain text
export function processContent(content: string, isRich: boolean = false): string {
  if (!content) return '';

  const sanitizeFn = isRich ? sanitizeRichHTML : sanitizeHTML;

  // If content contains HTML, sanitize it
  if (containsHTML(content)) {
    return sanitizeFn(content);
  }

  // If plain text, convert to HTML and then sanitize
  const htmlContent = textToHTML(content);
  return sanitizeFn(`<p>${htmlContent}</p>`);
}