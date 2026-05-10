import React from 'react';
import { Card, CardContent } from './Card';
import clsx from 'clsx';

interface StatCardProps {
    icon?: React.ReactNode;
    label: string;
    value: string | number;
    trend?: { value: number; direction: 'up' | 'down' };
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, className }) => {
    return (
        <Card className={className}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-slate-400 text-sm">{label}</p>
                    <p className="text-2xl font-bold text-white mt-2">{value}</p>
                    {trend && (
                        <p
                            className={clsx('text-xs mt-2', {
                                'text-green-400': trend.direction === 'up',
                                'text-red-400': trend.direction === 'down',
                            })}
                        >
                            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}% from last hour
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="text-blue-400 text-3xl flex-shrink-0 ml-4">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
};
