import type { Sub } from "$lib/modules/plans/models"
import { plansDecodeService } from "$lib/services/plansDecode.service"

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
    return completedReadings
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

/**
 * Sums the verses in each reading.
 * 
 * @param sub subscription
 */
export function setTotalVerses(sub: Sub) {
    sub.nestedReadings.forEach(r => {
        let totalVerses = r.bcvs
            .map(b => plansDecodeService.sumVerseRange(b.verses))
            .reduce((a, b) => a + b)
        r.totalVerses = totalVerses
    })
}


export function setPercentComplete(sub: Sub) {
	sub.percentCompleted = Math.ceil(sub.completedReadings.size / sub.nestedReadings.length * 100)
}
