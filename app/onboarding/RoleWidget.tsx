"use client"

import { api } from "@/convex/_generated/api"
import { DoctorRoleInput, PatientRoleInput } from "@/convex/types"
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react"
import { redirect } from "next/navigation"
import { ChangeEvent, useState } from "react"

type SetState<T> = (next: T) => void

const defaultPatient: PatientRoleInput = {
	role: "patient",
	name: "",
}

const defaultDoctor: DoctorRoleInput = {
	role: "doctor",
	name: "",
	tags: [],
}

export function RoleWidget({
	roleQuery,
}: {
	roleQuery: Preloaded<typeof api.auth.currentRole>
}) {
	const role = usePreloadedQuery(roleQuery)
	const [input, setInput] = useState<PatientRoleInput | DoctorRoleInput>(
		defaultPatient,
	)

	const createRoleForSelf = useMutation(api.auth.createRoleForSelf)

	if (role) {
		redirect("/")
	}

	async function onSubmit() {
		await createRoleForSelf({ payload: input })
	}

	function onRoleChange(event: ChangeEvent<HTMLInputElement>) {
		if (event.currentTarget.value === "patient") {
			setInput(defaultPatient)
		} else {
			setInput(defaultDoctor)
		}
	}

	return (
		<form onSubmit={onSubmit}>
			<label>
				I am a patient
				<input
					checked={input.role === "patient"}
					type="radio"
					name="role"
					value="patient"
					onChange={onRoleChange}
				/>
			</label>
			<label>
				I am a doctor
				<input
					checked={input.role === "doctor"}
					type="radio"
					name="role"
					value="doctor"
					onChange={onRoleChange}
				/>
			</label>
			<FormWidget input={input} setInput={setInput} />
			<button>Submit</button>
		</form>
	)
}

function FormWidget({
	input,
	setInput,
}: {
	input: PatientRoleInput | DoctorRoleInput
	setInput: SetState<PatientRoleInput | DoctorRoleInput>
}) {
	switch (input.role) {
		case "patient":
			return <PatientWidget input={input} setInput={setInput} />
		case "doctor":
			return <DoctorWidget input={input} setInput={setInput} />
	}
}

function PatientWidget({
	input,
	setInput,
}: {
	input: PatientRoleInput
	setInput: SetState<PatientRoleInput>
}) {
	return (
		<div>
			<label>
				Name
				<input
					value={input.name}
					onChange={(e) => setInput({ ...input, name: e.currentTarget.value })}
				/>
			</label>
		</div>
	)
}

function DoctorWidget({
	input,
	setInput,
}: {
	input: DoctorRoleInput
	setInput: SetState<DoctorRoleInput>
}) {
	const [tag, setTag] = useState("")
	function addTag() {
		if (!tag) {
			return
		}
		setInput({
			...input,
			tags: [...input.tags, tag],
		})
		setTag("")
	}

	return (
		<div>
			<label>
				Name
				<input
					value={input.name}
					onChange={(e) => setInput({ ...input, name: e.currentTarget.value })}
				/>
			</label>
			<label>
				Add Tag
				<input value={tag} onChange={(e) => setTag(e.currentTarget.value)} />
				<button type="button" onClick={addTag} disabled={tag === ""}>
					Add
				</button>
			</label>
			{input.tags.map((tag) => (
				<div key={tag}>{tag}</div>
			))}
		</div>
	)
}
