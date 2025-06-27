"use client"

import { useConvexAuth } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMyProfile } from "@/hooks/useMyProfile"

export default function Home() {
	const profile = useMyProfile()
	return (
		<>
			<main className="p-8 flex flex-col gap-8">
				{profile?.role === "patient" && (
					<Link prefetch href="/doctors">
						Find doctor
					</Link>
				)}
				<Link prefetch href="/appointments">
					Appointments
				</Link>
				<Link prefetch href="/chats">
					Chats
				</Link>
			</main>
		</>
	)
}

