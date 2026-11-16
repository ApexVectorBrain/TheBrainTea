import { publicLaunchReady } from "@/lib/public-launch";
import { SITE_URL, CAMPAIGN_PATHS } from "@/lib/site";
export default function sitemap() { return ["", "/services", "/team", "/about", "/book", "/contact", "/faq", "/internship", "/privacy", "/terms", "/refund-policy", ...(publicLaunchReady ? [...CAMPAIGN_PATHS, "/workshops"] : [])].map(path => ({ url: `${SITE_URL}${path}` })); }
