import { ConvexError, v } from "convex/values"
import {
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server"
import { api, internal } from "./_generated/api"
import { paginationOptsValidator } from "convex/server"
import { Id } from "./_generated/dataModel"
import { mapPaginated } from "../helpers/utils"
import { AppointmentInfo } from "./types"

export const createAppointmentWithDoctor = mutation({
	args: {
		suggestedDates: v.array(v.number()),
		durationMinutes: v.number(),
		doctor: v.id("doctors"),
	},
	async handler(ctx, { suggestedDates, durationMinutes, doctor }) {
		const patient = await ctx.runQuery(internal.auth.getCurrentPatient)

		if (!patient) {
			throw new ConvexError("Current user is not a patient")
		}

		const base = await ctx.db.insert("negotiationBases", {
			doctor,
			patient: patient._id,
			durationMinutes,
		})

		await ctx.db.insert("negotiations", {
			base,
			suggestedDates,
			subject: {
				type: "patient",
				id: patient._id,
			},
		})
	},
})

export const suggestDatesToPatient = mutation({
	args: {
		suggestedDates: v.array(v.number()),
		base: v.id("negotiationBases"),
	},
	async handler(ctx, { base, suggestedDates }) {
		const doctor = await ctx.runQuery(internal.auth.getCurrentDoctor)

		if (!doctor) {
			throw new ConvexError("Current user is not a doctor")
		}

		const negotiationBase = await ctx.db.get(base)

		if (!negotiationBase) {
			throw new ConvexError("Negotiation not found")
		}

		if (negotiationBase.doctor !== doctor._id) {
			throw new ConvexError("Doctor cannot suggest other's date")
		}

		await ctx.db.insert("negotiations", {
			base,
			suggestedDates,
			subject: {
				type: "doctor",
				id: doctor._id,
			},
		})
	},
})

export const suggestDatesToDoctor = mutation({
	args: {
		suggestedDates: v.array(v.number()),
		base: v.id("negotiationBases"),
	},
	async handler(ctx, { base, suggestedDates }) {
		const patient = await ctx.runQuery(internal.auth.getCurrentPatient)
		if (!patient) {
			throw new ConvexError("Current user is not a doctor")
		}

		const negotiationBase = await ctx.db.get(base)

		if (!negotiationBase) {
			throw new ConvexError("Negotiation not found")
		}

		if (negotiationBase.patient !== patient._id) {
			throw new ConvexError("Patient cannot suggest other's date")
		}

		await ctx.db.insert("negotiations", {
			base,
			suggestedDates,
			subject: {
				type: "patient",
				id: patient._id,
			},
		})
	},
})

export const confirmAppointmentDate = mutation({
	args: {
		base: v.id("negotiationBases"),
		suggestedDate: v.number(),
	},
	async handler(ctx, { base, suggestedDate }) {
		const latest = await ctx.db
			.query("negotiations")
			.withIndex("by_base", (q) => q.eq("base", base))
			.order("desc")
			.first()

		if (!latest) {
			throw new ConvexError("Cannot confirm without negotiations")
		}

		const negotiationBase = await ctx.db.get(base)
		if (!negotiationBase) {
			throw new ConvexError("Negotiation base does not exist")
		}

		const doctor = await ctx.runQuery(internal.auth.getCurrentDoctor)
		if (doctor && negotiationBase.doctor === doctor._id) {
			await ctx.runMutation(internal.servicing.createAppointmentConfirmation, {
				base,
				suggestedDate,
			})
		}

		const patient = await ctx.runQuery(internal.auth.getCurrentPatient)
		if (patient && negotiationBase.patient === patient._id) {
			await ctx.runMutation(internal.servicing.createAppointmentConfirmation, {
				base,
				suggestedDate,
			})
		}

		throw new ConvexError("User does not have access to confirm")
	},
})

export const createAppointmentConfirmation = internalMutation({
	args: {
		base: v.id("negotiationBases"),
		suggestedDate: v.number(),
	},
	async handler(ctx, { base, suggestedDate }) {
		const negotiationBase = await ctx.db.get(base)

		if (!negotiationBase) {
			throw new ConvexError("Negotiation base does not exist")
		}

		const confirmation = await ctx.db.insert("negotiationConfirmations", {
			base,
			suggestedDate,
		})

		await ctx.db.insert("appointments", {
			doctor: negotiationBase.doctor,
			patient: negotiationBase.patient,
			startsAt: suggestedDate,
			durationMinutes: negotiationBase.durationMinutes,
			confirmation,
		})
	},
})

export const appointmentNotes = query({
	args: {
		appointment: v.id("appointments"),
	},
	async handler(ctx, { appointment }) {
		const doctor = await ctx.runQuery(internal.auth.getCurrentDoctor)

		if (!doctor) {
			throw new ConvexError("Should be a doctor")
		}

		const info = await ctx.db.get(appointment)
		if (!info) {
			throw new ConvexError("Appointment not found")
		}

		if (info.doctor !== doctor._id) {
			throw new ConvexError("No access to appointment")
		}

		const notes = await ctx.db
			.query("appointmentNotes")
			.withIndex("by_appointment", (q) => q.eq("appointment", appointment))
			.collect()

		return notes
	},
})

export const listAppointmentsForPatient = query({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	async handler(ctx, { paginationOpts }) {
		const patient = await ctx.runQuery(internal.auth.getCurrentPatient)
		if (!patient) {
			throw new ConvexError("Not a patient")
		}
		const id: Id<"patients"> = patient._id
		const pages = await ctx.db
			.query("negotiationBases")
			.withIndex("by_patient", (q) => q.eq("patient", id))
			.paginate(paginationOpts)

		const infos = new Map<Id<"negotiationBases">, AppointmentInfo>()
		for (const base of pages.page) {
			const info = await ctx.runQuery(internal.servicing.getAppointmentInfo, {
				base: base._id,
			})
			infos.set(base._id, info)
		}

		return mapPaginated(pages, (base) => {
			return infos.get(base._id)!
		})
	},
})

export const appointmentInfo = query({
	args: {
		base: v.id("negotiationBases"),
	},
	async handler(ctx, { base }): Promise<AppointmentInfo> {
		const info = await ctx.db.get(base)
		if (!info) {
			throw new ConvexError("Appointment not found")
		}

		const role = await ctx.runQuery(api.auth.currentRole)
		if (!role) {
			throw new ConvexError("Should have a role")
		}

		if (role.role === "doctor") {
			if (info.doctor !== role.info._id) {
				throw new ConvexError("Doctor does not have access")
			}
		}

		if (role.role === "patient") {
			if (info.patient !== role.info._id) {
				throw new ConvexError("Patient does not have access")
			}
		}

		return await ctx.runQuery(internal.servicing.getAppointmentInfo, { base })
	},
})
export const getAppointmentInfo = internalQuery({
	args: {
		base: v.id("negotiationBases"),
	},
	async handler(ctx, { base }): Promise<AppointmentInfo> {
		const confirmation = await ctx.db
			.query("negotiationConfirmations")
			.withIndex("by_base", (q) => q.eq("base", base))
			.unique()

		if (confirmation) {
			return {
				_id: base,
				status: "confirmed",
				suggestedDate: confirmation.suggestedDate,
			}
		}

		const suggestions = await ctx.db
			.query("negotiations")
			.withIndex("by_base", (q) => q.eq("base", base))
			.collect()

		const latest = suggestions[0]
		if (latest.subject.type === "doctor") {
			return {
				_id: base,
				status: "waitingPatient",
				suggestedDates: latest.suggestedDates,
				suggestions,
			}
		} else {
			return {
				_id: base,
				status: "waitingDoctor",
				suggestedDates: latest.suggestedDates,
				suggestions,
			}
		}
	},
})
