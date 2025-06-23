"use client"

import { api } from "@/convex"
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export function DoctorInfo({
	doctorQuery,
	roleQuery,
}: {
	doctorQuery: Preloaded<typeof api.discovery.getDoctorInfo>
	roleQuery: Preloaded<typeof api.auth.currentRole>
}) {
	const doctor = usePreloadedQuery(doctorQuery)
	const role = usePreloadedQuery(roleQuery)

	const updateDoctor = useMutation(api.discovery.updateDoctor)
	const startChat = useMutation(api.chat.startChat)
	const createAppointmentWithDoctor = useMutation(
		api.servicing.createAppointmentWithDoctor,
	)

	const [name, setName] = useState(doctor.name)

	const router = useRouter()

	const isMe = role?.info._id === doctor._id

	function removeTag(index: number) {
		return async function() {
			await updateDoctor({
				name: doctor.name,
				tags: doctor.rawTags.splice(index, 1),
			})
		}
	}

	async function onStartChat() {
		const chat = await startChat({
			name: "Initial consultation",
			participant: doctor.user,
		})

		router.push(`/chats/${chat}`)
	}

	const [dialogOpen, setDialogOpen] = useState(false)
	const [suggestedDates, setSuggestedDates] = useState<number[]>([])
	const [suggestedDate, setSuggestedDate] = useState("")
	const [durationMinutes, setDurationMinutes] = useState("")
	async function onBookAppointment(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const appointment = await createAppointmentWithDoctor({
			suggestedDates,
			durationMinutes: Number(durationMinutes),
			doctor: doctor._id,
		})

		router.push(`/appointments/${appointment}`)
	}

	return (
		<div>
			{doctor.name} - {doctor.tags}
			{isMe ? (
				<div>
					<div>
						<input
							value={name}
							onChange={(e) => setName(e.currentTarget.value)}
							placeholder="Name"
						/>
						<button
							onClick={() => updateDoctor({ name, tags: doctor.rawTags })}
						>
							Save name
						</button>
					</div>
					{doctor.rawTags.map((tag, index) => (
						<li key={tag} onClick={removeTag(index)}>
							{tag}
						</li>
					))}
				</div>
			) : (
				<div>
					<button onClick={onStartChat}>Start chat</button>
					<button onClick={() => setDialogOpen(true)}>Book appointment</button>
					<dialog open={dialogOpen}>
						<form onSubmit={onBookAppointment}>
							<label>
								<p>Suggested date</p>
								<input
									type="datetime-local"
									onChange={(e) => setSuggestedDate(e.target?.value ?? "")}
								/>
							</label>
							<button
							type="button"
								onClick={() =>
									setSuggestedDates([
										...suggestedDates,
										new Date(suggestedDate).getTime(),
									])
								}
							>
								Add date
							</button>
							{suggestedDates.map((date, index) => (
								<div key={date}>
									{new Date(date).toLocaleString()}
									<button
									type="button"
										onClick={() =>
											setSuggestedDates(suggestedDates.splice(index, 1))
										}
									>
										Remove
									</button>
								</div>
							))}
							<label>
								<p>Duration in minutes</p>
								<input
									value={durationMinutes}
									onChange={(e) => setDurationMinutes(e.currentTarget.value)}
								/>
							</label>
							<button>Book</button>
						</form>
					</dialog>
				</div>
			)}
		</div>
	)
}
