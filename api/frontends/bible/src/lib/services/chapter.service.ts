import { jsonToChapter, type Chapter } from '$lib/models/bible.model';
import { CHAPTERS } from '$lib/storer/bible.db';
import { bibleStorer } from '$lib/storer/bible.storer';
import { extractBookChapter } from '$lib/utils/chapter';

class ChapterService {
	async get(bcvKey: string): Promise<Chapter> {
		let chapterKey = extractBookChapter(bcvKey);
		return await jsonToChapter(bibleStorer.getValue(CHAPTERS, chapterKey));
	}
}

export const chapterService = new ChapterService();
