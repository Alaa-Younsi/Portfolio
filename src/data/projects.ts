export type Project = {
  /** "engagement / category" — rendered above the title. */
  readonly meta: string;
  readonly title: string;
  readonly url: string;
};

/**
 * Rendered top to bottom in this order, so the last entry is the one that sits
 * at the foot of the list.
 */
export const projects: readonly Project[] = [
  { meta: "Commission / Online Shop", title: "Jazym", url: "https://jazym.vercel.app/" },
  { meta: "Commission / Private Driver", title: "The Driver", url: "https://thedriver.fr/" },
  { meta: "Commission / Company", title: "Norlyn Coffee", url: "https://www.norlyncoffee.com/" },
  { meta: "Commission / Cars Workshop", title: "GSM Auto", url: "https://www.gsmautodz.com/" },
  { meta: "Commission / Online Shop", title: "Kindo", url: "https://www.kindodz.com/" },
  { meta: "Commission / Online Shop", title: "Laroche", url: "https://www.larochebijoux.com/" },
  { meta: "Commission / Company", title: "HIS & HVAC", url: "https://www.his-hvac.com/en" },
  {
    meta: "Commission / Company",
    title: "Amana Partners",
    url: "https://www.amanapartnersllc.com/",
  },
  { meta: "Commission / Online Shop", title: "Auto Style", url: "https://auto-style.shop/" },
  { meta: "Commission / Online Shop", title: "Northernwest", url: "https://northern-west.shop/" },
  { meta: "Commission / Store", title: "Arcada", url: "https://www.arcadatile.com/" },
  { meta: "Commission / Company", title: "Afia Export", url: "https://www.afiaexport.com/" },
] as const;
