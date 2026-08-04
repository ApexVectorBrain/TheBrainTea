// 90-day operational dataset. It uses the shared seed so the catalogue,
// financial records, and current login emails stay identical across profiles.
process.env.SEED_PROFILE = "90-day";
require("./seed");
