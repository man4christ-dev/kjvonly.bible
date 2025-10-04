import type { chapter } from './chapter.model';

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

export async function jsonToChapter(jsonData: Promise<any>): Promise<Chapter> {
	let data = await jsonData;
	let result: Chapter = {
		number: data.number,
		bookName: data.bookName,
		verses: new Map(
			Object.entries(data.verses).map(([k, v]) => [k, v as Verse])
		),
		verseMap: new Map(
			Object.entries(data.verseMap).map(([k, v]) => [k, v as string])
		),
		footnotes: new Map(
			Object.entries(data.footnotes).map(([k, v]) => [k, v as string])
		)
	};

	return result;
}

export interface Chapter {
	number: number;
	bookName: string;
	verses: Map<string, Verse>;
	verseMap: Map<string, string>;
	footnotes: Map<string, string>;
}

export interface Verse {
	number: number;
	words: Word[];
	text: string;
}

export interface Word {
	text: string;
	class: string[] | null;
	href: string[] | null;
	emphasis: boolean;
}

export interface WordAnnots {
	class: string[];
}

export interface Annotations {
	version: number;
	annots: Map<number, Map<number, WordAnnots>>;
}

export function newAnnotation(): Annotations {
	return {
		version: 0,
		annots: new Map()
	};
}
