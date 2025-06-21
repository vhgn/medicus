import { ConvexError, v } from "convex/values"
import { internalMutation, mutation } from "./_generated/server"
import { internal } from "./_generated/api"

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
