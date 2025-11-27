/**
 * Positioning utilities for AddItemButtons component
 */

export interface ButtonPosition {
  top: number;
  left: number;
  position: 'right' | 'below';
}

export interface PositionConfig {
  gap: number;
  buttonWidth: number;
  buttonHeight: number;
}

const DEFAULT_CONFIG: PositionConfig = {
  gap: 8, // 8px gap between card and buttons
  buttonWidth: 200, // Approximate width of both buttons
  buttonHeight: 40, // Approximate height of button container
};

/**
 * Calculate optimal position for AddItemButtons relative to a card element
 */
export const calculateButtonPosition = (
  cardElement: HTMLElement,
  config: Partial<PositionConfig> = {}
): ButtonPosition => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { gap, buttonWidth, buttonHeight } = finalConfig;

  const rect = cardElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  // Try to find the header area first
  const headerArea = cardElement.querySelector('[data-header-area]');
  if (headerArea) {
    const headerRect = headerArea.getBoundingClientRect();

    // Default: right side of header, vertically centered
    const buttonRight = headerRect.right + gap;
    const buttonTop = headerRect.top + headerRect.height / 2 - buttonHeight / 2;

    // Check for viewport overflow on the right
    if (buttonRight + buttonWidth > viewportWidth) {
      // Position below header instead
      return {
        top: headerRect.bottom + gap + scrollY,
        left: headerRect.left + scrollX,
        position: 'below'
      };
    }

    return {
      top: buttonTop + scrollY,
      left: buttonRight + scrollX,
      position: 'right'
    };
  }

  // Fallback to full card if no header found
  const buttonRight = rect.right + gap;
  const buttonTop = rect.top + rect.height / 2 - buttonHeight / 2;

  // Check for viewport overflow on the right
  if (buttonRight + buttonWidth > viewportWidth) {
    // Position below card instead
    return {
      top: rect.bottom + gap + scrollY,
      left: rect.left + scrollX,
      position: 'below'
    };
  }

  return {
    top: buttonTop + scrollY,
    left: buttonRight + scrollX,
    position: 'right'
  };
};

/**
 * Check if a position would cause viewport overflow
 */
export const wouldOverflowViewport = (
  position: ButtonPosition,
  config: Partial<PositionConfig> = {}
): boolean => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { buttonWidth, buttonHeight } = finalConfig;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  // Check horizontal overflow
  if (position.left + buttonWidth > viewportWidth + scrollX) {
    return true;
  }

  // Check vertical overflow
  if (position.top + buttonHeight > viewportHeight + scrollY) {
    return true;
  }

  return false;
};

/**
 * Get safe position that doesn't overflow viewport
 */
export const getSafePosition = (
  cardElement: HTMLElement,
  config: Partial<PositionConfig> = {}
): ButtonPosition => {
  const position = calculateButtonPosition(cardElement, config);

  if (wouldOverflowViewport(position, config)) {
    // Fallback to below position
    const rect = cardElement.getBoundingClientRect();
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const { gap } = finalConfig;

    return {
      top: rect.bottom + gap + window.scrollY,
      left: rect.left + window.scrollX,
      position: 'below'
    };
  }

  return position;
};

/**
 * Throttle function to limit how often position calculations run
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: number | null = null;
  let lastExecTime = 0;

  return ((...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
};

/**
 * Debounce function to delay position calculations until scrolling stops
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: number | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => func(...args), delay);
  }) as T;
};