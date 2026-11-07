'use client';
import { forwardRef, useEffect, useRef, useState } from 'react';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { cx, useControllable, useForma } from './provider.js';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  loading?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading, className, children, onClick, ...props },
  ref,
) {
  return (
    <button
      type="button"
      {...props}
      ref={ref}
      className={cx('f-button', `f-button--${variant}`, size === 'sm' && 'f-button--sm', className)}
      aria-busy={loading || undefined}
      aria-disabled={loading || props['aria-disabled']}
      onClick={(event) => {
        if (loading || props['aria-disabled'] === true || props['aria-disabled'] === 'true') {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {loading && <span className="f-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});
export interface IconButtonProps extends ButtonProps {
  label: string;
}
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className, children, ...props },
  ref,
) {
  return (
    <Button {...props} ref={ref} className={cx('f-icon-button', className)} aria-label={label}>
      <span aria-hidden="true">{children}</span>
    </Button>
  );
});
export const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  function Link({ className, ...props }, ref) {
    return <a {...props} ref={ref} className={cx('f-link', className)} />;
  },
);
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}
export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return <span {...props} className={cx('f-badge', `f-tone-${tone}`, className)} />;
}
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: number;
}
export function Avatar({ name, src, size = 32, className, style, ...props }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <span
      {...props}
      role="img"
      aria-label={name}
      className={cx('f-avatar', className)}
      style={{ width: size, height: size, ...style }}
    >
      {src && !failed ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{Array.from(name.trim()).slice(0, 2).join('')}</span>
      )}
    </span>
  );
}
export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr {...props} className={cx('f-divider', className)} />;
}
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref,
) {
  return <div {...props} ref={ref} className={cx('f-card', className)} />;
});
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  tone?: Tone;
}
export function Alert({ title, tone = 'info', className, children, ...props }: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      {...props}
      className={cx('f-alert', `f-tone-${tone}`, className)}
    >
      {title && <strong>{title}</strong>}
      {children && <div>{children}</div>}
    </div>
  );
}
export interface ToastProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}
export function Toast({
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
}: ToastProps) {
  const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  const [present, setPresent] = useState(open);
  const [announced, setAnnounced] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const { t, reducedMotion } = useForma();
  useEffect(() => {
    if (open) {
      if (!ref.current?.contains(document.activeElement))
        returnFocus.current = document.activeElement as HTMLElement;
      setPresent(true);
      setAnnounced(true);
      if (ref.current) ref.current.inert = false;
      return;
    }
    setAnnounced(false);
    const node = ref.current;
    if (!node) return;
    if (node.contains(document.activeElement) && returnFocus.current?.isConnected)
      returnFocus.current.focus();
    node.inert = true;
    const duration = reducedMotion
      ? 0
      : parseFloat(getComputedStyle(node).animationDuration) * 1000;
    const timer = window.setTimeout(
      () => setPresent(false),
      Number.isFinite(duration) ? duration : 0,
    );
    return () => window.clearTimeout(timer);
  }, [open, reducedMotion]);
  return (
    <>
      <span className="f-sr-only" role="status" aria-atomic="true">
        {announced ? children : null}
      </span>
      {present && (
        <div
          ref={ref}
          className={cx('f-toast', className)}
          data-leaving={!open ? '' : undefined}
          aria-hidden={!open || undefined}
        >
          <div>{children}</div>
          <IconButton
            label={t('通知を閉じる', 'Dismiss notification')}
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            ×
          </IconButton>
        </div>
      )}
    </>
  );
}
export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: string;
  value?: number;
  max?: number;
  showValue?: boolean;
}
export function Progress({
  label,
  value,
  max = 100,
  showValue = true,
  className,
  ...props
}: ProgressProps) {
  max = Math.max(1, max);
  const bounded = value === undefined ? undefined : Math.min(max, Math.max(0, value));
  return (
    <div {...props} className={cx('f-field', className)}>
      <div className="f-between">
        <span>{label}</span>
        {showValue && bounded !== undefined && <span>{Math.round((bounded / max) * 100)}%</span>}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={bounded}
        className={cx('f-progress-track', bounded === undefined && 'f-progress-indeterminate')}
      >
        <div style={{ width: bounded === undefined ? '35%' : `${(bounded / max) * 100}%` }} />
      </div>
    </div>
  );
}
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
}
export function Skeleton({
  width = '100%',
  height = 16,
  style,
  className,
  ...props
}: SkeletonProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cx('f-skeleton', className)}
      style={{ width, height, ...style }}
    />
  );
}
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div {...props} className={cx('f-empty', className)}>
      {icon && (
        <div className="f-empty-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
