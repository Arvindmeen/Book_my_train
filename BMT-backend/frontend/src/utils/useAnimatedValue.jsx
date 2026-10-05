import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook to smoothly animate any numeric value using requestAnimationFrame.
 * Uses ease-out cubic interpolation for natural, fluid motion.
 */
export function useAnimatedValue(targetValue, duration = 1000) {
  const numTarget = typeof targetValue === 'number' ? targetValue : parseFloat(targetValue) || 0;
  const [currentValue, setCurrentValue] = useState(0);
  const startValRef = useRef(0);
  const targetValRef = useRef(numTarget);
  const startTimeRef = useRef(null);

  useEffect(() => {
    startValRef.current = currentValue;
    targetValRef.current = numTarget;
    startTimeRef.current = null;

    let animId;
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / Math.max(duration, 100), 1);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = startValRef.current + (targetValRef.current - startValRef.current) * ease;
      setCurrentValue(val);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValRef.current);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [numTarget, duration]);

  return currentValue;
}

/**
 * Animated counter display component
 */
export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1000,
  formatter = null,
}) {
  const animated = useAnimatedValue(value, duration);

  if (formatter && typeof formatter === 'function') {
    return <>{formatter(animated)}</>;
  }

  const formatted = decimals > 0
    ? animated.toFixed(decimals)
    : Math.round(animated).toLocaleString('en-IN');

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
