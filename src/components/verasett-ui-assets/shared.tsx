'use client';
import type { ReactNode } from 'react';
import { Icon as BaseIcon, type IconName as BaseIconName } from '../icons';
import s from './assets.module.css';
import './tokens.css';

export const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ');
export type IconName = BaseIconName;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return <BaseIcon name={name} className={cx(s.icon, className)} />;
}

export function DemoNote({ children = 'Illustrative data' }: { children?: ReactNode }) {
  return <span className={s.demoNote}><Icon name="info" />{children}</span>;
}
