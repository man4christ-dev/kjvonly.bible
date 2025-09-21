import { describe, it, assert } from "vitest"
import { subsEnricherService } from "./subsEnricher.service"
import { plansDecoderService } from "./plansDecoder.service"
import type { Readings } from "$lib/modules/plans/models"


describe('verse rng', () => {
    interface tt {
        rng: string
        expectedResult: number
    }

    let testTable: tt[] = [
        {
            rng: '1-b',
            expectedResult: 0
        },
        {
            rng: '1-1',
            expectedResult: 1
        },
        {
            rng: '1-2',
            expectedResult: 2
        },
        {
            rng: '1-31',
            expectedResult: 31
        }
    ]

    for (const t of testTable) {
        it('should return correct total', () => {
            let result = plansDecoderService.sumVerseRange(t.rng)
            assert.equal(result, t.expectedResult, `expected ${t.expectedResult} but got ${result}`)
        })
    }
})


describe('set total verses', () => {
    it('should set totalVerses', () => {
        let readings: Readings[] =  [
            {
                totalVerses: 0,
                bcvs: [
                    {
                        bookName: "",
                        bookID: 0,
                        chapter: 0,
                        verses: "1-5",
                        chapterKey: ""
                    },
                    {
                        bookName: "",
                        bookID: 0,
                        chapter: 0,
                        verses: "1-5",
                        chapterKey: ""
                    }
                ]
            },
            {
                totalVerses: 0,
                bcvs: [
                    {
                        bookName: "",
                        bookID: 0,
                        chapter: 0,
                        verses: "1-10",
                        chapterKey: ""
                    },
                    {
                        bookName: "",
                        bookID: 0,
                        chapter: 0,
                        verses: "1-10",
                        chapterKey: ""
                    }
                ]
            },
            {
                totalVerses: 0,
                bcvs: [
                    {
                        bookName: "",
                        bookID: 0,
                        chapter: 0,
                        verses: "1-15",
                        chapterKey: ""
                    },
                    {
                        bookName: "",
                        bookID: 0,
                        chapter: 0,
                        verses: "1-15",
                        chapterKey: ""
                    }
                ]
            },
        ]

        readings.forEach((r, idx) => {
            let total = plansDecoderService.setTotalVerses(r.bcvs)
            assert.equal(
                total,
                (idx + 1) * 10,
                `expected ${idx * 10} but got ${r.totalVerses}`
            )
        })
    })
})