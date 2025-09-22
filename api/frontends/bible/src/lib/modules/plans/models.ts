export const PLANS_VIEWS = {
	PLANS_LIST: 'PLANS_LIST',
	PLANS_ACTIONS: 'PLANS_ACTION',
	PLANS_DETAILS: 'PLANS_DETAILS',

	SUBS_LIST: 'SUBS_LIST',
	SUBS_ACTIONS: 'SUBS_ACTIONS',
	SUBS_DETAILS: 'SUBS_DETAILS',

	NEXT_LIST: 'NEXT_LIST'
};

export interface NavPlan {
	reading: BCV[];
	currentReadingsIndex: number;
	subID: string;
	readingIndex: number;
	returnView: string;
}

/**
 * bookName: "Genesis",
 * bookID: 1,
 * chapter: 1,
 * verses: "1-31",
 * chapterKey: "1_1_1-31"
 */
export interface BCV {
	bookName: string;
	bookID: number;
	chapter: number;
	verses: string;
	chapterKey: string;
}

export interface Readings {
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
	nextReadingIndex: number;
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
