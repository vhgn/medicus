import { Id } from "@/datamodel"
import { PatientInfo } from "./PatientInfo"
import { preloadQuery } from "convex/nextjs"
import { api } from "@/convex"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { getSelf } from "../../../helpers/ssr"

export default async function PatientPage({
	params,
}: {
	params: Promise<{ id: Id<"patients"> }>
}) {
	const { id } = await params

	const token = await convexAuthNextjsToken()
	const patientQuery = await preloadQuery(
		api.discovery.getPatientInfo,
		{ patient: id },
		{ token },
	)

	const self = await getSelf()
	return <PatientInfo self={self} patientQuery={patientQuery} />
}
