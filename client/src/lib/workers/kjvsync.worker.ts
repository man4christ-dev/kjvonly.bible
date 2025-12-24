import { api } from '$lib/nostr/api';
import {
  BibleDB,
  ANNOTATIONS,
  UNSYNCED_ANNOTATIONS,
  NOTES,
  UNSYNCED_NOTES,
  CHAPTERS,
  BOOKNAMES,
  SEARCH,
  STRONGS,
  PARAGRAPHS
} from '$lib/storer/bible.db';
import { authService } from '$lib/services/auth.service';
import { offlineApi } from '$lib/nostr/offline.nostr';
import { downloadAndDecompressGzip } from '$lib/utils/gzip';

onmessage = async (e) => {
  switch (e.data.action) {
    case 'init':
      await syncAnnotsAndNotesFromServer(e.data);
      break;
    case 'sync':
      await syncAnnotsAndNotesFromServer(e.data);
      break;
    case 'chapters':
      fetchAndStoreAllBibleChapters(e.data.urls);
      break;
    case 'paragraphs':
      fetchAndStoreAllParagraphs(e.data.urls);
      break;
    case 'booknames':
      fetchAndStoreBooknames(e.data.urls);
      break;
    case 'strongs':
      fetchAndStoreStrongsDefs(e.data.urls);
      break;
    case 'search':
      fetchAndStoreSearchBibleIndex(e.data.urls);
  }
};

let db = await BibleDB.CreateAsync();

async function syncAnnotsAndNotesFromServer(data: any) {
  authService.setBearerToekn(data.token);

  // ----------------- SYNC ANNOTS ------------------------------------------
  await offlineApi.sync('/annots', UNSYNCED_ANNOTATIONS, ANNOTATIONS);
  postMessage({ id: 'annotations' });

  // ----------------- SYNC NOTES -------------------------------------------
  await offlineApi.sync('/notes', UNSYNCED_NOTES, NOTES);
  postMessage({ id: 'notes' });
}

// --------------------- SYNC STATIC DATA -------------------------------------
async function fetchAndStoreAllBibleChapters(urls: string[]) {
  for (let u of urls) {
    try {
      let json = ''
      if (u.endsWith('.gz')) {
        json = await downloadAndDecompressGzip(u)
      } else {
        throw new Error(`can only process gzip for chapters but got ${u}`)
      }
      let chapters = new Map<string, any>(Object.entries(JSON.parse(json)));
      chapters.forEach((chapter: any, bibleLocationRef: string) => {
        chapter['id'] = bibleLocationRef;
        db.putValue(CHAPTERS, chapter);
      });
      return
    } catch (err) {
      console.log(`error: ${err}`);
    }
  }
}

async function fetchAndStoreAllParagraphs(urls: string[]) {
  for (let u of urls) {
    try {
      let json = ''
      if (u.endsWith('.gz')) {
        json = await downloadAndDecompressGzip(u)
      } else {
        throw new Error(`can only process gzip for paragraphs but got ${u}`)
      }
      let chapters = new Map<string, any>(Object.entries(JSON.parse(json)));
      chapters.forEach((chapter: any, bibleLocationRef: string) => {
        if (chapter === null) {
          chapter = {}
        }
        chapter['id'] = bibleLocationRef;
        db.putValue(PARAGRAPHS, chapter);
      });
      return
    } catch (err) {
      console.log(`error: ${err}`);
    }
  }
}

async function fetchAndStoreBooknames(urls: string[]) {

  for (let u of urls) {
    try {
      let json = ''
      if (u.endsWith('.gz')) {
        json = await downloadAndDecompressGzip(u)
      } else {
        throw new Error(`can only process gzip for booknames but got ${u}`)
      }
      let data = JSON.parse(json)
      data['id'] = BOOKNAMES;
      db.putValue(BOOKNAMES, data);
    } catch (err) {
      console.log(`error: ${err}`);
    }
  }
}

async function fetchAndStoreSearchBibleIndex(urls: string[]) {
  for (let u of urls) {
    try {
      let json = ''
      if (u.endsWith('.gz')) {
        json = await downloadAndDecompressGzip(u)
      } else {
        throw new Error(`can only process gzip bibleindex but got ${u}`)
      }
      let data = JSON.parse(json)

      db.putValue(SEARCH, data);
    } catch (err) {
      console.log(`error: ${err}`);
    }
  }
}

async function fetchAndStoreStrongsDefs(urls: string[]) {
  for (let u of urls) {
    try {
      let json = ''
      if (u.endsWith('.gz')) {
        json = await downloadAndDecompressGzip(u)
      } else {
        throw new Error(`can only process gzip for strongs but got ${u}`)
      }
      let data = JSON.parse(json)

      let defs = new Map<string, any>(Object.entries(data));
      defs.forEach((def: any, key: string) => {
        def['id'] = key;
        db.putValue(STRONGS, def);
      });
    } catch (err) {
      console.log(`error: ${err}`);
    }
  }
}
