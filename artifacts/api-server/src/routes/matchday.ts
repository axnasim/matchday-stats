import { Router, type IRouter } from "express";
import {
  CreateAlertBody,
  CreateAlertResponse,
  DeleteAlertParams,
  GetOverviewResponse,
  ListAlertsResponse,
  ListLeaguesResponse,
  ListSoccerLeadersQueryParams,
  ListSoccerLeadersResponse,
  ListSoccerPlayersQueryParams,
  ListSoccerPlayersResponse,
  ListSoccerSquadsQueryParams,
  ListSoccerSquadsResponse,
  ListSoccerStandingsQueryParams,
  ListSoccerStandingsResponse,
  ListSoccerStatsQueryParams,
  ListSoccerStatsResponse,
  ListSoccerTeamsQueryParams,
  ListSoccerTeamsResponse,
  ListMatchesQueryParams,
  ListMatchesResponse,
} from "@workspace/api-zod";
import { premierLeagueSnapshot } from "../data/premier-league-snapshot.js";
import { soccerTeamSnapshots } from "../data/soccer-team-snapshots.js";

const router: IRouter = Router();

const leagues = [
  { id: "premier-league", name: "Premier League", shortName: "PL", country: "England", accent: "#d946ef", category: "domestic" },
  { id: "serie-a", name: "Serie A", shortName: "SA", country: "Italy", accent: "#2563eb", category: "domestic" },
  { id: "bundesliga", name: "Bundesliga", shortName: "BL", country: "Germany", accent: "#ef4444", category: "domestic" },
  { id: "la-liga", name: "La Liga", shortName: "LL", country: "Spain", accent: "#f97316", category: "domestic" },
  { id: "ligue-1", name: "Ligue 1", shortName: "L1", country: "France", accent: "#06b6d4", category: "domestic" },
  { id: "brasileirao", name: "Brasileirão", shortName: "BR", country: "Brazil", accent: "#16a34a", category: "domestic" },
  { id: "liga-portugal", name: "Liga Portugal", shortName: "LP", country: "Portugal", accent: "#0f766e", category: "domestic" },
  { id: "belgian-pro-league", name: "Belgian Pro League", shortName: "BPL", country: "Belgium", accent: "#8b5cf6", category: "domestic" },
  { id: "mls", name: "Major League Soccer", shortName: "MLS", country: "United States", accent: "#0ea5e9", category: "domestic" },
  { id: "saudi-pro-league", name: "Saudi Professional League", shortName: "SPL", country: "Saudi Arabia", accent: "#84cc16", category: "domestic" },
  { id: "j1-league", name: "J1 League", shortName: "J1", country: "Japan", accent: "#dc2626", category: "domestic" },
  { id: "k-league-1", name: "K League 1", shortName: "KL1", country: "South Korea", accent: "#0891b2", category: "domestic" },
  { id: "uefa-champions-league", name: "UEFA Champions League", shortName: "UCL", country: "Europe", accent: "#4f46e5", category: "competition" },
  { id: "uefa-europa-league", name: "UEFA Europa League", shortName: "UEL", country: "Europe", accent: "#f59e0b", category: "competition" },
  { id: "uefa-conference-league", name: "UEFA Conference League", shortName: "UECL", country: "Europe", accent: "#14b8a6", category: "competition" },
  { id: "uefa-super-cup", name: "UEFA Super Cup", shortName: "USC", country: "Europe", accent: "#64748b", category: "competition" },
  { id: "fifa-world-cup", name: "FIFA World Cup", shortName: "WC", country: "International", accent: "#0f766e", category: "competition" },
  { id: "uefa-euro", name: "UEFA European Championship", shortName: "EURO", country: "Europe", accent: "#2563eb", category: "competition" },
  { id: "copa-america", name: "Copa América", shortName: "CA", country: "South America", accent: "#ca8a04", category: "competition" },
  { id: "uefa-nations-league", name: "UEFA Nations League", shortName: "UNL", country: "Europe", accent: "#9333ea", category: "competition" },
  { id: "africa-cup-of-nations", name: "Africa Cup of Nations", shortName: "AFCON", country: "Africa", accent: "#dc2626", category: "competition" },
  { id: "caf-champions-league", name: "CAF Champions League", shortName: "CAF CL", country: "Africa", accent: "#15803d", category: "competition" },
] as const;

type MatchStatus = "UPCOMING" | "LIVE" | "FT";
type AlertType = "kickoff" | "goals" | "final";

