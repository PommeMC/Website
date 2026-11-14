import { LINKS, MOBILE_NOTE, PLATFORMS, SERVER_VERSIONS } from "@/data/home";
import { PARITY_HREF } from "@/data/nav";
import { getLatestRelease, GITHUB_URL, NEW_ISSUE_URL } from "@/utils/github";
import { getParityRun } from "@/utils/parity";

/** The release these answers were last read against. Re-read the page and bump it with each release. */
export const CHECKED_FOR = "0.2.10";

interface Question {
  /** The question's anchor. Fixed, so links pasted elsewhere keep working when a question is reworded. */
  id: string;
  question: string;
  answer: string;
  list?: string[];
  links?: { label: string; href: string }[];
}

export interface FaqGroup {
  id: string;
  title: string;
  questions: Question[];
}

export async function getFaq(): Promise<FaqGroup[]> {
  const [release, parity] = await Promise.all([getLatestRelease(), getParityRun()]);
  const firstLaunch = Object.entries(release?.firstLaunch ?? {});

  return [
    {
      id: "start",
      title: "Getting started",
      questions: [
        {
          id: "free",
          question: "Is Pomme free?",
          answer: "Yes. Pomme is free to download and open source under GPL-3.0.",
          links: [{ label: "Read the code", href: GITHUB_URL }],
        },
        {
          id: "own",
          question: "Do I need to own Minecraft?",
          answer:
            "Yes. You sign in with the Microsoft account that owns Minecraft: Java Edition, and Pomme downloads the game's textures and sounds from Mojang the first time it runs.",
        },
        {
          id: "java",
          question: "Do I need Java installed?",
          answer: "No. Pomme is a native program written in Rust and doesn't use Java at all.",
        },
        {
          id: "platforms",
          question: "Which platforms does it run on?",
          answer: `Windows (x64), macOS on Apple Silicon, and Linux (x64). ${MOBILE_NOTE}`,
        },
        {
          id: "sign-in",
          question: "Is it safe to sign in with my Microsoft account?",
          answer:
            "You sign in on Microsoft's own sign-in page in your browser, so Pomme never sees your password. It keeps your sign-in in your system's credential store, and only sends it to Microsoft, Xbox Live and Mojang.",
        },
      ],
    },
    {
      id: "playing",
      title: "Playing",
      questions: [
        {
          id: "servers",
          question: "Which servers can I join?",
          answer: `Servers running Minecraft: Java Edition ${SERVER_VERSIONS}, signed in with your Microsoft account.`,
        },
        {
          id: "banned",
          question: "Can I get banned on servers?",
          answer:
            "Pomme tells servers its name when it joins, so they can see you aren't on the official client. It adds no cheats or gameplay advantages. Whether a server allows it is up to that server's rules and anti-cheat, so check them before you play somewhere that only allows the official client.",
        },
        {
          id: "singleplayer",
          question: "Can I play singleplayer?",
          answer:
            "Yes. Worlds run on SteelMC, a Minecraft server written in Rust that Pomme runs inside the client, so there's nothing else to set up.",
        },
        {
          id: "resource-packs",
          question: "Do resource packs work?",
          answer: "Yes. Local and server-sent resource packs both work, and changes apply without a restart.",
        },
        {
          id: "shaders",
          question: "Do shader packs work?",
          answer:
            "Support is early. Pomme loads OptiFine and Iris shader packs and translates them for its Vulkan renderer, but not every pack works yet.",
        },
        {
          id: "mods",
          question: "Can I use Fabric or Forge mods?",
          answer: "No. Those mods are Java code written for Mojang's client, which Pomme doesn't run.",
        },
      ],
    },
    {
      id: "install",
      title: "Installing and updating",
      questions: [
        {
          id: "first-launch",
          question: "Why does Windows or macOS warn me on first launch?",
          answer: "The builds aren't code-signed yet, so your system asks before running them the first time.",
          list: firstLaunch.map(([platform, note]) => `${PLATFORMS.find((p) => p.key === platform)?.label ?? platform}: ${note}`),
          links: firstLaunch.length > 0 ? [] : [{ label: "See the release notes", href: LINKS.latestRelease }],
        },
        {
          id: "update",
          question: "How do I update?",
          answer: "You don't need to. When a new release is out, Pomme installs it before the menu opens and restarts itself.",
        },
      ],
    },
    {
      id: "project",
      title: "The project",
      questions: [
        {
          id: "official",
          question: "Is this an official Minecraft product?",
          answer: "No. Pomme is a community project and isn't approved by or associated with Mojang or Microsoft.",
        },
        {
          id: "differences",
          question: "Something behaves differently from vanilla. What should I do?",
          answer: "Report it on GitHub: say what you did, what you expected and what happened.",
          links: [
            { label: "Report a bug", href: NEW_ISSUE_URL },
            ...(parity ? [{ label: "See what's been tested", href: PARITY_HREF }] : []),
          ],
        },
        {
          id: "help",
          question: "How can I help?",
          answer: "Play and report bugs, make add-ons, contribute code or sponsor the project.",
          links: [{ label: "Ways to help", href: "/community" }],
        },
        {
          id: "mobile",
          question: "When are Android and iOS coming?",
          answer: "Early builds can be built from source today. There's no date for downloadable ones yet.",
        },
      ],
    },
  ];
}
