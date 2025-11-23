import { bibleStorer } from '../storer/bible.storer';

import {
  CHAPTERS,
  BOOKNAMES,
  SEARCH,
  STRONGS
} from '$lib/storer/bible.db';

import { offlineApi } from './offline.nostr';
import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
import { KJVONLY_PUBKEY } from '$lib/utils/nostr';
import { CHAPTER_KIND } from './kinds';

export class ChapterApi {
  async getChapter(bibleLocationRef: string): Promise<any> {
    bibleLocationRef =
      bibleLocationReferenceService.extractBookIDChapter(bibleLocationRef);

    let filter = {
      "authors": [KJVONLY_PUBKEY],
      "kinds": [CHAPTER_KIND],
      "#d": [`kjvonly/bible/kjvs/${bibleLocationRef}`]
    }

    return offlineApi.cacheHitThenFetch(
      filter,
      bibleLocationRef,
      CHAPTERS,
      CHAPTERS
    );
  }

  async getBooknames(): Promise<any> {
    let filter = {
      "authors": [KJVONLY_PUBKEY],
      "#d": [`kjvs/booknames.json.gz.hex`]
    }

    return offlineApi.cacheHitThenFetch(
      filter,
      BOOKNAMES,
      BOOKNAMES,
      BOOKNAMES
    );
  }

}

export let chapterApi = new ChapterApi();
