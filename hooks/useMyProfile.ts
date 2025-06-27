import { api } from "@/convex"
import { useQuery } from "convex/react"

export function useMyProfile(): { url: string, role: "doctor" | "patient" } | undefined {
	const role = useQuery(api.auth.currentRole)

	if (!role) {
		return undefined
	}

	switch (role.role) {
		case "patient":
			return { url: `/patients/${role.info._id}`, role: "patient"}
		case "doctor":
			return { url: `/doctors/${role.info._id}`, role: "doctor" }
	}
}
