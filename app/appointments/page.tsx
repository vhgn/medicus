"use client"

import { api } from "@/convex"
import { usePaginatedQuery } from "convex/react"
import Link from "next/link"

const LIMIT = 12
export default function AppointmentsPage() {
	const query = usePaginatedQuery(
		api.servicing.listAppointments,
		{},
		{ initialNumItems: LIMIT },
	)

	// TODO: show better
	return (
		<div>
			{query.results.map((result) => (
				<Link key={result._id} href={`/appointments/${result._id}`}>
					{result.status}
				</Link>
			))}
			<button onClick={() => query.loadMore(LIMIT)}>Load more</button>
		</div>
	)
}
