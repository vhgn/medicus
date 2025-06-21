"use client"
import { api } from "@/convex"
import { usePaginatedQuery } from "convex/react"
import Link from "next/link"

const LIMIT = 12
export default function ChatsPage() {
	const chatsQuery = usePaginatedQuery(
		api.chat.listChats,
		{},
		{
			initialNumItems: LIMIT,
		},
	)

	return (
		<div>
			<div>
				{chatsQuery.results.map((chat) => (
					<Link key={chat._id} href={`/chats/${chat._id}`}>
						{chat.name}
					</Link>
				))}
			</div>
			<button onClick={() => chatsQuery.loadMore(LIMIT)}>Load more</button>
		</div>
	)
}
