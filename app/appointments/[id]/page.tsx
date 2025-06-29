import { api } from "@/convex"
import { Id } from "@/datamodel"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { preloadQuery } from "convex/nextjs"
import { AppointmentInfo } from "./AppointmentInfo"
import { getSelf } from "../../../helpers/ssr"
import { redirect } from "next/navigation"

export default async function AppointmentPage({
	params,
}: {
	params: Promise<{ id: Id<"negotiationBases"> }>
}) {
	const { id } = await params
	const token = await convexAuthNextjsToken()
	const appointmentQuery = await preloadQuery(api.servicing.appointmentInfo, { base: id }, { token })
	const roleQuery = await preloadQuery(api.auth.currentRole, {}, { token })

	const self = await getSelf()

	if (!self) {
		redirect("/appointments")
	}

	return <AppointmentInfo appointmentQuery={appointmentQuery} roleQuery={roleQuery} />
}
