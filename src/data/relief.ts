export const APP_NAME = "Stand With Nepal";
export const PAGE_TITLE = "Stand With Nepal — Flash Flood Relief 2026";
export const PAGE_DESCRIPTION =
  "Help families after the 26 August 2026 Himalayan flash floods in Nepal. Official casualty figures from Nepal Police. Donate through the Government of Nepal Prime Minister’s Disaster Relief Fund.";

export const UPDATED_ON = "1 September 2026";
export const FIGURES_AS_OF = "1 September 2026, 9:36 p.m. NPT";
export const FIGURES_SOURCE = "NDRRMA / Nepal Police (Nepal-only)";
export const FIGURES_NOTE =
  "Latest snapshot 1 September 2026, 9:36 p.m. NPT. Confirmed dead 1,050, missing 4,247, injured 1,473. Missing is held at the official peak; Wikipedia currently lists a lower missing count. Numbers are still changing.";

export const SHARE_TEXT =
  "Catastrophic flash floods hit Nepal’s Himalayas on 26 August. Official Nepal-only figures: 1,050 deaths, with 4,247 people still missing. Donate only through the official Government of Nepal Prime Minister’s Disaster Relief Fund:
https://pmdrf.nchl.com.np/";

export const stats = [
  { value: "1,050", label: "Confirmed dead" },
  { value: "4,247", label: "Missing" },
  { value: "1,473", label: "Injured" },
  { value: "14", label: "Hydropower plants damaged" },
] as const;

export type Photo = {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  href: string;
};

export const photos: Photo[] = [
  {
    src: "/photos/hero.jpg",
    alt: "Aerial view of a Himalayan town half-swallowed by mud after the flash flood, with a swollen grey river and cloud-covered mountains",
    caption: "A riverside town after the flood — homes stand in a sheet of mud while the river still runs high.",
    credit: "Reuters",
    href: "https://www.reuters.com/pictures/hundreds-missing-wall-mud-rock-devastates-nepal-tibet-border-2026-08-26/N4CUTLVGR5JX3MYB7HITMH7PFA",
  },
  {
    src: "/photos/village-silt.jpg",
    alt: "Aerial photograph of a dense hillside town with the riverbank side of buildings buried in grey silt",
    caption: "Silt swallowed the river edge of this town. Whole rows of houses were filled to the first storey.",
    credit: "NBC News",
    href: "https://www.nbcnews.com/world/asia/flash-flood-nepal-tibet-villages-destroyed-american-tourists-missing-rcna594473",
  },
  {
    src: "/photos/bridge.jpg",
    alt: "A steel truss bridge collapsed into a muddy, fast-moving river beside damaged riverside buildings",
    caption: "A steel bridge torn from its piers. Nineteen bridges were damaged, cutting villages off from help.",
    credit: "CNN",
    href: "https://www.cnn.com/2026/08/26/world/live-news/nepal-flash-flooding-floods-intl",
  },
  {
    src: "/photos/child.jpg",
    alt: "A child stands with hands behind their head looking down a street buried in thick mud",
    caption: "A child looks out over a street that is no longer a street.",
    credit: "The Philadelphia Inquirer",
    href: "https://www.inquirer.com/news/nation-world/nepal-china-flash-flooding-20260826.html",
  },
  {
    src: "/photos/onlookers.jpg",
    alt: "Residents on a balcony photograph isolated houses standing in a wide field of mud",
    caption: "Neighbors watch houses that the flood left standing alone in a field of mud.",
    credit: "NPR / Niranjan Shrestha, AP",
    href: "https://www.npr.org/2026/08/26/g-s1-140211/8-dead-hundreds-missing-as-nepal-avalanche-triggers-flash-floods",
  },
  {
    src: "/photos/rescue.jpg",
    alt: "Rescuers on an excavator carry an elderly woman through deep flood mud",
    caption: "Rescuers carry an elderly survivor through mud too deep to walk.",
    credit: "News coverage, August 2026",
    href: "https://dailypioneer.com/news/nepal-flash-flood-72-killed-500-missing",
  },
  {
    src: "/photos/corridor.jpg",
    alt: "Aerial view of a mountain valley filled with a wide river of grey mud, with buildings isolated in the flow",
    caption: "The flood turned a mountain valley into a river of mud. Buildings sit where streets used to be.",
    credit: "Reuters",
    href: "https://www.reuters.com/world/nepal-flash-floods-live-mudslide-nepal-tibet-border-triggers-catastrophic-2026-08-26/",
  },
  {
    src: "/photos/buildings.jpg",
    alt: "Multi-storey buildings isolated in a receding mudflow with a grey river beyond",
    caption: "Buildings left isolated as the mudflow receded. Many families have nowhere to return to.",
    credit: "PBS News",
    href: "https://www.pbs.org/newshour/world/at-least-22-killed-and-hundreds-missing-after-avalanche-triggers-deadly-flash-floods-in-nepal",
  },
  {
    src: "/photos/valley.jpg",
    alt: "Wide aerial of a Himalayan valley where a grey flood path cuts through green hills and settlements",
    caption: "The flood path through Nepal’s Himalayan foothills, looking upstream toward the mountains.",
    credit: "Al Jazeera",
    href: "https://www.aljazeera.com/gallery/2026/8/26/photos-avalanche-floods-kill-eight-hundreds-missing-in-nepals-himalayas",
  },
];

