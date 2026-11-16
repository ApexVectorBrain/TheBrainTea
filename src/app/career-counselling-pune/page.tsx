import CampaignPage from "@/components/CampaignPage";
import { campaigns } from "@/lib/campaign-data";
import { publicPageRobots } from "@/lib/public-launch";
export const metadata = { title: "Career and academic counselling in Pune | The Brain Tea", description: campaigns["career-counselling-pune"].line, robots: publicPageRobots, alternates: { canonical: "/career-counselling-pune" } };
export default function Page() { return <CampaignPage slug="career-counselling-pune" />; }
