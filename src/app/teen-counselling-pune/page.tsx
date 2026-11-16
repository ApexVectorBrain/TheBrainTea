import CampaignPage from "@/components/CampaignPage";
import { campaigns } from "@/lib/campaign-data";
import { publicPageRobots } from "@/lib/public-launch";
export const metadata = { title: "Counselling for children and teenagers in Pune | The Brain Tea", description: campaigns["teen-counselling-pune"].line, robots: publicPageRobots, alternates: { canonical: "/teen-counselling-pune" } };
export default function Page() { return <CampaignPage slug="teen-counselling-pune" />; }
