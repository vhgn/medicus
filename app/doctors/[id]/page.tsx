import { api } from "@/convex"
import { Id } from "@/datamodel"
import { preloadQuery } from "convex/nextjs"
import { DoctorInfo } from "./DoctorInfo"

export default async function DoctorPage({
	params,
}: {
	params: Promise<{ id: Id<"doctors"> }>
}) {
	const { id } = await params
	const doctorQuery = await preloadQuery(api.discovery.getDoctorInfo, { id })
	const roleQuery = await preloadQuery(api.auth.currentRole)
	return <DoctorInfo doctorQuery={doctorQuery} roleQuery={roleQuery}/>
}

