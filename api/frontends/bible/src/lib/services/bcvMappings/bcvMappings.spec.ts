import { it } from 'vitest';

import data from './booksChaptersVerseCountByID.json';

function sort(a: string, b: string): number {
	return parseInt(a) - parseInt(b);
}

it('test', () => {
	let d = JSON.parse(JSON.stringify(data));

	console.log(`new Map([`);
	for (let bookID of Object.keys(d).sort(sort)) {
		console.log(`[ "${bookID}", new Map([`);
		for (let chapter of Object.keys(d[bookID]).sort(sort)) {
			console.log(`["${chapter}", "${d[bookID][chapter]}"],`);
		}
		console.log('])],');
	}
	console.log(`])`);
});
