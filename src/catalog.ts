export const sources = [
  { id: "uscis-policy", agency: "USCIS", title: "USCIS Policy Manual", url: "https://www.uscis.gov/policy-manual" },
  { id: "uscis-forms", agency: "USCIS", title: "USCIS Forms", url: "https://www.uscis.gov/forms/all-forms" },
  { id: "uscis-fees", agency: "USCIS", title: "USCIS Fee Schedule", url: "https://www.uscis.gov/g-1055" },
  { id: "dos-visas", agency: "DOS", title: "U.S. Visas", url: "https://travel.state.gov/content/travel/en/us-visas.html" },
  { id: "eoir", agency: "DOJ", title: "Executive Office for Immigration Review", url: "https://www.justice.gov/eoir" },
  { id: "cfr-8", agency: "eCFR", title: "Title 8", url: "https://www.ecfr.gov/current/title-8" }
] as const;
export const dossiers = [
  { id: "I-130", title: "Petition for Alien Relative", status: "unverified", enabled: false },
  { id: "I-485", title: "Adjustment of Status", status: "unverified", enabled: false },
  { id: "RFE", title: "Request for Evidence", status: "unverified", enabled: false }
] as const;
