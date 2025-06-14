import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'fontScale';

export const FontScaleContext = createContext<{
  scale: number;
  setScale: (n: number) => void;
}>({ scale: 1, setScale: () => {} });

export const FontScaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scale, setScale] = useState(1);

  /* load persisted value on mount */
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setScale(Number(saved));
    })();
  }, []);

  /* helper so Settings can both update state + persist */
  const updateScale = async (value: number) => {
    setScale(value);
    await AsyncStorage.setItem(STORAGE_KEY, value.toString());
  };

  return (
    <FontScaleContext.Provider value={{ scale, setScale: updateScale }}>
      {children}
    </FontScaleContext.Provider>
  );
};
