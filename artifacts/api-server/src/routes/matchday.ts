import { Router, type IRouter } from "express";
import {
  CreateAlertBody,
  CreateAlertResponse,
  DeleteAlertParams,
  GetOverviewResponse,
  ListAlertsResponse,
  ListLeaguesResponse,
  ListMatchesQueryParams,
  ListMatchesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const leagues = [
  { id: "premier-league", name: "Premier League", shortName: "PL", country: "England", accent: "#d946ef" },
  { id: "serie-a", name: "Serie A", shortName: "SA", country: "Italy", accent: "#2563eb" },
  { id: "bundesliga", name: "Bundesliga", shortName: "BL", country: "Germany", accent: "#ef4444" },
  { id: "la-liga", name: "La Liga", shortName: "LL", country: "Spain", accent: "#f97316" },
  { id: "ligue-1", name: "Ligue 1", shortName: "L1", country: "France", accent: "#06b6d4" },
  { id: "brasileirao", name: "Brasileirão", shortName: "BR", country: "Brazil", accent: "#16a34a" },
  { id: "liga-portugal", name: "Liga Portugal", shortName: "LP", country: "Portugal", accent: "#0f766e" },
  { id: "belgian-pro-league", name: "Belgian Pro League", shortName: "BPL", country: "Belgium", accent: "#8b5cf6" },
  { id: "mls", name: "Major League Soccer", shortName: "MLS", country: "United States", accent: "#0ea5e9" },
  { id: "saudi-pro-league", name: "Saudi Professional League", shortName: "SPL", country: "Saudi Arabia", accent: "#84cc16" },
  { id: "j1-league", name: "J1 League", shortName: "J1", country: "Japan", accent: "#dc2626" },
  { id: "k-league-1", name: "K League 1", shortName: "KL1", country: "South Korea", accent: "#0891b2" },
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