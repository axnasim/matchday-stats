import { useMemo, useState } from 'react';
import { ArrowUpRight, ChevronRight, Search, Shield, SlidersHorizontal, Trophy } from 'lucide-react';
import {
  getListSoccerLeadersQueryKey,
  getListSoccerSquadsQueryKey,
  getListSoccerStandingsQueryKey,
  getListSoccerTeamsQueryKey,
  useListSoccerLeaders,
  useListSoccerSquads,
  useListSoccerStandings,
  useListSoccerTeams,
} from '@workspace/api-client-react';
import type { SoccerPlayerLeader, SoccerSquadPlayer, SoccerStanding, SoccerTeam } from '@workspace/api-client-react';
import { Link } from 'wouter';

type Tab = 'table' | 'clubs' | 'squads' | 'leaders';
type LeaderCategory = 'goals' | 'assists';

const leagueId = 'premier-league';
const teamsParams = { leagueId };
const standingsParams = { leagueId };
const squadParams = { leagueId };
const initialLeadersParams = { leagueId, category: 'goals' as const };

const formatSnapshot = (date?: string) => {
  if (!date) return 'Snapshot date unavailable';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parsed);
};

function ClubBadge({ name, url, small = false }: { name: string; url?: string; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <span className={`club-badge ${small ? 'club-badge-small' : ''}`}>
    {url && !failed ? <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} /> : <span>{name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</span>}
  </span>;
}

function FormDots({ form }: { form?: string[] }) {
  return <span className="form-dots" aria-label={`Recent form: ${(form ?? []).join(', ') || 'not available'}`}>{(form ?? []).slice(-5).map((result, index) =>
    <i key={`${result}-${index}`} className={`form-dot form-${result.toLowerCase()}`} title={result} />,
  )}</span>;
}

function LoadingBlock() {
  return <div className="pl-loading" aria-label="Loading league data">
    <div className="pl-skeleton pl-skeleton-head" />
    <div className="pl-skeleton pl-skeleton-row" />
    <div className="pl-skeleton pl-skeleton-row" />
    <div className="pl-skeleton pl-skeleton-row" />
    <div className="pl-skeleton pl-skeleton-row" />
  </div>;
}

function LoadFailure({ retry }: { retry: () => void }) {
  return <div className="pl-empty-state"><Shield size={23} /><strong>League data didn’t come through.</strong><span>Reconnect to the snapshot and try again.</span><button type="button" onClick={retry}>Retry snapshot</button></div>;
}

function StandingsTable({ rows, onTeam }: { rows: SoccerStanding[]; onTeam: (teamId: string) => void }) {
  if (!rows.length) return <div className="pl-empty-state"><Trophy size={23} /><strong>No standings available</strong><span>This competition has no table rows in the current snapshot.</span></div>;
  return <div className="pl-table-wrap"><table className="pl-table">
    <thead><tr><th className="rank-column">#</th><th className="club-column">Club</th><th title="Played">P</th><th title="Won">W</th><th title="Drawn">D</th><th title="Lost">L</th><th className="optional-col" title="Goals for">GF</th><th className="optional-col" title="Goals against">GA</th><th title="Goal difference">GD</th><th className="points-column" title="Points">Pts</th><th className="form-column">Last 5</th></tr></thead>
    <tbody>{rows.map((row) => <tr key={row.teamId} className={row.rank <= 4 ? 'row-champions' : row.rank >= 18 ? 'row-relegation' : ''}>
      <td className="rank-cell"><span>{row.rank}</span></td>
      <td><button type="button" onClick={() => onTeam(row.teamId)} className="pl-club-link"><ClubBadge name={row.teamName} url={row.badgeUrl} small /><span>{row.teamName}</span><ChevronRight size={14} /></button></td>
      <td>{row.played}</td><td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td>
      <td className="optional-col">{row.goalsFor}</td><td className="optional-col">{row.goalsAgainst}</td>
      <td className={row.goalDifference > 0 ? 'stat-positive' : row.goalDifference < 0 ? 'stat-negative' : ''}>{row.goalDifference > 0 ? '+' : ''}{row.goalDifference}</td>
      <td className="points-cell">{row.points}</td><td className="form-column"><FormDots form={row.form} /></td>
    </tr>)}</tbody>
  </table></div>;
}

function LeaderRows({ rows, category, onBrowse }: { rows: SoccerPlayerLeader[]; category: LeaderCategory; onBrowse: (teamId: string) => void }) {
  if (!rows.length) return <div className="pl-empty-state"><Trophy size={23} /><strong>No {category} leaders in this snapshot</strong><span>Leaderboard entries will appear here when available.</span></div>;
  return <div className="leader-list">{rows.map((player) => <button type="button" className="leader-row" key={player.playerId} onClick={() => onBrowse(player.teamId)} data-testid={`leader-${category}-${player.playerId}`}>
    <span className="leader-rank">{String(player.rank).padStart(2, '0')}</span><span className="leader-main"><strong>{player.playerName}</strong><small>{player.teamName}</small></span>
    <span className="leader-value">{player.value}<small>{category === 'goals' ? 'GOALS' : 'ASSISTS'}</small></span><ChevronRight size={16} />
  </button>)}</div>;
}

export default function PremierLeaguePage() {
  const [activeTab, setActiveTab] = useState<Tab>('table');
  const [leaderCategory, setLeaderCategory] = useState<LeaderCategory>('goals');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [search, setSearch] = useState('');
  const teamsQuery = useListSoccerTeams(teamsParams, { query: { queryKey: getListSoccerTeamsQueryKey(teamsParams) } });
  const standingsQuery = useListSoccerStandings(standingsParams, { query: { queryKey: getListSoccerStandingsQueryKey(standingsParams) } });
  const squadsQuery = useListSoccerSquads(selectedTeam === 'all' ? squadParams : { ...squadParams, teamId: selectedTeam }, {
    query: { queryKey: getListSoccerSquadsQueryKey(selectedTeam === 'all' ? squadParams : { ...squadParams, teamId: selectedTeam }) },
  });
  const leadersParams = { leagueId, category: leaderCategory };
  const leadersQuery = useListSoccerLeaders(leadersParams, { query: { queryKey: getListSoccerLeadersQueryKey(leadersParams) } });

  const teams = teamsQuery.data ?? [];
  const standings = standingsQuery.data?.standings ?? [];
  const players = squadsQuery.data?.players ?? [];
  const filteredTeams = useMemo(() => teams.filter((team) => team.name.toLowerCase().includes(search.toLowerCase())), [teams, search]);
  const filteredPlayers = useMemo(() => players.filter((player) => {
    const needle = search.toLowerCase();
    return player.name.toLowerCase().includes(needle) || player.teamName.toLowerCase().includes(needle);
  }), [players, search]);
  const sourceData = standingsQuery.data ?? squadsQuery.data ?? leadersQuery.data;
  const snapshot = formatSnapshot(sourceData?.asOf);
  const snapshotSource = sourceData?.source ?? 'Official Premier League site';
  const activeQuery = activeTab === 'table' ? standingsQuery : activeTab === 'clubs' ? teamsQuery : activeTab === 'squads' ? squadsQuery : leadersQuery;
  const hasError = activeQuery.isError;
  const isLoading = activeQuery.isLoading;
  const reload = () => {
    void standingsQuery.refetch();
    void teamsQuery.refetch();
    void squadsQuery.refetch();
    void leadersQuery.refetch();
  };

  const browseClub = (teamId: string) => {
    setSelectedTeam(teamId);
    setActiveTab('squads');
    setSearch('');
  };
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'table', label: 'Standings', count: standings.length },
    { id: 'clubs', label: 'Clubs', count: teams.length },
    { id: 'squads', label: 'Squads', count: players.length },
    { id: 'leaders', label: 'Player leaders' },
  ];
  const selectedClub = teams.find((team) => team.id === selectedTeam);
  const selectedSquadClub = selectedTeam === 'all' ? undefined : selectedClub?.name ?? players[0]?.teamName;

  return <div className="page-enter main-padding px-5 py-7 lg:px-10 lg:py-10">
    <div className="mx-auto max-w-[1320px]">
      <div className="pl-breadcrumb"><Link href="/soccer">Soccer</Link><ChevronRight size={13} /><span>Competitions</span><ChevronRight size={13} /><strong>Premier League</strong></div>
      <header className="pl-hero">
        <div className="pl-hero-topline"><span className="pl-competition-mark">PL</span><span className="label-mono">England · domestic league</span><span className="pl-season-pill">2026 / 27</span></div>
        <div className="pl-hero-content"><div><p className="pl-kicker">The top flight</p><h1>Premier<br className="mobile-break" /> League<span className="pl-title-period">.</span></h1><p className="pl-hero-copy">Twenty clubs. One table. Every detail worth keeping an eye on.</p></div>
         <div className="pl-hero-side"><div className="pl-hero-stat"><strong>{teams.length || '—'}</strong><span>clubs</span></div><div className="pl-hero-stat"><strong>{players.length || '—'}</strong><span>players listed</span></div><div className="pl-season-ribbon"><span>SEASON SNAPSHOT</span><strong>{snapshot}</strong><small>Not live-updating</small></div></div>
        </div>
        <div className="pl-hero-bottom"><span><i className="snapshot-dot" /> Snapshot from {snapshotSource}</span><span>Season context · {standingsQuery.data?.season ?? squadsQuery.data?.season ?? '2026/27'}</span></div>
      </header>

      <div className="pl-content-grid">
        <section className="pl-main-panel">
          <div className="pl-section-head"><div><p className="label-mono">Competition desk</p><h2>Follow the season</h2></div><span className="pl-updated">AS OF {snapshot.toUpperCase()}</span></div>
          <div className="pl-tab-bar" role="tablist" aria-label="Premier League sections">
            {tabs.map((tab) => <button type="button" role="tab" aria-selected={activeTab === tab.id} key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch(''); }} className={`pl-tab ${activeTab === tab.id ? 'is-active' : ''}`} data-testid={`tab-league-${tab.id}`}>
              {tab.label}<span>{tab.count ?? (tab.id === 'leaders' ? '2' : '')}</span>
            </button>)}
          </div>
          {(activeTab === 'clubs' || activeTab === 'squads') && <div className="pl-toolbar">
            <label className="pl-search"><Search size={16} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={activeTab === 'clubs' ? 'Find a club' : 'Find a player or club'} aria-label={activeTab === 'clubs' ? 'Search clubs' : 'Search squads'} data-testid="input-league-search" /></label>
            {activeTab === 'squads' && <label className="pl-select-wrap"><SlidersHorizontal size={14} /><select value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)} aria-label="Filter squad by club" data-testid="select-squad-club"><option value="all">All clubs</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>}
          </div>}
          {isLoading ? <LoadingBlock /> : hasError ? <LoadFailure retry={reload} /> : <>
            {activeTab === 'table' && <StandingsTable rows={standings} onTeam={browseClub} />}
            {activeTab === 'clubs' && <div className="club-grid">{filteredTeams.map((team: SoccerTeam) => <button type="button" key={team.id} className="club-card" onClick={() => browseClub(team.id)} data-testid={`card-club-${team.id}`}>
              <div className="club-card-top"><span className="club-place">{String(team.position || standings.find((row) => row.teamId === team.id)?.rank || '—').padStart(2, '0')}</span><ChevronRight size={15} /></div><ClubBadge name={team.name} url={team.badgeUrl} /><strong>{team.name}</strong><span className="club-card-form"><FormDots form={team.form} /><small>recent form</small></span>
            </button>)}
              {!filteredTeams.length && <div className="pl-empty-state"><Search size={23} /><strong>No clubs match that search</strong><span>Try another club name.</span></div>}
            </div>}
            {activeTab === 'squads' && <div className="squad-panel">
               <div className="squad-heading"><div><p className="label-mono">{selectedSquadClub ?? 'League register'}</p><h3>{selectedTeam === 'all' ? 'Squad players' : `${selectedSquadClub ?? 'Club'} squad`}</h3></div><span>{filteredPlayers.length} players</span></div>
              {filteredPlayers.length ? <div className="squad-list">{filteredPlayers.map((player: SoccerSquadPlayer) => <div className="squad-row" key={player.id} data-testid={`row-player-${player.id}`}>
                <span className="shirt-number">{player.shirtNumber || '—'}</span><div className="player-avatar">{player.photoUrl ? <img src={player.photoUrl} alt="" loading="lazy" /> : <span>{player.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span>}</div>
                <div className="player-details"><strong>{player.name}</strong><span>{player.position} <i>·</i> {player.nationality}</span></div><button className="player-club" type="button" onClick={() => setSelectedTeam(player.teamId)}><ClubBadge name={player.teamName} url={player.teamBadgeUrl} small /><span>{player.teamName}</span></button>
              </div>)}</div> : <div className="pl-empty-state"><Search size={23} /><strong>No players match that search</strong><span>Try a player or club name.</span></div>}
            </div>}
            {activeTab === 'leaders' && <div className="leaders-section">
              <div className="leaders-intro"><div><p className="label-mono">Individual impact</p><h3>Setting the standard</h3></div><div className="leader-toggle" role="group" aria-label="Leaderboard category">{(['goals', 'assists'] as LeaderCategory[]).map((category) => <button type="button" key={category} onClick={() => setLeaderCategory(category)} className={leaderCategory === category ? 'selected' : ''} data-testid={`button-leaders-${category}`}>{category}</button>)}</div></div>
              <LeaderRows rows={leadersQuery.data?.players ?? []} category={leaderCategory} onBrowse={browseClub} />
            </div>}
          </>}
        </section>
        <aside className="pl-rail">
           <div className="rail-card rail-highlights"><p className="label-mono">Season at a glance</p><h3>The numbers<br />behind the table.</h3><div className="rail-metric"><span>Players listed</span><strong>{players.length || '—'}</strong></div><div className="rail-metric"><span>Clubs in the race</span><strong>{teams.length || '—'}</strong></div><div className="rail-metric"><span>Season</span><strong>{standingsQuery.data?.season ?? squadsQuery.data?.season ?? '—'}</strong></div><p className="rail-note">Figures reflect the dated official-site snapshot, not a live feed.</p></div>
          <div className="rail-card rail-discover"><p className="label-mono">Keep exploring</p><Link href="/soccer/stats" className="rail-link"><span><strong>Player statistics</strong><small>League-wide numbers and form</small></span><ChevronRight size={16} /></Link><Link href="/soccer" className="rail-link"><span><strong>All competitions</strong><small>Back to the soccer hub</small></span><ChevronRight size={16} /></Link></div>
          {standings.length > 0 && <div className="rail-card rail-top"><div className="rail-top-header"><p className="label-mono">Table leaders</p><button type="button" onClick={() => setActiveTab('table')} data-testid="button-open-table">Full table <ChevronRight size={13} /></button></div>{standings.slice(0, 3).map((row) => <button className="rail-top-row" key={row.teamId} onClick={() => browseClub(row.teamId)} type="button"><span>{String(row.rank).padStart(2, '0')}</span><ClubBadge name={row.teamName} url={row.badgeUrl} small /><strong>{row.teamName}</strong><b>{row.points}</b></button>)}</div>}
        </aside>
      </div>
      <footer className="pl-footer"><span>Matchday Alerts <b>·</b> Competition detail</span><span><ArrowUpRight size={13} /> Snapshot records are historical reference data</span></footer>
    </div>
  </div>;
}
