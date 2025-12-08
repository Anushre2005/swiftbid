// src/components/shared/StageProgressBar.tsx
import React from 'react';
import type { RFPStage } from '../../types';
import clsx from 'clsx';

const stages: RFPStage[] = ['Discovery', 'Tech', 'Pricing', 'Approval', 'Final'];

interface StageProgressBarProps {
  currentStage: RFPStage;
}

const StageProgressBar: React.FC<StageProgressBarProps> = ({ currentStage }) => {
  // Find the index of the current stage to know which ones to highlight
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="flex items-center w-full max-w-md">
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <div key={stage} className="flex-1 flex items-center relative">
             {/* The Stage Segment Node */}
            <div
              className={clsx(
                'h-8 flex items-center justify-center px-3 text-xs font-medium rounded-sm z-10 transition-colors',
                // Conditional styling based on stage status
                isCompleted && 'bg-teal-600 text-white',
                isCurrent && 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300',
                isUpcoming && 'bg-slate-100 text-slate-400'
              )}
            >
              {stage}
            </div>

            {/* The Connecting Line (Arrow) */}
            {index < stages.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-1 mx-1',
                  isCompleted ? 'bg-teal-600' : 'bg-slate-200'
                )}
              ></div>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default StageProgressBar;