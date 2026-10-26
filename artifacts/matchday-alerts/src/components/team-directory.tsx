import { useMemo, useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import type { SoccerTeam } from '@workspace/api-client-react';

function snapshotDate(value?: string) {
  if (!value) return 'Date unavailable';
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(date);
}

function TeamCard({ team }: { team: SoccerTeam }) {
  const [failed, setFailed] = useState(false);
  const hasBadge = Boolean(team.badgeUrl) && !failed;
  const initials = team.shortName.split(/\s+/).map((part) => part[0]).slice(0, 3).join('');
  return <article data-testid={`card-team-${team.id}`} className="card-surface flex items-center gap-4 rounded-xl p-4">
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white p-2">
      {hasBadge
        ? <img src={team.badgeUrl} alt={`${team.name} badge`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="h-full w-full object-contain" />
        : <span aria-label={`${team.name}: badge unavailable`} className="font-mono text-sm font-bold text-[#193238]">{initials}</span>}
    </span>
    <div className="min-w-0">
      <h3 className="display-font text-base font-bold leading-snug">{team.name}</h3>
      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{hasBadge ? team.shortName : 'Badge unavailable · initials shown'}</p>
    </div>
  </article>;
}

type Props = {
  teams: SoccerTeam[];
  leagueName?: string;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
};

export function TeamDirectory({ teams, leagueName, isLoading, isError, retry }: Props) {
  const [search, setSearch] = useState('');
  const groups = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const grouped = new Map<string, SoccerTeam[]>();
    for (const team of teams) {
      if (query && !`${team.name} ${team.shortName} ${team.leagueName}`.toLocaleLowerCase().includes(query)) continue;
      const group = grouped.get(team.leagueId) ?? [];
      group.push(team);
      grouped.set(team.leagueId, group);
    }
    return Array.from(grouped.values()).map((group) => group.sort((a, b) => a.name.localeCompare(b.name)));
  }, [teams, search]);
  const count = groups.reduce((total, group) => total + group.length, 0);

  return <section>
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="label-mono text-[hsl(var(--primary))]">Competition team directory</p>
        <h2 className="display-font mt-1 text-2xl font-bold">{leagueName ? `${leagueName} teams` : 'Club & national teams'}</h2>
        <p className="mt-2 max-w-2xl text-sm text-[hsl(var(--muted-foreground))]">Dated team lists, not live standings. Each competition shows its season or tournament edition below.</p>
      </div>
      <label className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 sm:w-64">
        <Search size={15} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search teams…" aria-label="Search competition teams" data-testid="input-search-teams" className="min-w-0 w-full bg-transparent text-sm outline-none" />
      </label>
    </div>
    {isLoading ? <div aria-label="Loading teams" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}</div>
      : isError ? <div role="alert" className="card-surface rounded-xl p-6"><p className="font-bold">The team directory couldn’t load.</p><button type="button" onClick={retry} className="mt-3 text-sm font-bold text-[hsl(var(--primary))]">Try again</button></div>
      : !count ? <div className="card-surface rounded-xl p-8 text-center"><ShieldCheck className="mx-auto mb-3 text-[hsl(var(--muted-foreground))]" /><p className="font-bold">No teams match this search.</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Try another team name or clear your search.</p></div>
      : <div className="space-y-8">{groups.map((group) => {
        const first = group[0];
        const missingBadges = group.filter((team) => !team.badgeUrl).length;
        return <section key={first.leagueId} aria-label={`${first.leagueName} teams`}>
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="display-font text-lg font-bold">{first.leagueName} <span className="ml-1 font-mono text-xs font-normal text-[hsl(var(--muted-foreground))]">{group.length} teams</span></h3>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Season / edition {first.snapshotSeason ?? 'unavailable'} · Captured {snapshotDate(first.snapshotDate)} · Not live</p>
              <p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">Source: {first.snapshotSource ?? 'Unavailable'}{missingBadges ? ` · ${missingBadges} badges unavailable` : ''}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{group.map((team) => <TeamCard key={team.id} team={team} />)}</div>
        </section>;
      })}</div>}
  </section>;
}
