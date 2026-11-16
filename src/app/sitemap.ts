import { SITE_URL } from "@/lib/site";
export default function sitemap() { return ["", "/services", "/team", "/about", "/book", "/contact", "/faq", "/internship", "/privacy", "/terms", "/refund-policy"].map(path => ({ url: `${SITE_URL}${path}` })); }
