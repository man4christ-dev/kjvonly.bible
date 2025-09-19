

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
        id: "",
        subID: "",
        index: 0,
        version: 0
    }
}

export interface Plan {
    id: string;
    userID: string;
    name: string;
    description: string[];
    readings: Readings[];
    dateCreated: number;
    version: number;
}

export interface Sub {
    id: string;
    planID: string;
    userID: string;
    completedReadings: Map<number, CompletedReading>;
    plan: Plan;
    nextReadingIndex: number;
    percentCompleted: number;

    dateSubscribed: Date;
    version: number;
}

export function NullPlan(): Plan {
    return {
        id: "",
        userID: "",
        name: "",
        description: [],
        readings: [],
        dateCreated: 0,
        version: 0
    }
}

export function NullSub(): Sub {
    return {
        id: '',
        planID: '',
        userID: '',
        completedReadings: new Map(),
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