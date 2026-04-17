import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

/**
 * Hook to handle hardware back button on Android/iOS
 * @param {string|function|number} target - Path to navigate to, function to call, or number (-1) to go back
 * @param {boolean} condition - Only handle if this condition is true
 */
export const useBackNavigation = (target, condition = true) => {
  const navigate = useNavigate();
  // Store the target in a ref so we don't have to re-subscribe to the Capacitor event every time it changes
  const targetRef = useRef(target);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    if (!condition) return;

    let listenerHandle = null;
    let isMounted = true;

    const setupListener = async () => {
      const handle = await CapacitorApp.addListener('backButton', () => {
        const currentTarget = targetRef.current;
        if (typeof currentTarget === 'string') {
          navigate(currentTarget, { replace: true });
        } else if (typeof currentTarget === 'function') {
          currentTarget();
        } else if (typeof currentTarget === 'number') {
          navigate(currentTarget);
        }
      });

      if (isMounted) {
        listenerHandle = handle;
      } else {
        // If unmounted before the promise resolved, immediately remove it
        handle.remove();
      }
    };

    setupListener();

    return () => {
      isMounted = false;
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [navigate, condition]);
};
