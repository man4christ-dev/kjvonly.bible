export class BooksChaptersVerseCountByIDService {
	get(id: string): string {
		let bookName = this.map.get(id);
		if (!bookName) {
			bookName = 'Genesis';
			console.log(`error retrieving book name by id. Invalid id ${id}`);
		}
		return bookName;
	}

	map = new Map([]);
}

export const booksChaptersVerseCountByIDService =
	new BooksChaptersVerseCountByIDService();
