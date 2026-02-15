// Team name normalization: raw CSV names → canonical current names
export const TEAM_NAME_MAP: Record<string, string> = {
  "Chennai Super Kings": "Chennai Super Kings",
  "Mumbai Indians": "Mumbai Indians",
  "Kolkata Knight Riders": "Kolkata Knight Riders",
  "Royal Challengers Bangalore": "Royal Challengers Bengaluru",
  "Royal Challengers Bengaluru": "Royal Challengers Bengaluru",
  "Rajasthan Royals": "Rajasthan Royals",
  "Sunrisers Hyderabad": "Sunrisers Hyderabad",
  "Delhi Daredevils": "Delhi Capitals",
  "Delhi Capitals": "Delhi Capitals",
  "Kings XI Punjab": "Punjab Kings",
  "Punjab Kings": "Punjab Kings",
  "Gujarat Titans": "Gujarat Titans",
  "Lucknow Super Giants": "Lucknow Super Giants",
  "Deccan Chargers": "Deccan Chargers",
  "Pune Warriors": "Pune Warriors",
  "Rising Pune Supergiant": "Rising Pune Supergiant",
  "Rising Pune Supergiants": "Rising Pune Supergiant",
  "Gujarat Lions": "Gujarat Lions",
  "Kochi Tuskers Kerala": "Kochi Tuskers Kerala",
};

export const TEAM_SHORT_CODE: Record<string, string> = {
  "Chennai Super Kings": "CSK",
  "Mumbai Indians": "MI",
  "Kolkata Knight Riders": "KKR",
  "Royal Challengers Bengaluru": "RCB",
  "Rajasthan Royals": "RR",
  "Sunrisers Hyderabad": "SRH",
  "Delhi Capitals": "DC",
  "Punjab Kings": "PBKS",
  "Gujarat Titans": "GT",
  "Lucknow Super Giants": "LSG",
  "Deccan Chargers": "DCH",
  "Pune Warriors": "PW",
  "Rising Pune Supergiant": "RPS",
  "Gujarat Lions": "GL",
  "Kochi Tuskers Kerala": "KTK",
};

export const TEAM_COLORS: Record<string, string> = {
  CSK: "#FFCB05",
  MI: "#004BA0",
  KKR: "#3A225D",
  RCB: "#EC1C24",
  RR: "#EA1A85",
  SRH: "#FF822A",
  DC: "#004C93",
  PBKS: "#ED1B24",
  GT: "#1C1C1C",
  LSG: "#A72056",
  DCH: "#4B8BBE",
  PW: "#2F9BE3",
  RPS: "#6F42C1",
  GL: "#E04F16",
  KTK: "#6F2DA8",
};

export const ACTIVE_TEAMS = new Set([
  "Chennai Super Kings",
  "Mumbai Indians",
  "Kolkata Knight Riders",
  "Royal Challengers Bengaluru",
  "Rajasthan Royals",
  "Sunrisers Hyderabad",
  "Delhi Capitals",
  "Punjab Kings",
  "Gujarat Titans",
  "Lucknow Super Giants",
]);

