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
			<h2>Chats</h2>
			<div className="flex flex-col">
				{chatsQuery.results.map((chat) => (
					<Link key={chat._id} href={`/chats/${chat._id}`} className="card">
						{chat.name} {new Date(chat._creationTime).toLocaleString()}
					</Link>
				))}
			</div>
			{chatsQuery.status === "CanLoadMore" && (
				<button onClick={() => chatsQuery.loadMore(LIMIT)}>Load more</button>
			)}
		</div>
	)
}
