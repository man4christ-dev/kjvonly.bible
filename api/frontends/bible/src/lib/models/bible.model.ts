/**
 *
 * BCV is an abbreviation for Book, Chapter, Verse[s]. BCV contains metadata
 * associated to the Book Chapter verse.
 *
 * @example
 * let bcv: BCV {
 *      bookName: "Genesis",
 *      bookID: 1,
 *      chapter: 1,
 *      verses: "1-31",
 *      chapterKey: "1_1_1-31"
 * }
 */
export interface BCV {
	bookName: string;
	bookID: number;
	chapter: number;
	verses: string;
	chapterKey: string;
}
