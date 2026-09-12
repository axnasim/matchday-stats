import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Bell,
  BellRing,
  BarChart3,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  ExternalLink,
  Flame,
  Gauge,
  LayoutDashboard,
  Menu,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { Link, Route, Switch, useLocation } from 'wouter';
import {
  getGetOverviewQueryKey,
  getListAlertsQueryKey,
  getListLeaguesQueryKey,
  getListMatchesQueryKey,
  getListSoccerPlayersQueryKey,
  getListSoccerStatsQueryKey,
  getListSoccerTeamsQueryKey,
  useCreateAlert,
  useDeleteAlert,
  useGetOverview,
  useListAlerts,
  useListLeagues,
  useListMatches,
  useListSoccerPlayers,
  useListSoccerStats,
  useListSoccerTeams,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import './index.css';

const queryClient = new QueryClient();
type ViewFilter = 'all' | 'live' | 'upcoming' | 'finished';
type AlertKind = 'kickoff' | 'goals' | 'final';

const formatTime = (value?: string | null) => value ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—';
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(value)) : '—';
const formatRelative = (value?: string | null) => {
  if (!value) return 'not available';
  const mins = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  return mins < 1 ? 'just now' : `${mins} min ago`;
};

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const soccerActive = location.startsWith('/soccer');
  const links = [
    { href: '/', label: 'Matchday', icon: LayoutDashboard },
    { href: '/alerts', label: 'Saved alerts', icon: BellRing },
    { href: '/settings', label: 'Settings', icon: Settings2 },
  ];
  return (
    <div className="app-shell noise-overlay">
      <aside className="sidebar fixed inset-y-0 left-0 z-30 hidden w-[238px] flex-col border-r border-white/10 px-5 py-6 md:flex">
        <Brand />
        <div className="mt-12 flex flex-1 flex-col">
          <p className="label-mono mb-3 px-3 text-white/40">Sports</p>
          <div className="mb-8 space-y-1">
            <Link href="/soccer" className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${soccerActive ? 'bg-[#63d7aa]/15 text-[#8ce8c2]' : 'text-white/58 hover:bg-white/6 hover:text-white'}`} aria-current={soccerActive ? 'page' : undefined}>
              <Trophy size={17} strokeWidth={1.8} />
              <span>Soccer</span>
              <span className="ml-auto rounded-full bg-[#63d7aa]/15 px-2 py-0.5 font-mono text-[10px] text-[#8ce8c2]">22 competitions</span>
            </Link>
            <p className="px-3 pt-2 text-[11px] text-white/35">More sports coming soon</p>
          </div>
          <p className="label-mono mb-3 px-3 text-white/40">Control room</p>
          <nav className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`} className={`nav-link flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${location === href ? 'bg-white/10 text-white' : 'text-white/58 hover:bg-white/6 hover:text-white'}`}>
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
                {href === '/alerts' && <span className="ml-auto rounded-full bg-[#f08b68]/20 px-2 py-0.5 font-mono text-[10px] text-[#ffab8c]">live</span>}
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="label-mono text-white/45">Matchday pulse</span>
              <span className="live-dot h-2 w-2 rounded-full bg-[#63d7aa]" />
            </div>
            <p className="display-font text-2xl font-semibold text-white">On the ball.</p>
            <p className="mt-1 text-xs leading-relaxed text-white/48">Your important fixtures, without the noise.</p>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#63d7aa] font-mono text-xs font-bold text-[#102126]">MA</div>
          <div><p className="text-xs font-semibold text-white">tekbytz.sports</p><p className="text-[11px] text-white/40">Personal control room</p></div>
        </div>
      </aside>
      <header className="mobile-only sticky top-0 z-30 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] px-4 py-3 backdrop-blur-md md:hidden">
        <Brand compact />
        <button type="button" onClick={() => setMobileOpen((open) => !open)} aria-label="Open navigation" data-testid="button-open-navigation" className="rounded-lg p-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"><Menu size={20} /></button>
      </header>
      {mobileOpen && <div className="mobile-only fixed inset-x-0 top-[57px] z-20 flex flex-col gap-1 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-lg md:hidden"><p className="label-mono px-3 pb-1 pt-2 text-[hsl(var(--muted-foreground))]">Sports</p><Link href="/soccer" onClick={() => setMobileOpen(false)} data-testid="link-mobile-soccer" className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${soccerActive ? 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}><Trophy size={17} /> <span>Soccer</span><span className="ml-auto font-mono text-[10px]">22 competitions</span></Link><p className="px-3 pb-2 pt-1 text-[11px] text-[hsl(var(--muted-foreground))]">More sports coming soon</p>{links.map(({ href, label, icon: Icon }) => <Link onClick={() => setMobileOpen(false)} key={href} href={href} data-testid={`link-mobile-${label.toLowerCase().replace(' ', '-')}`} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${location === href ? 'bg-[hsl(var(--muted))] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}><Icon size={17} />{label}</Link>)}</div>}
      <main className="content min-h-[100dvh] md:ml-[238px]">{children}</main>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" data-testid="link-brand" className="flex items-center gap-3">
    <div className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#63d7aa] text-[#102126] shadow-[0_6px_18px_rgba(99,215,170,.2)]"><Trophy size={18} strokeWidth={2.4} /><span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#f08b68]" /></div>
    {!compact && <div><p className="display-font text-[17px] font-bold tracking-tight text-white">tekbytz.sports</p><p className="label-mono text-[8px] text-white/40">alerts / football</p></div>}
    {compact && <span className="display-font text-[17px] font-bold tracking-tight text-[hsl(var(--foreground))]">tekbytz.sports</span>}
  </Link>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
    <div><p className="label-mono mb-2 text-[hsl(var(--primary))]">{eyebrow}</p><h1 className="display-font text-4xl font-bold tracking-[-.04em] text-[hsl(var(--foreground))] sm:text-5xl">{title}</h1>{description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{description}</p>}</div>
    {action}
  </div>;
}

function Skeleton({ className = '' }: { className?: string }) { return <div className={`animate-pulse rounded-lg bg-[hsl(var(--muted))] ${className}`} />; }
function QueryError({ label = 'Could not load this view.', retry }: { label?: string; retry?: () => void }) {
  return <div className="card-surface flex flex-col items-center justify-center rounded-xl px-6 py-14 text-center"><CircleAlert className="mb-3 text-[hsl(var(--accent))]" size={25} /><p className="font-semibold text-[hsl(var(--foreground))]">{label}</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">The matchday feed missed a beat. Try again.</p>{retry && <button type="button" onClick={retry} data-testid="button-retry" className="action-button mt-5 rounded-lg bg-[hsl(var(--secondary))] px-4 py-2 text-xs font-bold text-[hsl(var(--secondary-foreground))]">Retry connection</button>}</div>;
}
function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="card-surface flex flex-col items-center justify-center rounded-xl px-6 py-14 text-center"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--primary))]"><Trophy size={21} /></div><p className="font-semibold">{title}</p><p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">{detail}</p></div>; }

