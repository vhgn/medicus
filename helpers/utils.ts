import { PaginationResult } from "convex/server"

export function mapPaginated<TData, TFinal>(
	data: PaginationResult<TData>,
	mapper: (a: TData) => TFinal,
): PaginationResult<TFinal> {
	return {
		...data,
		page: data.page.map(mapper),
	}
}
