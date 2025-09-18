/**
 * 
 * @param completedReadingIndexes completed reading indexes
 * @returns 
 */

export function getNextReadingIndex(readingIndexes: number[]): number {
	return  readingIndexes
	.sort((a, b) => a - b)
	.map((i, idx) => ({ 
		readingIndex: i,
		arrayIndex: idx
	}))
	.filter((i, idx) => i.readingIndex != idx)
	.at(0)?.arrayIndex || readingIndexes.length
}