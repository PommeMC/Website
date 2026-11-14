import { GITHUB_URL } from "@/utils/github";

/**
 * Hero parallax. Each layer moves down by (scroll distance x speed) over the first
 * `range` pixels of scroll. 0 = fixed to the page, 1 = fixed to the viewport.
 */
export const PARALLAX = {
  range: 900,
  sky: 0.5,
  logo: 0.58,
  far: 0.42,
  distant: 0.32,
  mid: 0.22,
  close: 0.11,
  near: 0,
} as const;

/** Logo animations. All of them are off for visitors who prefer reduced motion. */
export const LOGO_MOTION = {
  build: true, // letters drop in one by one on load, the apple last
  hop: true, // the apple hops on hover or tap
  sway: true, // the apple rocks gently every few seconds
  fall: true, // the apple falls out of the word as the page scrolls
} as const;

/**
 * Browser demo. Flip `enabled` once a web build exists; `entry` is a module URL that
 * exports `mount(el: HTMLElement)`. Nothing is fetched until "Play the demo" is pressed.
 */
export const DEMO = {
  enabled: false,
  entry: "",
} as const;

export const LINKS = {
  discord: "https://discord.gg/ucBA55bHPR",
  latestRelease: `${GITHUB_URL}/releases/latest`,
  contribute: GITHUB_URL,
  sponsor: "https://github.com/sponsors/Purdze",
  orchard: "https://orchard.pomme.rs/",
} as const;

export interface PlatformConfig {
  key: "windows" | "macos" | "linux" | "mobile";
  label: string;
  match?: RegExp;
}

export const PLATFORMS: PlatformConfig[] = [
  { key: "windows", label: "Windows", match: /windows.*\.(exe|msi)$/i },
  { key: "macos", label: "macOS", match: /macos.*\.dmg$/i },
  { key: "linux", label: "Linux", match: /linux.*\.AppImage$/i },
  { key: "mobile", label: "Mobile" },
];

export const MOBILE_NOTE = "Android and iOS are on the way.";

export function archLabel(platform: PlatformConfig["key"], file: string): string {
  if (/arm64|aarch64/i.test(file)) return platform === "macos" ? "Apple Silicon" : "ARM64";
  if (/x64|x86_64|amd64/i.test(file)) return platform === "macos" ? "Intel" : "x64";
  return "";
}

export const NOT_A = [
  { title: "A mod", body: "Mods patch Mojang's Java client. Pomme doesn't run that client at all.", isNot: true },
  { title: "A launcher", body: "Launchers start the official game. Pomme is the game client itself.", isNot: true },
  { title: "The whole client", body: "Renderer, networking, menus and physics, written again in Rust.", isNot: false },
];

export const FEATURES = [
  { title: "No Java needed", body: "Native on Windows, Linux and Apple Silicon Macs, with no garbage-collector stutter." },
  {
    title: "Performance first",
    body: "Vulkan, with hidden chunks culled on the GPU so it only draws what you see. Shader packs in early support.",
  },
  {
    title: "Vanilla-checked",
    body: "Physics, movement and rendering ported line by line, with in-game tests run against the official client.",
  },
  { title: "Real servers", body: "Joins vanilla servers from 1.20 to 26.3 with your Microsoft account." },
  { title: "Yours to fork", body: "GPL-3.0, built in the open on GitHub." },
];
