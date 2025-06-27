"use client"

import { useMyProfile } from "@/hooks/useMyProfile"
import Link from "next/link"
import { SignOutButton } from "./SignOutButton"

export function Header() {
	const profile = useMyProfile()
	return (
		<header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
			<Link href="/">Home</Link>
			{profile && (
				<Link prefetch href={profile.url}>
					My profile
				</Link>
			)}
			<SignOutButton />
		</header>
	)
}
