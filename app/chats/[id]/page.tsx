import { api } from "@/convex"
import { Id } from "@/datamodel"
import { preloadQuery } from "convex/nextjs"
import { ChatMessages } from "./ChatMessage"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { getSelf } from "../../../helpers/ssr"
import { redirect } from "next/navigation"

export default async function ChatPage({
	params,
}: {
	params: Promise<{ id: Id<"chats"> }>
}) {
	const { id } = await params
	const token = await convexAuthNextjsToken()
	const messagesQuery = await preloadQuery(
		api.chat.listMessages,
		{
			chat: id,
		},
		{ token },
	)
	const chatQuery = await preloadQuery(
		api.chat.getChatInfo,
		{
			chat: id,
		},
		{ token },
	)

	const self = await getSelf()

	if (!self) {
		redirect("/chats")
	}

	return (
		<ChatMessages
			messagesQuery={messagesQuery}
			chatQuery={chatQuery}
			self={self}
		/>
	)
}
