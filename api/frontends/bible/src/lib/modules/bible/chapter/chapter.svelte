<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { chapterApi } from '$lib/api/chapters.api';
	import Verse from './verse.svelte';
	import { syncService } from '$lib/services/sync.service';
	import { annotsApi } from '$lib/api/annots.api';

	import uuid4 from 'uuid4';
	import { notesService } from '$lib/services/notes.service';
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';

	let searchID = uuid4();

	let showChapter: boolean = $state(true);

	let loadedBookName = $state();
	let loadedChapter = $state();
	let footnotes: any = $state();
	let verseRange: boolean = $state(false);

	let notes: any = $state();

	let rangeStartIndex = 0;
	let rangeEndIndex = 0;

	let {
		bibleLocationRef: bibleLocationRef = $bindable(),
		bookName = $bindable(),
		bookChapter = $bindable(),
		id = $bindable(),
		pane = $bindable(),
		mode = $bindable(),
		annotations = $bindable(),
		lastKnownScrollPosition
	} = $props();

	$effect(() => {
		if (!bibleLocationRef) {
			return;
		}
		mode.value = '';

		bookIDChapter =
			bibleLocationReferenceService.extractBookChapter(bibleLocationRef);

		let bcv = bibleLocationRef.split('_');

		if (bcv.length > 2) {
			// untrack(() => {
			// 	bibleLocationRef = `${bcv[0]}_${bcv[1]}`;
			// });
			let [start, end] =
				bibleLocationReferenceService.extractVerses(bibleLocationRef);

			if (start + end > 0) {
				verseRange = true;
				rangeStartIndex = start;
				rangeEndIndex = end;
			} else {
				setTimeout(() => {
					let e = document.getElementById(`${id}-vno-${bcv[2]}`);
					e?.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
						inline: 'nearest'
					});
					e?.classList.add('animate-pulse');
					setTimeout(() => {
						e?.classList.remove('animate-pulse');
					}, 4000);
				}, 250);
			}
		}

		if (bibleLocationRef) {
			let el = document.getElementById(id);
			el?.scrollTo(0, 0);
			annotations = {};
			loadAnnotations();
			loadNotes();
			loadChapter();
		}
	});

	let bookIDChapter = $state('');
	let verses: any = $state();
	let keys: string[] = $state([]);

	async function loadAnnotations() {
		annotations = await annotsApi.getAnnotations(bookIDChapter);
	}

	async function loadNotes() {
		notesService.searchNotes(
			searchID,
			bibleLocationReferenceService.extractBookChapter(bookIDChapter),
			['bookChapter']
		);
	}

	async function loadChapter() {
		let data = await chapterApi.getChapter(bookIDChapter);
		bookName = data['bookName'];
		bookChapter = data['number'];
		loadedBookName = bookName;
		loadedChapter = bookChapter;
		verses = data['verses'];
		footnotes = data['footnotes'];
		keys = Object.keys(verses).sort((a, b) => (Number(a) < Number(b) ? -1 : 1));

		if (verseRange) {
			keys = Object.keys(verses)
				.sort((a, b) => (Number(a) < Number(b) ? -1 : 1))
				.slice(rangeStartIndex, rangeEndIndex);
		} else {
			keys = Object.keys(verses).sort((a, b) =>
				Number(a) < Number(b) ? -1 : 1
			);
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

	onMount(async () => {
		syncService.subscribe('annotations', () => {
			loadAnnotations();
		});

		notesService.subscribe(searchID, onSearchResults);
		notesService.subscribe('*', loadNotes);
	});
</script>

<div class="px-4 leading-loose">
	{#if showChapter}
		{#each keys as k, idx}
			<span class="whitespace-normal" id={`${id}-vno-${idx + 1}`}>
				<Verse
					bind:pane
					bind:annotations
					bind:notes
					bind:mode
					verse={verses[k]}
					{footnotes}
					bibleLocationRef={bookIDChapter}
					{lastKnownScrollPosition}
				></Verse>
			</span>
		{/each}
		<div class="mt-18"></div>
	{/if}
</div>

<style>
</style>
