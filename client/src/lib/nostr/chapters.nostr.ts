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
import { relayService } from '$lib/services/relay.service';

export class ChapterApi {
  async getChapter(bibleLocationRef: string): Promise<any> {
    bibleLocationRef =
      bibleLocationReferenceService.extractBookIDChapter(bibleLocationRef);

    let filter = {
      "authors": [KJVONLY_PUBKEY],
      "#d": [`kjvonly/bible/kjvs/${bibleLocationRef}`]
    }

    // TODO remove this to actually hit cache
    let content = await relayService.getContent(filter)
    return JSON.parse(content)

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

  async getSearchIndex(): Promise<any> {
    // return offlineApi.cacheHitThenFetch(
    //   `/data/json.gz/bibleindex.json`,
    //   'v1',
    //   SEARCH,
    //   SEARCH
    // );
  }

  async getStrongs(key: string): Promise<any> {
    let filter = {
      "authors": [KJVONLY_PUBKEY],
      "#d": [`kjvonly/bible/strongs/{key}`]
    }

    let content = await relayService.getContent(filter)
    return JSON.parse(content)


    return offlineApi.cacheHitThenFetch(
      filter,
      key,
      STRONGS,
      STRONGS
    );
  }
}

export let chapterApi = new ChapterApi();
