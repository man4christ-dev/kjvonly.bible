import type { Sub } from "$lib/modules/plans/models"

/**
 * 
 * Given an array of completed reading indexes
 * return the next reading to read. Note users
 * could read out of order. Regardless of the 
 * latest reading return the lowest incomplete
 * reading index.
 * 
 * @param completedReadingIndexes completed reading indexes
 * @returns lowest incomplete reading index
 */
export function getNextReadingIndex(completedReadings: number[]): number {
	return  completedReadings
	.sort((a, b) => a - b)
	.map((i, idx) => ({ 
		readingIndex: i,
		arrayIndex: idx
	}))
	.filter((i, idx) => i.readingIndex != idx)
	.at(0)?.arrayIndex || completedReadings.length
}

/**
 * Subscription have a next reading. The next reading is the lowest incomplete
 * reading index in the plan. Readings are 0 indexed stored in an array of the plan.
 * This function sets the next reading to the lowest incomplete reading index.
 * @param sub subscription
 *
 */
export function setNextReadingIndex(sub: Sub) {
	sub.nextReadingIndex = getNextReadingIndex(sub.completedReadings.keys().toArray())
}