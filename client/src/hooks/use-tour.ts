
import { useState, useEffect } from 'react';

export function useTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenProductTour");
    if (!hasSeenTour) {
      setIsActive(true);
    }
  }, []);

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const reset = () => {
    setCurrentStep(0);
    setIsActive(true);
    localStorage.removeItem("hasSeenProductTour");
  };

  const complete = () => {
    setIsActive(false);
    localStorage.setItem("hasSeenProductTour", "true");
  };

  return {
    currentStep,
    isActive,
    nextStep,
    prevStep,
    reset,
    complete,
  };
}
