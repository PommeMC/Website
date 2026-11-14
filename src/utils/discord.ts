import { LINKS } from "@/data/home";
import { fetchJson } from "@/utils/fetch";
import { once } from "@/utils/once";

/** Member count from Discord's public invite data, or null if it can't be fetched. */
export const getDiscordMembers = once(async (): Promise<number | null> => {
  const code = LINKS.discord.split("/").pop();
  const r = await fetchJson<{ approximate_member_count?: number }>(
    `https://discord.com/api/v10/invites/${code}?with_counts=true`,
    "discord"
  );
  return r?.data.approximate_member_count ?? null;
});
