import { Buffer } from '$lib/models/buffer.model';

export const PLANS_VIEWS = {
	PLANS_LIST: 'PLANS_LIST',
	PLANS_ACTIONS: 'PLANS_ACTION',
	PLANS_DETAILS: 'PLANS_DETAILS',

	SUBS_LIST: 'SUBS_LIST',
	SUBS_ACTIONS: 'SUBS_ACTIONS',
	SUBS_DETAILS: 'SUBS_DETAILS',

	NEXT_LIST: 'NEXT_LIST'
};

/**
 * When a user selects a reading for a subscription, the app routes to the bible
 * module. The bible module will check the {@link Buffer.bag} for a plan
 * variable. If it exists the bible module restricts the module to only display
 * the {@link BCV}[] in the readings.
 */
export interface NavPlan {
	reading: BCV[]; // TODO update this to readings plural
	currentReadingsIndex: number;
	subID: string;
	readingIndex: number; //TODO update this to readingsIndex plural
	returnView: string;
}

/**
 * TODO pull out to common models.
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

/**
 * Readings consist of the {@link BCV}[] (book, chapter, verses) to read. The
 * {@link BCV}s
 */
export interface Readings {
	// TODO move totalVerses to new interface
	// TODO add a date field to track when the reading should be completed if
	//      user desires a scheduled plan vs tracked reading.
	totalVerses: number;
	bcvs: BCV[];
}

export function NullReadings(): Readings {
	return {
		totalVerses: 0,
		bcvs: []
	};
}

export interface NextReading {
	reading: BCV[];
	totalVerses: number;
	planDateCreated: number;
	name: string;
	percentCompleted: number;
	readingIndex: number;
	totalReadings: number;
	subID: string;
}

/**
 * id: "00000000-0000-0000-0000-000000000000/0"
 * subID: "00000000-0000-0000-0000-000000000000"
 * index: 0
 * version: 0
 */
export interface CompletedReading {
	id: string;
	subID: string;
	index: number;
	version: number;
}

export function NullCompletedReading(): CompletedReading {
	return {
		id: '',
		subID: '',
		index: 0,
		version: 0
	};
}

export interface CachedPlan {
	id: string;
	userID: string;
	name: string;
	description: string[];
	readings: string[]; // TODO rename to encoded readings
	dateCreated: number;
	version: number;
}

export function cachedPlanToPlan(cp: CachedPlan): Plan {
	return {
		id: cp.id,
		userID: cp.userID,
		name: cp.name,
		description: cp.description,
		nestedReadings: [],
		dateCreated: cp.dateCreated,
		version: cp.version
	};
}

export interface Plan {
	id: string;
	userID: string;
	name: string;
	description: string[];
	nestedReadings: Readings[];
	dateCreated: number;
	version: number;
}

export interface CachedSub {
	id: string;
	planID: string;
	userID: string;
	dateSubscribed: number;
	version: number;
}

export function cachedSubToSub(cs: CachedSub): Sub {
	return {
		id: cs.id,
		planID: cs.planID,
		userID: cs.userID,
		dateSubscribed: cs.dateSubscribed,
		version: cs.version,
		name: '',
		description: [],
		nestedReadings: [],
		completedReadings: new Map(),
		nextReadingIndex: 0,
		percentCompleted: 0
	};
}

export interface Sub extends CachedSub {
	id: string;
	planID: string;
	userID: string;
	dateSubscribed: number;
	version: number;

	// VM
	name: string;
	description: string[];
	nestedReadings: Readings[];
	completedReadings: Map<number, CompletedReading>;
	//plan: Plan;
	nextReadingIndex: number; // TODO update name to nextReadingsIndex
	percentCompleted: number;
}

export function NullPlan(): Plan {
	return {
		id: '',
		userID: '',
		name: '',
		description: [],
		nestedReadings: [],
		dateCreated: 0,
		version: 0
	};
}

export function NullSub(): Sub {
	return {
		id: '',
		planID: '',
		userID: '',
		dateSubscribed: 0,
		version: 0,
		name: '',
		description: [],
		nestedReadings: [],
		completedReadings: new Map(),
		nextReadingIndex: 0,
		percentCompleted: 0
	};
}

export interface Booknames {
	booknamesById: Map<string, string>;
	booknamesByName: Map<string, number>;
	shortNames: Map<string, string>;
	maxChapterById: Map<string, number>;
	bookchapterversecountById: Map<string, Map<string, number>>;
}
