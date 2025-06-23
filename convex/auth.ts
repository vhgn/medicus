import { Password } from "@convex-dev/auth/providers/Password"
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server"
import { internalQuery, mutation, query } from "./_generated/server"
import { ConvexError, v } from "convex/values"
import { doctorRoleInput, patientRoleInput, UserRole } from "./types"
import { internal } from "./_generated/api"
import { DataModel } from "./_generated/dataModel"
import { assertAuthUser, assertAuthUserInfo } from "../helpers/auth"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Password],
})

export const currentUser = query({
	async handler(ctx) {
		return await assertAuthUserInfo(ctx).catch(() => null)
	},
})

export const currentUserId = query({
	async handler(ctx) {
		const user = await getAuthUserId(ctx)
		if (!user) {
			throw new ConvexError("Not logged in")
		}

		return user
	},
})

export const currentRole = query({
	async handler(ctx): Promise<null | UserRole> {
		const user = await getAuthUserId(ctx)
		if (!user) {
			return null
		}

		const role = await ctx.runQuery(internal.auth.userRole, { user })
		return role
	},
})

export const userRole = internalQuery({
	args: {
		user: v.id("users"),
	},
	async handler(ctx, { user }): Promise<null | UserRole> {
		const patient = await ctx.db
			.query("patients")
			.withIndex("by_user", (q) => q.eq("user", user))
			.unique()

		if (patient) {
			return {
				role: "patient",
				info: patient,
			} as const
		}

		const doctor = await ctx.db
			.query("doctors")
			.withIndex("by_user", (q) => q.eq("user", user))
			.unique()

		if (doctor) {
			return {
				role: "doctor",
				info: doctor,
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
		const user = await assertAuthUser(ctx)

		switch (payload.role) {
			case "doctor":
				await ctx.db.insert("doctors", {
					name: payload.name,
					user,
					tags: payload.tags.join(" "),
					rawTags: payload.tags,
				})
				break
			case "patient":
				await ctx.db.insert("patients", {
					name: payload.name,
					user,
				})
				break
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
