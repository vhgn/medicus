"use client"

import { api } from "@/convex/_generated/api"
import { usePaginatedQuery } from "convex/react"
import { useState } from "react"

const LIMIT = 12

export default function DoctorsPage() {
	const [query, setQuery] = useState("")
	console.log("Q", query)
	const doctorsByTags = usePaginatedQuery(
		api.discovery.searchDoctorWithTags,
		{
			query,
		},
		{
			initialNumItems: LIMIT,
		},
	)

	return (
		<div>
			<input value={query} onChange={(e) => setQuery(e.currentTarget.value)} placeholder="Search by tag" />
			{doctorsByTags?.results.map((doctor) => (
				<div key={doctor._id}>{doctor.name}</div>
			))}
		</div>
	)
}
