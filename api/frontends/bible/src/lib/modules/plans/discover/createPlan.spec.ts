import { bookIDByBookNameService } from '$lib/services/bibleMetadata/bookIDByBookName.service';
import { booksChaptersVerseCountByIDService } from '$lib/services/bibleMetadata/booksChaptersVerseCountByID.service';
import { describe, it } from 'vitest';

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', () => {
		Array('Job', 'Proverbs', 'Ecclesiastes').forEach((bookName) => {
			let id = bookIDByBookNameService.get(bookName);
			let book = booksChaptersVerseCountByIDService.get(id);
			book
				?.keys()
				.toArray()
				.sort((a: string, b: string) => parseInt(a) - parseInt(b))
				.forEach((ch) => console.log(`"${id}/${ch}/1-${book.get(ch)}",`));
		});
	});
});
