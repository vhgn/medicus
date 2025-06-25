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
		<div className="card">
			<h2>Find by name</h2>
			<input
				value={query}
				onChange={(e) => setQuery(e.currentTarget.value)}
				placeholder="Search by name"
			/>
			<div className="card">
				<h2>Results</h2>
				{doctorsByName?.results.map((doctor) => (
					<DoctorCard key={doctor._id} doctor={doctor} />
				))}
			</div>
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
		<div className="card">
			<h2>Find by treatment</h2>
			<input
				value={query}
				onChange={(e) => setQuery(e.currentTarget.value)}
				placeholder="Search by treatment"
			/>

			<div className="card">
				<h2>Results</h2>
				{doctorsByTags?.results.map((doctor) => (
					<DoctorCard key={doctor._id} doctor={doctor} />
				))}
			</div>
		</div>
	)
}

interface DoctorCardProps {
	doctor: (typeof api.discovery.searchDoctorWithName._returnType.page)[number]
}

function DoctorCard(props: DoctorCardProps) {
	return (
		<div className="card">
			<Link href={`/doctors/${props.doctor._id}`} key={props.doctor._id}>
				{props.doctor.name}
			</Link>
			<div>
				{props.doctor.rawTags.map((tag, index) => (
					<span key={index}>{tag}</span>
				))}
			</div>
		</div>
	)
}
