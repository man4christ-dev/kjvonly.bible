import { chapterApi } from '$lib/api/chapters.api';
import { jsonToChapter, type Chapter } from '$lib/models/bible.model';
import { CHAPTERS } from '$lib/storer/bible.db';
import { bibleStorer } from '$lib/storer/bible.storer';
import { bibleLocationReferenceService } from './bibleLocationReference.service';

class ChapterService {
	async get(ref: string): Promise<Chapter> {
		let chapter = chapterApi.getChapter(ref);
		return await jsonToChapter(chapter);
	}
}

export const chapterService = new ChapterService();
