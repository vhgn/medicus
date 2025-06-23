import {
	convexAuthNextjsMiddleware,
	createRouteMatcher,
	nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"
import { NextMiddleware, NextRequest } from "next/server"

const isSignInPage = createRouteMatcher(["/signin"])
const isProtectedRoute = createRouteMatcher(["/"])

export default wrap(
	convexAuthNextjsMiddleware(
		async (request, { convexAuth }) => {
			if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
				return nextjsMiddlewareRedirect(request, "/")
			}
			if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
				return nextjsMiddlewareRedirect(request, "/signin")
			}
		},
		{ verbose: Boolean(process.env.DEBUG) },
	),
)

function wrap(middleware: NextMiddleware): NextMiddleware {
	return async function(request, event) {
		const requestUrl = new URL(request.url)
		requestUrl.protocol = "https"
		const artificial = new NextRequest(requestUrl, {
			method: request.method,
			keepalive: request.keepalive,
			headers: request.headers,
			body: request.body,
			redirect: request.redirect,
			integrity: request.integrity,
			signal: request.signal,
			credentials: request.credentials,
			mode: request.mode,
			referrer: request.referrer,
			referrerPolicy: request.referrerPolicy,
			cache: request.cache,
		})
		return await middleware(artificial, event)
	}
}

export const config = {
	// The following matcher runs middleware on all routes
	// except static assets.
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
