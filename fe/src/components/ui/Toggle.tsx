import React from 'react';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  const toggleId = props.id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1">
        {label && (
          <label htmlFor={toggleId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked as any)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${checked ? 'bg-purple-600' : 'bg-gray-200'}
        `}
      >
        <span className="sr-only">Toggle {label}</span>
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>

      <input
        id={toggleId}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={() => onChange?.(!checked as any)}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};