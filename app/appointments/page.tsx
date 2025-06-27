"use client"

import { api } from "@/convex"
import { AppointmentInfo } from "@/types"
import { usePaginatedQuery } from "convex/react"
import Link from "next/link"

const LIMIT = 12
export default function AppointmentsPage() {
	const query = usePaginatedQuery(
		api.servicing.listAppointments,
		{},
		{ initialNumItems: LIMIT },
	)

	return (
		<div>
			{query.results.length === 0 && (
				<div>
					<h2>No appointments</h2>
					<Link prefetch href="/doctors">
						Find doctor
					</Link>
				</div>
			)}
			{query.results.map((result) => (
				<Link href={`/appointments/${result._id}`} key={result._id}>
					<AppointmentCard info={result} />
				</Link>
			))}
			{query.status === "CanLoadMore" && (
				<button onClick={() => query.loadMore(LIMIT)}>Load more</button>
			)}
		</div>
	)
}

interface AppointmentCardProps {
	info: AppointmentInfo
}
function AppointmentCard({ info }: AppointmentCardProps) {
	switch (info.status) {
		case "waitingDoctor":
			return (
				<div className="bg-blue-500">Waiting for confirmation from doctor</div>
			)
		case "waitingPatient":
			return (
				<div className="bg-orange-500">
					Waiting for confirmation from patient
				</div>
			)
		case "confirmed":
			return <div className="bg-green-500">Confirmed</div>
	}
}
