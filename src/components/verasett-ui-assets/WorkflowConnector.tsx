'use client';
import type { AssetProps } from './types';
import { cx, Icon } from './shared';
import s from './assets.module.css';

export interface WorkflowConnectorProps extends AssetProps { direction?: 'horizontal' | 'vertical'; showNode?: boolean }
export function WorkflowConnector({ direction = 'horizontal', showNode = false, className, style }: WorkflowConnectorProps) {
  return <span className={cx(s.asset, s.connector, className)} style={style} data-direction={direction} aria-hidden="true"><span className={s.connectorLine} /><Icon name="arrow-right" />{showNode && <span className={s.connectorNode} />}</span>;
}
