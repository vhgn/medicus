import { ConvexError, v } from "convex/values"
import { internalQuery, mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"
import { internal } from "./_generated/api"
import { paginationOptsValidator } from "convex/server"
import { assertAuthUser } from "../helpers/auth"
import { mapPaginated } from "../helpers/utils"
import { getAllOrThrow } from "convex-helpers/server/relationships"

export const startChat = mutation({
	args: {
		name: v.string(),
		participant: v.id("users"),
		appointment: v.optional(v.id("negotiationBases"))
	},
	async handler(ctx, { name, participant, appointment }) {
		const user = await getAuthUserId(ctx)
		if (!user) {
			throw new ConvexError("Should be logged in to start chat")
		}

		const userRole = await ctx.runQuery(internal.auth.userRole, {
			user: participant,
		})

		if (!userRole) {
			throw new ConvexError("Participant does not exist")
		}
		const chat = await ctx.db.insert("chats", {
			name,
			appointment,
		})

		await ctx.db.insert("chatMembers", {
			chat,
			user: user,
			accepted: true,
		})

		await ctx.db.insert("chatMembers", {
			chat,
			user: userRole.info.user,
			accepted: false,
		})

		return chat
	},
})

export const listChats = query({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	async handler(ctx, { paginationOpts }) {
		const user = await assertAuthUser(ctx)
		const members = await ctx.db
			.query("chatMembers")
			.withIndex("by_user", (q) => q.eq("user", user))
			.paginate(paginationOpts)

		const chats = await getAllOrThrow(
			ctx.db,
			members.page.map((p) => p.chat),
		)

		return mapPaginated(members, (m) => chats.find((c) => c._id === m.chat)!)
	},
})

export const listInvitations = query({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	async handler(ctx, { paginationOpts }) {
		const user = await getAuthUserId(ctx)
		if (!user) {
			throw new ConvexError("Should be logged in")
		}
		return await ctx.db
			.query("chatMembers")
			.withIndex("by_user_accepted", (q) =>
				q.eq("user", user).eq("accepted", true),
			)
			.paginate(paginationOpts)
	},
})

export const amIChatMember = internalQuery({
	args: {
		chat: v.id("chats"),
	},
	async handler(ctx, { chat }) {
		const user = await assertAuthUser(ctx)
		const member = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chat", chat).eq("user", user))
			.first()

		if (!member) {
			return false
		} else {
			return true
		}
	},
})

export const sendMessage = mutation({
	args: {
		chat: v.id("chats"),
		content: v.string(),
	},
	async handler(ctx, { chat, content }) {
		const user = await assertAuthUser(ctx)
		const isChatMember = await ctx.runQuery(internal.chat.amIChatMember, {
			chat,
		})
		if (!isChatMember) {
			throw new ConvexError("Not a member of chat")
		}
		await ctx.db.insert("messages", {
			chat,
			content,
			sender: user,
		})
	},
})

export const listMessages = query({
	args: {
		chat: v.id("chats"),
	},
	async handler(ctx, { chat }) {
		const isChatMember = await ctx.runQuery(internal.chat.amIChatMember, {
			chat,
		})
		if (!isChatMember) {
			throw new ConvexError("Not a member of chat")
		}

		const messages = await ctx.db
			.query("messages")
			.withIndex("by_chat", (q) => q.eq("chat", chat))
			.collect()
		return messages
	},
})

export const getChatInfo = query({
	args: {
		chat: v.id("chats"),
	},
	async handler(ctx, { chat }) {
		const isChatMember = await ctx.runQuery(internal.chat.amIChatMember, {
			chat,
		})
		if (!isChatMember) {
			throw new ConvexError("Not a member of chat")
		}

		const info = await ctx.db.get(chat)
		if (!info) {
			throw new ConvexError("Chat does not exist")
		}

		return info
	},
})