export const DONATE_URL = "https://pmdrf.nchl.com.np/";
export const DONATE_NAME = "Prime Minister’s Disaster Relief Fund";
export const DONATE_OPERATOR = "Government of Nepal";

export const officialPortals = [
  {
    name: "BIPAD Portal",
    owner: "NDRRMA · Government of Nepal",
    href: "https://bipadportal.gov.np/",
    body: "National disaster information system — incidents, damage, and live warnings.",
  },
  {
    name: "NDRRMA",
    owner: "National Disaster Risk Reduction and Management Authority",
    href: "https://ndrrma.gov.np/en",
    body: "Official authority for this response. Daily disaster bulletins are posted here.",
  },
  {
    name: "Disaster Risk Reduction Portal",
    owner: "Ministry of Home Affairs · Nepal Police data",
    href: "http://drrportal.gov.np/",
    body: "Police-reported incidents, deaths, missing, and damage by district.",
  },
  {
    name: "Unidentified dead — Nepal Police",
    owner: "Nepal Police unidentified-body registry",
    href: "https://udb.nepalpolice.gov.np/dead-bodies",
    body: "Official police list of unidentified bodies recovered after the flood. Families can search here.",
  },
  {
    name: "PM Disaster Relief Fund",
    owner: "Office of the Prime Minister",
    href: DONATE_URL,
    body: "The only donation link on this page. Domestic and international cards, NEPALPAY QR.",
  },
];

export const needs = [
  {
    title: "Emergency shelter",
    body: "Tarpaulins, blankets, sleeping mats, and rope for families whose homes were swept away.",
  },
  {
    title: "Safe drinking water",
    body: "Floodwater has contaminated supplies. Clean water and hygiene kits stop a second crisis.",
  },
  {
    title: "Medical care",
    body: "Trauma, wounds, and illness in cut-off villages. Medicines and field teams are already moving.",
  },
  {
    title: "Reaching the isolated",
    body: "The Betrawati–Rasuwagadhi road is gone. Many communities can be reached only by helicopter.",
  },
];

export const sources = [
  { label: "NDRRMA", href: "https://ndrrma.gov.np/en" },
  { label: "BIPAD Portal", href: "https://bipadportal.gov.np/" },
  { label: "Nepal DRR Portal", href: "http://drrportal.gov.np/" },
  {
    label: "Nepal Police HQ bulletin, 3:00 p.m. 28 Aug",
    href: "https://x.com/NepalPoliceHQ/status/2093280482939339145",
  },
  {
    label: "UPI — death toll 579, more than 1,900 missing, 28 Aug",
    href: "https://www.upi.com/Top_News/World-News/2026/08/28/nepal-flash-flood-579-dead/2171787929221/",
  },
  {
    label: "Nepal Police unidentified bodies",
    href: "https://udb.nepalpolice.gov.np/dead-bodies",
  },
  { label: "Office of the Prime Minister", href: "https://opmcm.gov.np/content/586/heartfelt-appeal/" },
  { label: "PM Disaster Relief Fund", href: "https://pmdrf.nchl.com.np/" },
  {
    label: "Kathmandu Post — police death toll 359",
    href: "https://kathmandupost.com/national/2026/08/27/nepal-flood-death-toll-reaches-270-as-hundreds-remain-out-of-contact",
  },
  {
    label: "ReliefWeb sitrep, 27 Aug 2026",
    href: "https://reliefweb.int/report/nepal/nepal-flash-floods-rapid-situation-overview-27-august-2026",
  },
  {
    label: "IFRC GO — Rasuwa Flood",
    href: "https://go.ifrc.org/emergencies/8073",
  },
];
