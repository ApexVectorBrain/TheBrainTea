import { handleApi, forbidden, requireTherapist } from "@/server/http";

// Leave is intentionally staff-managed. Keep this endpoint as an explicit
// denial so old consultant portal clients cannot mutate availability.
export const POST = handleApi(async (request: Request) => {
  await requireTherapist(request);
  throw forbidden("Leave is managed by reception or an administrator");
});