// Venue normalization: raw CSV names → canonical "Stadium, City"
export const VENUE_NAME_MAP: Record<string, string> = {
  "M Chinnaswamy Stadium": "M. Chinnaswamy Stadium, Bengaluru",
  "M.Chinnaswamy Stadium": "M. Chinnaswamy Stadium, Bengaluru",
  "Eden Gardens": "Eden Gardens, Kolkata",
  "Wankhede Stadium": "Wankhede Stadium, Mumbai",
  "MA Chidambaram Stadium": "MA Chidambaram Stadium, Chennai",
  "MA Chidambaram Stadium, Chepauk": "MA Chidambaram Stadium, Chennai",
  "Feroz Shah Kotla": "Arun Jaitley Stadium, Delhi",
  "Arun Jaitley Stadium": "Arun Jaitley Stadium, Delhi",
  "Arun Jaitley Stadium, Delhi": "Arun Jaitley Stadium, Delhi",
  "Sawai Mansingh Stadium": "Sawai Mansingh Stadium, Jaipur",
  "Rajiv Gandhi International Stadium": "Rajiv Gandhi Intl Stadium, Hyderabad",
  "Rajiv Gandhi International Stadium, Uppal": "Rajiv Gandhi Intl Stadium, Hyderabad",
  "Punjab Cricket Association Stadium, Mohali": "PCA Stadium, Mohali",
  "Punjab Cricket Association IS Bindra Stadium": "PCA Stadium, Mohali",
  "Punjab Cricket Association IS Bindra Stadium, Mohali": "PCA Stadium, Mohali",
  "Punjab Cricket Association IS Bindra Stadium, Mohali, Chandigarh": "PCA Stadium, Mohali",
  "Dr DY Patil Sports Academy": "DY Patil Stadium, Mumbai",
  "Dr DY Patil Sports Academy, Mumbai": "DY Patil Stadium, Mumbai",
  "Brabourne Stadium": "Brabourne Stadium, Mumbai",
  "Brabourne Stadium, Mumbai": "Brabourne Stadium, Mumbai",
  "Holkar Cricket Stadium": "Holkar Cricket Stadium, Indore",
  "Barabati Stadium": "Barabati Stadium, Cuttack",
  "JSCA International Stadium Complex": "JSCA International Stadium, Ranchi",
  "Green Park": "Green Park, Kanpur",
  "Nehru Stadium": "Nehru Stadium, Kochi",
  "Subrata Roy Sahara Stadium": "MCA Stadium, Pune",
  "Maharashtra Cricket Association Stadium": "MCA Stadium, Pune",
  "Maharashtra Cricket Association Stadium, Pune": "MCA Stadium, Pune",
  "Himachal Pradesh Cricket Association Stadium": "HPCA Stadium, Dharamsala",
  "Himachal Pradesh Cricket Association Stadium, Dharamsala": "HPCA Stadium, Dharamsala",
  "Saurashtra Cricket Association Stadium": "SCA Stadium, Rajkot",
  "Vidarbha Cricket Association Stadium": "VCA Stadium, Nagpur",
  "Vidarbha Cricket Association Stadium, Jamtha": "VCA Stadium, Nagpur",
  "Shaheed Veer Narayan Singh International Stadium": "VNS International Stadium, Raipur",
  "Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium": "ACA-VDCA Stadium, Visakhapatnam",
  "Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium, Visakhapatnam": "ACA-VDCA Stadium, Visakhapatnam",
  "Dubai International Cricket Stadium": "Dubai International Stadium, Dubai",
  "Sharjah Cricket Stadium": "Sharjah Cricket Stadium, Sharjah",
  "Sheikh Zayed Stadium": "Sheikh Zayed Stadium, Abu Dhabi",
  "Zayed Cricket Stadium": "Sheikh Zayed Stadium, Abu Dhabi",
  "Narendra Modi Stadium": "Narendra Modi Stadium, Ahmedabad",
  "Narendra Modi Stadium, Ahmedabad": "Narendra Modi Stadium, Ahmedabad",
  "Sardar Patel Stadium": "Narendra Modi Stadium, Ahmedabad",
  "Sardar Patel Stadium, Motera": "Narendra Modi Stadium, Ahmedabad",
  "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium": "Ekana Cricket Stadium, Lucknow",
  "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow": "Ekana Cricket Stadium, Lucknow",
  "Barsapara Cricket Stadium": "Barsapara Cricket Stadium, Guwahati",
  "Barsapara Cricket Stadium, Guwahati": "Barsapara Cricket Stadium, Guwahati",
  "Maharaja Yadavindra Singh International Cricket Stadium": "MYS International Stadium, Mullanpur",
  "Maharaja Yadavindra Singh International Cricket Stadium, Mullanpur": "MYS International Stadium, Mullanpur",
  // South Africa venues (2009 season)
  "Newlands": "Newlands, Cape Town",
  "SuperSport Park": "SuperSport Park, Centurion",
  "Kingsmead": "Kingsmead, Durban",
  "St George's Park": "St George's Park, Port Elizabeth",
  "New Wanderers Stadium": "New Wanderers Stadium, Johannesburg",
  "Buffalo Park": "Buffalo Park, East London",
  "De Beers Diamond Oval": "De Beers Diamond Oval, Kimberley",
  "OUTsurance Oval": "OUTsurance Oval, Bloemfontein",
};

export function normalizeVenue(raw: string): string {
  const cleaned = raw.replace(/^"+|"+$/g, "").trim();
  return VENUE_NAME_MAP[cleaned] || cleaned;
}

export function normalizeTeam(raw: string): string {
  const cleaned = raw.trim();
  return TEAM_NAME_MAP[cleaned] || cleaned;
}

export function normalizeSeason(raw: string): number {
  if (raw.includes("/")) {
    const parts = raw.split("/");
    const century = parts[0].substring(0, 2);
    return parseInt(century + parts[1]);
  }
  return parseInt(raw);
}

export function teamSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function extractCityFromVenue(venue: string): string | null {
  const parts = venue.split(", ");
  return parts.length > 1 ? parts[parts.length - 1] : null;
}
