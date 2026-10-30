'use client';
import type { ReactNode, SVGProps } from 'react';
import { figmaPaths, figmaSources } from './figma-paths';

export type CanonicalIconName = keyof typeof figmaPaths;

/** @deprecated Use CanonicalIconName. Source provenance is tracked per icon. */
export type VerifiedIconName = CanonicalIconName;

export type LegacyIconName = 'file' | 'review' | 'arrow' | 'blocked';

export type IconName = CanonicalIconName | LegacyIconName;

export interface IconProps extends SVGProps<SVGSVGElement> {
  name?: IconName;
  size?: number | string;
  title?: string;
  className?: string;
}

const legacyAliases: Record<LegacyIconName, CanonicalIconName> = {
  file: 'file-text',
  review: 'alert-circle',
  blocked: 'circle-slash',
  arrow: 'arrow-right',
};

function resolveIcon(name: IconName): { content: ReactNode; source: string } {
  const canonicalName = name in legacyAliases ? legacyAliases[name as LegacyIconName] : name as CanonicalIconName;
  if (!Object.hasOwn(figmaPaths, canonicalName)) throw new Error(`Unsupported icon: ${name}`);
  return { content: figmaPaths[canonicalName], source: figmaSources[canonicalName] };
}

export function Icon({
  name = 'info',
  size = 24,
  width = size,
  height = size,
  title,
  className,
  strokeWidth = 2,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-hidden': ariaHidden,
  role,
  focusable = false,
  ...props
}: IconProps) {
  const { content, source } = resolveIcon(name);
  const accessibleTitle = title?.trim() || undefined;
  const accessibleLabel = ariaLabel?.trim() || undefined;
  const labelledBy = ariaLabelledBy?.trim() || undefined;
  const hasName = Boolean(accessibleTitle || accessibleLabel || labelledBy);
  const decorative = ariaHidden === true || ariaHidden === 'true' || role === 'none' || role === 'presentation' || !hasName;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      className={className}
      {...props}
      focusable={focusable}
      aria-label={accessibleLabel}
      aria-labelledby={labelledBy}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : role ?? 'img'}
      data-icon-source={source}
    >
      {accessibleTitle && <title>{accessibleTitle}</title>}
      {content}
    </svg>
  );
}

export const VerasettIcon = Icon;

function createIcon(name: CanonicalIconName) {
  return function SpecificIcon(props: Omit<IconProps, 'name'>) {
    return <Icon name={name} {...props} />;
  };
}

export const SearchIcon = createIcon('search');
export const FilterIcon = createIcon('filter');
export const DownloadIcon = createIcon('download');
export const ExportIcon = createIcon('export');
export const CheckIcon = createIcon('check');
export const CheckCircleIcon = createIcon('check-circle');
export const AlertCircleIcon = createIcon('alert-circle');
export const AlertTriangleIcon = createIcon('alert-triangle');
export const InfoIcon = createIcon('info');
export const ChevronDownIcon = createIcon('chevron-down');
export const ChevronRightIcon = createIcon('chevron-right');
export const ChevronLeftIcon = createIcon('chevron-left');
export const ChevronUpIcon = createIcon('chevron-up');
export const ArrowUpDownIcon = createIcon('arrow-up-down');
export const RefreshCwIcon = createIcon('refresh-cw');
export const CalendarIcon = createIcon('calendar');
export const DollarSignIcon = createIcon('dollar-sign');
export const CurrencyIcon = createIcon('currency');
export const CreditCardIcon = createIcon('credit-card');
export const BuildingIcon = createIcon('building');
export const BankIcon = createIcon('bank');
export const FileTextIcon = createIcon('file-text');
export const UserIcon = createIcon('user');
export const LockIcon = createIcon('lock');
export const SlidersIcon = createIcon('sliders');
export const ExternalLinkIcon = createIcon('external-link');
export const CloseIcon = createIcon('close');
export const ClockIcon = createIcon('clock');
export const LayersIcon = createIcon('layers');
export const FolderIcon = createIcon('folder');
