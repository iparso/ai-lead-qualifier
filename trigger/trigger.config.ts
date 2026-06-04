import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_vxlrlfitajureecbnjan",
  dirs: ["./"],
  runtime: "node",
  logLevel: "info",
  maxDuration: 300,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
});
