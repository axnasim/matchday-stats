import { Router, type IRouter } from "express";
import {
  CreateAlertBody,
  CreateAlertResponse,
  DeleteAlertParams,
  GetOverviewResponse,
  ListAlertsResponse,
  ListLeaguesResponse,
  ListSoccerPlayersQueryParams,
  ListSoccerPlayersResponse,
  ListSoccerStatsQueryParams,
  ListSoccerStatsResponse,
  ListSoccerTeamsQueryParams,
  ListSoccerTeamsResponse,
  ListMatchesQueryParams,
  ListMatchesResponse,
} from "@workspace/api-zod";

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

const matches: Match[] = [
  match("pl-ars-che", "premier-league", "2026-09-12T11:30:00.000Z", "UPCOMING", team("Arsenal", "Arsenal", "AR"), team("Chelsea", "Chelsea", "CH"), { venue: "Emirates Stadium", round: "Matchweek 5" }),
  match("pl-liv-bri", "premier-league", "2026-09-13T15:00:00.000Z", "UPCOMING", team("Liverpool", "Liverpool", "LI"), team("Brighton", "Brighton", "BR"), { venue: "Anfield", round: "Matchweek 5" }),
  match("sa-int-juv", "serie-a", "2026-09-12T18:45:00.000Z", "UPCOMING", team("Inter", "Inter", "IN"), team("Juventus", "Juventus", "JU"), { venue: "San Siro", round: "Matchday 4" }),
  match("bl-bay-dor", "bundesliga", "2026-09-12T13:30:00.000Z", "LIVE", team("Bayern Munich", "Bayern", "BM"), team("Dortmund", "Dortmund", "DO"), { venue: "Allianz Arena", round: "Matchday 4", minute: 67, homeScore: 2, awayScore: 1 }),
  match("ll-bar-atm", "la-liga", "2026-09-13T19:00:00.000Z", "UPCOMING", team("Barcelona", "Barcelona", "BA"), team("Atlético Madrid", "Atlético", "AM"), { venue: "Camp Nou", round: "Matchday 5" }),
  match("l1-psg-om", "ligue-1", "2026-09-12T19:00:00.000Z", "UPCOMING", team("Paris Saint-Germain", "PSG", "PS"), team("Marseille", "Marseille", "OM"), { venue: "Parc des Princes", round: "Matchday 5" }),
  match("br-fla-pal", "brasileirao", "2026-09-12T22:30:00.000Z", "UPCOMING", team("Flamengo", "Flamengo", "FL"), team("Palmeiras", "Palmeiras", "PA"), { venue: "Maracanã", round: "Round 24" }),
  match("lp-ben-por", "liga-portugal", "2026-09-13T17:00:00.000Z", "UPCOMING", team("Benfica", "Benfica", "BE"), team("Porto", "Porto", "PO"), { venue: "Estádio da Luz", round: "Matchday 6" }),
  match("bpl-bru-gen", "belgian-pro-league", "2026-09-12T16:15:00.000Z", "FT", team("Club Brugge", "Brugge", "CB"), team("Genk", "Genk", "GE"), { venue: "Jan Breydel Stadium", round: "Matchday 7", homeScore: 1, awayScore: 1 }),
  match("mls-laf-sea", "mls", "2026-09-13T02:30:00.000Z", "UPCOMING", team("LAFC", "LAFC", "LA"), team("Seattle Sounders", "Seattle", "SS"), { venue: "BMO Stadium", round: "Week 29" }),
  match("spl-nas-hil", "saudi-pro-league", "2026-09-12T17:00:00.000Z", "LIVE", team("Al Nassr", "Al Nassr", "AN"), team("Al Hilal", "Al Hilal", "AH"), { venue: "Al-Awwal Park", round: "Matchday 4", minute: 34, homeScore: 0, awayScore: 1 }),
  match("j1-kaw-urawa", "j1-league", "2026-09-13T06:00:00.000Z", "UPCOMING", team("Kawasaki Frontale", "Kawasaki", "KF"), team("Urawa Reds", "Urawa", "UR"), { venue: "Todoroki Stadium", round: "Matchweek 29" }),
  match("kl1-uls-jeo", "k-league-1", "2026-09-13T10:00:00.000Z", "UPCOMING", team("Ulsan HD", "Ulsan", "UL"), team("Jeonbuk Motors", "Jeonbuk", "JM"), { venue: "Ulsan Munsu Stadium", round: "Round 30" }),
  match("pl-mci-tot", "premier-league", "2026-09-11T19:00:00.000Z", "FT", team("Man City", "Man City", "MC"), team("Tottenham", "Spurs", "TO"), { venue: "Etihad Stadium", round: "Matchweek 4", homeScore: 3, awayScore: 2 }),
  match("sa-mil-rom", "serie-a", "2026-09-10T18:45:00.000Z", "FT", team("AC Milan", "Milan", "MI"), team("Roma", "Roma", "RO"), { venue: "San Siro", round: "Matchday 3", homeScore: 2, awayScore: 0 }),
  match("ll-mad-sev", "la-liga", "2026-09-10T20:00:00.000Z", "FT", team("Real Madrid", "Real Madrid", "RM"), team("Sevilla", "Sevilla", "SE"), { venue: "Santiago Bernabéu", round: "Matchday 4", homeScore: 1, awayScore: 1 }),
];

