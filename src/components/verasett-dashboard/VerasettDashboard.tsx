import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from '../icons';
import { AssetSegmentedControl } from '../verasett-ui-assets/AssetSegmentedControl';
import { StatusPill } from '../verasett-ui-assets/StatusPill';
import { formatMoney } from '../verasett-ui-assets/format';
import '../verasett-ui-assets/tokens.css';
import '../verasett-ui-assets/fonts.css';
import { DashboardPopover } from './DashboardPopover';
import { dailyReceipts, dashboardTransactions, filterTransactions, getDashboardSummary, type DashboardTransaction, type DashboardTransactionStatus } from './dashboard-data';
import s from './dashboard.module.css';

type Popup = 'workspace' | 'date' | 'account' | 'filter' | 'export' | 'activity' | null;
type Period = 'week' | 'month' | 'all';
const periods: { value: Period; label: string; detail: string }[] = [
  { value: 'week', label: 'Last 7 days', detail: 'Oct 23 – 29, 2026' },
  { value: 'month', label: 'This month', detail: 'Oct 1 – 29, 2026' },
  { value: 'all', label: 'All records', detail: 'Oct 20 – 29, 2026' },
];
const activityItems = [
  { id: 'match', icon: 'check-circle' as IconName, title: 'Acme payment matched', detail: '3 invoices allocated to ACH-78421', time: '12 min ago', reference: 'ACH-78421' },
  { id: 'review', icon: 'alert-circle' as IconName, title: 'Westline needs your review', detail: '$250 remittance difference remains unresolved', time: '28 min ago', reference: 'ACH-55231' },
  { id: 'evidence', icon: 'file-text' as IconName, title: 'Harbor evidence is pending', detail: 'Supporting remittance has not been verified', time: '1 hour ago', reference: 'ACH-62108' },
];
const shortMoney = (minor: number) => `$${(minor / 100000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k`;
const dateLabel = (date: string) => `Oct ${Number(date.slice(-2))}, 2026`;

function CashChart({ rows, metric }: { rows: readonly DashboardTransaction[]; metric: 'amount' | 'rate' }) {
  const series = dailyReceipts(rows);
  const ceiling = Math.max(1000000, Math.ceil(Math.max(...series.map(day => day.receivedMinor)) / 1000000) * 1000000);
  return <div className={s.chart}>
    <svg viewBox="0 0 680 208" role="img" aria-label={metric === 'amount' ? 'Cash received and matched by day, October 23 to 29' : 'Percentage of received cash matched by day, October 23 to 29'}>
      <title>Illustrative daily reconciliation totals, October 23 to 29, 2026</title>
      {[0, 1, 2, 3].map(tick => <g key={tick}><line x1="48" x2="660" y1={24 + tick * 44} y2={24 + tick * 44} className={s.chartGrid} /><text x="0" y={28 + tick * 44} className={s.chartLabel}>{metric === 'rate' ? `${100 - Math.round(tick * 100 / 3)}%` : shortMoney(Math.round(ceiling * (1 - tick / 3)))}</text></g>)}
      {series.map((day, index) => {
        const x = 77 + index * 86;
        const receivedHeight = metric === 'amount' ? day.receivedMinor / ceiling * 132 : day.receivedMinor ? 132 : 0;
        const matchedHeight = metric === 'amount' ? day.matchedMinor / ceiling * 132 : day.receivedMinor ? day.matchedMinor / day.receivedMinor * 132 : 0;
        return <g key={day.date}><title>{`${day.label}: ${formatMoney(day.receivedMinor)} received, ${formatMoney(day.matchedMinor)} matched`}</title>
          <rect x={x} y={156 - receivedHeight} width="20" height={receivedHeight} rx="3" className={s.receivedBar} />
          <rect x={x + 26} y={156 - matchedHeight} width="20" height={matchedHeight} rx="3" className={s.matchedBar} />
          <text x={x + 23} y="185" textAnchor="middle" className={s.chartLabel}>{day.label}</text>
        </g>;
      })}
    </svg>
  </div>;
}