type Match = {
  id: string;
  leagueId: string;
  leagueName: string;
  leagueShortName: string;
  kickoff: string;
  status: MatchStatus;
  minute: number | null;
  homeTeam: { name: string; shortName: string; initials: string };
  awayTeam: { name: string; shortName: string; initials: string };
  homeScore: number | null;
  awayScore: number | null;
  venue: string;
  round: string;
};

const team = (name: string, shortName: string, initials: string) => ({
  name,
  shortName,
  initials,
});

const match = (
  id: string,
  leagueId: string,
  kickoff: string,
  status: MatchStatus,
  home: ReturnType<typeof team>,
  away: ReturnType<typeof team>,
  details: Pick<Match, "venue" | "round"> & Partial<Pick<Match, "minute" | "homeScore" | "awayScore">>,
): Match => {
  const league = leagues.find((item) => item.id === leagueId)!;
  return {
    id,
    leagueId,
    leagueName: league.name,
    leagueShortName: league.shortName,
    kickoff,
    status,
    minute: details.minute ?? null,
    homeTeam: home,
    awayTeam: away,
    homeScore: details.homeScore ?? null,
    awayScore: details.awayScore ?? null,
    venue: details.venue,
    round: details.round,
  };
};

// Sample fixtures are anchored to the Premier League snapshot date so they agree with its
// table: every club has played 8, so Matchweek 9 fixtures stay unplayed on this board.
const matchdayDate = premierLeagueSnapshot.asOf;

const matches: Match[] = [
  match("pl-ars-liv", "premier-league", "2026-10-25T15:30:00.000Z", "UPCOMING", team("Arsenal", "Arsenal", "AR"), team("Liverpool", "Liverpool", "LI"), { venue: "Emirates Stadium", round: "Matchweek 9" }),
  match("pl-che-mci", "premier-league", "2026-10-25T16:00:00.000Z", "UPCOMING", team("Chelsea", "Chelsea", "CH"), team("Manchester City", "Man City", "MC"), { venue: "Stamford Bridge", round: "Matchweek 9" }),
  match("pl-bha-new", "premier-league", "2026-10-26T20:00:00.000Z", "UPCOMING", team("Brighton & Hove Albion", "Brighton", "BR"), team("Newcastle United", "Newcastle", "NE"), { venue: "American Express Stadium", round: "Matchweek 9" }),
  match("sa-int-juv", "serie-a", "2026-10-25T19:45:00.000Z", "UPCOMING", team("Internazionale", "Inter", "IN"), team("Juventus", "Juventus", "JU"), { venue: "San Siro", round: "Matchday 8" }),
  match("bl-bay-dor", "bundesliga", "2026-10-25T13:30:00.000Z", "LIVE", team("Bayern Munich", "Bayern", "BM"), team("Borussia Dortmund", "Dortmund", "DO"), { venue: "Allianz Arena", round: "Matchday 8", minute: 67, homeScore: 2, awayScore: 1 }),
  match("ll-bar-atm", "la-liga", "2026-10-25T20:00:00.000Z", "UPCOMING", team("Barcelona", "Barcelona", "BA"), team("Atlético Madrid", "Atlético", "AM"), { venue: "Camp Nou", round: "Matchday 10" }),
  match("l1-psg-om", "ligue-1", "2026-10-25T19:45:00.000Z", "UPCOMING", team("Paris Saint-Germain", "PSG", "PS"), team("Marseille", "Marseille", "OM"), { venue: "Parc des Princes", round: "Matchday 9" }),
  match("br-fla-pal", "brasileirao", "2026-10-25T22:30:00.000Z", "UPCOMING", team("Flamengo", "Flamengo", "FL"), team("Palmeiras", "Palmeiras", "PA"), { venue: "Maracanã", round: "Round 31" }),
  match("lp-ben-por", "liga-portugal", "2026-10-25T18:30:00.000Z", "UPCOMING", team("Benfica", "Benfica", "BE"), team("FC Porto", "Porto", "PO"), { venue: "Estádio da Luz", round: "Matchday 8" }),
  match("bpl-bru-gen", "belgian-pro-league", "2026-10-25T11:30:00.000Z", "FT", team("Club Brugge", "Brugge", "CB"), team("Racing Genk", "Genk", "GE"), { venue: "Jan Breydel Stadium", round: "Matchday 12", homeScore: 1, awayScore: 1 }),
  match("mls-laf-sea", "mls", "2026-10-26T02:30:00.000Z", "UPCOMING", team("LAFC", "LAFC", "LA"), team("Seattle Sounders FC", "Seattle", "SS"), { venue: "BMO Stadium", round: "Regular season" }),
  match("spl-nas-hil", "saudi-pro-league", "2026-10-25T14:00:00.000Z", "LIVE", team("Al Nassr", "Al Nassr", "AN"), team("Al Hilal", "Al Hilal", "AH"), { venue: "Al-Awwal Park", round: "Matchday 7", minute: 41, homeScore: 0, awayScore: 1 }),
  match("j1-kaw-urawa", "j1-league", "2026-10-25T05:00:00.000Z", "FT", team("Kawasaki Frontale", "Kawasaki", "KF"), team("Urawa Red Diamonds", "Urawa", "UR"), { venue: "Todoroki Stadium", round: "Matchweek 11", homeScore: 2, awayScore: 0 }),
  match("kl1-uls-jeo", "k-league-1", "2026-10-25T05:00:00.000Z", "FT", team("Ulsan HD", "Ulsan", "UL"), team("Jeonbuk Hyundai Motors", "Jeonbuk", "JM"), { venue: "Ulsan Munsu Stadium", round: "Round 35", homeScore: 1, awayScore: 2 }),
  match("sa-mil-rom", "serie-a", "2026-10-19T18:45:00.000Z", "FT", team("AC Milan", "Milan", "MI"), team("AS Roma", "Roma", "RO"), { venue: "San Siro", round: "Matchday 7", homeScore: 2, awayScore: 0 }),
  match("ll-mad-sev", "la-liga", "2026-10-19T19:00:00.000Z", "FT", team("Real Madrid", "Real Madrid", "RM"), team("Sevilla", "Sevilla", "SE"), { venue: "Santiago Bernabéu", round: "Matchday 9", homeScore: 1, awayScore: 1 }),
];

