
export function getNextReadingIndex(readingIndexes: number[]): number {
		readingIndexes.sort((a: number,b: number)=>  a - b )

		let nextReadingIndex = 0
		for(let j = 0; j < readingIndexes.length; j++){
			if (readingIndexes[j] != j){
				return nextReadingIndex
			} 
			nextReadingIndex = j + 1
		}

		return nextReadingIndex
}