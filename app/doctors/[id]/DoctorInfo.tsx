"use client"

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
				<button onClick={onStartChat}>Start chat</button>
			)}
		</div>
	)
}
