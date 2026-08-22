import { forbidden, handleApi, requireTherapist } from "@/server/http";

// Leave is intentionally staff-managed. Existing clients cannot remove a
// block directly, even if they know a historical block id.
export const DELETE = handleApi(async (request: Request) => {
  await requireTherapist(request);
  throw forbidden("Leave is managed by reception or an administrator");
});
