import CampaignPage from "@/components/CampaignPage";
import { campaigns } from "@/lib/campaign-data";
import { publicPageRobots } from "@/lib/public-launch";
export const metadata = { title: "Online counselling with Pune psychologists | The Brain Tea", description: campaigns["online-counselling"].line, robots: publicPageRobots, alternates: { canonical: "/online-counselling" } };
export default function Page() { return <CampaignPage slug="online-counselling" />; }
