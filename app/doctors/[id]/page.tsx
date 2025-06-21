import { Id } from "@/convex/_generated/dataModel"

export default async function DoctorPage({
	params,
}: {
	params: Promise<{ id: Id<"doctors"> }>
}) {
	const { id } = await params
	return <div>{id}</div>
}
