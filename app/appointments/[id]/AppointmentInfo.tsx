"use client"

import { SuggestOtherDates } from "@/components/SuggestOtherDates"
import { api } from "@/convex"
import {
	AppointmentConfirmed,
	AppointmentSuggestion,
	AppointmentWaitingDoctor,
	AppointmentWaitingPatient,
	UserRole,
} from "@/types"
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ApppointmentInfoProps {
	roleQuery: Preloaded<typeof api.auth.currentRole>
	appointmentQuery: Preloaded<typeof api.servicing.appointmentInfo>
}
export function AppointmentInfo({
	roleQuery,
	appointmentQuery,
}: ApppointmentInfoProps) {
	const appointment = usePreloadedQuery(appointmentQuery)
	const role = usePreloadedQuery(roleQuery)

	switch (appointment.status) {
		case "waitingDoctor":
			return <WaitingDoctor info={appointment} role={role} />
		case "waitingPatient":
			return <WaitingPatient info={appointment} role={role} />
		case "confirmed":
			return <Confirmed info={appointment} role={role} />
	}
}

interface WaitingDoctorProps {
	info: AppointmentWaitingDoctor
	role: null | UserRole
}
function WaitingDoctor({ info, role }: WaitingDoctorProps) {
	const shouldSuggest = role?.info._id === info.last.subject.id
	const suggest = useMutation(api.servicing.suggestDatesToPatient)

	return (
		<div>
			<h2>Waiting for doctor confirmation</h2>
			{info.suggestions.map((suggestion) => (
				<Suggestion key={suggestion._id} info={suggestion} />
			))}
			<Suggestion info={info.last} shouldSuggest={shouldSuggest} />
			{shouldSuggest && (
				<SuggestOtherDates
					trigger="Suggest"
					onSubmit={async (suggestedDates) => {
						await suggest({ base: info._id, suggestedDates })
					}}
				/>
			)}
		</div>
	)
}

interface WaitingPatientProps {
	info: AppointmentWaitingPatient
	role: null | UserRole
}
function WaitingPatient({ info, role }: WaitingPatientProps) {
	const shouldSuggest = role?.info._id === info.last.subject.id
	const suggest = useMutation(api.servicing.suggestDatesToDoctor)
	return (
		<div>
			waiting patient {info.status}
			{info.suggestions.map((suggestion) => (
				<Suggestion key={suggestion._id} info={suggestion} />
			))}
			<Suggestion info={info.last} shouldSuggest={shouldSuggest} />
			{shouldSuggest && (
				<SuggestOtherDates
					trigger="Suggest"
					onSubmit={async (suggestedDates) => {
						await suggest({ base: info._id, suggestedDates })
					}}
				/>
			)}
		</div>
	)
}

interface ConfirmedProps {
	info: AppointmentConfirmed
	role: null | UserRole
}
function Confirmed({ info, role }: ConfirmedProps) {
	const startChat = useMutation(api.chat.startChat)

	const router = useRouter()

	async function onClick() {
		const participant =
			role?.role === "patient" ? info.doctor.user : info.patient.user
		const chat = await startChat({
			name: "Initial consultation",
			participant,
			appointment: info._id,
		})

		router.push(`/chats/${chat}`)
	}

	return (
		<div>
			Appointment date {new Date(info.suggestedDate).toLocaleString()} is
			confirmed
			{info.chat ? (
				<Link href={`/chats/${info.chat}`}>Go to Chat</Link>
			) : (
				<button onClick={onClick}>Start chat</button>
			)}
		</div>
	)
}

interface SuggestionProps {
	info: AppointmentSuggestion
	shouldSuggest?: boolean
}

function Suggestion({ info, shouldSuggest }: SuggestionProps) {
	const confirmAppointmentDate = useMutation(
		api.servicing.confirmAppointmentDate,
	)

	function onClick(date: number) {
		return async function() {
			if (!shouldSuggest) {
				return
			}

			await confirmAppointmentDate({
				base: info.base,
				suggestedDate: date,
			})
		}
	}

	return (
		<div className={shouldSuggest ? "bg-blue-500" : "bg-gray-500"}>
			<div>
				{info.suggestedDates.map((date, index) => {
					return (
						<button
							disabled={!shouldSuggest}
							key={index}
							onClick={onClick(date)}
						>
							{new Date(date).toLocaleString()}
						</button>
					)
				})}
			</div>
		</div>
	)
}
