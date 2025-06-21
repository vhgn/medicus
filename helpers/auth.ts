import { MutationCtx, QueryCtx } from "../convex/_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"
import { ConvexError } from "convex/values"

type AnyCtx = QueryCtx | MutationCtx

export async function assertAuthUser(ctx: AnyCtx) {
	const user = await getAuthUserId(ctx)
	if (!user) {
		throw new ConvexError("Must be logged in")
	}

	return user
}

export async function assertAuthUserInfo(ctx: AnyCtx) {
	const user = await assertAuthUser(ctx)
	const info = await ctx.db.get(user)
	if (!info) {
		throw new ConvexError("User info not found")
	}

	return info
}
