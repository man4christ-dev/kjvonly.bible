import FlexSearch, { type Id } from 'flexsearch';

export interface SearchResult {
	key: string;
	bookName: string;
	number: number;
	verseNumber: number;
	text: string;
}

export interface SearchResultResponse {
	id: string;
	indexes: string[];
	stats: SearchResultStats;
}

export function newSearchResultResponse(): SearchResultResponse {
	return {
		id: '',
		indexes: [],
		stats: newSearchResultStats()
	};
}

export interface SearchResultStats {
	count: number;
	time: string;
}

function newSearchResultStats(): SearchResultStats {
	return {
		count: 0,
		time: ''
	};
}
