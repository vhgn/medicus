import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"
import { migrationsTable } from "convex-helpers/server/migrations"

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
	...authTables,
	doctors: defineTable({
		name: v.string(),
		user: v.id("users"),
		tags: v.string(),
		rawTags: v.array(v.string()),
	})
		.index("by_user", ["user"])
		.searchIndex("by_name", {
			searchField: "name",
		})
		.searchIndex("by_tags", {
			searchField: "tags",
		}),
	patients: defineTable({
		name: v.string(),
		user: v.id("users"),
	})
		.index("by_user", ["user"])
		.searchIndex("by_name", {
			searchField: "name",
		}),
	appointments: defineTable({
		patient: v.id("patients"),
		doctor: v.id("doctors"),
		startsAt: v.number(),
		durationMinutes: v.number(),
		confirmation: v.id("negotiationConfirmations"),
	}),
	negotiationConfirmations: defineTable({
		base: v.id("negotiationBases"),
		suggestedDate: v.number(),
	}),
	negotiations: defineTable({
		subject: v.union(
			v.object({
				type: v.literal("doctor"),
				id: v.id("doctors"),
			}),
			v.object({
				type: v.literal("patient"),
				id: v.id("patients"),
			}),
		),
		suggestedDates: v.array(v.number()),
		base: v.id("negotiationBases"),
	}).index("by_base", ["base"]),
	negotiationBases: defineTable({
		patient: v.id("patients"),
		doctor: v.id("doctors"),
		durationMinutes: v.number(),
	}),
	chats: defineTable({
		name: v.string(),
	}),
	chatMembers: defineTable({
		chat: v.id("chats"),
		user: v.id("users"),
		accepted: v.boolean(),
	})
		.index("by_user", ["user"])
		.index("by_chat", ["chat"])
		.index("by_chat_user", ["chat", "user"])
		.index("by_user_accepted", ["user", "accepted"]),
	messages: defineTable({
		chat: v.id("chats"),
		content: v.string(),
		sender: v.id("users"),
	}).index("by_chat", ["chat"]),
	migrations: migrationsTable,
})
