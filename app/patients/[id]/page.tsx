import { Id } from "@/datamodel"
import { PatientInfo } from "./PatientInfo"

export default async function PatientPage({ params }: { params: Promise<{ id: Id<"patients"> }>}) {
	const { id } = await params

	return <PatientInfo self={}
}
