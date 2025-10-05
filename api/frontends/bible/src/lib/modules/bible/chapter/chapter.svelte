<script lang="ts">
	// ================================ IMPORTS ================================
	// SVELTE

	import { onDestroy, onMount } from 'svelte';

	// COMPONENTS
	import Verse from './verse.svelte';

	// MODELS
	import { type Verse as VerseModel } from '../../../models/bible.model';
	import { type Chapter } from '../../../models/bible.model';

	// SERVICES
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
	import { notesService } from '$lib/services/notes.service';
	import { syncService } from '$lib/services/sync.service';

	// API
	import { annotsApi } from '$lib/api/annots.api';

	// OTHER
	import uuid4 from 'uuid4';
	import { scrollTo, scrollToTop } from '$lib/utils/eventHandlers';
	import { chapterService } from '$lib/services/bible/chapter.service';

	// =============================== BINDINGS ================================

	let {
		bibleLocationRef: bibleLocationRef = $bindable(),
		id = $bindable(),
		pane = $bindable(),
		mode = $bindable(),
		annotations = $bindable(),
		lastKnownScrollPosition
	} = $props();

	// ================================= VARS ==================================

	let notesID = uuid4();

	let footnotes: any = $state();
	let hasVerseRange: boolean = $state(false);

	let notes: any = $state();

	let verseRangeStartIndex: number = 0;
	let verseRangeEndIndex: number = 0;

	let bookIDChapter: string = $state('');
	let chapter: Chapter | undefined = $state();
	let verses: Map<string, VerseModel> = $state(new Map());
	let versesToShow: string[] = $state([]);

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
		setBookChapterID();
		setVerseRanges();
		scrollToVerse();
		resetAnnotations();
		loadAnnotations();
		loadNotes();
		loadChapter();
	});

	// ================================ FUNCS ==================================

	function resetMode() {
		mode.value = '';
	}

	function resetAnnotations() {
		annotations = {};
	}

	function setBookChapterID() {
		bookIDChapter =
			bibleLocationReferenceService.extractBookIDChapter(bibleLocationRef);
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
		annotations = await annotsApi.getAnnotations(bookIDChapter);
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
			bibleLocationReferenceService.extractBookIDChapter(bookIDChapter),
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
			versesToShow = verses
				.keys()
				.toArray()
				.sort((a, b) => (Number(a) < Number(b) ? -1 : 1))
				.slice(verseRangeStartIndex, verseRangeEndIndex);
		} else {
			versesToShow = verses
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
	{#each versesToShow as k, idx}
		<span class="whitespace-normal" id={`${id}-vno-${idx + 1}`}>
			<Verse
				bind:pane
				bind:annotations
				bind:notes
				bind:mode
				verse={chapter?.verses.get(k)}
				bibleLocationRef={bookIDChapter}
				{footnotes}
				{lastKnownScrollPosition}
			></Verse>
		</span>
	{/each}
	<div class="mt-18"></div>
</div>
