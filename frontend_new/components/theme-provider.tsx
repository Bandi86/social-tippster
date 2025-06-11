'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: Omit<ThemeProviderProps, 'attribute'> & { attribute?: 'class' | Array<'class'> }) {
  // Only allow attribute="class" or attribute={["class"]}
  return (
    <NextThemesProvider attribute={props.attribute ?? 'class'} {...props}>
      {children}
    </NextThemesProvider>
  );
}
