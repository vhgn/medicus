import {
	convexAuthNextjsMiddleware,
	createRouteMatcher,
	nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"

const isSignInPage = createRouteMatcher(["/signin"])
const isProtectedRoute = createRouteMatcher(["/", "/chats"])

export default convexAuthNextjsMiddleware(
	async (request, { convexAuth }) => {
		console.log("isCors", isCors(request))
		console.log("request.url", request.url)
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

function isCors(request: Request) {
  const origin = request.headers.get("Origin");
  const originURL = origin ? new URL(origin) : null;
  return (
    originURL !== null &&
    (originURL.host !== request.headers.get("Host") ||
      originURL.protocol !== new URL(request.url).protocol)
  );
}
