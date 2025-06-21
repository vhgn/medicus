import { Password } from "@convex-dev/auth/providers/Password"
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server"
import { internalQuery, mutation, query } from "./_generated/server"
import { ConvexError, v } from "convex/values"
import { doctorRoleInput, patientRoleInput } from "./types"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Password],
})

export const currentUser = query({
	async handler(ctx) {
		const user = await getAuthUserId(ctx)
		if (!user) {
			return null
		}

		return await ctx.db.get(user)
	},
})

export const currentRole = query({
	async handler(ctx) {
		const user = await getAuthUserId(ctx)
		if (!user) {
			return null
		}
		const patient = await ctx.db
			.query("patients")
			.withIndex("by_user", (q) => q.eq("user", user))
			.unique()

		if (patient) {
			return {
				type: "patient",
				patient,
			} as const
		}

		const doctor = await ctx.db
			.query("doctors")
			.withIndex("by_user", (q) => q.eq("user", user))
			.unique()

		if (doctor) {
			return {
				type: "doctor",
				doctor,
			} as const
		}

		return null
	},
})

export const createRoleForSelf = mutation({
	args: {
		payload: v.union(doctorRoleInput, patientRoleInput),
	},
	async handler(ctx, { payload }) {
		const user = await getAuthUserId(ctx)

		if (!user) {
			throw new ConvexError("User is not signed in")
		}

		switch (payload.role) {
			case "doctor":
				const doctor = await ctx.db.insert("doctors", {
					name: payload.name,
					user,
				})
				for (const tag of payload.tags) {
					await ctx.db.insert("doctorTags", {
						doctor,
						tag: tag,
					})
				}
			case "patient":
				await ctx.db.insert("patients", {
					name: payload.name,
					user,
				})
		}
	},
})

export const getCurrentPatient = internalQuery({
	async handler(ctx) {
		const user = await getAuthUserId(ctx)

		if (!user) {
			return null
		}

		const patient = await ctx.db
			.query("patients")
			.withIndex("by_user", (q) => q.eq("user", user))
			.unique()

		if (!patient) {
			return null
		}

		return patient
	},
})

export const getCurrentDoctor = internalQuery({
	async handler(ctx) {
		const user = await getAuthUserId(ctx)

		if (!user) {
			return null
		}

		const doctor = await ctx.db
			.query("doctors")
			.withIndex("by_user", (q) => q.eq("user", user))
			.unique()

		if (!doctor) {
			return null
		}

		return doctor
	},
})
