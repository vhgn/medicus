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

export type AppointmentSuggestion = Doc<"negotiations">

export type AppointmentWaitingDoctor = {
	_id: Id<"negotiationBases">
	status: "waitingDoctor"
	suggestions: AppointmentSuggestion[]
	last: AppointmentSuggestion
}
export type AppointmentWaitingPatient = {
	_id: Id<"negotiationBases">
	status: "waitingPatient"
	suggestions: AppointmentSuggestion[]
	last: AppointmentSuggestion
}
export type AppointmentConfirmed = {
	_id: Id<"negotiationBases">
	status: "confirmed"
	suggestedDate: number
	patient: Doc<"patients">
	doctor: Doc<"doctors">
}

export type UserRole =
	| { role: "patient"; info: Doc<"patients"> }
	| { role: "doctor"; info: Doc<"doctors"> }
