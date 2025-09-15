/**
 * 
 * @param completedReadingIndexes completed reading indexes
 * @returns 
 */
export function getNextReadingIndex(completedReadingIndexes: number[]): number {
		completedReadingIndexes.sort((a: number,b: number)=>  a - b )

		let nextReadingIndex = 0
		for(let j = 0; j < completedReadingIndexes.length; j++){
			if (completedReadingIndexes[j] != j){
				return nextReadingIndex
			} 
			nextReadingIndex = j + 1
		}

		return nextReadingIndex
}
