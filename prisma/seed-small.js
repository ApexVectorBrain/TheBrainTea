// Compact remote-friendly seed. The shared seed implementation keeps the
// exact same schema, logins, services and financial invariants as the full
// dataset while generating only about 20–30 appointments.
process.env.SEED_PROFILE = "small";
require("./seed");
