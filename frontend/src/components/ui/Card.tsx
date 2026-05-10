import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div
            className={clsx(
                'bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => {
    return (
        <div className={clsx('mb-4 border-b border-slate-700 pb-4', className)} {...props}>
            {children}
        </div>
    );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className, ...props }) => {
    return (
        <h2 className={clsx('text-xl font-bold text-white', className)} {...props}>
            {children}
        </h2>
    );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => {
    return (
        <div className={clsx('text-slate-300', className)} {...props}>
            {children}
        </div>
    );
};
