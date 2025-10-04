import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';

/**
 * Reduces a reference chapter key to BookID.
 *
 * @param chapterKey any reference
 * @returns
 */
export function extractBookID(chapterKey: string): string {
	let bcvw = chapterKey.split('_');
	if (bcvw.length > 0) {
		chapterKey = bcvw[0];
	}
	return chapterKey;
}

/**
 * Reduces a reference chapter key to BookID.
 *
 * @param chapterKey any reference
 * @returns
 */
export function extractBookName(chapterKey: string): string {
	let bcvw = chapterKey.split('_');
	if (bcvw.length > 0) {
		chapterKey = bcvw[0];
		return bookNamesByIDService.get(extractBookID(chapterKey));
	}
	return '';
}

/**
 * Reduces a reference chapter key to BookID.
 *
 * @param chapterKey any reference
 * @returns
 */
export function extractChapter(chapterKey: string): number {
	let bcvw = chapterKey.split('_');
	if (bcvw.length > 1) {
		return parseInt(bcvw[1]);
	}
	return 1;
}

/**
 * Reduces a reference chapter key to BookID_Chapter.
 *
 * @param chapterKey any reference
 * @returns
 */
export function extractBookChapter(chapterKey: string): string {
	let bcvw = chapterKey.split('_');
	if (bcvw.length > 2) {
		chapterKey = `${bcvw[0]}_${bcvw[1]}`;
	}
	return chapterKey;
}

export function extractVerses(chapterKey: string): number[] {
	let bcv = chapterKey.split('_');
	if (bcv.length > 2) {
		let verses = bcv[2].split('-');
		let s = parseInt(verses[0]);
		let e = parseInt(verses[1]);

		if (!Number.isNaN(s) && !Number.isNaN(e)) {
			return [s - 1, e];
		} else {
			return [0, 0];
		}
	}

	return [0, 0];
}

export function extractVerse(chapterKey: string): number {
	let bcv = chapterKey.split('_');
	if (bcv.length > 2) {
		return parseInt(bcv[2], 10);
	}
	return 1;
}
