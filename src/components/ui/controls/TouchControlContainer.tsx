import React from 'react';

interface TouchControlContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function TouchControlContainer({
  children,
  className = ''
}: TouchControlContainerProps) {
  return (
    <div
      className={`
        md:hidden
        fixed bottom-0 left-0 right-0
        p-4 pb-6
        bg-gradient-to-t from-black/80 to-transparent
        pointer-events-none
        z-50
        ${className}
      `.trim()}
    >
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
