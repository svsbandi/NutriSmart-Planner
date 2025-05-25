
import React from 'react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-20 h-20 border-[6px]',
  };

  return (
    <div className="flex justify-center items-center my-8">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-primary border-t-transparent`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
