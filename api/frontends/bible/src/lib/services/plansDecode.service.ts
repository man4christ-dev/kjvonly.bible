import type { Sub } from "$lib/modules/plans/models"

export class PlansDecodeService {

    /**
     * Parse start and end verse. 
     * 
     * 
     * @param rng start and end verse e.g. 1-31
     * @returns parsed start and end index in array. 
     *          [0,0] if unable to parse start or end index.
     */
    parseVerseRange(rng: string): number[] {
        let startEndVerses = rng.split('-')
        let start = parseInt(startEndVerses[0], 10)
        let end = parseInt(startEndVerses[1], 10)

        if (Number.isNaN(start) || Number.isNaN(end)) {
            start = 0
            end = 0
        }

        return [start, end]
    }

    /**
     * A verse range is made up of a start verse hyphen end verse.
     * Sum verse range sums the verses in the range.
     * 
     * E.g. 1-2 is 2 verses, 1-10 is 10 verses, 2-5 is 4 verses etc...
     * 
     * @param rng a verse group
     * @returns 
     */
    sumVerseRange(rng: string): number {
        let [start, end] = this.parseVerseRange(rng)

        if (start + end === 0) {
            return 0
        }

        const includeStartAndEndVerse = 1
        return end - start + includeStartAndEndVerse
    }

    /**
     * Sums the verses in each reading.
     * 
     * @param sub subscription
     */
    setTotalVerses(sub: Sub) {
        sub.nestedReadings.forEach(r => {
            let totalVerses = r.bcvs
                .map(b => this.sumVerseRange(b.verses))
                .reduce((a, b) => a + b)
            r.totalVerses = totalVerses
        })
    }
}

export let plansDecodeService = new PlansDecodeService()