import { assert, describe, expect, it } from "vitest";
import { plansDecodeService } from "./plansDecode.service";


describe('verse rng', () => {
    interface tt {
        grp: string
        expectedResult: number
    }

    let testTable: tt[] = [
        {
            grp: '1-b',
            expectedResult: 0
        },
        {
            grp: '1-1',
            expectedResult: 1
        },
        {
            grp: '1-2',
            expectedResult: 2
        },
        {
            grp: '1-31',
            expectedResult: 31
        }
    ]

    for (const t of testTable) {
        it('should return correct total', () => {
            
            let result = plansDecodeService.sumVerseRange(t.grp)
            assert.equal(result, t.expectedResult, `expected ${t.expectedResult} but got ${result}`)
        })
    }
})
