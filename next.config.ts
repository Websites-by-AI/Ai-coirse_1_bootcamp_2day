import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer", "pg"],
  poweredByHeader: false,
};

export default nextConfig;
