import { useEffect } from 'react';
import { useGameStore } from './gameStore';
import { arrivalIntervalMs } from '../game/queue';

/**
 * Customers arrive over the shift: one right away, then one per
 * `arrivalIntervalMs` (shorter at peak). Stops while the day summary is open.
 */
export function useOrderArrivals(): void {
  const dayOver = useGameStore((state) => state.dayOver);

  useEffect(() => {
    if (dayOver) {
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const arrive = () => {
      useGameStore.getState().enqueueOrder();
      timer = setTimeout(arrive, arrivalIntervalMs(useGameStore.getState().clock.minutes));
    };
    arrive();
    return () => clearTimeout(timer);
  }, [dayOver]);
}
