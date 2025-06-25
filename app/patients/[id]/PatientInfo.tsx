"use client"

import { api } from "@/convex"
import { Doc } from "@/datamodel"
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react"
import Link from "next/link"
import { FormEvent, useState } from "react"

export function PatientInfo({
	patientQuery,
	self,
}: {
	patientQuery: Preloaded<typeof api.discovery.getPatientInfo>
	self: null | Doc<"users">
}) {
	const patient = usePreloadedQuery(patientQuery)

	const isMe = self && patient.user === self._id

	return (
		<div>
			<h1>{patient.name}</h1>
			{isMe && (
				<div>
					<Link prefetch href="/appointments">
						My appointments
					</Link>
					<ProfileChange name={patient.name} />
				</div>
			)}
		</div>
	)
}

interface ProfileChangeProps {
	name: string
}

function ProfileChange({ name: initialName }: ProfileChangeProps) {
	const [name, setName] = useState(initialName)

	const updateProfile = useMutation(api.discovery.updatePatient)

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		await updateProfile({
			name,
		})
	}

	return (
		<form onSubmit={onSubmit}>
			<input value={name} onChange={(e) => setName(e.currentTarget.value)} />
			<button>Update</button>
		</form>
	)
}
