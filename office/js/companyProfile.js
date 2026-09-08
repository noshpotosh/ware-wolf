export const FOUNDING_TEAM_SIZE = 3;

const EMPLOYEE_IDS = new Set([
  "fabrizio", "maeve", "dex", "cal", "reed",
]);
const LEADERSHIP_STYLES = new Set(["visionary", "operator", "coach"]);
const COMPANY_FOCUSES = new Set([
  "web-products", "games", "internal-tools",
]);

function cleanText(value, maximumLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maximumLength);
}

export function createCompanyProfile(input) {
  const founderName = cleanText(input?.founderName, 24);
  const companyName = cleanText(input?.companyName, 30);
  const companyMotto = cleanText(input?.companyMotto, 90);
  const leadershipStyle = input?.leadershipStyle;
  const companyFocus = input?.companyFocus;
  const employeeIds = [...new Set(input?.employeeIds || [])]
    .filter(id => EMPLOYEE_IDS.has(id));

  const profileIsComplete = founderName && companyName
    && LEADERSHIP_STYLES.has(leadershipStyle)
    && COMPANY_FOCUSES.has(companyFocus)
    && employeeIds.length === FOUNDING_TEAM_SIZE;
  if (!profileIsComplete) return null;

  return {
    founderName,
    leadershipStyle,
    companyName,
    companyMotto,
    companyFocus,
    employeeIds,
  };
}
