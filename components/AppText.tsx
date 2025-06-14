import { FontScaleContext } from '@/contexts/FontScaleContext';
import React, { useContext } from 'react';
import { Text, TextProps } from 'react-native';

/**
 * Drop‑in replacement for React Native's <Text>.
 * Multiplies whatever fontSize you specify by the global scale.
 *
 * <AppText style={{ fontSize: 16 }}>Hello</AppText>
 *  – if scale === 1.2 → renders at 19.2 pts
 */
export function AppText({ style, ...rest }: TextProps) {
  const { scale } = useContext(FontScaleContext);

  // flatten any style arrays so we can read fontSize
  const flat =
    Array.isArray(style) ? Object.assign({}, ...style) : (style as any) || {};

  // default to 14 if caller didn’t specify a fontSize
  const base = flat.fontSize ?? 14;

  return (
    <Text
      {...rest}
      style={[style, { fontSize: base * scale }]}
      allowFontScaling={false} // prevent double‑scaling from OS
    />
  );
}
