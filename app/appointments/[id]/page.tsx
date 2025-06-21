import { api } from "@/convex"
import { Id } from "@/datamodel"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { preloadQuery } from "convex/nextjs"
import { AppointmentInfo } from "./AppointmentInfo"
import { getSelf } from "../../../helpers/ssr"

export default async function AppointmentPage({
	params,
}: {
	params: Promise<{ id: Id<"negotiationBases"> }>
}) {
	const { id } = await params
	const token = await convexAuthNextjsToken()
	const appointmentQuery = await preloadQuery(api.servicing.appointmentInfo, { base: id }, { token })

	const self = await getSelf()

	return <AppointmentInfo appointmentQuery={appointmentQuery} self={self} />
}
