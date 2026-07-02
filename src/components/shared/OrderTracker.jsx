import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { key: 'approved',   label: 'Approved' },
  { key: 'preparing',  label: 'Preparing' },
  { key: 'ready',      label: 'Ready' },
  { key: 'collected',  label: 'Collected' },
  { key: 'on_the_way', label: 'On the way' },
  { key: 'delivered',  label: 'Delivered' },
];

export default function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg w-fit">
        <span className="text-red-600 font-medium text-sm">Order Cancelled</span>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg w-fit">
        <span className="text-amber-700 font-medium text-sm">⏳ Pending Approval</span>
      </div>
    );
  }

  const currentIdx = steps.findIndex(s => s.key === status);
  const currentLabel = steps[currentIdx]?.label || '';

  return (
    <div className="w-full">
      {/* Current status label centered above */}
      <div className="text-center mb-2">
        <span className="text-[10px] md:text-sm font-semibold text-[#1a2f5e]">✦ {currentLabel}</span>
      </div>

      {/* Steps row */}
      <div className="flex items-center w-full overflow-x-auto pb-1">
        {steps.map((step, idx) => {
          const done = idx <= currentIdx;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.key}>
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={cn(
                  "w-6 h-6 md:w-9 md:h-9 rounded-full flex items-center justify-center",
                  done
                    ? "bg-[#1a3a6b] shadow-md"
                    : "bg-white border-2 border-[#c8d4e8]"
                )}>
                  {done && <Check className="w-3 h-3 md:w-4 md:h-4 text-white stroke-[3]" />}
                </div>
                <span className={cn(
                  "text-[9px] md:text-xs whitespace-nowrap font-medium",
                  done ? "text-[#1a3a6b]" : "text-[#9aa5b8]"
                )}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className={cn(
                  "flex-1 h-[2px] mx-0.5 md:mx-1 mb-4 md:mb-5",
                  idx < currentIdx ? "bg-[#1a3a6b]" : "bg-[#c8d4e8]"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}