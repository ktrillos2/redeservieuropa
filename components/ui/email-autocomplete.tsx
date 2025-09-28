import React, { useState, useRef } from 'react';
import { Input } from './input';

const SUGGESTIONS = ['@gmail.com', '@hotmail.com'];

export interface EmailAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  name?: string;
  placeholder?: string;
  'data-field'?: string;
  'data-modal-field'?: string;
}

export const EmailAutocomplete: React.FC<EmailAutocompleteProps> = ({ value, onChange, onBlur, className, ...props }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const ref = useRef<HTMLInputElement>(null);


  // Mostrar sugerencias solo si el usuario ha empezado a escribir y no ha completado un dominio
  const atIndex = value.indexOf('@');
  const base = atIndex === -1 ? value : value.slice(0, atIndex);
  const showTooltip = value.length > 0 && atIndex === -1;


  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(e.target.value.length > 0 && e.target.value.indexOf('@') === -1);
    setHighlighted(-1);
  };


  const handleSuggestionClick = (s: string) => {
    onChange(base + s);
    setShowSuggestions(false);
    setHighlighted(-1);
    ref.current?.focus();
  };

  // Ya no se necesita navegación con teclado ni lista filtrada
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={ref}
        type="email"
        autoComplete="off"
        value={value}
        onChange={handleInput}
        onBlur={onBlur}
        onFocus={() => setShowSuggestions(value.length > 0 && value.indexOf('@') === -1)}
        onKeyDown={handleKeyDown}
        className={className}
        {...props}
      />
      {showTooltip && showSuggestions && (
        <>
          <div
            className="absolute z-20 left-0 right-0 flex gap-1 bg-white dark:bg-background border border-border rounded shadow-md mt-1 px-1 py-1 justify-center email-tooltip-autofill"
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="px-1.5 py-0.5 rounded bg-accent/10 hover:bg-accent/20 text-primary font-medium border border-accent/30 email-tooltip-btn"
                onMouseDown={e => { e.preventDefault(); handleSuggestionClick(s); }}
              >
                <span className="font-semibold">{s}</span>
              </button>
            ))}
          </div>
          <style jsx>{`
            .email-tooltip-autofill, .email-tooltip-btn {
              font-size: 0.68rem;
            }
            @media (max-width: 600px) {
              .email-tooltip-autofill, .email-tooltip-btn {
                font-size: 0.56rem !important;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
};
