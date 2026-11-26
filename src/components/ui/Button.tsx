import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'ghost' | 'danger' | 'quiet';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'sm';
  leading?: ReactNode;
  trailing?: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  quiet: 'btn-quiet',
};

export function Button({
  variant = 'ghost',
  size = 'md',
  leading,
  trailing,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn('btn', variantClass[variant], size === 'sm' && 'btn-sm', className)}
      {...rest}
    >
      {leading}
      <span>{children}</span>
      {trailing}
    </button>
  );
}
