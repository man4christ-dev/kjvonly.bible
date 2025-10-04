import { jsonToChapter, type Chapter } from '$lib/models/bible.model';
import { CHAPTERS } from '$lib/storer/bible.db';
import { bibleStorer } from '$lib/storer/bible.storer';
import { bibleLocationReferenceService } from './bibleLocationReference.service';

class ChapterService {
	async get(reference: string): Promise<Chapter> {
		let bibleLocationRef =
			bibleLocationReferenceService.extractBookChapter(reference);
		return await jsonToChapter(
			bibleStorer.getValue(CHAPTERS, bibleLocationRef)
		);
	}
}

export const chapterService = new ChapterService();
