import { chapterApi } from "$lib/api/chapters.api"
import { plansApi } from "$lib/api/plans.api"
import { cachedPlanToPlan, type BCV, type Booknames, type CachedPlan, type Plan, type Readings, type Sub } from "$lib/modules/plans/models"

export class PlansDecodeService {

    booknames: any

    // ====================== SUBS ==========================
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
    getNextReadingIndex(completedReadings: number[]): number {
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
    setNextReadingIndex(sub: Sub) {
        sub.nextReadingIndex = this.getNextReadingIndex(sub.completedReadings.keys().toArray())
    }


    setPercentComplete(sub: Sub) {
        sub.percentCompleted = Math.ceil(sub.completedReadings.size / sub.nestedReadings.length * 100)
    }

    // ========================== Plans =============================
    decodeReadings(encodedReadings: string): BCV[] {
        return encodedReadings.split(';').map(r => {
            let bcv = r.split('/')
            return {
                bookName: this.booknames['booknamesById'][bcv[0]],
                bookID: parseInt(bcv[0]),
                chapter: parseInt(bcv[1]),
                verses: bcv[2],
                chapterKey: r.replaceAll('/', '_')
            }
        })
    }

    parseEncodedReadings(encodedReadings: string[]): Readings[] {
        return encodedReadings.map((ers: string) => {
            return {
                bcvs: this.decodeReadings(ers),
                totalVerses: 0
            }
        })
    }

    async decodePlans(): Promise<Plan[]> {
        let cachedPlans: CachedPlan[] = await plansApi.gets()
        return cachedPlans.map((cp: CachedPlan) => {
            let plan: Plan = cachedPlanToPlan(cp)
            plan.nestedReadings = this.parseEncodedReadings(cp.readings)
            return plan
        })
    }

    constructor() {
        chapterApi.getBooknames().then((data) => {
            this.booknames = data
        })


    }

}

export let plansDecodeService = new PlansDecodeService()