

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
    readings: PlanReading[];
    currentReadingsIndex: number;
    subID: string;
    readingIndex: number
    returnView: string
}


/**
 * bookName: "Genesis",
 * bookID: 1,
 * chapter: 1,
 * verses: "1-31",
 * chapterKey: "1_1_1-31"
 */
export interface PlanReading {
    bookName: string;
    bookID: number;
    chapter: number;
    verses: string;
    chapterKey: string;
}

export interface NextReading {
    reading: PlanReading[];
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

export interface Plan {
    id: string;
    userID: string;
    name: string;
    description: string[];
    readings: PlanReading[][];
    dateCreated: number;
    version: number;
}

export interface Sub {
    id: string;
    planID: string;
    userID: string;
    readings: Map<number, CompletedReading>;
    plan: Plan;
    nextReadingIndex: number;
    percentCompleted: number;

    dateSubscribed: Date;
    version: number;
}

export function NullSub(): Sub {
    return {
        id: '',
        planID: '',
        userID: '',
        readings: new Map(),
        plan: {
            id: '',
            userID: '',
            name: '',
            description: [],
            readings: [],
            version: 0,
            dateCreated: 0
        },
        nextReadingIndex: 0,
        percentCompleted: 0,
        dateSubscribed: new Date(),
        version: 0
    };
}

export interface Booknames {
    booknamesById: Map<string, string>
    booknamesByName: Map<string, number>
    shortNames: Map<string, string>
    maxChapterById: Map<string, number>
    bookchapterversecountById: Map<string, Map<string, number>>
}