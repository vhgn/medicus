"use client"

import { api } from "@/convex"
import { usePaginatedQuery } from "convex/react"
import { useState } from "react"
import { useThrottle } from "@/hooks/useThrottle"
import Link from "next/link"

const LIMIT = 12

export default function DoctorsPage() {
	return (
		<div>
			<DoctorNameSearch />
			<DoctorTagSearch />
		</div>
	)
}

function DoctorNameSearch() {
	const [query, setQuery] = useState("")
	const throttledQuery = useThrottle(query)

	const doctorsByName = usePaginatedQuery(
		api.discovery.searchDoctorWithName,
		{
			name: throttledQuery,
		},
		{
			initialNumItems: LIMIT,
		},
	)
	return (
		<div className="border-gray-100 border-s">
			<input
				value={query}
				onChange={(e) => setQuery(e.currentTarget.value)}
				placeholder="Search by name"
			/>
			{doctorsByName?.results.map((doctor) => (
				<DoctorCard key={doctor._id} doctor={doctor} />
			))}
		</div>
	)
}
function DoctorTagSearch() {
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
		<div className="border-gray-100 border-s">
			<input
				value={query}
				onChange={(e) => setQuery(e.currentTarget.value)}
				placeholder="Search by tag"
			/>
			{doctorsByTags?.results.map((doctor) => (
				<DoctorCard key={doctor._id} doctor={doctor} />
			))}
		</div>
	)
}

interface DoctorCardProps {
	doctor: (typeof api.discovery.searchDoctorWithName._returnType.page)[number]
}

function DoctorCard(props: DoctorCardProps) {
	return (
		<Link href={`/doctors/${props.doctor._id}`} key={props.doctor._id}>
			{props.doctor.name}
		</Link>
	)
}
