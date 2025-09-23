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

export interface Booknames {
	booknamesById: Map<string, string>;
	booknamesByName: Map<string, number>;
	shortNames: Map<string, string>;
	maxChapterById: Map<string, number>;
	bookchapterversecountById: Map<string, Map<string, number>>;
}
