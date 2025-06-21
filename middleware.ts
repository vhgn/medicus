import {
	convexAuthNextjsMiddleware,
	createRouteMatcher,
	nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"

const isSignInPage = createRouteMatcher(["/signin"])
const isProtectedRoute = createRouteMatcher(["/"])

export default convexAuthNextjsMiddleware(
	async (request, { convexAuth }) => {
		if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
			return nextjsMiddlewareRedirect(request, "/")
		}
		if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
			return nextjsMiddlewareRedirect(request, "/signin")
		}
	},
	{ verbose: Boolean(process.env.DEBUG) },
)

export const config = {
	// The following matcher runs middleware on all routes
	// except static assets.
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
