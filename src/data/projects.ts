export interface ProjectLink {
  href: string;
  icon: string;
  label: string;
}

export interface Project {
  slug: string;
  number: string;
  status: "live" | "dev";
  name: string;
  shortName: string;
  desc: string;
  tags: string[];
  features: string[];
  links: ProjectLink[];
  tech: string[];
  cover: string;
  screenshots: { src: string; alt: string; size?: "wide" | "tall" }[];
}

export const projects: Project[] = [
  {
    slug: "clash",
    number: "01",
    status: "live",
    name: "CLASH — TOURNAMENT MANAGEMENT SYSTEM",
    shortName: "Clash",
    desc: "An all-in-one tournament platform where organizers generate and manage tournaments, and players discover events, register, and track their competitive history and results across seasons.",
    tags: ["Tournament Engine", "Bracket Generation", "Player Profiles", "Live Results"],
    features: [
      "Discover & register for tournaments",
      "Auto-generated brackets & match schedules",
      "Player history, stats & result tracking",
      "Multi-sport support (volleyball, padel, beach tennis, dodgeball, spikeball)",
      "Referee portal for live score entry",
      "Venue & court management",
      "Rankings system & player voting",
    ],
    links: [
      { href: "https://theclasheg.com", icon: "fa-globe", label: "theclasheg.com" },
      { href: "https://dashboard.theclasheg.com", icon: "fa-chart-line", label: "Dashboard" },
      { href: "https://referee.theclasheg.com", icon: "fa-flag-checkered", label: "Referee Portal" },
    ],
    tech: [".NET", "React", "SQL Server", "Docker", "Jenkins", "CSS", "HTML", "Netcup"],
    cover: "",
    screenshots: [],
  },
  {
    slug: "beachamp",
    number: "02",
    status: "live",
    name: "BEACHAMP — TRAINING PORTAL",
    shortName: "Beachamp",
    desc: "A full admin portal for managing sports training academies — track players, coaches, groups, payments, expenses, subscriptions, and scheduling with revenue analytics and daily reports.",
    tags: ["Admin Dashboard", "Player Management", "Revenue Analytics", "Scheduling", "Payments"],
    features: [
      "Player, coach & group management",
      "Revenue, expense & profit tracking",
      "Subscription packages & payments",
      "Session scheduling & daily reports",
    ],
    links: [{ href: "https://beachamp.org", icon: "fa-globe", label: "beachamp.org" }],
    tech: ["Next.js 15", "TypeScript", "Supabase", "Tailwind CSS", "Lucide React", "Vercel"],
    cover: "",
    screenshots: [],
  },
  {
    slug: "fl",
    number: "03",
    status: "live",
    name: "FL — THE FANTASY LEAGUE",
    shortName: "FL",
    desc: "The ultimate fantasy football experience — create your own league with your rules, custom matches and players. Configure team budgets, auto-pricing, transfer windows, and custom point systems. Available on Android & iOS.",
    tags: ["Custom Leagues", "Auto Pricing", "Transfer Market", "Stat Tracking", "Mobile App"],
    features: [
      "Configurable for any league or sport",
      "Team budget & player price management",
      "Transfer count limits & market",
      "Custom scoring & point systems",
    ],
    links: [
      { href: "https://thefantasyleague.app", icon: "fa-globe", label: "thefantasyleague.app" },
      {
        href: "https://play.google.com/store/apps/details?id=com.thefantasyleague",
        icon: "fa-google-play fa-brands",
        label: "Google Play",
      },
      {
        href: "https://apps.apple.com/eg/app/the-fantasy-league/id6478969805",
        icon: "fa-apple fa-brands",
        label: "App Store",
      },
    ],
    tech: ["React Native", ".NET", "SQL Server", "Netcup"],
    cover: "",
    screenshots: [],
  },
];
