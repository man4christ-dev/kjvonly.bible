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
	indexes: FlexSearch.IndexSearchResult;
	stats: SearchResultStats;
}

export interface SearchResultStats {
	count: number;
	time: string;
}
