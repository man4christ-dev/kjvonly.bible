export interface StrongsPopups {
	searchPopup: searchPopup | undefined;
}

export interface searchPopup {
	paneID: string;
	searchTerms: string;
	onFilterBibleLocationRefByBookID: (refs: string[]) => string[];
}

export function newStrongsPopups(): StrongsPopups {
	return {
		searchPopup: undefined
	};
}
