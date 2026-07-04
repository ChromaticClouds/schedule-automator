import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
const subscribe = (callback: () => void) => {
  const subscription = Appearance.addChangeListener(() => callback());
  return () => subscription.remove();
};

const getSnapshot = () => Appearance.getColorScheme() ?? 'light';
const getServerSnapshot = () => 'light';

export function useColorScheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
