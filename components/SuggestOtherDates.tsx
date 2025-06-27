import { FormEvent, useState } from "react"

interface SuggestOtherDatesProps {
	onSubmit: (
		suggestedDates: number[],
		durationMinutes: number,
	) => void | Promise<void>
	trigger: string
	initialDurationMinutes?: number
	initialSelectedDate?: number
}

export function SuggestOtherDates({
	onSubmit,
	trigger,
	initialDurationMinutes,
	initialSelectedDate,
}: SuggestOtherDatesProps) {
	const [dialogOpen, setDialogOpen] = useState(false)
	const [suggestedDates, setSuggestedDates] = useState<number[]>([])
	const [selectedDate, setSelectedDate] = useState(
		initialSelectedDate?.toString() ?? "",
	)
	const [durationMinutes, setDurationMinutes] = useState(
		initialDurationMinutes?.toString() ?? "",
	)

	async function onConfirm(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()

		await onSubmit(suggestedDates, Number(durationMinutes))

		setDialogOpen(false)
	}

	return (
		<>
			<button onClick={() => setDialogOpen(true)}>{trigger}</button>
			<dialog open={dialogOpen}>
				<form onSubmit={onConfirm}>
					<label>
						<p>Suggested date</p>
						<input
							type="datetime-local"
							onChange={(e) => setSelectedDate(e.target?.value ?? "")}
						/>
					</label>
					<button
						type="button"
						onClick={() =>
							setSuggestedDates([
								...suggestedDates,
								new Date(selectedDate).getTime(),
							])
						}
					>
						Add date
					</button>
					{suggestedDates.map((date, index) => (
						<div key={date}>
							{new Date(date).toLocaleString()}
							<button
								type="button"
								onClick={() => {
									const dates = [...suggestedDates]
									dates.splice(index, 1)
									setSuggestedDates(dates)
								}}
							>
								Remove
							</button>
						</div>
					))}
					<label>
						<p>Duration in minutes</p>
						<input
							disabled={initialDurationMinutes !== undefined}
							value={durationMinutes}
							onChange={(e) => setDurationMinutes(e.currentTarget.value)}
						/>
					</label>
					<button>Book</button>
				</form>
			</dialog>
		</>
	)
}
