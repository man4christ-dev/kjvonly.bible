import type { Verse } from '$lib/models/bible.model';
import { extractVerse } from '$lib/utils/chapter';
import { chapterService } from './chapter.service';

class VerseService {
	async get(bcvKey: string): Promise<Verse | undefined> {
		let chapter = await chapterService.get(bcvKey);
		let verseNumber = extractVerse(bcvKey);
		return chapter.verses.get(`${verseNumber}`);
	}
}

export const verseService = new VerseService();
