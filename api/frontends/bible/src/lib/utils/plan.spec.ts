import { assert, describe, it } from "vitest";
import { getNextReadingIndex, setNextReadingIndex } from "./plan";
import { NullCompletedReading, NullSub, type CompletedReading, type Sub } from "$lib/modules/plans/models";

describe('path util functions', () => {
    interface tt {
        completedReadings: number[]
        expectedResult: number

    }

    let testTable: tt[] = [
        {
            completedReadings: [0, 1, 2],
            expectedResult: 3
        },
        {
            completedReadings: [2, 1, 0],
            expectedResult: 3
        },
        {
            completedReadings: [1, 0, 2],
            expectedResult: 3
        },
        {
            completedReadings: [0, 1, 3],
            expectedResult: 2
        },
    ]

    for (const t of testTable) {
        it('returns next number in sequence', () => {
            let result = getNextReadingIndex(t.completedReadings)
            assert.equal(result, t.expectedResult, `should have returned ${t.expectedResult} but got ${result} instead.`)
        })
    }

    for (const t of testTable) {
        it('should set the next reading index', () => {
            let sub: Sub = NullSub()
            let completedReading = new Map<number, CompletedReading>()
            for (const cr of t.completedReadings) {
                completedReading.set(cr, NullCompletedReading())
            }
            sub.completedReadings = completedReading
            setNextReadingIndex(sub)
            assert.equal(
                sub.nextReadingIndex,
                t.expectedResult,
                `should have set nextReadingIndex to ${t.expectedResult} but got ${sub.nextReadingIndex} instead.`
            )

        })
    }

})