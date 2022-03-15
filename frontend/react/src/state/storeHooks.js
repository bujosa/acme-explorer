import { useEffect, useState } from 'react';
import { store } from './store';

export function useStoreWithInitializer (selector, initializer) {
  const [state, setState] = useState(selector(store.getState()));
  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(selector(store.getState())));
    initializer();
    return unsubscribe;
  }, [null]);
  return state;
}

export function useStore (selector) {
  return useStoreWithInitializer(selector, () => {});
}
