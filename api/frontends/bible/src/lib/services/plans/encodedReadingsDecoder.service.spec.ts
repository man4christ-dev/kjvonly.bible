import { describe, it, assert, expect } from 'vitest';
import { subsEnricherService } from './subsEnricher.service';
import { encodedReadingsDecoderService } from './encodedReadingsDecoder.service';
import type { Readings } from '$lib/modules/plans/models';

describe('verse rng', () => {
	interface tt {
		rng: string;
		expectedResult: number;
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
	];

	for (const t of testTable) {
		it('should return correct total', () => {
			let result = encodedReadingsDecoderService.sumVerseRange(t.rng);
			assert.equal(
				result,
				t.expectedResult,
				`expected ${t.expectedResult} but got ${result}`
			);
		});
	}
});

describe('set total verses', () => {
	it('should set totalVerses', () => {
		let readings: Readings[] = [
			{
				totalVerses: 0,
				bcvs: [
					{
						bookName: '',
						bookID: 0,
						chapter: 0,
						verses: '1-5',
						chapterKey: ''
					},
					{
						bookName: '',
						bookID: 0,
						chapter: 0,
						verses: '1-5',
						chapterKey: ''
					}
				]
			},
			{
				totalVerses: 0,
				bcvs: [
					{
						bookName: '',
						bookID: 0,
						chapter: 0,
						verses: '1-10',
						chapterKey: ''
					},
					{
						bookName: '',
						bookID: 0,
						chapter: 0,
						verses: '1-10',
						chapterKey: ''
					}
				]
			},
			{
				totalVerses: 0,
				bcvs: [
					{
						bookName: '',
						bookID: 0,
						chapter: 0,
						verses: '1-15',
						chapterKey: ''
					},
					{
						bookName: '',
						bookID: 0,
						chapter: 0,
						verses: '1-15',
						chapterKey: ''
					}
				]
			}
		];

		readings.forEach((r, idx) => {
			let total = encodedReadingsDecoderService.setTotalVerses(r.bcvs);
			assert.equal(
				total,
				(idx + 1) * 10,
				`expected ${idx * 10} but got ${r.totalVerses}`
			);
		});
	});
});

describe('parseEncodedReadings', () => {
	it('should decode encoded readings', () => {
		let encodedReadings = ['1/1/1-31;47/1/1-25;15/1/1-11;51/1/1-26'];

		let expectedReadings: Readings[] = [
			{
				bcvs: [
					{
						bookName: 'Genesis',
						bookID: 1,
						chapter: 1,
						verses: '1-31',
						chapterKey: '1_1_1-31'
					},
					{
						bookName: 'Matthew',
						bookID: 47,
						chapter: 1,
						verses: '1-25',
						chapterKey: '47_1_1-25'
					},
					{
						bookName: 'Ezra',
						bookID: 15,
						chapter: 1,
						verses: '1-11',
						chapterKey: '15_1_1-11'
					},
					{
						bookName: 'Acts',
						bookID: 51,
						chapter: 1,
						verses: '1-26',
						chapterKey: '51_1_1-26'
					}
				],
				totalVerses: 93
			}
		];

		let nestedReadings =
			encodedReadingsDecoderService.parseEncodedReadings(encodedReadings);

		expect(nestedReadings).toMatchObject(expectedReadings);
	});
});
