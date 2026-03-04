import React from 'react';
import { Check } from 'lucide-react';

export default function StepProgress({ currentStep, totalSteps = 4 }) {
  const steps = [
    { id: 1, label: 'Professional' },
    { id: 2, label: 'Skills' },
    { id: 3, label: 'Schedule' },
    { id: 4, label: 'Verify' },
  ];

  return (
    <div className="w-full py-4 mb-10">
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-[#FF9500] transition-all duration-500 -z-0"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              {/* Circle */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${
                  isCompleted 
                    ? 'bg-[#FF9500] border-[#FF9500] text-white' 
                    : isActive 
                    ? 'bg-white border-[#FF9500] text-[#FF9500] ring-4 ring-[#FFF4E5]' 
                    : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? <Check size={20} strokeWidth={3} /> : step.id}
              </div>

              {/* Label */}
              <span 
                className={`absolute -bottom-7 whitespace-nowrap text-[10px] uppercase tracking-widest font-black transition-colors ${
                  isActive ? 'text-[#FF9500]' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}