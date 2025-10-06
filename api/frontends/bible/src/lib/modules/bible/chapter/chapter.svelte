<script lang="ts">
	// ================================ IMPORTS ================================
	// SVELTE

	import { onDestroy, onMount } from 'svelte';

	// COMPONENTS
	import Verse from './verse.svelte';

	// MODELS
	import {
		BIBLE_MODES,
		newAnnotation,
		type Annotations,
		type BibleMode,
		type Verse as VerseModel
	} from '../../../models/bible.model';
	import { type Chapter } from '../../../models/bible.model';

	// SERVICES
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
	import { chapterService } from '$lib/services/bible/chapter.service';
	import { notesService } from '$lib/services/notes.service';
	import { syncService } from '$lib/services/sync.service';

	// API
	import { annotsApi } from '$lib/api/annots.api';

	// OTHER
	import uuid4 from 'uuid4';
	import { scrollTo, scrollToTop } from '$lib/utils/eventHandlers';
	import type { Pane } from '$lib/models/pane.model';

	// =============================== BINDINGS ================================

	let {
		bibleLocationRef = $bindable<string>(),
		id = $bindable<string>(),
		pane = $bindable<Pane>(),
		mode = $bindable<BibleMode>(),
		annotations = $bindable<Annotations>(),
		lastKnownScrollPosition
	}: {
		bibleLocationRef: string;
		id: string;
		pane: Pane;
		mode: BibleMode;
		annotations: Annotations;
		lastKnownScrollPosition: number;
	} = $props();

	// ================================= VARS ==================================

	let notesID = uuid4();

	let footnotes: Map<string, string> = $state(new Map());
	let hasVerseRange: boolean = $state(false);

	let notes: any = $state();

	let verseRangeStartIndex: number = 0;
	let verseRangeEndIndex: number = 0;

	let chapter: Chapter | undefined = $state();
	let verses: Map<string, VerseModel> = $state(new Map());
	let versesNumbersToShow: string[] = $state([]);

	// =============================== LIFECYCLE ===============================

	onMount(async () => {
		subscribeToAnnotations();
		subscribeToNotes();
	});

	onDestroy(() => {
		unsubscribeToAnnotations();
		unsubscribeToNotes();
	});

	$effect(() => {
		bibleLocationRef;
		resetMode();
		setVerseRanges();
		scrollToVerse();
		resetAnnotations();
		loadAnnotations();
		loadNotes();
		loadChapter();
	});

	// ================================ FUNCS ==================================

	function resetMode() {
		mode.value = BIBLE_MODES.READING;
	}

	function resetAnnotations() {
		annotations = newAnnotation();
	}

	function setVerseRanges() {
		let [start, end] =
			bibleLocationReferenceService.extractVerses(bibleLocationRef);
		hasVerseRange = start + end > 0;
		verseRangeStartIndex = start;
		verseRangeEndIndex = end;
	}

	function scrollToVerse() {
		if (bibleLocationReferenceService.hasVerse(bibleLocationRef)) {
			let verseNumber =
				bibleLocationReferenceService.extractVerse(bibleLocationRef);
			scrollTo(`${id}-vno-${verseNumber}`, animateScrolledToVerse);
		} else {
			scrollToTop(`${id}-scroll-container`, (el: HTMLElement) => {});
		}
	}

	function animateScrolledToVerse(el: HTMLElement) {
		el?.classList.add('animate-pulse');
		setTimeout(() => {
			el?.classList.remove('animate-pulse');
		}, 4000);
	}

	function subscribeToAnnotations() {
		syncService.subscribe(id, 'annotations', () => {
			loadAnnotations();
		});
	}

	function unsubscribeToAnnotations() {
		syncService.unsubscribe(id);
	}

	async function loadAnnotations() {
		annotations = await annotsApi.getAnnotations(bibleLocationRef);
	}

	function subscribeToNotes() {
		notesService.subscribe(id, notesID, onSearchResults);
		notesService.subscribe(id, '*', loadNotes);
	}

	function unsubscribeToNotes() {
		notesService.unsubscribe(id);
	}

	async function loadNotes() {
		notesService.searchNotes(
			notesID,
			bibleLocationReferenceService.extractBookIDChapter(bibleLocationRef),
			['bookChapter']
		);
	}

	async function loadChapter() {
		chapter = await chapterService.get(bibleLocationRef);
		verses = chapter.verses;
		footnotes = chapter.footnotes;
		setChapterVersesToShow();
	}

	function setChapterVersesToShow() {
		if (hasVerseRange) {
			versesNumbersToShow = verses
				.keys()
				.toArray()
				.sort((a, b) => (Number(a) < Number(b) ? -1 : 1))
				.slice(verseRangeStartIndex, verseRangeEndIndex);
		} else {
			versesNumbersToShow = verses
				.keys()
				.toArray()
				.sort((a, b) => (Number(a) < Number(b) ? -1 : 1));
		}
	}

	function onSearchResults(data: any) {
		if (data) {
			let tempNotes: any = {};
			Object.keys(data.notes).forEach(
				(id) => (tempNotes[data.notes[id].bibleLocationRef] = true)
			);
			notes = tempNotes;
		}
	}
</script>

<div class="px-4 leading-loose">
	{#each versesNumbersToShow as k, idx}
		<span class="whitespace-normal" id={`${id}-vno-${idx + 1}`}>
			<Verse
				bind:pane
				bind:annotations
				bind:notes
				bind:mode
				verse={chapter?.verses.get(k)}
				{bibleLocationRef}
				{footnotes}
				{lastKnownScrollPosition}
			></Verse>
		</span>
	{/each}
	<div class="mt-18"></div>
</div>
