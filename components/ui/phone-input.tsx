import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { cn } from '@/lib/utils';

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  country?: string;
  disabled?: boolean;
  className?: string;
}

export const PhoneInputIntl: React.FC<PhoneInputProps> = ({ value, onChange, inputProps, country = 'fr', disabled, className }) => {
  return (
    <PhoneInput
      country={country}
      value={value}
      onChange={onChange}
      inputProps={{
        ...inputProps,
        className: cn(
          // Clases base del input nativo
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
          inputProps?.className
        )
      }}
      disabled={disabled}
      inputClass={''}
      buttonClass={'border-none bg-transparent'}
      containerClass={''}
      enableSearch
      autoFormat
      disableDropdown={false}
      masks={{ fr: '.. .. .. .. ..', mx: '.. .. .. .. .. .. ..', es: '... ... ...' }}
      placeholder="Selecciona país y número"
    />
  );
};
