import { once } from "@/utils/once";

const GITHUB_REPO = "PommeMC/Client";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
export const CONTRIBUTORS_URL = `${GITHUB_URL}/graphs/contributors`;
const API = `https://api.github.com/repos/${GITHUB_REPO}`;

type GhAsset = { name: string; size: number; download_count: number; browser_download_url: string };
type GhRelease = {
  tag_name: string;
  html_url: string;
  published_at: string;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  assets: GhAsset[];
};
type GhRepo = { stargazers_count: number };
type GhContributor = { login: string; avatar_url: string; html_url: string; contributions: number; type: string };

export interface Release {
  /** "Pomme" for client builds, "Launcher" for the retired launcher. */
  product: string;
  version: string;
  url: string;
  publishedAt: Date;
  assets: GhAsset[];
  downloads: number;
  firstLaunch: Record<string, string>;
  /** Pull request titles from the generated "What's Changed" list. */
  changes: string[];
  contributors: number;
}

export interface Contributor {
  login: string;
  avatarUrl: string;
  profileUrl: string;
  commits: number;
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "User-Agent": "pomme-website-build", Accept: "application/vnd.github+json" };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function get<T>(url: string): Promise<{ data: T; res: Response } | null> {
  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      console.warn(`[github] ${res.status} for ${url}`);
      return null;
    }
    return { data: (await res.json()) as T, res };
  } catch (err) {
    console.warn(`[github] request failed for ${url}`, err);
    return null;
  }
}

/** With per_page=1, the "last" page number in the Link header is the total item count. */
async function countFromLink(url: string): Promise<number | null> {
  const r = await get<unknown[]>(url);
  if (!r) return null;
  const last = r.res.headers.get("link")?.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return last ? Number(last[1]) : r.data.length;
}

/** "client-v0.2.10+26.2" -> "0.2.10". */
function parseVersion(tag: string): string {
  return tag.match(/v?(\d+\.\d+(?:\.\d+)?(?:-[\w.]+)?)(?:\+[\w.]+)?$/)?.[1] ?? tag;
}

/** Reads lines like "- **Windows:** on the SmartScreen prompt, ..." from the release notes, keyed by lower-case platform. */
function parseFirstLaunch(body: string | null): Record<string, string> {
  const notes: Record<string, string> = {};
  for (const line of (body ?? "").split("\n")) {
    const m = line.match(/^\s*[-*]\s*\*\*([^*:]+):?\*\*:?\s*(.+)$/);
    if (!m) continue;
    const raw = m[2].trim();
    const text = raw
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();
    // A note that starts with a command (`chmod ...`) keeps the command's case.
    const sentence = raw.startsWith("`") ? text : text.charAt(0).toUpperCase() + text.slice(1);
    notes[m[1].trim().toLowerCase()] = /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
  }
  return notes;
}

/** Reads the generated "* Add a thing by @someone in https://..." lines. */
function parseChanges(body: string | null): { changes: string[]; contributors: number } {
  const changes: string[] = [];
  const authors = new Set<string>();
  for (const line of (body ?? "").split(/\r?\n/)) {
    const m = line.match(/^\s*\*\s+(.+?) by @([\w-]+(?:\[bot\])?) in https:\/\/\S+$/);
    if (!m) continue;
    // Drop conventional-commit prefixes such as "chore(deps): ".
    const title = m[1].replace(/^\w+(?:\([^)]*\))?!?:\s*/, "");
    changes.push(title.charAt(0).toUpperCase() + title.slice(1));
    if (!m[2].endsWith("[bot]")) authors.add(m[2]);
  }
  return { changes, contributors: authors.size };
}

function toRelease(rel: GhRelease): Release {
  return {
    product: rel.tag_name.startsWith("launcher-") ? "Launcher" : "Pomme",
    version: parseVersion(rel.tag_name),
    url: rel.html_url,
    publishedAt: new Date(rel.published_at),
    assets: rel.assets,
    downloads: rel.assets.filter((a) => !/sums/i.test(a.name)).reduce((n, a) => n + a.download_count, 0),
    firstLaunch: parseFirstLaunch(rel.body),
    ...parseChanges(rel.body),
  };
}

function toContributors(list: GhContributor[]): Contributor[] {
  return list
    .filter((c) => c.type !== "Bot" && !c.login.endsWith("[bot]"))
    .map((c) => ({ login: c.login, avatarUrl: c.avatar_url, profileUrl: c.html_url, commits: c.contributions }));
}

/** Published releases, newest first. */
export const getReleases = once(async (): Promise<Release[] | null> => {
  const r = await get<GhRelease[]>(`${API}/releases?per_page=100`);
  if (!r) return null;
  return r.data
    .filter((rel) => !rel.draft && !rel.prerelease)
    .map(toRelease)
    .sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf());
});

export async function getLatestRelease(): Promise<Release | null> {
  return (await getReleases())?.find((r) => r.product === "Pomme") ?? null;
}

export const getStars = once(async () => (await get<GhRepo>(API))?.data.stargazers_count ?? null);

export const getContributors = once(async (): Promise<Contributor[] | null> => {
  const all: GhContributor[] = [];
  for (let page = 1; page <= 10; page++) {
    const r = await get<GhContributor[]>(`${API}/contributors?per_page=100&page=${page}`);
    if (!r) return all.length ? toContributors(all) : null;
    all.push(...r.data);
    if (r.data.length < 100) break;
  }
  return toContributors(all);
});

export const getCommitCount = once(() => countFromLink(`${API}/commits?per_page=1`));

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n).toLowerCase();
}
