"use client"

import { api } from "@/convex"
import { usePaginatedQuery } from "convex/react"
import { useState } from "react"
import { useThrottle } from "@/hooks/useThrottle"

const LIMIT = 12

export default function DoctorsPage() {
	const [query, setQuery] = useState("")
	const throttledQuery = useThrottle(query)

	const doctorsByTags = usePaginatedQuery(
		api.discovery.searchDoctorWithTags,
		{
			query: throttledQuery,
		},
		{
			initialNumItems: LIMIT,
		},
	)

	return (
		<div>
			<input
				value={query}
				onChange={(e) => setQuery(e.currentTarget.value)}
				placeholder="Search by tag"
			/>
			{doctorsByTags?.results.map((doctor) => (
				<div key={doctor._id}>{doctor.name}</div>
			))}
		</div>
	)
}
