import type { PlatformConfig } from "@/data/home";

/** Best guess at the visitor's system, for picking a download. Null when it can't tell. */
export function detectPlatform(): PlatformConfig["key"] | null {
  const ua = navigator.userAgent;
  // iPads report a desktop Mac user agent, so touch support is what gives them away.
  if (/Android|iPhone|iPad/i.test(ua) || (/Mac/i.test(ua) && navigator.maxTouchPoints > 1)) return "mobile";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac/i.test(ua)) return "macos";
  // ChromeOS mentions Linux too, but the AppImage won't run there, so Chromebooks see every option instead.
  if (/CrOS/i.test(ua)) return null;
  if (/Linux|X11/i.test(ua)) return "linux";
  return null;
}
