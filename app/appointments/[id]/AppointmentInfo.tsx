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
	return (
		<div>
			<h2>Waiting for doctor confirmation</h2>
			{info.suggestions.map((suggestion) => (
				<Suggestion key={suggestion._id} info={suggestion} role={role} />
			))}
			<Suggestion info={info.last} role={role} isLast />
		</div>
	)
}

interface WaitingPatientProps {
	info: AppointmentWaitingPatient
	role: null | UserRole
}
function WaitingPatient({ info, role }: WaitingPatientProps) {
	return (
		<div>
			waiting patient {info.status}
			{info.suggestions.map((suggestion) => (
				<Suggestion key={suggestion._id} info={suggestion} role={role} />
			))}
			<Suggestion info={info.last} role={role} />
			<SuggestOtherDates
			// initialDurationMinutes={info.last}
				trigger="Suggest"
				onSubmit={async () => {
					// TODO
				}}
			/>
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
		})

		router.push(`/chats/${chat}`)
	}

	return (
		<div>
			Appointment date {new Date(info.suggestedDate).toLocaleString()} is
			confirmed
			<button onClick={onClick}>Start chat</button>
		</div>
	)
}

interface SuggestionProps {
	info: AppointmentSuggestion
	role: null | UserRole
	isLast?: boolean
}

function Suggestion({ info, role, isLast }: SuggestionProps) {
	const isMe = role !== null && info.subject.id === role.info._id

	const confirmAppointmentDate = useMutation(
		api.servicing.confirmAppointmentDate,
	)

	function onClick(date: number) {
		return async function() {
			if (!isLast) {
				return
			}

			await confirmAppointmentDate({
				base: info.base,
				suggestedDate: date,
			})
		}
	}

	return (
		<div className={isMe ? "bg-blue-500" : "bg-gray-500"}>
			{isMe ? "You suggested" : "They suggested"}
			<div>
				{info.suggestedDates.map((date, index) => {
					return (
						<button
							disabled={!isLast || isMe}
							key={index}
							onClick={onClick(date)}
						>
							{new Date(date).toLocaleString()}
						</button>
					)
				})}
			</div>
			{isMe && "They did not confirm yet"}
		</div>
	)
}
