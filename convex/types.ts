import { Infer, v } from "convex/values"

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
