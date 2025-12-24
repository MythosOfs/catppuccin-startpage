// User configuration for the startpage - update the palette, location, and your preferred tabs, categories, and links

// Define preferred palette for light and dark mode
// Available themes: latte, frappe, mocha, macchiato
const preferredLightTheme = latte;
const preferredDarkTheme = mocha;

let palette = initThemeSystem(preferredLightTheme, preferredDarkTheme);

const default_configuration = {
  overrideStorage: true,
  temperature: {
    location: "Berlin",
    scale: "C",
  },
  clock: {
    format: "k:i p",
    icon_color: palette.maroon,
  },
  // additionalClocks: [
  //   {
  //     label: "UA",
  //     timezone: "Europe/Kyiv",
  //     format: "h:i",
  //     icon_color: palette.peach,
  //   },
  // ],
  search: {
    engines: {
      p: ["https://www.perplexity.ai/search/?q=", "PerplexityAI"],
      d: ["https://duckduckgo.com/?q=", "DuckDuckGo"],
      k: ["https://kagi.com/search?q=", "Kagi"]
    },
    default: "k",
  },
  keybindings: {
    "s": "search-bar",
  },
  disabled: ["current-time"],
  localIcons: true,
  localFonts: true,
  fastlink: "https://www.claude.ai",
  openLastVisitedTab: true,
  // Spotify Client ID - Get this from https://developer.spotify.com/dashboard
  spotifyClientId: "6c129ccfdfc94390b2c234542cb75b62",
  rssFeedMaxItems: 10,
  rssFeeds: [
    {
      name: "Heise News",
      url: "https://www.heise.de/rss/heise-atom.xml"
    },
    {
      name: "Golem.de",
      url: "https://rss.golem.de/rss.php?feed=ATOM1.0"
    },
    {
      name: "Heise Developer",
      url: "https://www.heise.de/developer/rss/news-atom.xml"
    },
    {
      name: "Heise Security",
      url: "https://www.heise.de/security/rss/news-atom.xml"
    }
  ],
  tabs: [
    {
      name: "myself",
      background_url: "src/img/banners/banner_03.gif",
      categories: [
        {
          name: "bookmarks",
          links: [
            {
              name: "fmhy",
              url: "https://fmhy.net",
              icon: "list-search",
              icon_color: palette.green,
            },
            {
              name: "torrentleech",
              url: "https://torrentleech.org",
              icon: "download",
              icon_color: palette.peach,
            },
          ],
        },
        {
          name: "dienste",
          links: [
            {
              name: "proton mail",
              url: "https://mail.proton.me",
              icon: "mail",
              icon_color: palette.green,
            },
            {
              name: "proton calendar",
              url: "https://calendar.proton.me",
              icon: "calendar-filled",
              icon_color: palette.peach,
            },
            {
              name: "proton drive",
              url: "https://drive.proton.me",
              icon: "cloud",
              icon_color: palette.red,
            },
            {
              name: "bitwarden",
              url: "https://vault.bitwarden.com",
              icon: "key",
              icon_color: palette.blue,
            },
            {
              name: "mullvad vpn",
              url: "https://mullvad.net/en/account",
              icon: "shield-lock",
              icon_color: palette.mauve,
            },
          ],
        },
        {
          name: "media",
          links: [
            {
              name: "heise",
              url: "https://www.heise.de",
              icon: "news",
              icon_color: palette.green,
            },
            {
              name: "golem",
              url: "https://www.golem.de",
              icon: "article",
              icon_color: palette.peach,
            },
          ],
        },
      ],
    },
    {
      name: "dev",
      background_url: "src/img/banners/banner_15.gif",
      categories: [
        {
          name: "development",
          links: [
            {
              name: "github",
              url: "https://github.com",
              icon: "brand-github",
              icon_color: palette.green,
            },
          ],
        },
        {
          name: "resources",
          links: [
            {
              name: "dou",
              url: "https://dou.ua",
              icon: "brand-prisma",
              icon_color: palette.green,
            },
            {
              name: "hackernews",
              url: "https://news.ycombinator.com",
              icon: "brand-redhat",
              icon_color: palette.peach,
            },
            {
              name: "uber engineering",
              url: "https://www.uber.com/en-GB/blog/london/engineering",
              icon: "brand-uber",
              icon_color: palette.red,
            },
            {
              name: "netflix tech blog",
              url: "https://netflixtechblog.com",
              icon: "brand-netflix",
              icon_color: palette.blue,
            },
          ],
        },
      ],
    },
    {
      name: "chi ll",
      background_url: "src/img/banners/banner_11.gif",
      categories: [
        {
          name: "social media",
          links: [
            {
              name: "nitter",
              url: "https://nitter.poast.org",
              icon: "brand-twitter",
              icon_color: palette.green,
            },
            {
              name: "reddit",
              url: "https://www.reddit.com/r/unixporn",
              icon: "brand-reddit",
              icon_color: palette.peach,
            },
            {
              name: "libreddit",
              url: "https://libreddit.spike.codes",
              icon: "alien",
              icon_color: palette.red,
            },
          ],
        },
        {
          name: "gaming",
          links: [
            {
              name: "infiniteBacklog",
              url: "https://infinitebacklog.net",
              icon: "device-gamepad",
              icon_color: palette.green,
            },
            {
              name: "steam",
              url: "https://store.steampowered.com",
              icon: "brand-steam",
              icon_color: palette.peach,
            },
            {
              name: "epicgames",
              url: "https://store.epicgames.com",
              icon: "brand-fortnite",
              icon_color: palette.red,
            },
            {
              name: "protondb",
              url: "https://www.protondb.com",
              icon: "brand-steam",
              icon_color: palette.blue,
            },
          ],
        },
        {
          name: "video",
          links: [
            {
              name: "anilist",
              url: "https://anilist.co/home",
              icon: "brand-funimation",
              icon_color: palette.green,
            },
            {
              name: "youtube",
              url: "https://www.youtube.com",
              icon: "brand-youtube",
              icon_color: palette.peach,
            },
            {
              name: "twitch",
              url: "https://www.twitch.tv",
              icon: "brand-twitch",
              icon_color: palette.red,
            },
            {
              name: "netflix",
              url: "https://www.netflix.com",
              icon: "brand-netflix",
              icon_color: palette.blue,
            },
            {
              name: "prime video",
              url: "https://www.primevideo.com",
              icon: "brand-amazon",
              icon_color: palette.mauve,
            },
            {
              name: "disney+",
              url: "https://www.disneyplus.com",
              icon: "mickey",
              icon_color: palette.sapphire,
            },
          ],
        },
      ],
    },
  ],
};

const CONFIG = new Config(default_configuration, palette);

const root = document.querySelector(":root");
root.style.setProperty("--bg", palette.mantle);
root.style.setProperty("--accent", palette.blue);