const soccerTeams = [
  { id: "arsenal", name: "Arsenal", shortName: "Arsenal", leagueId: "premier-league", leagueName: "Premier League", country: "England", position: 1, form: ["W", "W", "D", "W", "W"] },
  { id: "liverpool", name: "Liverpool", shortName: "Liverpool", leagueId: "premier-league", leagueName: "Premier League", country: "England", position: 2, form: ["W", "W", "W", "L", "W"] },
  { id: "bayern", name: "Bayern Munich", shortName: "Bayern", leagueId: "bundesliga", leagueName: "Bundesliga", country: "Germany", position: 1, form: ["W", "W", "W", "D", "W"] },
  { id: "dortmund", name: "Dortmund", shortName: "Dortmund", leagueId: "bundesliga", leagueName: "Bundesliga", country: "Germany", position: 3, form: ["W", "D", "W", "W", "L"] },
  { id: "barcelona", name: "Barcelona", shortName: "Barcelona", leagueId: "la-liga", leagueName: "La Liga", country: "Spain", position: 1, form: ["W", "W", "W", "W", "D"] },
  { id: "inter", name: "Inter", shortName: "Inter", leagueId: "serie-a", leagueName: "Serie A", country: "Italy", position: 1, form: ["W", "W", "D", "W", "W"] },
  { id: "lafc", name: "Los Angeles FC", shortName: "LAFC", leagueId: "mls", leagueName: "Major League Soccer", country: "United States", position: 2, form: ["W", "L", "W", "W", "D"] },
  { id: "flamengo", name: "Flamengo", shortName: "Flamengo", leagueId: "brasileirao", leagueName: "Brasileirão", country: "Brazil", position: 1, form: ["W", "W", "W", "D", "W"] },
];

const playerStats = [
  { playerId: "saka", playerName: "Bukayo Saka", teamName: "Arsenal", leagueId: "premier-league", leagueName: "Premier League", position: "FW", appearances: 5, goals: 5, assists: 3, minutes: 438, cleanSheets: 0, cards: 1, rating: 8.4 },
  { playerId: "salah", playerName: "Mohamed Salah", teamName: "Liverpool", leagueId: "premier-league", leagueName: "Premier League", position: "FW", appearances: 5, goals: 4, assists: 4, minutes: 447, cleanSheets: 0, cards: 0, rating: 8.2 },
  { playerId: "kane", playerName: "Harry Kane", teamName: "Bayern Munich", leagueId: "bundesliga", leagueName: "Bundesliga", position: "FW", appearances: 4, goals: 6, assists: 2, minutes: 359, cleanSheets: 0, cards: 0, rating: 8.6 },
  { playerId: "musiala", playerName: "Jamal Musiala", teamName: "Bayern Munich", leagueId: "bundesliga", leagueName: "Bundesliga", position: "MF", appearances: 4, goals: 3, assists: 3, minutes: 326, cleanSheets: 0, cards: 1, rating: 8.1 },
  { playerId: "yamal", playerName: "Lamine Yamal", teamName: "Barcelona", leagueId: "la-liga", leagueName: "La Liga", position: "FW", appearances: 5, goals: 4, assists: 5, minutes: 421, cleanSheets: 0, cards: 1, rating: 8.5 },
  { playerId: "thuram", playerName: "Marcus Thuram", teamName: "Inter", leagueId: "serie-a", leagueName: "Serie A", position: "FW", appearances: 4, goals: 4, assists: 2, minutes: 348, cleanSheets: 0, cards: 0, rating: 8.0 },
  { playerId: "bouanga", playerName: "Denis Bouanga", teamName: "Los Angeles FC", leagueId: "mls", leagueName: "Major League Soccer", position: "FW", appearances: 5, goals: 5, assists: 2, minutes: 452, cleanSheets: 0, cards: 1, rating: 8.3 },
  { playerId: "pedro", playerName: "Pedro", teamName: "Flamengo", leagueId: "brasileirao", leagueName: "Brasileirão", position: "FW", appearances: 5, goals: 6, assists: 1, minutes: 431, cleanSheets: 0, cards: 0, rating: 8.5 },
  { playerId: "raya", playerName: "David Raya", teamName: "Arsenal", leagueId: "premier-league", leagueName: "Premier League", position: "GK", appearances: 5, goals: 0, assists: 0, minutes: 450, cleanSheets: 3, cards: 0, rating: 7.8 },
  { playerId: "sommer", playerName: "Yann Sommer", teamName: "Inter", leagueId: "serie-a", leagueName: "Serie A", position: "GK", appearances: 4, goals: 0, assists: 0, minutes: 360, cleanSheets: 3, cards: 0, rating: 7.9 },
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
    result = result.filter((item) => item.kickoff.startsWith("2026-09-12"));
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