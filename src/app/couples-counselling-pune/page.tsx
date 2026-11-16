import CampaignPage from "@/components/CampaignPage";
import { campaigns } from "@/lib/campaign-data";
import { publicPageRobots } from "@/lib/public-launch";
export const metadata = { title: "Couples and marriage counselling in Pune | The Brain Tea", description: campaigns["couples-counselling-pune"].line, robots: publicPageRobots, alternates: { canonical: "/couples-counselling-pune" } };
export default function Page() { return <CampaignPage slug="couples-counselling-pune" />; }
