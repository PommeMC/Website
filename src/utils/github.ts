import { capitalize } from "@/utils/content";
import { fetchJson } from "@/utils/fetch";
import { once } from "@/utils/once";

const GITHUB_REPO = "PommeMC/Client";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
export const CONTRIBUTORS_URL = `${GITHUB_URL}/graphs/contributors`;
export const NEW_ISSUE_URL = `${GITHUB_URL}/issues/new/choose`;
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
type GhRepo = { stargazers_count: number; has_discussions: boolean };
type GhIssue = { number: number; title: string; html_url: string; labels: { name: string }[]; pull_request?: unknown };
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

const get = <T>(url: string) => fetchJson<T>(url, "github", { headers: headers() });

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
  for (const line of (body ?? "").split(/\r?\n/)) {
    const m = line.match(/^\s*[-*]\s*\*\*([^*:]+):?\*\*:?\s*(.+)$/);
    if (!m) continue;
    const raw = m[2].trim();
    const text = raw
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();
    // A note that starts with a command (`chmod ...`) keeps the command's case.
    const sentence = raw.startsWith("`") ? text : capitalize(text);
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
    changes.push(capitalize(title));
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

const getRepo = once(async () => (await get<GhRepo>(API))?.data ?? null);

export const getStars = async () => (await getRepo())?.stargazers_count ?? null;

/** Where to suggest a feature: Discussions when the repo has them, otherwise a new issue. */
export const getIdeasUrl = async () => ((await getRepo())?.has_discussions ? `${GITHUB_URL}/discussions` : NEW_ISSUE_URL);

export interface Issue {
  number: number;
  title: string;
  url: string;
  labels: string[];
}

/** Open issues labelled as good first issues, newest first. */
export const getGoodFirstIssues = once(async (): Promise<Issue[] | null> => {
  const r = await get<GhIssue[]>(`${API}/issues?state=open&labels=good%20first%20issue&per_page=5`);
  if (!r) return null;
  return r.data
    .filter((i) => !i.pull_request)
    .map((i) => ({
      number: i.number,
      title: i.title,
      url: i.html_url,
      labels: i.labels.map((l) => l.name).filter((n) => n !== "good first issue"),
    }));
});

/** A GitHub avatar URL for an image shown `px` CSS pixels wide, fetched at twice that for sharp screens. */
export const sizedAvatar = (url: string, px: number) => `${url}${url.includes("?") ? "&" : "?"}s=${2 * px}`;
export const loginAvatar = (login: string, px: number) => sizedAvatar(`https://avatars.githubusercontent.com/${login}`, px);

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
