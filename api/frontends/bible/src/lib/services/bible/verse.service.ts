import type { Verse } from '$lib/models/bible.model';
import { bibleLocationReferenceService } from './bibleLocationReference.service';
import { chapterService } from './chapter.service';

class VerseService {
	async get(reference: string): Promise<Verse | undefined> {
		let chapter = await chapterService.get(reference);
		let verseNumber = bibleLocationReferenceService.extractVerse(reference);
		return chapter.verses.get(`${verseNumber}`);
	}
}

export const verseService = new VerseService();