function OverviewStrip({ overview, loading }: { overview: any; loading: boolean }) {
  const stats = [
    { label: 'Live now', value: overview?.liveCount, accent: true, icon: Flame },
    { label: 'Coming up', value: overview?.upcomingCount, icon: Clock3 },
    { label: 'Finished', value: overview?.finishedCount, icon: Check },
    { label: 'Leagues tracked', value: overview?.trackedLeagueCount, icon: Trophy },
  ];
  return <div className="overview-grid mb-9 grid grid-cols-4 gap-3">
    {stats.map(({ label, value, accent, icon: Icon }) => <div key={label} className={`card-surface rounded-xl p-4 ${accent ? 'border-[hsl(var(--primary)/.32)] bg-[hsl(var(--primary)/.05)]' : ''}`}><div className="mb-4 flex items-center justify-between"><span className="label-mono text-[hsl(var(--muted-foreground))]">{label}</span><Icon size={16} className={accent ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'} /></div>{loading ? <Skeleton className="h-8 w-14" /> : <p data-testid={`text-stat-${label.toLowerCase().replace(' ', '-')}`} className="display-font text-3xl font-bold tracking-tight">{value ?? '—'}</p>}</div>)}
  </div>;
}

function NextMatchCard({ match, onAlert }: { match: any; onAlert: (team: string, leagueId: string) => void }) {
  if (!match) return <div className="card-surface rounded-xl p-6"><p className="label-mono text-[hsl(var(--muted-foreground))]">Next on deck</p><p className="mt-4 font-semibold">No upcoming fixtures in the feed.</p></div>;
  return <div className="relative overflow-hidden rounded-xl bg-[#193238] p-6 text-[#edf0e6] shadow-[0_12px_28px_rgba(22,48,53,.16)]"><div className="absolute right-[-22px] top-[-35px] h-40 w-40 rounded-full border-[20px] border-[#63d7aa]/10" /><div className="relative"><div className="mb-6 flex items-start justify-between"><div><p className="label-mono text-[#8fbdb0]">Next on deck</p><p className="mt-1 text-xs text-white/52">{match.leagueShortName} · {match.round}</p></div><span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] text-[#bde4d2]">{formatDate(match.kickoff)}</span></div><div className="flex items-center justify-between gap-3"><TeamChip team={match.homeTeam} light /><div className="text-center"><p className="font-mono text-2xl font-medium text-[#63d7aa]">{formatTime(match.kickoff)}</p><p className="mt-1 text-[10px] uppercase tracking-widest text-white/40">kickoff</p></div><TeamChip team={match.awayTeam} light flip /></div><button type="button" onClick={() => onAlert(match.homeTeam.name, match.leagueId)} data-testid={`button-alert-next-${match.id}`} className="action-button mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#63d7aa] py-2.5 text-xs font-bold text-[#102126] hover:bg-[#86e2be]"><Bell size={14} /> Set alert for this match</button></div></div>;
}

function TeamChip({ team, light = false, flip = false }: { team: any; light?: boolean; flip?: boolean }) {
  return <div className={`flex min-w-0 items-center gap-2.5 ${flip ? 'flex-row-reverse text-right' : ''}`}><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-[10px] font-bold ${light ? 'border-white/15 bg-white/10 text-[#bde4d2]' : 'border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--primary))]'}`}>{team?.initials ?? '?'}</div><div className="min-w-0"><p className={`truncate text-sm font-bold ${light ? 'text-white' : ''}`}>{team?.shortName ?? team?.name ?? 'Team'}</p><p className={`truncate text-[10px] ${light ? 'text-white/45' : 'text-[hsl(var(--muted-foreground))]'}`}>{team?.name ?? 'Unknown team'}</p></div></div>;
}

function MatchRow({ match, onAlert }: { match: any; onAlert: (team: string, leagueId: string) => void }) {
  const live = match.status === 'LIVE';
  const finished = match.status === 'FT';
  return <div data-testid={`row-match-${match.id}`} className={`match-row card-surface grid grid-cols-[86px_minmax(0,1fr)_148px] items-center gap-4 rounded-xl p-4 ${live ? 'border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.035)]' : ''}`}><div><div className="mb-1 flex items-center gap-1.5">{live && <span className="live-dot h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />}<span className={`font-mono text-[11px] font-medium ${live ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'}`}>{live ? `${match.minute ?? 0}'` : finished ? 'Full time' : formatTime(match.kickoff)}</span></div><span className="label-mono text-[9px] text-[hsl(var(--muted-foreground))]">{match.leagueShortName}</span></div><div className="grid gap-2 sm:grid-cols-2"><TeamChip team={match.homeTeam} /><TeamChip team={match.awayTeam} flip /></div><div className="flex items-center justify-end gap-3"><div className="text-right font-mono text-sm font-medium">{live || finished ? <><p>{match.homeScore ?? 0}</p><p>{match.awayScore ?? 0}</p></> : <p className="text-xs text-[hsl(var(--muted-foreground))]">{match.venue}</p>}</div>{!finished && <button type="button" onClick={() => onAlert(match.homeTeam.name, match.leagueId)} aria-label={`Set alert for ${match.homeTeam.name}`} data-testid={`button-alert-${match.id}`} className="action-button rounded-lg border border-[hsl(var(--border))] p-2 text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/.4)] hover:bg-[hsl(var(--primary)/.08)] hover:text-[hsl(var(--primary))]"><Bell size={15} /></button>}</div></div>;
}

function Dashboard() {
  const [view, setView] = useState<ViewFilter>('all');
  const [league, setLeague] = useState('all');
  const [alertDraft, setAlertDraft] = useState<{ team: string; leagueId: string } | null>(null);
  const leagues = useListLeagues({ query: { queryKey: getListLeaguesQueryKey() } });
  const overview = useGetOverview({ query: { queryKey: getGetOverviewQueryKey() } });
  const matchParams = useMemo(() => ({ dateRange: 'today' as const, status: view, leagueId: league === 'all' ? undefined : league }), [view, league]);
  const matches = useListMatches(matchParams, { query: { queryKey: getListMatchesQueryKey(matchParams) } });
  const handleRefresh = () => { void queryClient.invalidateQueries({ queryKey: getGetOverviewQueryKey() }); void queryClient.invalidateQueries({ queryKey: getListMatchesQueryKey(matchParams) }); };
  const data = matches.data ?? [];
  return <div className="page-enter main-padding px-6 py-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-[1320px]">
    <PageHeader eyebrow="Saturday · matchday control room" title="Stay close to the game." description="The live state of your football world, trimmed to what deserves your attention." action={<button type="button" onClick={handleRefresh} data-testid="button-refresh-dashboard" className="action-button flex items-center gap-2 self-start rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2.5 text-xs font-bold hover:bg-[hsl(var(--muted))] sm:self-auto"><RefreshCw size={14} /> Refresh feed</button>} />
    <OverviewStrip overview={overview.data} loading={overview.isLoading} />
    {overview.isError || leagues.isError || matches.isError ? <QueryError retry={handleRefresh} /> : <><div className="mb-9 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(290px,.8fr)]"><div className="card-surface soft-grid relative overflow-hidden rounded-xl p-6 sm:p-7"><div className="relative flex items-start justify-between"><div><p className="label-mono text-[hsl(var(--muted-foreground))]">The next 90 minutes</p><h2 className="display-font mt-2 max-w-md text-3xl font-bold leading-tight tracking-[-.04em]">Every important moment, in one glance.</h2><p className="mt-3 max-w-md text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Live matches sit up front. Upcoming fixtures line up behind them. Nothing gets buried.</p></div><div className="hidden rounded-lg border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--primary)/.08)] p-2.5 text-[hsl(var(--primary))] sm:block"><Gauge size={22} /></div></div><div className="relative mt-8 flex items-center gap-4"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full w-[64%] rounded-full bg-[hsl(var(--primary))]" /></div><span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">feed health 64%</span></div></div><NextMatchCard match={overview.data?.nextMatch} onAlert={(team, leagueId) => setAlertDraft({ team, leagueId })} /></div>
      <section><div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="label-mono text-[hsl(var(--muted-foreground))]">Today’s fixtures</p><h2 className="display-font mt-1 text-2xl font-bold tracking-[-.03em]">The match board</h2></div><div className="mobile-scroll flex gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">{(['all', 'live', 'upcoming', 'finished'] as ViewFilter[]).map((filter) => <button type="button" key={filter} onClick={() => setView(filter)} data-testid={`button-filter-${filter}`} className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-bold capitalize transition-colors ${view === filter ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>{filter === 'all' ? 'All matches' : filter}</button>)}</div></div><div className="mb-5 flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => setLeague('all')} data-testid="button-league-all" className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${league === 'all' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]'}`}><span className="h-2 w-2 rounded-full bg-current" /> All leagues</button>{(leagues.data ?? []).map((item: any) => <button type="button" key={item.id} onClick={() => setLeague(item.id)} data-testid={`button-league-${item.id}`} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${league === item.id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]'}`}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.accent }} />{item.shortName}</button>)}</div>{matches.isLoading ? <div className="space-y-3"><Skeleton className="h-[88px]" /><Skeleton className="h-[88px]" /><Skeleton className="h-[88px]" /></div> : data.length ? <div className="space-y-3">{data.map((match: any) => <MatchRow key={match.id} match={match} onAlert={(team, leagueId) => setAlertDraft({ team, leagueId })} />)}</div> : <EmptyState title="No matches in this view" detail="Try another league or switch back to all matches to widen the board." />}</section></>}
    {alertDraft && <AlertComposer initial={alertDraft} leagues={leagues.data ?? []} onClose={() => setAlertDraft(null)} />}
  </div></div>;
}

function LeagueGroup({ title, detail, items }: { title: string; detail: string; items: any[] }) {
  return <section>
    <div className="mb-4"><p className="display-font text-2xl font-bold">{title}</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{detail}</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item: any) => <Link href={`/soccer?league=${item.id}`} key={item.id} className="card-surface match-row rounded-xl p-5"><div className="mb-6 flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs font-bold text-white" style={{ backgroundColor: item.accent }}>{item.shortName}</span><span className="label-mono text-[hsl(var(--muted-foreground))]">{item.country}</span></div><p className="display-font text-xl font-bold">{item.name}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">View teams, players, fixtures, and stats</p></Link>)}</div>
  </section>;
}

type SoccerSection = 'leagues' | 'teams' | 'players' | 'live';
type StatCategory = 'goals' | 'assists' | 'appearances' | 'minutes' | 'rating' | 'cleanSheets' | 'cards';

function SoccerHub() {
  const [location] = useLocation();
  const routeLeague = new URLSearchParams(location.split('?')[1] ?? '').get('league') ?? 'all';
  const [section, setSection] = useState<SoccerSection>('leagues');
  const [league, setLeague] = useState(routeLeague);
  useEffect(() => setLeague(routeLeague), [routeLeague]);
  const leagues = useListLeagues({ query: { queryKey: getListLeaguesQueryKey() } });
  const leagueParams = league === 'all' ? undefined : { leagueId: league };
  const teams = useListSoccerTeams(leagueParams, { query: { queryKey: getListSoccerTeamsQueryKey(leagueParams) } });
  const players = useListSoccerPlayers(leagueParams, { query: { queryKey: getListSoccerPlayersQueryKey(leagueParams) } });
  const liveParams = { dateRange: 'week' as const, status: 'live' as const };
  const liveMatches = useListMatches(liveParams, { query: { queryKey: getListMatchesQueryKey(liveParams) } });
  const tabs: { id: SoccerSection; label: string; count: number | undefined }[] = [
    { id: 'leagues', label: 'Leagues', count: leagues.data?.length },
    { id: 'teams', label: 'Teams', count: teams.data?.length },
    { id: 'players', label: 'Players', count: players.data?.length },
    { id: 'live', label: 'Live games', count: liveMatches.data?.length },
  ];
  const domesticLeagues = (leagues.data ?? []).filter((item: any) => item.category === 'domestic');
  const competitionLeagues = (leagues.data ?? []).filter((item: any) => item.category === 'competition');

  return <div className="page-enter main-padding px-6 py-8 lg:px-10 lg:py-10">
    <div className="mx-auto max-w-[1220px]">
      <PageHeader eyebrow="Sports · Soccer" title="The soccer hub." description="Browse every supported league, club, player, and live game from one place." action={<Link href="/soccer/stats" data-testid="link-soccer-stats" className="action-button flex items-center gap-2 self-start rounded-lg bg-[hsl(var(--foreground))] px-4 py-3 text-xs font-bold text-[hsl(var(--background))] sm:self-auto"><BarChart3 size={15} /> Explore stats</Link>} />
      <div className="mb-7 flex flex-wrap gap-2">
        {tabs.map((tab) => <button type="button" key={tab.id} onClick={() => setSection(tab.id)} data-testid={`button-soccer-section-${tab.id}`} className={`rounded-lg border px-3.5 py-2.5 text-xs font-bold transition-colors ${section === tab.id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>{tab.label}{tab.count !== undefined && <span className="ml-2 font-mono text-[10px] opacity-70">{tab.count}</span>}</button>)}
        <Link href="/soccer/stats" data-testid="link-soccer-stats-nav" className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2.5 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/.4)] hover:text-[hsl(var(--primary))]"><BarChart3 size={14} /> Stats</Link>
      </div>
      <div className="mb-7 flex items-center gap-3 overflow-x-auto pb-1">
        <span className="label-mono shrink-0 text-[hsl(var(--muted-foreground))]">League</span>
        <button type="button" onClick={() => setLeague('all')} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold ${league === 'all' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]'}`}>All leagues</button>
        {(leagues.data ?? []).map((item: any) => <button type="button" key={item.id} onClick={() => setLeague(item.id)} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${league === item.id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]'}`}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.accent }} />{item.shortName}</button>)}
      </div>
      {section === 'leagues' && <div className="space-y-10">
        <LeagueGroup title="Domestic leagues" detail="Follow the regular season competitions in each country." items={domesticLeagues} />
        <LeagueGroup title="Competition leagues" detail="Follow continental and international tournaments." items={competitionLeagues} />
      </div>}
      {section === 'teams' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(teams.data ?? []).map((item: any) => <div key={item.id} className="card-surface rounded-xl p-5"><div className="flex items-start justify-between"><div><p className="display-font text-lg font-bold">{item.name}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{item.leagueName}</p></div><span className="font-mono text-2xl font-bold text-[hsl(var(--primary))]">#{item.position}</span></div><div className="mt-5 flex items-center justify-between"><span className="label-mono text-[hsl(var(--muted-foreground))]">Recent form</span><div className="flex gap-1.5">{item.form.map((result: string, index: number) => <span key={`${item.id}-${index}`} className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${result === 'W' ? 'bg-[hsl(var(--primary)/.13)] text-[hsl(var(--primary))]' : result === 'D' ? 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]' : 'bg-[hsl(var(--accent)/.13)] text-[hsl(var(--accent))]'}`}>{result}</span>)}</div></div></div>)}</div>}
      {section === 'players' && <div className="card-surface overflow-hidden rounded-xl"><div className="hidden grid-cols-[1fr_120px_90px_90px_90px] gap-4 border-b border-[hsl(var(--border))] px-5 py-3 label-mono text-[hsl(var(--muted-foreground))] sm:grid"><span>Player</span><span>League</span><span>Apps</span><span>Goals</span><span>Rating</span></div>{(players.data ?? []).map((item: any) => <div key={item.id} className="grid gap-3 border-b border-[hsl(var(--border))] px-5 py-4 last:border-0 sm:grid-cols-[1fr_120px_90px_90px_90px] sm:items-center sm:gap-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]"><Users size={16} /></span><div><p className="font-bold">{item.name}</p><p className="text-xs text-[hsl(var(--muted-foreground))]">{item.teamName} · {item.position}</p></div></div><span className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">{item.leagueName}</span><span className="text-xs font-semibold sm:text-sm">{item.appearances} apps</span><span className="text-xs font-semibold sm:text-sm">{item.goals} goals</span><span className="font-mono text-sm text-[hsl(var(--primary))]">{item.rating.toFixed(1)}</span></div>)}</div>}
      {section === 'live' && <div className="space-y-3">{(liveMatches.data ?? []).map((item: any) => <MatchRow key={item.id} match={item} onAlert={() => undefined} />)}{!liveMatches.data?.length && <EmptyState title="No live games right now" detail="When a match starts, it will appear here with its score and minute." />}</div>}
    </div>
  </div>;
}

function SoccerStatsPage() {
  const [league, setLeague] = useState('all');
  const [season, setSeason] = useState('2026/27');
  const [category, setCategory] = useState<StatCategory>('goals');
  const leagues = useListLeagues({ query: { queryKey: getListLeaguesQueryKey() } });
  const params = useMemo(() => ({ leagueId: league === 'all' ? undefined : league, season, category }), [league, season, category]);
  const stats = useListSoccerStats(params, { query: { queryKey: getListSoccerStatsQueryKey(params) } });
  const categoryLabels: Record<StatCategory, string> = { goals: 'Goals', assists: 'Assists', appearances: 'Appearances', minutes: 'Minutes', rating: 'Rating', cleanSheets: 'Clean sheets', cards: 'Cards' };
  const statValue = (item: any) => category === 'rating' ? item.rating.toFixed(1) : item[category];

  return <div className="page-enter main-padding px-6 py-8 lg:px-10 lg:py-10">
    <div className="mx-auto max-w-[1220px]">
      <PageHeader eyebrow="Sports · Soccer · Stats" title="Player statistics." description="Filterable league tables for the metrics football fans expect from an EPL-style stats centre." action={<Link href="/soccer" data-testid="link-back-soccer" className="action-button flex items-center gap-2 self-start rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-xs font-bold sm:self-auto">Back to soccer</Link>} />
      <div className="card-surface mb-6 grid gap-3 rounded-xl p-4 sm:grid-cols-3">
        <label className="label-mono text-[hsl(var(--muted-foreground))]">League<select value={league} onChange={(event) => setLeague(event.target.value)} className="mt-2 block w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2.5 font-sans text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]"><option value="all">All leagues</option>{(leagues.data ?? []).map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="label-mono text-[hsl(var(--muted-foreground))]">Season<select value={season} onChange={(event) => setSeason(event.target.value)} className="mt-2 block w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2.5 font-sans text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]"><option>2026/27</option><option>2025/26</option></select></label>
        <label className="label-mono text-[hsl(var(--muted-foreground))]">Metric<select value={category} onChange={(event) => setCategory(event.target.value as StatCategory)} className="mt-2 block w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2.5 font-sans text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <div className="mb-4 flex items-center justify-between"><div><p className="label-mono text-[hsl(var(--primary))]">{categoryLabels[category]} leaders</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Updated with the current soccer data feed.</p></div><BarChart3 className="text-[hsl(var(--primary))]" size={22} /></div>
      {stats.isLoading ? <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div> : stats.isError ? <QueryError retry={() => void stats.refetch()} /> : <div className="card-surface overflow-hidden rounded-xl"><div className="hidden grid-cols-[60px_1fr_160px_80px_90px_80px] gap-4 border-b border-[hsl(var(--border))] px-5 py-3 label-mono text-[hsl(var(--muted-foreground))] sm:grid"><span>#</span><span>Player</span><span>League</span><span>Pos</span><span>{categoryLabels[category]}</span><span>Rating</span></div>{(stats.data ?? []).map((item: any) => <div key={item.playerId} className="grid gap-2 border-b border-[hsl(var(--border))] px-5 py-4 last:border-0 sm:grid-cols-[60px_1fr_160px_80px_90px_80px] sm:items-center sm:gap-4"><span className="font-mono text-sm text-[hsl(var(--muted-foreground))]">#{item.rank}</span><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]"><Users size={16} /></span><div><p className="font-bold">{item.playerName}</p><p className="text-xs text-[hsl(var(--muted-foreground))]">{item.teamName}</p></div></div><span className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">{item.leagueName}</span><span className="text-xs font-semibold">{item.position}</span><span className="font-mono text-lg font-bold text-[hsl(var(--primary))]">{statValue(item)}</span><span className="font-mono text-sm">{item.rating.toFixed(1)}</span></div>)}</div>}
    </div>
  </div>;
}

function AlertComposer({ initial, leagues, onClose }: { initial?: { team: string; leagueId: string }; leagues: any[]; onClose: () => void }) {
  const create = useCreateAlert();
  const [teamName, setTeamName] = useState(initial?.team ?? '');
  const [leagueId, setLeagueId] = useState(initial?.leagueId ?? leagues[0]?.id ?? '');
  const [types, setTypes] = useState<AlertKind[]>(['kickoff', 'goals', 'final']);
  const [done, setDone] = useState(false);
  const toggle = (kind: AlertKind) => setTypes((items) => items.includes(kind) ? items.filter((item) => item !== kind) : [...items, kind]);
  const submit = () => { if (!teamName.trim() || !leagueId || !types.length) return; create.mutate({ data: { leagueId, teamName: teamName.trim(), alertTypes: types } }, { onSuccess: () => { void queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() }); setDone(true); setTimeout(onClose, 700); } }); };
  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#102126]/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"><div role="dialog" aria-modal="true" className="page-enter w-full max-w-md rounded-t-2xl bg-[hsl(var(--card))] p-6 shadow-2xl sm:rounded-2xl"><div className="mb-6 flex items-start justify-between"><div><p className="label-mono text-[hsl(var(--primary))]">New saved alert</p><h2 className="display-font mt-1 text-2xl font-bold">Keep me close.</h2></div><button type="button" onClick={onClose} data-testid="button-close-alert-composer" aria-label="Close alert composer" className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"><X size={18} /></button></div><label className="label-mono mb-2 block text-[hsl(var(--muted-foreground))]" htmlFor="alert-league">League</label><div className="relative mb-4"><select id="alert-league" value={leagueId} onChange={(event) => setLeagueId(event.target.value)} data-testid="select-alert-league" className="w-full appearance-none rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]">{leagues.map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-[hsl(var(--muted-foreground))]" size={16} /></div><label className="label-mono mb-2 block text-[hsl(var(--muted-foreground))]" htmlFor="alert-team">Team</label><input id="alert-team" value={teamName} onChange={(event) => setTeamName(event.target.value)} data-testid="input-alert-team" placeholder="e.g. Arsenal" className="mb-5 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-3 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))]" /><p className="label-mono mb-3 text-[hsl(var(--muted-foreground))]">Notify me for</p><div className="mb-7 grid grid-cols-3 gap-2">{(['kickoff', 'goals', 'final'] as AlertKind[]).map((kind) => <button type="button" key={kind} onClick={() => toggle(kind)} data-testid={`button-alert-type-${kind}`} className={`rounded-lg border px-2 py-3 text-xs font-bold capitalize ${types.includes(kind) ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}>{types.includes(kind) && <Check size={13} className="mx-auto mb-1" />}{kind}</button>)}</div><button type="button" disabled={create.isPending || done} onClick={submit} data-testid="button-save-alert" className="action-button flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-60">{done ? <><Check size={16} /> Alert saved</> : create.isPending ? 'Saving alert…' : <><BellRing size={16} /> Save alert</>}</button></div></div>;
}

function AlertsPage() {
  const alerts = useListAlerts({ query: { queryKey: getListAlertsQueryKey() } });
  const deleteAlert = useDeleteAlert();
  const [composer, setComposer] = useState(false);
  const leagues = useListLeagues({ query: { queryKey: getListLeaguesQueryKey() } });
  const [notice, setNotice] = useState('');
  const remove = (id: string) => { if (!window.confirm('Remove this saved alert?')) return; deleteAlert.mutate({ id }, { onSuccess: () => { void queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() }); setNotice('Alert removed'); setTimeout(() => setNotice(''), 2200); } }); };
  return <div className="page-enter main-padding px-6 py-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-[1100px]"><PageHeader eyebrow="Your attention, tuned" title="Saved alerts." description="A short list of the teams and moments worth interrupting your day for." action={<button type="button" onClick={() => setComposer(true)} data-testid="button-new-alert" className="action-button flex items-center gap-2 self-start rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-[hsl(var(--primary-foreground))] sm:self-auto"><Plus size={16} /> New alert</button>} />{notice && <div className="mb-5 flex items-center gap-2 rounded-lg border border-[hsl(var(--primary)/.25)] bg-[hsl(var(--primary)/.08)] px-4 py-3 text-xs font-semibold text-[hsl(var(--primary))]"><Check size={15} />{notice}</div>}<div className="mb-8 grid gap-3 sm:grid-cols-3"><div className="card-surface rounded-xl p-4"><p className="label-mono text-[hsl(var(--muted-foreground))]">Active rules</p><p data-testid="text-active-alert-count" className="display-font mt-3 text-3xl font-bold">{alerts.data?.filter((item: any) => item.enabled).length ?? '—'}</p></div><div className="card-surface rounded-xl p-4"><p className="label-mono text-[hsl(var(--muted-foreground))]">Moments watched</p><p className="display-font mt-3 text-3xl font-bold">{alerts.data?.reduce((total: number, item: any) => total + item.alertTypes.length, 0) ?? '—'}</p></div><div className="card-surface rounded-xl bg-[hsl(var(--primary)/.07)] p-4"><p className="label-mono text-[hsl(var(--primary))]">Delivery status</p><p className="mt-3 flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"><span className="live-dot h-2 w-2 rounded-full bg-[hsl(var(--primary))]" /> Browser ready</p></div></div>{alerts.isLoading ? <div className="space-y-3"><Skeleton className="h-[108px]" /><Skeleton className="h-[108px]" /></div> : alerts.isError ? <QueryError retry={() => void alerts.refetch()} /> : alerts.data?.length ? <div className="space-y-3">{alerts.data.map((alert: any) => <AlertRow key={alert.id} alert={alert} onDelete={() => remove(alert.id)} deleting={deleteAlert.isPending} />)}</div> : <EmptyState title="No saved alerts yet" detail="Save a team from the match board and we’ll keep the important moments in view." />}{composer && <AlertComposer leagues={leagues.data ?? []} onClose={() => setComposer(false)} />}</div></div>;
}

function AlertRow({ alert, onDelete, deleting }: { alert: any; onDelete: () => void; deleting: boolean }) {
  return <div data-testid={`row-alert-${alert.id}`} className="match-row card-surface flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]"><BellRing size={20} /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{alert.teamName}</p><span className="rounded-full bg-[hsl(var(--muted))] px-2 py-1 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{alert.leagueName}</span></div><div className="mt-2 flex flex-wrap gap-1.5">{alert.alertTypes.map((type: string) => <span key={type} className="rounded bg-[hsl(var(--background))] px-2 py-1 text-[10px] font-semibold capitalize text-[hsl(var(--muted-foreground))]">{type}</span>)}</div></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><span className={`flex items-center gap-1.5 text-xs font-semibold ${alert.enabled ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}><span className={`h-2 w-2 rounded-full ${alert.enabled ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted-foreground))]'}`} />{alert.enabled ? 'Active' : 'Paused'}</span><button type="button" disabled={deleting} onClick={onDelete} data-testid={`button-delete-alert-${alert.id}`} aria-label={`Delete alert for ${alert.teamName}`} className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/.1)] hover:text-[hsl(var(--destructive))]"><Trash2 size={16} /></button></div></div>;
}

function SettingsPage() {
  const [permission, setPermission] = useState<NotificationPermission>(() => typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const [refresh, setRefresh] = useState(() => localStorage.getItem('matchday-refresh') ?? '60');
  const [saved, setSaved] = useState(false);
  const requestPermission = async () => { if (typeof Notification === 'undefined') return; const result = await Notification.requestPermission(); setPermission(result); };
  const save = () => { localStorage.setItem('matchday-refresh', refresh); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return <div className="page-enter main-padding px-6 py-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-[930px]"><PageHeader eyebrow="Your matchday setup" title="Settings." description="Keep the signal useful. Choose where alerts can land and how often the board checks in." /><div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><div className="space-y-5"><section className="card-surface rounded-xl p-6 sm:p-7"><div className="mb-6 flex items-start gap-4"><div className="rounded-xl bg-[hsl(var(--primary)/.11)] p-3 text-[hsl(var(--primary))]"><ShieldCheck size={22} /></div><div><h2 className="display-font text-xl font-bold">Browser notifications</h2><p className="mt-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Allow tekbytz.sports to tap you on the shoulder when a saved moment arrives.</p></div></div><div className="flex flex-col gap-3 rounded-lg bg-[hsl(var(--muted)/.6)] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold">Permission status</p><p data-testid="text-notification-permission" className="mt-1 text-xs capitalize text-[hsl(var(--muted-foreground))]">{permission === 'granted' ? 'Notifications are enabled' : permission === 'denied' ? 'Notifications are blocked in this browser' : 'Permission has not been requested'}</p></div>{permission === 'granted' ? <span className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))]"><Check size={15} /> Ready</span> : <button type="button" onClick={requestPermission} data-testid="button-enable-notifications" className="action-button rounded-lg bg-[hsl(var(--primary))] px-3 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))]">Enable notifications</button>}</div></section><section className="card-surface rounded-xl p-6 sm:p-7"><div className="mb-6 flex items-start gap-4"><div className="rounded-xl bg-[hsl(var(--accent)/.11)] p-3 text-[hsl(var(--accent))]"><RefreshCw size={22} /></div><div><h2 className="display-font text-xl font-bold">Feed refresh</h2><p className="mt-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">How often the match board checks for a new score or kickoff.</p></div></div><label htmlFor="refresh-rate" className="label-mono mb-2 block text-[hsl(var(--muted-foreground))]">Refresh interval</label><div className="relative"><select id="refresh-rate" value={refresh} onChange={(event) => setRefresh(event.target.value)} data-testid="select-refresh-interval" className="w-full appearance-none rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]"><option value="30">Every 30 seconds</option><option value="60">Every minute</option><option value="300">Every 5 minutes</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-[hsl(var(--muted-foreground))]" size={16} /></div><div className="mt-5 flex justify-end"><button type="button" onClick={save} data-testid="button-save-settings" className="action-button flex items-center gap-2 rounded-lg bg-[hsl(var(--foreground))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--background))]">{saved ? <Check size={14} /> : <SlidersHorizontal size={14} />}{saved ? 'Saved' : 'Save preferences'}</button></div></section></div><aside className="card-surface h-fit rounded-xl p-6"><p className="label-mono text-[hsl(var(--muted-foreground))]">Quiet by design</p><div className="my-5 flex h-24 items-center justify-center rounded-lg bg-[hsl(var(--sidebar))] text-[#63d7aa]"><BellRing size={27} /></div><p className="text-sm font-semibold leading-relaxed">Only the moments you choose will interrupt you.</p><p className="mt-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">tekbytz.sports never sends a notification for an untracked team. Your saved alerts are the source of truth.</p><Link href="/alerts" data-testid="link-settings-alerts" className="mt-5 flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))]">Review saved alerts <ExternalLink size={13} /></Link></aside></div></div></div>;
}

function Router() {
  const [location] = useLocation();
  return <AppShell><ErrorBoundary resetKey={location}><Switch><Route path="/" component={Dashboard} /><Route path="/soccer/stats" component={SoccerStatsPage} /><Route path="/soccer" component={SoccerHub} /><Route path="/alerts" component={AlertsPage} /><Route path="/settings" component={SettingsPage} /><Route component={NotFound} /></Switch></ErrorBoundary></AppShell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><Router /><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;