const soccerTeams = [
  ...premierLeagueSnapshot.teams.map((item) => ({
    ...item,
    snapshotSeason: premierLeagueSnapshot.season,
    snapshotDate: premierLeagueSnapshot.asOf,
    snapshotSource: premierLeagueSnapshot.source,
  })),
  ...Object.entries(soccerTeamSnapshots).flatMap(([leagueId, snapshot]) => {
    const league = leagues.find((item) => item.id === leagueId);
    if (!league) throw new Error(`Unknown competition in team snapshot: ${leagueId}`);
    return snapshot.teams.map((item) => ({
      ...item,
      id: `${leagueId}-${item.id}`,
      leagueId,
      leagueName: league.name,
      country: league.country,
      snapshotSeason: snapshot.season,
      snapshotDate: snapshot.asOf,
      snapshotSource: snapshot.source,
    }));
  }),
];

// Premier League goals and assists match the snapshot leaderboards where a player appears on them;
// every other figure here is sample data sized to the same point in the season.
const playerStats = [
  { playerId: "haaland", playerName: "Erling Haaland", teamName: "Manchester City", leagueId: "premier-league", leagueName: "Premier League", position: "FW", appearances: 8, goals: 9, assists: 1, minutes: 702, cleanSheets: 0, cards: 1, rating: 8.7 },
  { playerId: "joao-pedro", playerName: "João Pedro", teamName: "Chelsea", leagueId: "premier-league", leagueName: "Premier League", position: "FW", appearances: 8, goals: 5, assists: 3, minutes: 671, cleanSheets: 0, cards: 2, rating: 8.1 },
  { playerId: "isak", playerName: "Alexander Isak", teamName: "Liverpool", leagueId: "premier-league", leagueName: "Premier League", position: "FW", appearances: 7, goals: 5, assists: 1, minutes: 548, cleanSheets: 0, cards: 0, rating: 7.8 },
  { playerId: "rice", playerName: "Declan Rice", teamName: "Arsenal", leagueId: "premier-league", leagueName: "Premier League", position: "MF", appearances: 8, goals: 1, assists: 4, minutes: 715, cleanSheets: 0, cards: 2, rating: 7.9 },
  { playerId: "saka", playerName: "Bukayo Saka", teamName: "Arsenal", leagueId: "premier-league", leagueName: "Premier League", position: "FW", appearances: 8, goals: 2, assists: 2, minutes: 664, cleanSheets: 0, cards: 1, rating: 7.8 },
  { playerId: "raya", playerName: "David Raya", teamName: "Arsenal", leagueId: "premier-league", leagueName: "Premier League", position: "GK", appearances: 8, goals: 0, assists: 0, minutes: 720, cleanSheets: 4, cards: 0, rating: 7.6 },
  { playerId: "kane", playerName: "Harry Kane", teamName: "Bayern Munich", leagueId: "bundesliga", leagueName: "Bundesliga", position: "FW", appearances: 7, goals: 11, assists: 3, minutes: 612, cleanSheets: 0, cards: 0, rating: 8.6 },
  { playerId: "musiala", playerName: "Jamal Musiala", teamName: "Bayern Munich", leagueId: "bundesliga", leagueName: "Bundesliga", position: "MF", appearances: 7, goals: 4, assists: 4, minutes: 541, cleanSheets: 0, cards: 1, rating: 8.0 },
  { playerId: "yamal", playerName: "Lamine Yamal", teamName: "Barcelona", leagueId: "la-liga", leagueName: "La Liga", position: "FW", appearances: 9, goals: 6, assists: 7, minutes: 748, cleanSheets: 0, cards: 1, rating: 8.4 },
  { playerId: "thuram", playerName: "Marcus Thuram", teamName: "Internazionale", leagueId: "serie-a", leagueName: "Serie A", position: "FW", appearances: 7, goals: 6, assists: 2, minutes: 583, cleanSheets: 0, cards: 0, rating: 7.9 },
  { playerId: "bouanga", playerName: "Denis Bouanga", teamName: "LAFC", leagueId: "mls", leagueName: "Major League Soccer", position: "FW", appearances: 31, goals: 19, assists: 6, minutes: 2604, cleanSheets: 0, cards: 3, rating: 8.2 },
  { playerId: "pedro", playerName: "Pedro", teamName: "Flamengo", leagueId: "brasileirao", leagueName: "Brasileirão", position: "FW", appearances: 26, goals: 16, assists: 4, minutes: 2017, cleanSheets: 0, cards: 2, rating: 8.3 },
  { playerId: "sommer", playerName: "Yann Sommer", teamName: "Internazionale", leagueId: "serie-a", leagueName: "Serie A", position: "GK", appearances: 7, goals: 0, assists: 0, minutes: 630, cleanSheets: 3, cards: 0, rating: 7.5 },
];

