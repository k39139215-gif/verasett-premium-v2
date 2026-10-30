import { useEffect, useId, useRef, type ReactNode } from 'react';
import s from './dashboard.module.css';

export function DashboardPopover({ label, trigger, open, onOpenChange, children, align = 'right', wide = false, className = '' }: {
  label: string; trigger: ReactNode; open: boolean; onOpenChange: (open: boolean) => void;
  children: ReactNode; align?: 'left' | 'right'; wide?: boolean; className?: string;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const change = useRef(onOpenChange);
  useEffect(() => { change.current = onOpenChange; }, [onOpenChange]);
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('button:not(:disabled), input, a[href]')?.focus();
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) change.current(false); };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); change.current(false); button.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div ref={root} className={`${s.popoverRoot} ${className}`}>
    <button ref={button} type="button" aria-label={label} aria-expanded={open} aria-controls={open ? id : undefined} aria-haspopup="dialog" className={s.popoverTrigger} onClick={() => onOpenChange(!open)}>{trigger}</button>
    {open && <div ref={panel} id={id} role="dialog" aria-label={label} className={`${s.popover} ${wide ? s.widePopover : ''}`} data-align={align} onKeyDown={event => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || (event.target as HTMLElement).tagName === 'INPUT') return;
      const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]') ?? []);
      const current = items.indexOf(event.target as HTMLElement);
      if (current < 0) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
      items[next]?.focus();
    }}>{children}</div>}
  </div>;
}
