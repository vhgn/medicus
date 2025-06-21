import { v } from "convex/values"
import { query } from "./_generated/server"
import { paginationOptsValidator } from "convex/server"
import { getAllOrThrow } from "convex-helpers/server/relationships"
import { mapPaginated } from "../helpers/utils"

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
		const result = await ctx.db
			.query("doctorTags")
			.withSearchIndex("by_tag", (q) => q.search("tag", query))
			.paginate(paginationOpts)

		const doctors = await getAllOrThrow(
			ctx.db,
			result.page.map((t) => t.doctor),
		)

		return mapPaginated(result, (t) => doctors.find((d) => d._id === t.doctor)!)
	},
})
