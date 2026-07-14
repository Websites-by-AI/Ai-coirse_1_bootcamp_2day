import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: works without R2/KV bindings for first deploy.
export default defineCloudflareConfig({});
