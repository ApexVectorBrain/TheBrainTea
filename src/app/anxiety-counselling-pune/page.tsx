import CampaignPage from "@/components/CampaignPage";
import { campaigns } from "@/lib/campaign-data";
import { publicPageRobots } from "@/lib/public-launch";
export const metadata = { title: "Counselling for anxiety and overthinking in Pune | The Brain Tea", description: campaigns["anxiety-counselling-pune"].line, robots: publicPageRobots, alternates: { canonical: "/anxiety-counselling-pune" } };
export default function Page() { return <CampaignPage slug="anxiety-counselling-pune" />; }
