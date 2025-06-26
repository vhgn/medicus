"use client"

import { useConvexAuth } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMyProfile } from "@/hooks/useMyProfile"

export default function Home() {
	const url = useMyProfile()
	return (
		<>
			<header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
				Medicus Task
				<SignOutButton />
			</header>
			<main className="p-8 flex flex-col gap-8">
				<Link prefetch href="/doctors">
					Find doctor
				</Link>
				<Link prefetch href="/appointments">
					Appointments
				</Link>
				{url && (
					<Link prefetch href={url}>
						My profile
					</Link>
				)}
			</main>
		</>
	)
}

function SignOutButton() {
	const { isAuthenticated } = useConvexAuth()
	const { signOut } = useAuthActions()
	const router = useRouter()
	return (
		<>
			{isAuthenticated && (
				<button
					className="bg-slate-200 dark:bg-slate-800 text-foreground rounded-md px-2 py-1"
					onClick={() =>
						void signOut().then(() => {
							router.push("/signin")
						})
					}
				>
					Sign out
				</button>
			)}
		</>
	)
}
