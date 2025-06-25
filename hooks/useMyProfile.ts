import { api } from "@/convex"
import { useQuery } from "convex/react"

export function useMyProfile(): string | undefined {
	const role = useQuery(api.auth.currentRole)

	if (!role) {
		return undefined
	}

	switch (role.role) {
		case "patient":
			return `/patients/${role.info._id}`
		case "doctor":
			return `/doctors/${role.info._id}`
	}
}
