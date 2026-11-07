'use client';
import { cloneElement, forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactElement, ReactNode } from 'react';
import { assignRef, cx, useControllable, useForma } from './provider.js';
import { Button, IconButton, Link } from './primitives.js';
import type { ButtonProps } from './primitives.js';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}
export interface TabsProps {
  label: string;
  items: readonly TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  className?: string;
}
export function Tabs({ label, items, value, defaultValue, onValueChange, className }: TabsProps) {
  const enabled = items.filter((item) => !item.disabled);
  const [selected, select] = useControllable(
    value,
    defaultValue ?? enabled[0]?.id ?? '',
    onValueChange,
  );
  const active = enabled.some((item) => item.id === selected) ? selected : enabled[0]?.id;
  const base = useId();
  const ref = useRef<HTMLDivElement>(null);
  function keyboard(event: KeyboardEvent, current: string) {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key) || !enabled.length) return;
    event.preventDefault();
    const index = enabled.findIndex((item) => item.id === current);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length;
    select(enabled[next].id);
    ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')[next]?.focus();
  }
  return (
    <div className={className}>
      <div ref={ref} role="tablist" aria-label={label} className="f-tab-list">
        {items.map((item, i) => (
          <button
            type="button"
            className="f-tab"
            role="tab"
            key={item.id}
            id={`${base}-tab-${i}`}
            aria-controls={`${base}-panel-${i}`}
            aria-selected={active === item.id}
            tabIndex={active === item.id ? 0 : -1}
            disabled={item.disabled}
            onClick={() => select(item.id)}
            onKeyDown={(event) => keyboard(event, item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, i) => (
        <div
          key={item.id}
          className="f-tab-panel"
          role="tabpanel"
          id={`${base}-panel-${i}`}
          aria-labelledby={`${base}-tab-${i}`}
          tabIndex={0}
          hidden={active !== item.id}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}
export function Breadcrumbs({
  items,
  label,
  className,
}: {
  items: readonly BreadcrumbItem[];
  label?: string;
  className?: string;
}) {
  const { t } = useForma();
  return (
    <nav aria-label={label ?? t('パンくず', 'Breadcrumb')} className={className}>
      <ol className="f-breadcrumbs">
        {items.map((item, i) => (
          <li key={i}>
            {item.href && i !== items.length - 1 ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export interface PaginationProps {
  page?: number;
  defaultPage?: number;
  total: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  label?: string;
  className?: string;
}
export function Pagination({
  page: controlled,
  defaultPage = 1,
  total,
  pageSize = 10,
  onPageChange,
  label,
  className,
}: PaginationProps) {
  const [requested, setPage] = useControllable(controlled, defaultPage, onPageChange);
  const count = Math.max(1, Math.ceil(Math.max(0, total) / Math.max(1, pageSize))),
    page = Math.max(1, Math.min(count, requested));
  const { t } = useForma();
  return (
    <nav
      aria-label={label ?? t('ページ切り替え', 'Pagination')}
      className={cx('f-pagination', className)}
    >
      <IconButton
        label={t('前のページ', 'Previous page')}
        size="sm"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        ‹
      </IconButton>
      <span aria-live="polite" aria-atomic="true">
        {page} / {count}
      </span>
      <IconButton
        label={t('次のページ', 'Next page')}
        size="sm"
        disabled={page >= count}
        onClick={() => setPage(page + 1)}
      >
        ›
      </IconButton>
    </nav>
  );
}
export interface OverlayProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export interface PopoverProps extends OverlayProps {
  label: string;
  children: ReactNode;
  className?: string;
  triggerProps?: Omit<ButtonProps, 'children'>;
}
function usePopover({ open: value, defaultOpen = false, onOpenChange }: OverlayProps) {
  const [open, setOpen] = useControllable(value, defaultOpen, onOpenChange);
  const ref = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const focusLast = useRef(false);
  const latest = useRef({ open, setOpen });
  latest.current = { open, setOpen };
  useEffect(() => {
    const node = ref.current!;
    const toggle = () => {
      const actual = node.matches(':popover-open');
      if (actual !== latest.current.open) latest.current.setOpen(actual);
    };
    node.addEventListener('toggle', toggle);
    return () => node.removeEventListener('toggle', toggle);
  }, []);
  useEffect(() => {
    const node = ref.current!,
      anchor = trigger.current!;
    function position() {
      const rect = anchor.getBoundingClientRect();
      const width = node.offsetWidth,
        height = node.offsetHeight;
      node.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`;
      node.style.top = `${Math.max(12, rect.bottom + height + 12 > window.innerHeight ? rect.top - height - 8 : rect.bottom + 8)}px`;
      node.style.maxHeight = `${Math.max(100, window.innerHeight - 24)}px`;
    }
    if (open) {
      node.inert = false;
      if (!node.matches(':popover-open')) node.showPopover();
      position();
      const items = node.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)');
      (items[focusLast.current ? items.length - 1 : 0] ?? node).focus({ preventScroll: true });
      window.addEventListener('resize', position);
      window.addEventListener('scroll', position, true);
    } else {
      if (node.contains(document.activeElement)) anchor.focus({ preventScroll: true });
      if (node.matches(':popover-open')) node.hidePopover();
      node.inert = true;
    }
    return () => {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [open]);
  return { open, setOpen, ref, trigger, focusLast };
}
export function Popover({ label, children, className, triggerProps, ...state }: PopoverProps) {
  const id = useId(),
    { open, setOpen, ref, trigger } = usePopover(state);
  return (
    <>
      <Button
        {...triggerProps}
        ref={trigger}
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="dialog"
        onClick={(event) => {
          triggerProps?.onClick?.(event);
          if (!event.defaultPrevented) setOpen(!open);
        }}
      >
        {label}
      </Button>
      <div
        ref={ref}
        id={id}
        popover="auto"
        role="dialog"
        aria-label={label}
        tabIndex={-1}
        className={cx('f-popover', 'native-popover', className)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
          }
        }}
      >
        {children}
      </div>
    </>
  );
}
export interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  onSelect?: () => void;
}
export interface MenuProps extends OverlayProps {
  label: string;
  items: readonly MenuItem[];
  onAction?: (id: string) => void;
  triggerProps?: Omit<ButtonProps, 'children'>;
  className?: string;
}
export function Menu({ label, items, onAction, triggerProps, className, ...state }: MenuProps) {
  const id = useId(),
    { open, setOpen, ref, trigger, focusLast } = usePopover(state);
  const search = useRef({ text: '', time: 0 });
  function keyboard(event: KeyboardEvent) {
    const nodes = Array.from(
      ref.current!.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'),
    );
    const index = nodes.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') next = (index + 1) % nodes.length;
    if (event.key === 'ArrowUp') next = (index - 1 + nodes.length) % nodes.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = nodes.length - 1;
    if (
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const now = Date.now();
      search.current.text =
        now - search.current.time > 500 ? event.key : search.current.text + event.key;
      search.current.time = now;
      const query = search.current.text.toLocaleLowerCase();
      for (let n = 1; n <= nodes.length; n++) {
        const i = (index + n) % nodes.length;
        if (nodes[i].textContent?.toLocaleLowerCase().startsWith(query)) {
          next = i;
          break;
        }
      }
    }
    if (next >= 0 && nodes[next]) {
      event.preventDefault();
      nodes[next].focus();
    }
  }
  return (
    <>
      <Button
        {...triggerProps}
        ref={trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={(event) => {
          triggerProps?.onClick?.(event);
          if (!event.defaultPrevented) setOpen(!open);
        }}
        onKeyDown={(event) => {
          triggerProps?.onKeyDown?.(event);
          if (!event.defaultPrevented && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            focusLast.current = event.key === 'ArrowUp';
            setOpen(true);
          }
        }}
      >
        {label}
      </Button>
      <div
        id={id}
        ref={ref}
        popover="auto"
        role="menu"
        tabIndex={-1}
        aria-label={label}
        className={cx('f-popover', 'native-popover', className)}
        onKeyDown={keyboard}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className="f-option"
            disabled={item.disabled}
            onClick={() => {
              setOpen(false);
              trigger.current?.focus();
              onAction?.(item.id);
              item.onSelect?.();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
export interface TooltipProps {
  content: ReactNode;
  children: ReactElement<HTMLAttributes<HTMLElement>>;
  className?: string;
}
export function Tooltip({ content, children, className }: TooltipProps) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);
  return (
    <span
      className={cx('native-tooltip', className)}
      data-dismissed={dismissed ? '' : undefined}
      onPointerEnter={() => setDismissed(false)}
      onFocus={() => setDismissed(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setDismissed(true);
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      {cloneElement(children, { 'aria-describedby': cx(children.props['aria-describedby'], id) })}
      <span id={id} className="f-tooltip" role="tooltip">
        {content}
      </span>
    </span>
  );
}
export interface DialogProps extends OverlayProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  trigger?: ReactNode;
  triggerProps?: Omit<ButtonProps, 'children'>;
  className?: string;
  closeLabel?: string;
  onClose?: () => void;
}
function Modal({
  title,
  description,
  children,
  footer,
  trigger,
  triggerProps,
  className,
  closeLabel,
  onClose,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  drawer,
  forwarded,
}: DialogProps & { drawer?: boolean; forwarded?: React.Ref<HTMLDialogElement> }) {
  const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  const ref = useRef<HTMLDialogElement>(null),
    returnFocus = useRef<HTMLElement | null>(null);
  const id = useId();
  const { t } = useForma();
  useEffect(() => {
    const node = ref.current!;
    if (open) {
      node.inert = false;
      if (!node.open) {
        returnFocus.current = document.activeElement as HTMLElement;
        node.showModal();
      }
    } else if (node.open) {
      node.close();
      node.inert = true;
      if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
    }
  }, [open]);
  return (
    <>
      {trigger && (
        <Button
          {...triggerProps}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={(event) => {
            triggerProps?.onClick?.(event);
            if (!event.defaultPrevented) setOpen(true);
          }}
        >
          {trigger}
        </Button>
      )}
      <dialog
        ref={(node) => {
          ref.current = node;
          assignRef(forwarded, node);
        }}
        className={cx(drawer ? 'f-drawer' : 'f-dialog', className)}
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onClose={() => {
          if (ref.current?.open) return;
          if (ref.current) ref.current.inert = true;
          if (open) setOpen(false);
          onClose?.();
        }}
      >
        <div className="f-between">
          <h2 id={`${id}-title`}>{title}</h2>
          <IconButton
            label={closeLabel ?? t('閉じる', 'Close')}
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            ×
          </IconButton>
        </div>
        {description && (
          <p id={`${id}-description`} className="f-help">
            {description}
          </p>
        )}
        <div className="f-dialog-content">{children}</div>
        {footer && <div className="f-react-dialog-footer">{footer}</div>}
      </dialog>
    </>
  );
}
export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog(props, ref) {
  return <Modal {...props} forwarded={ref} />;
});
export const Drawer = forwardRef<HTMLDialogElement, DialogProps>(function Drawer(props, ref) {
  return <Modal {...props} forwarded={ref} drawer />;
});
export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}
export interface AccordionProps {
  items: readonly AccordionItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (ids: string[]) => void;
  multiple?: boolean;
  className?: string;
}
export function Accordion({
  items,
  value,
  defaultValue = [],
  onValueChange,
  multiple = true,
  className,
}: AccordionProps) {
  const [expanded, setExpanded] = useControllable<readonly string[]>(value, defaultValue, (next) =>
    onValueChange?.([...next]),
  );
  return (
    <div className={cx('f-accordion', className)}>
      {items.map((item) => (
        <details key={item.id} open={expanded.includes(item.id)}>
          <summary
            onClick={(event) => {
              event.preventDefault();
              setExpanded(
                expanded.includes(item.id)
                  ? expanded.filter((id) => id !== item.id)
                  : multiple
                    ? [...expanded, item.id]
                    : [item.id],
              );
            }}
          >
            {item.title}
            <span aria-hidden="true">+</span>
          </summary>
          <div>{item.content}</div>
        </details>
      ))}
    </div>
  );
}
