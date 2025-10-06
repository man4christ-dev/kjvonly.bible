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
 *      bibleLocationRef: "1_1_1-31"
 * }
 */
export interface BCV {
	bookName: string;
	bookID: number;
	chapter: number;
	verses: string;
	bibleLocationRef: string;
}

export function jsonToChapter(data: any): Chapter {
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

export function newChapter(): Chapter {
	return {
		number: 0,
		bookName: '',
		verses: new Map(),
		verseMap: new Map(),
		footnotes: new Map()
	};
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

export async function jsonToAnnots(data: any): Promise<Annotations> {
	let annots: Map<number, Map<number, WordAnnots>> = new Map();
	for (let verseNumber of Object.keys(data.annots)) {
		let a: Map<number, WordAnnots> = new Map();
		for (let wordIdx of Object.keys(data.annots[verseNumber])) {
			a.set(parseInt(wordIdx), JSON.parse(data.annots[verseNumber][wordIdx]));
		}
		annots.set(parseInt(verseNumber), a);
	}
	return {
		version: data.version,
		annots: annots
	};
}

export interface BibleMode {
	value: BIBLE_MODES;

	bibleLocationRef: string;
	notePopup: NotePopup;

	// edit options, word
	colorAnnotation: string;
	type: string;
}

export interface NotePopup {
	show: boolean;
}

export function newBibleMode(): BibleMode {
	return {
		value: BIBLE_MODES.READING,
		colorAnnotation: 'bg-highlighta',
		type: '',
		bibleLocationRef: '73_1_1_1',
		notePopup: { show: false }
	};
}

export enum BIBLE_MODES {
	READING = 1,
	EDIT
}