type Alert = {
  id: string;
  leagueId: string;
  leagueName: string;
  teamName: string;
  alertTypes: AlertType[];
  enabled: boolean;
  createdAt: string;
};

let alerts: Alert[] = [
  {
    id: "alert-arsenal",
    leagueId: "premier-league",
    leagueName: "Premier League",
    teamName: "Arsenal",
    alertTypes: ["kickoff", "goals", "final"],
    enabled: true,
    createdAt: "2026-09-01T10:00:00.000Z",
  },
];

router.get("/leagues", (_req, res) => {
  res.json(ListLeaguesResponse.parse(leagues));
});

router.get("/matches", (req, res) => {
  const params = ListMatchesQueryParams.parse(req.query);
  let result = [...matches];

  if (params.leagueId) {
    result = result.filter((item) => item.leagueId === params.leagueId);
  }
  if (params.status !== "all") {
    const status = params.status === "upcoming" ? "UPCOMING" : params.status === "live" ? "LIVE" : "FT";
    result = result.filter((item) => item.status === status);
  }
  if (params.dateRange === "today") {
    result = result.filter((item) => item.kickoff.startsWith(matchdayDate));
  }

  result.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  res.json(ListMatchesResponse.parse(result));
});

router.get("/soccer/teams", (req, res) => {
  const params = ListSoccerTeamsQueryParams.parse(req.query);
  const result = params.leagueId
    ? soccerTeams.filter((item) => item.leagueId === params.leagueId)
    : soccerTeams;
  res.json(ListSoccerTeamsResponse.parse(result));
});

router.get("/soccer/standings", (req, res) => {
  const params = ListSoccerStandingsQueryParams.parse(req.query);
  if (params.leagueId !== "premier-league") {
    res.status(404).json({ error: "Standings are not available for this league." });
    return;
  }
  res.json(ListSoccerStandingsResponse.parse({
    leagueId: "premier-league",
    leagueName: "Premier League",
    season: premierLeagueSnapshot.season,
    asOf: premierLeagueSnapshot.asOf,
    source: premierLeagueSnapshot.source,
    standings: premierLeagueSnapshot.standings,
  }));
});

