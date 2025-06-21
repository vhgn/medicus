import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			allowedOrigins: ["medicus.aldente.am"],
		},
	},
}

export default nextConfig
