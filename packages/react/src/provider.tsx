'use client';
import { createContext, forwardRef, useContext, useEffect, useState } from 'react';
import type { HTMLAttributes, Ref, RefObject } from 'react';

export type Locale = 'ja' | 'en';
export type Theme = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';
export type Motion = 'system' | 'reduce';
const defaults = {
  locale: 'ja' as Locale,
  theme: 'system' as Theme,
  density: 'comfortable' as Density,
  motion: 'system' as Motion,
  reducedMotion: false,
};
const FormaContext = createContext(defaults);
export interface FormaProviderProps extends HTMLAttributes<HTMLDivElement> {
  locale?: Locale;
  theme?: Theme;
  density?: Density;
  motion?: Motion;
}
function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}
export const FormaProvider = forwardRef<HTMLDivElement, FormaProviderProps>(function FormaProvider(
  { locale, theme, density, motion, className, children, ...props },
  ref,
) {
  const parent = useContext(FormaContext);
  locale ??= parent.locale;
  theme ??= parent.theme;
  density ??= parent.density;
  motion ??= parent.motion;
  const dark = useMedia('(prefers-color-scheme: dark)');
  const osReduce = useMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = motion === 'reduce' || osReduce;
  return (
    <FormaContext.Provider value={{ locale, theme, density, motion, reducedMotion }}>
      <div
        {...props}
        ref={ref}
        lang={locale}
        className={cx('forma', 'f-react', className)}
        data-theme={theme === 'system' ? (dark ? 'dark' : 'light') : theme}
        data-density={density}
        data-motion={reducedMotion ? 'reduce' : 'full'}
      >
        {children}
      </div>
    </FormaContext.Provider>
  );
});
export function useForma() {
  const context = useContext(FormaContext);
  return { ...context, t: (ja: string, en: string) => (context.locale === 'ja' ? ja : en) };
}
export function cx(...names: (string | undefined | false)[]) {
  return names.filter(Boolean).join(' ');
}
export function useControllable<T>(
  value: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [internal, setInternal] = useState(initial);
  return [
    value === undefined ? internal : value,
    (next) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
  ];
}
export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}
export function useFormReset(ref: RefObject<HTMLElement | null>, reset: () => void) {
  useEffect(() => {
    const form = ref.current?.closest('form');
    // Reset can be cancelled by the consumer. Run after native event dispatch.
    const onReset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) reset();
      });
    };
    form?.addEventListener('reset', onReset);
    return () => form?.removeEventListener('reset', onReset);
  }, [ref, reset]);
}
