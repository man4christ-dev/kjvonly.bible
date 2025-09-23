import type { BCV } from './bible.model';

/**
 * When a user selects a reading for a subscription, the app routes to the bible
 * module. The bible module will check the {@link Buffer.bag} for a plan
 * variable. If it exists the bible module restricts the module to only display
 * the {@link BCV}[] in the readings.
 */
export interface NavPlan {
	readings: Readings;
	currentReadingsIndex: number;
	subID: string;
	selectedReadingsIndex: number;
	returnView: string;
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

/**
 *
 * @returns An zero value Readings
 */
export function NullReadings(): Readings {
	return {
		totalVerses: 0,
		bcvs: []
	};
}

export interface NextReading {
	subID: string;
	readings: Readings;
	planDateCreated: number; // This should be date subscribed
	name: string;
	percentCompleted: number;
	readingIndex: number;
	totalReadings: number;
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
