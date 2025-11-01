import { useState, useEffect } from 'react';

interface QuizTimerProps {
  expiresAt: string;
  onTimeExpired: () => void;
}

export const QuizTimer = ({ expiresAt, onTimeExpired }: QuizTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const remaining = Math.max(0, expiry - now);

      setTimeRemaining(remaining);

      if (remaining === 0 && !hasExpired) {
        setHasExpired(true);
        onTimeExpired();
      }
    };

    // Update immediately
    updateTimer();

    // Then update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, hasExpired, onTimeExpired]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getColorClass = (): string => {
    const totalSeconds = Math.floor(timeRemaining / 1000);

    if (totalSeconds === 0) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (totalSeconds < 300) { // Less than 5 minutes
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }
    if (totalSeconds < 600) { // Less than 10 minutes
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getWarningMessage = (): string | null => {
    const totalSeconds = Math.floor(timeRemaining / 1000);

    if (totalSeconds === 0) {
      return 'Time is up! Your quiz will be auto-submitted.';
    }
    if (totalSeconds < 60) {
      return 'Less than 1 minute remaining!';
    }
    if (totalSeconds < 300) {
      return 'Less than 5 minutes remaining!';
    }
    return null;
  };

  const warningMessage = getWarningMessage();

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${getColorClass()}`}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-mono text-lg font-semibold">
          {formatTime(timeRemaining)}
        </span>
        <span className="text-sm">remaining</span>
      </div>

      {warningMessage && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {warningMessage}
        </div>
      )}
    </div>
  );
};
