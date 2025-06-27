import { ConvexError, v } from "convex/values"
import { internalQuery, mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"
import { api, internal } from "./_generated/api"
import { paginationOptsValidator } from "convex/server"
import { assertAuthUser } from "../helpers/auth"
import { mapPaginated } from "../helpers/utils"
import { getAllOrThrow } from "convex-helpers/server/relationships"
import { Doc } from "./_generated/dataModel"

export const startChat = mutation({
	args: {
		name: v.string(),
		participant: v.id("users"),
		appointment: v.optional(v.id("negotiationBases")),
	},
	async handler(ctx, { name, participant, appointment }) {
		const user = await getAuthUserId(ctx)
		if (!user) {
			throw new ConvexError("Should be logged in to start chat")
		}

		const participantRole = await ctx.runQuery(internal.auth.userRole, {
			user: participant,
		})

		let accepted = false
		if (appointment) {
			const info = await ctx.runQuery(api.servicing.canAccessAppointment, {
				base: appointment,
			})
			if (!info) {
				throw new ConvexError(
					"Cannot start chat with appointment without access",
				)
			}
			accepted = true
		}

		if (!participantRole) {
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
			user: participantRole.info.user,
			accepted,
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

			console.log("Member", members)

		return mapPaginated(members, (m) => {
			return {
				...chats.find((c) => c._id === m.chat)!,
				accepted: m.accepted,
			}
		})
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
			.unique()

		return member
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

export const acceptInvitation = mutation({
	args: {
		chat: v.id("chats"),
	},
	async handler(ctx, { chat }) {
		const member = await ctx.runQuery(internal.chat.amIChatMember, { chat })
		if (!member) {
			throw new ConvexError("You are not a member of chat")
		}

		if (member.accepted) {
			throw new ConvexError("Already accepted")
		}

		await ctx.db.patch(member._id, {
			accepted: true,
		})
	},
})

export const getChatInfo = query({
	args: {
		chat: v.id("chats"),
	},
	async handler(ctx, { chat }): Promise<Doc<"chats"> & { accepted: boolean }> {
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

		return {
			...info,
			accepted: isChatMember.accepted,
		}
	},
})
