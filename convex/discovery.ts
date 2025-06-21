import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { paginationOptsValidator } from "convex/server"
import { internal } from "./_generated/api"

export const searchDoctorWithName = query({
	args: {
		name: v.string(),
		paginationOpts: paginationOptsValidator,
	},
	async handler(ctx, { name, paginationOpts }) {
		return await ctx.db
			.query("doctors")
			.withSearchIndex("by_name", (q) => q.search("name", name))
			.paginate(paginationOpts)
	},
})

export const searchDoctorWithTags = query({
	args: {
		query: v.string(),
		paginationOpts: paginationOptsValidator,
	},
	async handler(ctx, { query, paginationOpts }) {
		return await ctx.db
			.query("doctors")
			.withSearchIndex("by_tags", (q) => q.search("tags", query))
			.paginate(paginationOpts)
	},
})

export const getDoctorInfo = query({
	args: {
		id: v.id("doctors"),
	},
	async handler(ctx, { id }) {
		const doctor = await ctx.db.get(id)
		if (!doctor) {
			throw new ConvexError("Not found")
		}

		return doctor
	},
})

export const updateDoctor = mutation({
	args: {
		name: v.string(),
		tags: v.array(v.string()),
	},
	async handler(ctx, { name, tags }) {
		const doctor = await ctx.runQuery(internal.auth.getCurrentDoctor)
		if (!doctor) {
			throw new ConvexError("You are not a doctor")
		}

		await ctx.db.patch(doctor._id, {
			name,
			tags: tags.join(" "),
			rawTags: tags,
		})
	},
})

export const getPatientInfo = query({
	args: {
		patient: v.id("patients"),
	},
	async handler(ctx, { patient }) {
		const info = await ctx.db.get(patient)

		// TODO: Check access

		if (!info) {
			throw new ConvexError("Not found")
		}

		return info
	},
})
