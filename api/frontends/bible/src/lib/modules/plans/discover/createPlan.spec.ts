import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import booknames from '../../../../../static/data/json.gz/booknames.json';
import type { Booknames } from '../models';



describe('sum test', () => {

	it('adds 1 + 2 to equal 3', () => {
		let vc = new Map<string, Map<string, number>>();
		Object.keys(booknames['bookchapterversecountById']).forEach(c => {
			let cvc = new Map<string, number>(Object.entries(booknames['bookchapterversecountById'][c]))
			vc.set(c, cvc)
		})


		let bn: Booknames = {
			booknamesById: new Map(Object.entries(booknames['booknamesById'])),
			booknamesByName: new Map(Object.entries(booknames['booknamesByName'])),
			shortNames: new Map(Object.entries(booknames['shortNames'])),
			maxChapterById: new Map(Object.entries(booknames['maxChapterById'])),
			bookchapterversecountById: vc
		}

		Array('Job', 'Proverbs', "Ecclesiastes").forEach((bookName) => {
			let id = bn.booknamesByName.get(bookName)
			let book = bn.bookchapterversecountById.get(`${id}`)
			book?.keys().toArray().sort((a, b) => a - b).forEach(ch => console.log(`"${id}/${ch}/1-${book.get(ch)}",`))
		})

	});
});
