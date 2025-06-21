import { api } from "@/convex"
import {
	AppointmentConfirmed,
	AppointmentWaitingDoctor,
	AppointmentWaitingPatient,
} from "@/types"
import { Doc } from "@convex-dev/auth/server"
import { Preloaded, usePreloadedQuery } from "convex/react"

interface ApppointmentInfoProps {
	self: Doc<"users">
	appointmentQuery: Preloaded<typeof api.servicing.appointmentInfo>
}
export function AppointmentInfo({
	self,
	appointmentQuery,
}: ApppointmentInfoProps) {
	const appointment = usePreloadedQuery(appointmentQuery)

	switch (appointment.status) {
		case "waitingDoctor":
			return <WaitingDoctor info={appointment} self={self} />
		case "waitingPatient":
			return <WaitingPatient info={appointment} self={self} />
		case "confirmed":
			return <Confirmed info={appointment} self={self} />
	}
}

interface WaitingDoctorProps {
	info: AppointmentWaitingDoctor
	self: Doc<"users">
}
function WaitingDoctor({ info }: WaitingDoctorProps) {
	return <div>waiting doctor {info.status}</div>
}

interface WaitingPatientProps {
	info: AppointmentWaitingPatient
	self: Doc<"users">
}
function WaitingPatient({ info }: WaitingPatientProps) {
	return <div>waiting patient {info.status}</div>
}

interface ConfirmedProps {
	info: AppointmentConfirmed
	self: Doc<"users">
}
function Confirmed({ info }: ConfirmedProps) {
	return <div>confirmed {info.status}</div>
}
