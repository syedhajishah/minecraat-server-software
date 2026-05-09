import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'gray';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'gray', children, className, ...props }) => {
  const variants = {
    success: 'bg-green-900 text-green-200',
    danger: 'bg-red-900 text-red-200',
    warning: 'bg-yellow-900 text-yellow-200',
    info: 'bg-blue-900 text-blue-200',
    gray: 'bg-gray-700 text-gray-200',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
