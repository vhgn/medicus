import { api } from "@/convex"
import { preloadQuery } from "convex/nextjs"
import { RoleWidget } from "./RoleWidget"

export default async function OnboardingPage() {
	const roleQuery = await preloadQuery(api.auth.currentRole)

	return <RoleWidget roleQuery={roleQuery} />
}
