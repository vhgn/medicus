import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			allowedOrigins: ["medicus.aldente.am"],
		},
	},
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.devtool = "source-map"
		}
		return config
	},
}

export default nextConfig
