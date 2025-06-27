"use client"
import { api } from "@/convex"
import { Doc, Id } from "@/datamodel"
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react"
import Link from "next/link"
import { useState } from "react"

interface ChatMessagesProps {
	chatQuery: Preloaded<typeof api.chat.getChatInfo>
	messagesQuery: Preloaded<typeof api.chat.listMessages>
	self: Doc<"users">
}
export function ChatMessages({
	chatQuery,
	messagesQuery,
	self,
}: ChatMessagesProps) {
	const chat = usePreloadedQuery(chatQuery)
	const messages = usePreloadedQuery(messagesQuery)

	const [message, setMessage] = useState("")

	const sendMessage = useMutation(api.chat.sendMessage).withOptimisticUpdate(
		(localQueryStore, { chat, content }) => {
			const query = localQueryStore.getQuery(api.chat.listMessages, { chat })
			query?.push({
				_id: crypto.randomUUID() as Id<"messages">,
				_creationTime: Date.now(),
				chat,
				content,
				sender: self._id,
			})
			localQueryStore.setQuery(api.chat.listMessages, { chat }, query)
		},
	)

	const acceptInvitation = useMutation(api.chat.acceptInvitation)

	if (!chat.accepted) {
		return (
			<div>
				<h2>You have not yet accepted the invitation</h2>
				<button onClick={() => acceptInvitation({ chat: chat._id })}>
					Accept invitation
				</button>
			</div>
		)
	}

	return (
		<div>
			<p>{chat.name}</p>
			{chat.appointment && (
				<Link href={`/appointments/${chat.appointment}`}>
					Go to Appointment
				</Link>
			)}
			<div>
				{messages.map((message) => (
					<Message key={message._id} message={message} self={self} />
				))}
			</div>
			<form
				onSubmit={async (e) => {
					e.preventDefault()
					setMessage("")
					await sendMessage({ chat: chat._id, content: message })
				}}
			>
				<input
					value={message}
					onChange={(e) => setMessage(e.currentTarget.value)}
					placeholder="Your message"
				/>
				<button>Send</button>
			</form>
		</div>
	)
}

interface MessageProps {
	message: Doc<"messages">
	self: Doc<"users">
}
function Message({ self, message }: MessageProps) {
	return (
		<div
			className={
				message.sender === self._id
					? "bg-blue-300 text-black"
					: "bg-gray-300 text-white"
			}
		>
			{message.content}
		</div>
	)
}
