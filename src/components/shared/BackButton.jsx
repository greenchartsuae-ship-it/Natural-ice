import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BackButton({ to, label = 'Back', className }) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (to) navigate(to);
    else if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };
  return (
    <button
      onClick={handleBack}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-[#1D71B8] transition-colors',
        className
      )}
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </button>
  );
}