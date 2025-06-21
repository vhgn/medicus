import { Infer, v } from "convex/values"
import { Doc, Id } from "./_generated/dataModel"

export const doctorRoleInput = v.object({
	role: v.literal("doctor"),
	name: v.string(),
	tags: v.array(v.string()),
})
export type DoctorRoleInput = Infer<typeof doctorRoleInput>

export const patientRoleInput = v.object({
	role: v.literal("patient"),
	name: v.string(),
})
export type PatientRoleInput = Infer<typeof patientRoleInput>

export type AppointmentInfo =
	| AppointmentWaitingDoctor
	| AppointmentWaitingPatient
	| AppointmentConfirmed

export type AppointmentWaitingDoctor = {
	_id: Id<"negotiationBases">
	status: "waitingDoctor"
	suggestions: Doc<"negotiations">[]
	suggestedDates: number[]
}
export type AppointmentWaitingPatient = {
	_id: Id<"negotiationBases">
	status: "waitingPatient"
	suggestions: Doc<"negotiations">[]
	suggestedDates: number[]
}
export type AppointmentConfirmed = {
	_id: Id<"negotiationBases">
	status: "confirmed"
	suggestedDate: number
}
