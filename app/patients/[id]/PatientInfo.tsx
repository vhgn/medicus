import { api } from "@/convex"
import { Doc } from "@/datamodel"
import { Preloaded, usePreloadedQuery } from "convex/react"

export function PatientInfo({
	patientQuery,
	self,
}: {
	patientQuery: Preloaded<typeof api.discovery.getPatientInfo>
	self: null | Doc<"users">
}) {
	const patient = usePreloadedQuery(patientQuery)

	const isMe = self && patient.user === self._id

	return (
		<div>
			{patient.name}
			{isMe && "ME"}
		</div>
	)
}
