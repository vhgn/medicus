import { useEffect, useState } from "react"

export function useThrottle<T>(value: T, millis = 300) {
	const [throttled, setThrottled] = useState(value)

	useEffect(() => {
		const timer = setTimeout(() => setThrottled(value), millis)
		return () => clearTimeout(timer)
	}, [value, millis])

	return throttled
}
