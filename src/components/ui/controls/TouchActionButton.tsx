import React from 'react';

interface TouchActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export default function TouchActionButton({
  label,
  icon,
  onClick,
  variant = 'primary',
  className = ''
}: TouchActionButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
    secondary: 'bg-white/10 hover:bg-white/15 active:bg-white/20',
    danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700'
  };

  const buttonClass = `
    min-w-[48px] min-h-[48px] px-6 py-3
    ${variantClasses[variant]}
    rounded-xl
    flex items-center justify-center gap-2
    text-white font-semibold text-base
    transition-all duration-75
    active:scale-95
    touch-none select-none
    ${className}
  `.trim();

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      aria-label={label}
      style={{ touchAction: 'manipulation' }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
