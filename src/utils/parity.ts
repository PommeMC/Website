import { capitalize } from "@/utils/content";
import { fetchJson } from "@/utils/fetch";
import { once } from "@/utils/once";

/**
 * Parity results from a run of the Client's in-game scripts on both Pomme and vanilla, published to R2 by the Client.
 * latest.json names the newest export; each export's files never change. If either can't be fetched at build time, or
 * the export is malformed, the parity sections are left out rather than failing the whole build.
 */
const BUCKET = "https://parity.pomme.rs/parity";

type Result = "pass" | "fail" | "skip";
const CLIENTS = ["pomme", "vanilla"] as const;
type Client = (typeof CLIENTS)[number];

export interface Shot {
  name: string;
  width?: number;
  height?: number;
  score: number;
  flagged: boolean;
  pomme: string;
  vanilla: string;
  heatmap?: string;
}

interface Check {
  text: string;
  pomme: Result;
  vanilla: Result;
}

export interface Scenario {
  id: string;
  category: string;
  title: string;
  description: string;
  mechanics: Record<Client, Result>;
  /** The script's checks in order. Empty for scripts that only take screenshots. */
  checks: Check[];
  shots: Shot[];
}

type CoverageStatus = "implemented" | "progress" | "missing";

/** How much of one of vanilla's own lists (entities, screens, ...) Pomme handles, item by item. */
export interface Coverage {
  kind: string;
  label: string;
  items: {
    id: string;
    name: string;
    status: CoverageStatus;
    note?: string;
    /** Scenarios that cover the item. */
    scripts: string[];
  }[];
  counts: { implemented: number; progress: number };
}

export interface ParityRun {
  generatedAt: Date;
  commit: string;
  versions: { pomme: string; vanilla: string };
  categories: { id: string; name: string; scenarios: Scenario[] }[];
  scenarios: Scenario[];
  gaps: { area: string; text: string }[];
  coverage: Coverage[];
}

function checkResult(checks: Check[], client: Client): Result {
  const results = checks.map((c) => c[client]);
  if (results.includes("fail")) return "fail";
  return results.every((r) => r === "pass") ? "pass" : "skip";
}

/**
 * A scenario's overall result per client must agree with its checks: any fail is a fail, all passes is a pass. One that
 * doesn't is left out with a warning, so a single bad scenario doesn't take the rest of the results down with it.
 */
function consistentOnly(scenarios: Scenario[]): Scenario[] {
  return scenarios.filter((s) => {
    if (s.checks.length === 0) return true;
    const wrong = CLIENTS.map((c) => ({ c, fromChecks: checkResult(s.checks, c) })).filter(
      ({ c, fromChecks }) => fromChecks !== s.mechanics[c]
    );
    for (const { c, fromChecks } of wrong) {
      console.warn(`[parity] left out ${s.id}: ${c} says ${s.mechanics[c]}, its checks say ${fromChecks}`);
    }
    return wrong.length === 0;
  });
}

/** "blockEntities" -> "Block entities". */
const kindLabel = (kind: string) => capitalize(kind.replace(/([A-Z])/g, " $1").toLowerCase());

/** parity.json as published, before image paths are made absolute and categories gather their scenarios. */
interface ParityJson {
  generatedAt: string;
  commit: string;
  versions: ParityRun["versions"];
  categories: { id: string; name: string }[];
  scenarios: Scenario[];
  gaps: ParityRun["gaps"];
  coverage?: Record<string, { items: Coverage["items"] }>;
}

/** Turns a published export into what the pages use, filling in optional fields. Throws if a required part is missing. */
function toRun(raw: ParityJson, base: string): ParityRun {
  if (!Array.isArray(raw.scenarios) || !Array.isArray(raw.categories) || !raw.versions) {
    throw new Error("parity.json has no scenarios, categories or versions");
  }
  const scenarios = consistentOnly(
    raw.scenarios.map((s) => ({
      ...s,
      checks: s.checks ?? [],
      shots: (s.shots ?? []).map((shot) => ({
        ...shot,
        pomme: base + shot.pomme,
        vanilla: base + shot.vanilla,
        heatmap: shot.heatmap && base + shot.heatmap,
      })),
    }))
  );
  return {
    generatedAt: new Date(raw.generatedAt),
    commit: raw.commit,
    versions: raw.versions,
    categories: raw.categories.map((c) => ({
      ...c,
      scenarios: scenarios.filter((s) => s.category === c.id),
    })),
    scenarios,
    gaps: raw.gaps ?? [],
    coverage: Object.entries(raw.coverage ?? {}).map(([kind, c]) => {
      const items = (c.items ?? []).map((i) => ({ ...i, scripts: i.scripts ?? [] }));
      const count = (status: CoverageStatus) => items.filter((i) => i.status === status).length;
      return {
        kind,
        label: kindLabel(kind),
        items,
        counts: { implemented: count("implemented"), progress: count("progress") },
      };
    }),
  };
}

export const getParityRun = once(async (): Promise<ParityRun | null> => {
  // `export` names the export's folder; the first exports were named after their commit and have no `export` field.
  const latest = (await fetchJson<{ export?: string; commit: string }>(`${BUCKET}/latest.json`, "parity"))?.data;
  if (!latest) return null;
  const folder = latest.export ?? latest.commit;
  const base = `${BUCKET}/${folder}/`;
  const raw = (await fetchJson<ParityJson>(`${base}parity.json`, "parity"))?.data;
  if (!raw) return null;
  try {
    return toRun(raw, base);
  } catch (err) {
    console.warn(`[parity] export ${folder} is unusable, so the parity sections are left out`, err);
    return null;
  }
});

const passesOnBoth = (s: Scenario) => CLIENTS.every((c) => s.mechanics[c] === "pass");

/** How many scenarios pass on both clients, and how many screenshot pairs fall within the comparison's tolerance. */
export function tally(scenarios: Scenario[]) {
  const shots = scenarios.flatMap((s) => s.shots);
  return {
    scenarios: scenarios.length,
    behaveAlike: scenarios.filter(passesOnBoth).length,
    shots: shots.length,
    shotsAlike: shots.filter((s) => !s.flagged).length,
  };
}

/** "moved_0_1" -> "Moved 0 1". */
export const shotLabel = (name: string) => capitalize(name.replace(/_/g, " "));

/** Anchor for a scenario's row, so other parts of the page can link to it. */
export const scenarioAnchor = (id: string) => `scenario-${id.replace(/\//g, "-")}`;
