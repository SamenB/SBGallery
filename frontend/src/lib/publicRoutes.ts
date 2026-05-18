export const PUBLIC_ROUTES = {
  originalsAndPrints: "/originals-and-prints",
  archive: "/archive",
  about: "/about",
  contact: "/contact",
  shipping: "/shipping",
  faq: "/faq",
  terms: "/terms",
  privacy: "/privacy",
} as const;

export const LEGACY_PUBLIC_ROUTES = {
  shop: "/shop",
  gallery: "/gallery",
} as const;

export const PRIMARY_NAV_LINKS = [
  { href: PUBLIC_ROUTES.originalsAndPrints, label: "Originals & Prints" },
  { href: PUBLIC_ROUTES.archive, label: "Archive" },
  { href: PUBLIC_ROUTES.about, label: "About the Artist" },
  { href: PUBLIC_ROUTES.contact, label: "Contact" },
] as const;

export const HOME_HERO_LINKS = [
  PRIMARY_NAV_LINKS[0],
  PRIMARY_NAV_LINKS[1],
  PRIMARY_NAV_LINKS[2],
] as const;
