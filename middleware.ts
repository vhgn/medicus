import {
	convexAuthNextjsMiddleware,
	createRouteMatcher,
	nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"
import { NextMiddleware } from "next/server"

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
		console.log("URL", request.url);
		request.nextUrl.protocol = "https";
		console.log("URLf", request.url)
		for (const key of request.headers.keys()) {
			console.log("H", key, request.headers.get(key))
		}
		return await middleware(request, event)
	}
}

export const config = {
	// The following matcher runs middleware on all routes
	// except static assets.
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
