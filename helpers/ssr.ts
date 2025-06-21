import { api } from "@/convex"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"

export async function getSelf() {
	const token = await convexAuthNextjsToken()
	const self = await fetchQuery(api.auth.currentUser, {}, { token })

	return self
}
