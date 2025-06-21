import { api } from "@/convex"
import { Id } from "@/datamodel"
import { Preloaded, usePreloadedQuery } from "convex/react"

export function PatientInfo({
	patientQuery,
	roleQuery,
	self,
}: {
	patientQuery: Preloaded<typeof api.discovery.getPatientInfo>
	roleQuery: Preloaded<typeof api.auth.currentRole>
	self: null | Id<"users">
}) {
	const patient = usePreloadedQuery(patientQuery)
	const role = usePreloadedQuery(roleQuery)

	const isMe = role?.info.user === self && self !== null
	return (
		<div>
			{patient.name}
			{isMe && "ME"}
		</div>
	)
}