export function VerasettDashboard() {
  const [popup, setPopup] = useState<Popup>(null);
  const [period, setPeriod] = useState<Period>('week');
  const [accounts, setAccounts] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | DashboardTransactionStatus>('all');
  const [sources, setSources] = useState<string[]>([]);
  const [draftStatuses, setDraftStatuses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [draftSources, setDraftSources] = useState<string[]>([]);
  const [sort, setSort] = useState<'date' | 'amount'>('date');
  const [ascending, setAscending] = useState(false);
  const [chartMetric, setChartMetric] = useState<'amount' | 'rate'>('amount');
  const [selected, setSelected] = useState<string[]>([]);
  const [activeNav, setActiveNav] = useState('Overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [read, setRead] = useState<string[]>([]);
  const [activityFilter, setActivityFilter] = useState('all');
  const [detail, setDetail] = useState<DashboardTransaction>(dashboardTransactions[2]);
  const [announcement, setAnnouncement] = useState('');
  const sheet = useRef<HTMLDialogElement>(null);
  const selectAll = useRef<HTMLInputElement>(null);
  const tableSection = useRef<HTMLElement>(null);
  const reviewSection = useRef<HTMLElement>(null);
  const scope = useMemo(() => filterTransactions(dashboardTransactions, { period, accounts, query: '', statuses: [], sources: [] }), [period, accounts]);
  const summary = getDashboardSummary(scope);
  const visible = useMemo(() => filterTransactions(dashboardTransactions, { period, accounts, query, statuses: status === 'all' ? statuses : [status], sources }).sort((a, b) => {
    const comparison = sort === 'amount' ? a.amountMinor - b.amountMinor : a.date.localeCompare(b.date);
    return (ascending ? comparison : -comparison) || a.id.localeCompare(b.id);
  }), [period, accounts, query, statuses, status, sources, sort, ascending]);
  const review = scope.filter(row => row.status !== 'Matched');
  const selectedVisible = visible.filter(row => selected.includes(row.id));
  useEffect(() => {
    if (selectAll.current) selectAll.current.indeterminate = selectedVisible.length > 0 && selectedVisible.length < visible.length;
  }, [selectedVisible.length, visible.length]);
  const filterCount = statuses.length + sources.length;
  const unreadCount = activityItems.filter(item => !read.includes(item.id)).length;
  const dateRange = periods.find(item => item.value === period)!;
  const closePopup = useCallback(() => setPopup(null), []);
  const togglePopup = (key: Popup) => (open: boolean) => {
    if (key === 'filter' && open) { setDraftStatuses(statuses); setDraftSources(sources); }
    setPopup(open ? key : null);
  };
  const toggleChoice = (values: string[], value: string) => values.includes(value) ? values.filter(item => item !== value) : [...values, value];
  const openDetails = (row: DashboardTransaction) => { closePopup(); setDetail(row); sheet.current?.showModal(); };
  const navigate = (name: string) => {
    setActiveNav(name); setMobileNav(false);
    if (name === 'Payments') tableSection.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    else if (name === 'Review queue') reviewSection.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    else if (name === 'Activity') setPopup('activity');
    else window.scrollTo({ top: 0, behavior: 'auto' });
  };
  function exportCsv() {
    const rows = selectedVisible.length ? selectedVisible : visible;
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = [['Payment reference', 'Customer', 'Amount USD', 'Status', 'Date', 'Account'], ...rows.map(row => [row.reference, row.customer, (row.amountMinor / 100).toFixed(2), row.status, row.date, row.account])].map(row => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'verasett-dashboard-demo.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setAnnouncement(`${rows.length} illustrative payment records exported.`); closePopup();
  }
  const sortColumn = (column: 'date' | 'amount') => { if (sort === column) setAscending(!ascending); else { setSort(column); setAscending(false); } };
  return <div className={`${s.dashboard} verasettPremiumTheme`} data-dashboard>
    <aside className={s.sidebar} data-mobile-open={mobileNav}>
      <a className={s.brand} href="#dashboard"><span className={s.brandMark} aria-hidden="true">v</span>verasett</a>
      <DashboardPopover label="Switch workspace" open={popup === 'workspace'} onOpenChange={togglePopup('workspace')} align="left" className={s.workspace} trigger={<><span className={s.companyMark}>V</span><span>Verasett workspace<small>Demo workspace</small></span><Icon name="chevron-down" size={16} /></>}>
        <div className={s.popoverHeading}><strong>Your workspace</strong><span>Local preview</span></div>
        <div className={s.workspaceOption}><span className={s.companyMark}>V</span><div><strong>Verasett workspace</strong><small>Illustrative USD records</small></div><Icon name="check" size={16} /></div>
        <a className={s.menuItem} href="#composition"><Icon name="layers" size={18} />Open component library<Icon name="arrow-right" size={16} /></a>
      </DashboardPopover>
      <nav className={s.mainNav} aria-label="Dashboard navigation">
        <span className={s.navLabel}>Workspace</span>
        {([{ name: 'Overview', icon: 'grid' }, { name: 'Payments', icon: 'credit-card' }, { name: 'Review queue', icon: 'alert-circle' }, { name: 'Activity', icon: 'clock' }] as { name: string; icon: IconName }[]).map(item => <button type="button" key={item.name} aria-current={activeNav === item.name ? 'page' : undefined} onClick={() => navigate(item.name)}><Icon name={item.icon} size={19} /><span>{item.name}</span>{item.name === 'Review queue' && <span className={s.navCount}>{review.length}</span>}</button>)}
        <span className={s.navLabel}>Reconciliation</span>
        <a href="#workflow-tools"><Icon name="folder" size={19} />Source files<Icon name="external-link" size={13} /></a>
        <a href="#screens/approval"><Icon name="check-circle" size={19} />Approvals<Icon name="external-link" size={13} /></a>
        <a href="#screens/export"><Icon name="export" size={19} />ERP exports<Icon name="external-link" size={13} /></a>
        <a href="#screens/audit"><Icon name="file-text" size={19} />Audit trail<Icon name="external-link" size={13} /></a>
      </nav>
      <div className={s.sidebarBottom}><div className={s.sandbox}><Icon name="lock" size={18} /><strong>A place to explore</strong><p>Explore reconciliation with illustrative payment records.</p><a href="#composition">View UI library<Icon name="arrow-right" size={16} /></a></div>
        <div className={s.profile}><span className={s.avatar}>AK</span><span>Alex Kim<small>Controller</small></span><Icon name="chevron-down" size={16} /></div>
      </div>
    </aside>
    <div className={s.mainShell}>
      <header className={s.topbar}><div className={s.breadcrumb}><button className={s.mobileMenu} type="button" aria-label="Toggle dashboard navigation" aria-expanded={mobileNav} onClick={() => setMobileNav(!mobileNav)}><Icon name="layers" size={20} /></button><span>Workspace</span><Icon name="chevron-right" size={14} /><strong>{activeNav}</strong></div>
        <div className={s.topbarActions}><span className={s.demoTag}>Demo workspace</span><a className={s.libraryLink} href="#composition">UI library<Icon name="external-link" size={14} /></a>
          <DashboardPopover label="Activity notifications" open={popup === 'activity'} onOpenChange={togglePopup('activity')} wide className={s.notificationTrigger} trigger={<><Icon name="inbox" size={20} />{unreadCount > 0 && <span className={s.notificationCount}>{unreadCount}</span>}</>}>
            <div className={s.popoverHeading}><strong>Activity</strong><button type="button" onClick={() => setRead(activityItems.map(item => item.id))}>Mark all read</button></div>
            <AssetSegmentedControl label="Activity views" value={activityFilter} onValueChange={setActivityFilter} options={[{ value: 'all', label: 'All activity' }, { value: 'unread', label: `Unread (${unreadCount})` }]} />
            <div className={s.notificationList}>{activityItems.filter(item => activityFilter === 'all' || !read.includes(item.id)).map(item => <button type="button" key={item.id} onClick={() => { setRead(prev => [...new Set([...prev, item.id])]); openDetails(dashboardTransactions.find(row => row.reference === item.reference)!); }}><span className={s.eventIcon}><Icon name={item.icon} size={18} /></span><span><strong>{item.title}</strong><small>{item.detail}</small><span className={s.eventTime}>{item.time}{!read.includes(item.id) && <em>Unread</em>}</span></span></button>)}{activityFilter === 'unread' && unreadCount === 0 && <p className={s.notificationEmpty}>You're all caught up.</p>}</div><div className={s.popoverNote}>Reading an event keeps its financial status intact.</div>
          </DashboardPopover><span className={s.topAvatar} aria-label="Alex Kim">AK</span>
        </div>
      </header>
      <main className={s.main}>
        <div className={s.pageHeading}><div><h1>Cash application overview</h1><p>A clear view of your payments, matches and exceptions.</p></div><div className={s.pageActions}>
          <DashboardPopover label="Date range" open={popup === 'date'} onOpenChange={togglePopup('date')} trigger={<><Icon name="calendar" size={17} /><span>{dateRange.label}</span><Icon name="chevron-down" size={15} /></>}>
            <div className={s.popoverHeading}><strong>Date range</strong></div>{periods.map(item => <button type="button" className={s.dateOption} key={item.value} aria-pressed={period === item.value} onClick={() => { setPeriod(item.value); setSelected([]); closePopup(); }}><span><strong>{item.label}</strong><small>{item.detail}</small></span>{period === item.value && <Icon name="check" size={17} />}</button>)}<div className={s.popoverNote}>Snapshot as of October 29, 2026</div>
          </DashboardPopover>
          <div className={s.splitButton}><button type="button" onClick={exportCsv}><Icon name="export" size={17} />Export report</button><DashboardPopover label="Export options" open={popup === 'export'} onOpenChange={togglePopup('export')} trigger={<Icon name="chevron-down" size={16} />}><div className={s.popoverHeading}><strong>Export report</strong></div><button type="button" className={s.menuItem} onClick={exportCsv}><Icon name="file-text" size={18} /><span>Download payment CSV<small>{selectedVisible.length ? `${selectedVisible.length} selected records` : `${visible.length} visible records`}</small></span></button><div className={s.popoverNote}>Downloads illustrative records. No ERP posting.</div></DashboardPopover></div>
        </div></div>
        <div className={s.scopeLine}><span>{dateRange.detail}</span><DashboardPopover label="Bank account scope" open={popup === 'account'} onOpenChange={togglePopup('account')} align="left" trigger={<><Icon name="building" size={15} />{accounts.length ? `${accounts[0]} account` : 'All bank accounts'}<Icon name="chevron-down" size={14} /></>}><div className={s.popoverHeading}><strong>Bank accounts</strong></div>{[{ value: '', title: 'All bank accounts', detail: 'Operating and Collections' }, { value: 'Operating', title: 'Operating account', detail: 'USD operating receipts' }, { value: 'Collections', title: 'Collections account', detail: 'USD customer collections' }].map(item => <button type="button" className={s.dateOption} key={item.value} aria-pressed={item.value ? accounts.includes(item.value) : !accounts.length} onClick={() => { setAccounts(item.value ? [item.value] : []); setSelected([]); closePopup(); }}><span><strong>{item.title}</strong><small>{item.detail}</small></span>{(item.value ? accounts.includes(item.value) : !accounts.length) && <Icon name="check" size={16} />}</button>)}</DashboardPopover></div>
        <div className={s.metrics} aria-label="Cash application totals">
          <div><span><Icon name="currency" size={18} />Total received</span><strong>{formatMoney(summary.receivedMinor)}</strong><small>{summary.totalCount} bank payments in this period</small></div>
          <div><span><Icon name="check-circle" size={18} />Reconciled</span><strong>{formatMoney(summary.matchedMinor)}</strong><small className={s.positive}>{summary.matchedCount} payments matched to invoices</small></div>
          <div><span><Icon name="alert-circle" size={18} />Needs attention</span><strong>{formatMoney(summary.reviewMinor)}</strong><small className={s.warning}>{summary.reviewCount} payments awaiting review</small></div>
          <div><span><Icon name="layers" size={18} />Match rate</span><strong>{summary.matchRate.toFixed(0)}<i>%</i></strong><small>{summary.matchedCount} of {summary.totalCount} payments matched</small><div className={s.miniProgress} role="progressbar" aria-label="Payments matched" aria-valuenow={Math.round(summary.matchRate)} aria-valuemin={0} aria-valuemax={100}><span style={{ transform: `scaleX(${summary.matchRate / 100})` }} /></div></div>
        </div>
        <div className={s.analysisGrid}>
          <section className={s.chartPanel} aria-labelledby="cash-chart-title"><div className={s.panelHeader}><div><h2 id="cash-chart-title">Cash movement</h2><p>Received and matched over the last 7 days</p></div><AssetSegmentedControl label="Chart metric" value={chartMetric} onValueChange={value => setChartMetric(value as 'amount' | 'rate')} options={[{ value: 'amount', label: 'Amount' }, { value: 'rate', label: 'Match rate' }]} /></div><CashChart rows={scope} metric={chartMetric} /><div className={s.chartFooter}><span><i className={s.receivedKey} />Received<i className={s.matchedKey} />Matched</span><small>All values in USD</small></div></section>
          <section ref={reviewSection} className={s.reviewPanel} aria-labelledby="review-panel-title"><div className={s.panelHeader}><div><h2 id="review-panel-title">Needs your attention <span>{review.length}</span></h2><p>A few payments need a closer look.</p></div><Icon name="alert-circle" size={19} /></div>
            <div className={s.reviewList}>{review.slice(0, 3).map(row => <button type="button" key={row.id} onClick={() => openDetails(row)} aria-label={`Review ${row.customer}`}><span className={s.customerIcon}>{row.customer.split(' ').map(word => word[0]).slice(0, 2).join('')}</span><span><strong>{row.customer}</strong><small>{row.status === 'Evidence pending' ? 'Remittance evidence pending' : 'Payment difference to review'}</small></span><span className={s.reviewAmount}>{formatMoney(row.amountMinor)}<Icon name="chevron-right" size={14} /></span></button>)}{review.length === 0 && <div className={s.reviewEmpty}><Icon name="check-circle" size={24} /><strong>Everything is matched</strong><p>No open exceptions for this account and period.</p></div>}</div>
            <button className={s.reviewFooter} type="button" onClick={() => { setStatus('all'); setStatuses(['Needs review', 'Evidence pending']); tableSection.current?.scrollIntoView({ block: 'start', behavior: 'auto' }); }}>View review queue<Icon name="arrow-right" size={16} /></button>
          </section>
        </div>
        <section ref={tableSection} className={s.tablePanel} aria-labelledby="payments-title"><div className={s.tableTitle}><div><h2 id="payments-title">Incoming payments <span>{scope.length}</span></h2><p>Every receipt, with its reconciliation status.</p></div><span className={s.tableScope}>USD payments</span></div>
          <div className={s.tableToolbar}><div className={s.tableTabs} role="group" aria-label="Payment views">{(['all', 'Matched', 'Needs review'] as const).map(value => <button type="button" key={value} aria-pressed={status === value && !statuses.length} onClick={() => { setStatus(value); setStatuses([]); }}>{value === 'all' ? 'All payments' : value}<span>{value === 'all' ? scope.length : scope.filter(row => row.status === value).length}</span></button>)}</div>
            <div className={s.tableTools}><label className={s.search}><Icon name="search" size={16} /><input type="search" aria-label="Search dashboard payments" placeholder="Search payments..." value={query} onChange={event => setQuery(event.target.value)} /></label><DashboardPopover label="Filter payments" open={popup === 'filter'} onOpenChange={togglePopup('filter')} trigger={<><Icon name="sliders" size={16} />Filters{filterCount > 0 && <span className={s.filterCount}>{filterCount}</span>}</>}>
              <div className={s.popoverHeading}><strong>Filter payments</strong><button type="button" onClick={() => { setDraftStatuses([]); setDraftSources([]); }}>Reset</button></div><fieldset className={s.filterGroup}><legend>Reconciliation status</legend>{(['Matched', 'Needs review', 'Evidence pending'] as const).map(value => <label key={value}><input type="checkbox" checked={draftStatuses.includes(value)} onChange={() => setDraftStatuses(toggleChoice(draftStatuses, value))} /><span>{value}</span><small>{scope.filter(row => row.status === value).length}</small></label>)}</fieldset><fieldset className={s.filterGroup}><legend>Payment method</legend>{['ACH', 'Wire'].map(value => <label key={value}><input type="checkbox" checked={draftSources.includes(value)} onChange={() => setDraftSources(toggleChoice(draftSources, value))} /><span>{value}</span><small>{scope.filter(row => row.source === value).length}</small></label>)}</fieldset><div className={s.filterActions}><button type="button" onClick={closePopup}>Cancel</button><button type="button" onClick={() => { setStatuses(draftStatuses); setSources(draftSources); setStatus('all'); setSelected([]); closePopup(); }}>Apply filters</button></div>
            </DashboardPopover></div>
          </div>
          {(filterCount > 0 || selectedVisible.length > 0) && <div className={s.filterStrip}>{selectedVisible.length > 0 && <strong>{selectedVisible.length} selected</strong>}{[...statuses, ...sources].map(value => <button type="button" key={value} aria-label={`Remove ${value} filter`} onClick={() => { setStatuses(statuses.filter(item => item !== value)); setSources(sources.filter(item => item !== value)); }}>{value}<Icon name="close" size={12} /></button>)}{filterCount > 0 && <button type="button" className={s.clearFilters} onClick={() => { setStatuses([]); setSources([]); }}>Clear all</button>}</div>}
          <div className={s.tableScroller}><table><caption className={s.srOnly}>Illustrative incoming payments, USD. Select a payment to inspect its allocation.</caption><thead><tr><th className={s.checkColumn}><input ref={selectAll} type="checkbox" aria-label="Select all dashboard payments" checked={visible.length > 0 && selectedVisible.length === visible.length} onChange={event => { const ids = visible.map(row => row.id); setSelected(event.target.checked ? [...new Set([...selected, ...ids])] : selected.filter(id => !ids.includes(id))); }} /></th><th>Payment / customer</th><th className={s.amountColumn} aria-sort={sort === 'amount' ? ascending ? 'ascending' : 'descending' : 'none'}><button type="button" onClick={() => sortColumn('amount')}>Amount<Icon name={sort === 'amount' ? ascending ? 'chevron-up' : 'chevron-down' : 'arrow-up-down'} size={13} /></button></th><th className={s.methodColumn}>Method</th><th className={s.dateColumn} aria-sort={sort === 'date' ? ascending ? 'ascending' : 'descending' : 'none'}><button type="button" onClick={() => sortColumn('date')}>Received<Icon name={sort === 'date' ? ascending ? 'chevron-up' : 'chevron-down' : 'arrow-up-down'} size={13} /></button></th><th>Allocation</th><th>Status</th><th className={s.actionColumn}><span className={s.srOnly}>Payment details</span></th></tr></thead><tbody>
            {visible.map(row => <tr key={row.id} data-selected={selected.includes(row.id)}><td className={s.checkColumn}><input type="checkbox" aria-label={`Select ${row.reference}`} checked={selected.includes(row.id)} onChange={() => setSelected(toggleChoice(selected, row.id))} /></td><th scope="row"><button type="button" className={s.paymentCell} onClick={() => openDetails(row)}><span className={s.paymentAvatar}>{row.customer.split(' ').map(word => word[0]).slice(0, 2).join('')}</span><span><strong>{row.customer}</strong><small>{row.reference}</small></span></button></th><td className={s.amountColumn}>{formatMoney(row.amountMinor)}</td><td className={s.methodColumn}><span className={s.methodBadge}>{row.source}</span></td><td className={s.dateColumn}>{dateLabel(row.date)}</td><td><span className={s.allocationLabel}><Icon name="file-text" size={14} />{row.invoiceCount} invoices</span></td><td><StatusPill status={row.status} className={s.tableStatus} /></td><td className={s.actionColumn}><button type="button" aria-label={`View ${row.reference}`} onClick={() => openDetails(row)}><Icon name="chevron-right" size={16} /></button></td></tr>)}
          </tbody></table>{visible.length === 0 && <div className={s.emptyTable}><Icon name="search" size={26} /><h3>No payments found</h3><p>Try another search or clear the filters.</p><button type="button" onClick={() => { setQuery(''); setStatus('all'); setSources([]); setStatuses([]); }}>Clear search and filters</button></div>}</div>
          <div className={s.tableFooter}><span>Showing {visible.length} of {scope.length} payments</span><span>{selectedVisible.length ? `${formatMoney(selectedVisible.reduce((sum, row) => sum + row.amountMinor, 0))} selected` : 'Select a payment to inspect details'}<Icon name="arrow-right" size={14} /></span></div>
        </section>
        <footer className={s.footer}><span><Icon name="lock" size={13} />Illustrative records. No live accounts connected.</span><a href="#composition">Explore the full Verasett UI library<Icon name="arrow-right" size={14} /></a></footer>
      </main>
    </div>
    <dialog ref={sheet} className={s.detailSheet} aria-labelledby="payment-detail-title"><header><div><span>Payment details</span><h2 id="payment-detail-title">{detail.customer}</h2></div><button type="button" aria-label="Close payment details" onClick={() => sheet.current?.close()}><Icon name="close" size={21} /></button></header><div className={s.detailBody}><StatusPill status={detail.status} /><div className={s.detailAmount}><span>Received amount</span><strong>{formatMoney(detail.amountMinor)}</strong><small>{detail.reference}</small></div><dl className={s.detailFacts}><div><dt>Received</dt><dd>{dateLabel(detail.date)}</dd></div><div><dt>Payment method</dt><dd>{detail.source}</dd></div><div><dt>Bank account</dt><dd>{detail.account}</dd></div></dl><h3>{detail.status === 'Matched' ? 'Matched invoices' : 'Candidate invoices'}</h3><div className={s.invoiceList}>{detail.invoices.map(invoice => <div key={invoice.reference}><span><Icon name="file-text" size={15} />{invoice.reference}</span><strong>{formatMoney(invoice.amountMinor)}</strong></div>)}</div><div className={s.detailTotal}><span>Invoice total</span><strong>{formatMoney(detail.invoices.reduce((sum, invoice) => sum + invoice.amountMinor, 0))}</strong></div><div className={s.detailDifference}><span>Difference</span><strong>{formatMoney(detail.amountMinor - detail.invoices.reduce((sum, invoice) => sum + invoice.amountMinor, 0))}</strong></div><div className={s.detailNotice} data-matched={detail.status === 'Matched'}><Icon name={detail.status === 'Matched' ? 'check-circle' : 'alert-circle'} size={20} /><p>{detail.note}</p></div></div><footer><span>No payment or deduction is approved from this view.</span><button type="button" onClick={() => sheet.current?.close()}>Done</button></footer></dialog>
    <span className={s.srOnly} role="status">{announcement}</span>
  </div>;
}
