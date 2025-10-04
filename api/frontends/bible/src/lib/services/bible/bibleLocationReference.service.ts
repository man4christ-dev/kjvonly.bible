import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';

class BibleLocationReferenceService {
	/**
	 * Reduces a reference chapter key to BookID.
	 *
	 * @param ref any reference
	 * @returns
	 */
	extractBookID(ref: string): string {
		let bcvw = ref.split('_');
		if (bcvw.length > 0) {
			ref = bcvw[0];
		}
		return ref;
	}

	/**
	 * Returns the bookName from the ref.
	 *
	 * @param ref any reference
	 * @returns
	 */
	extractBookName(ref: string): string {
		let bcvw = ref.split('_');
		if (bcvw.length > 0) {
			ref = bcvw[0];
			return bookNamesByIDService.get(this.extractBookID(ref));
		}
		return '';
	}

	/**
	 * Reduces a reference chapter key to BookID.
	 *
	 * @param ref any reference
	 * @returns
	 */
	extractChapter(ref: string): number {
		let bcvw = ref.split('_');
		if (bcvw.length > 1) {
			return parseInt(bcvw[1]);
		}
		return 1;
	}

	/**
	 * Reduces a reference chapter key to BookID_Chapter.
	 *
	 * @param ref any reference
	 * @returns
	 */
	extractBookChapter(ref: string): string {
		let bcvw = ref.split('_');
		if (bcvw.length > 2) {
			ref = `${bcvw[0]}_${bcvw[1]}`;
		}
		return ref;
	}

	extractVerses(ref: string): number[] {
		let bcv = ref.split('_');
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

	extractVerse(ref: string): number {
		let bcv = ref.split('_');
		if (bcv.length > 2) {
			return parseInt(bcv[2], 10);
		}
		return 1;
	}
}

export const bibleLocationReferenceService =
	new BibleLocationReferenceService();