router.get("/soccer/squads", (req, res) => {
  const params = ListSoccerSquadsQueryParams.parse(req.query);
  if (params.leagueId !== "premier-league") {
    res.status(404).json({ error: "Squad data is not available for this league." });
    return;
  }
  const players = params.teamId
    ? premierLeagueSnapshot.squads.filter((player) => player.teamId === params.teamId)
    : premierLeagueSnapshot.squads;
  res.json(ListSoccerSquadsResponse.parse({
    leagueId: "premier-league",
    leagueName: "Premier League",
    season: premierLeagueSnapshot.season,
    asOf: premierLeagueSnapshot.asOf,
    source: premierLeagueSnapshot.source,
    players,
  }));
});

router.get("/soccer/leaders", (req, res) => {
  const params = ListSoccerLeadersQueryParams.parse(req.query);
  if (params.leagueId !== "premier-league") {
    res.status(404).json({ error: "Player leaders are not available for this league." });
    return;
  }
  res.json(ListSoccerLeadersResponse.parse({
    leagueId: "premier-league",
    leagueName: "Premier League",
    season: premierLeagueSnapshot.season,
    asOf: premierLeagueSnapshot.asOf,
    source: premierLeagueSnapshot.source,
    category: params.category,
    players: premierLeagueSnapshot.leaders.filter((player) => player.category === params.category),
  }));
});

router.get("/soccer/players", (req, res) => {
  const params = ListSoccerPlayersQueryParams.parse(req.query);
  const result = playerStats
    .filter((item) => !params.leagueId || item.leagueId === params.leagueId)
    .filter((item) => !params.teamId || item.teamName.toLowerCase().replaceAll(" ", "-") === params.teamId)
    .map(({ playerId, playerName, teamName, leagueId, leagueName, position, appearances, goals, assists, rating }) => ({
      id: playerId,
      name: playerName,
      teamId: teamName.toLowerCase().replaceAll(" ", "-"),
      teamName,
      leagueId,
      leagueName,
      position,
      appearances,
      goals,
      assists,
      rating,
    }));
  res.json(ListSoccerPlayersResponse.parse(result));
});

router.get("/soccer/stats", (req, res) => {
  const params = ListSoccerStatsQueryParams.parse(req.query);
  // Only the snapshot's season has figures; other seasons return an empty table.
  if (params.season !== premierLeagueSnapshot.season) {
    res.json(ListSoccerStatsResponse.parse([]));
    return;
  }
  const filtered = playerStats.filter((item) => !params.leagueId || item.leagueId === params.leagueId);
  const metric = params.category;
  const result = [...filtered]
    .sort((a, b) => b[metric] - a[metric])
    .map((item, index) => ({ ...item, rank: index + 1 }));
  res.json(ListSoccerStatsResponse.parse(result));
});

router.get("/overview", (_req, res) => {
  const upcoming = matches.filter((item) => item.status === "UPCOMING");
  const overview = {
    liveCount: matches.filter((item) => item.status === "LIVE").length,
    upcomingCount: upcoming.length,
    finishedCount: matches.filter((item) => item.status === "FT").length,
    trackedLeagueCount: leagues.length,
    nextMatch: upcoming.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())[0] ?? null,
    matchdayDate,
    lastUpdated: new Date().toISOString(),
  };
  res.json(GetOverviewResponse.parse(overview));
});

router.get("/alerts", (_req, res) => {
  res.json(ListAlertsResponse.parse(alerts));
});

router.post("/alerts", (req, res) => {
  const data = CreateAlertBody.parse(req.body);
  const league = leagues.find((item) => item.id === data.leagueId);
  if (!league) {
    res.status(400).json({ error: "Unknown league" });
    return;
  }

  const created: Alert = {
    id: `alert-${Date.now()}`,
    leagueId: league.id,
    leagueName: league.name,
    teamName: data.teamName,
    alertTypes: data.alertTypes,
    enabled: true,
    createdAt: new Date().toISOString(),
  };
  alerts = [created, ...alerts];
  res.status(201).json(CreateAlertResponse.parse(created));
});

router.delete("/alerts/:id", (req, res) => {
  const { id } = DeleteAlertParams.parse(req.params);
  const before = alerts.length;
  alerts = alerts.filter((item) => item.id !== id);
  if (alerts.length === before) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.status(204).send();
});

export default router;