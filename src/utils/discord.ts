import { LINKS } from "@/data/home";
import { once } from "@/utils/once";

/** Member count from Discord's public invite data, or null if it can't be fetched. */
export const getDiscordMembers = once(async (): Promise<number | null> => {
  const code = LINKS.discord.split("/").pop();
  try {
    const res = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`);
    if (!res.ok) return null;
    const data = (await res.json()) as { approximate_member_count?: number };
    return data.approximate_member_count ?? null;
  } catch {
    return null;
  }
});
