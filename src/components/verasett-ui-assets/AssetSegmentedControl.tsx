'use client';
import { useRef, useState, type KeyboardEvent } from 'react';
import type { AssetProps } from './types';
import { cx } from './shared';
import base from './assets.module.css';
import s from './asset-segmented-control.module.css';

// Layout and keyboard pattern adapted from BoardUI's MIT segmented-control.
// Native buttons replace React Aria; no measured/animated thumb is required.
// Source and license: THIRD-PARTY-NOTICES.md and BOARDUI-LICENSE.txt beside this file.
export interface AssetSegmentOption { value: string; label: string; disabled?: boolean }
export interface AssetSegmentedControlProps extends AssetProps {
  label: string;
  options: readonly AssetSegmentOption[];
  value: string;
  onValueChange: (value: string) => void;
}
export function AssetSegmentedControl({ label, options, value, onValueChange, className, style }: AssetSegmentedControlProps) {
  const group = useRef<HTMLDivElement>(null);
  const [focusedValue, setFocusedValue] = useState<string | null>(null);
  const active = options.find(option => option.value === value && !option.disabled)?.value ?? options.find(option => !option.disabled)?.value;
  const tabStop = options.find(option => option.value === focusedValue && !option.disabled)?.value ?? active;
  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const buttons = Array.from(group.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0 || !buttons.length) return;
    event.preventDefault();
    const rtl = group.current ? getComputedStyle(group.current).direction === 'rtl' : false;
    const backward = event.key === 'ArrowUp' || event.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (backward ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next].focus();
  }
  return <div ref={group} role="group" aria-label={label} className={cx(base.asset, s.group, className)} style={style} onKeyDown={moveFocus} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusedValue(null); }}>
    {options.map(option => <button type="button" key={option.value} disabled={option.disabled} aria-pressed={value === option.value} tabIndex={tabStop === option.value ? 0 : -1} onFocus={() => setFocusedValue(option.value)} onClick={() => onValueChange(option.value)}>{option.label}</button>)}
  </div>;
}
