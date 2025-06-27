"use client"

import { SuggestOtherDates } from "@/components/SuggestOtherDates"
import { api } from "@/convex"
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
	const [tag, setTag] = useState("")
	const [tags, setTags] = useState(doctor.rawTags)

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
						<input
							value={tag}
							onChange={(e) => setTag(e.currentTarget.value)}
							placeholder="New tag"
						/>
						<button
							type="button"
							onClick={() => {
								setTags([...tags, tag])
								setTag("")
							}}
						>
							Add tag
						</button>
						{tags.map((tag, index) => (
							<li key={tag} onClick={removeTag(index)}>
								{tag}
							</li>
						))}
						<button
							onClick={() => updateDoctor({ name, tags })}
						>
							Save
						</button>
					</div>
				</div>
			) : (
				<div>
					<button onClick={onStartChat}>Start chat</button>
					<SuggestOtherDates
						trigger="Book"
						onSubmit={async (suggestedDates, durationMinutes) => {
							const appointment = await createAppointmentWithDoctor({
								suggestedDates,
								doctor: doctor._id,
								durationMinutes,
							})

							router.push(`/appointments/${appointment}`)
						}}
					/>
				</div>
			)}
		</div>
	)
}
