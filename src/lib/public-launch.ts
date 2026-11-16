// Enable only on the approved production deployment after clinic review.
export const publicLaunchReady = process.env.PUBLIC_MARKETING_LAUNCH_READY === "true";
export const publicPageRobots = { index: publicLaunchReady, follow: true };
