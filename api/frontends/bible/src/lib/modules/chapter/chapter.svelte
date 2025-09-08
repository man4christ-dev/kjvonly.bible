<script lang="ts">
	import { onMount } from 'svelte';
	import { chapterApi } from '$lib/api/chapters.api';
	import Verse from './verse.svelte';
	import { syncService } from '$lib/services/sync.service';
	import { annotsApi } from '$lib/api/annots.api';

	import { extractBookChapter } from '$lib/utils/chapter';
	import uuid4 from 'uuid4';
	import { notesService } from '$lib/services/notes.service';
	import { numberToLetters } from '$lib/services/dynamicGrid.service';

	let searchID = uuid4();

	let showChapter: boolean = $state(true);

	let loadedBookName = $state();
	let loadedChapter = $state();
	let footnotes: any = $state();

	let notes: any = $state();

	let planStartIndex = $state(0)
	let planEndIndex = $state(0)

	let {
		chapterKey = $bindable(),
		bookName = $bindable(),
		bookChapter = $bindable(),
		id = $bindable(),
		pane = $bindable(),
		mode = $bindable(),
		annotations = $bindable(),
		lastKnownScrollPosition
	} = $props();

	$effect(() => {
		if (!chapterKey) {
			return;
		}

		mode.value = '';



		let bcv = chapterKey.split('_');

		if (mode.plan){
			if (bcv.length > 2){
				let verses = bcv[2].split('-')
				let start = parseInt(verses[0])
				let end =  parseInt(verses[1])

				if(!Number.isNaN(start) && !Number.isNaN(end)){
					planStartIndex = start - 1
					planEndIndex = end
				}
			}
		}
		if (bcv.length > 2) {
			chapterKey = `${bcv[0]}_${bcv[1]}`;
			setTimeout(() => {
				let e = document.getElementById(`${id}-vno-${bcv[2]}`);
				e?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
				e?.classList.add('scrolled-to');
				setTimeout(() => {
					e?.classList.remove('scrolled-to');
				}, 4000);
			}, 250);
		}

		if (chapterKey) {
			let el = document.getElementById(id);
			el?.scrollTo(0, 0);
			annotations = {};
			loadAnnotations();
			loadNotes();
			loadChapter();
		}
	});

	let verses: any = $state();
	let keys: string[] = $state([]);

	async function loadAnnotations() {
		annotations = await annotsApi.getAnnotations(chapterKey);
	}

	async function loadNotes() {
		notesService.searchNotes(searchID, extractBookChapter(chapterKey), ['bookChapter']);
	}

	async function loadChapter() {
		let data = await chapterApi.getChapter(chapterKey);
		bookName = data['bookName'];
		bookChapter = data['number'];
		loadedBookName = bookName;
		loadedChapter = bookChapter;
		verses = data['verses'];
		footnotes = data['footnotes'];

		if (mode.plan) {
 			keys = Object.keys(verses).sort((a, b) => (Number(a) < Number(b) ? -1 : 1)).slice(planStartIndex, planEndIndex);
		} else {
			keys = Object.keys(verses).sort((a, b) => (Number(a) < Number(b) ? -1 : 1));
		}
		
	}

	function onSearchResults(data: any) {
		if (data) {
			let tempNotes: any = {};
			Object.keys(data.notes).forEach((id) => (tempNotes[data.notes[id].chapterKey] = true));
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
			<!-- w-full required for safari. -->
			<span class="whitespace-normal" id={`${id}-vno-${idx + 1}`}>
				<Verse
					bind:pane
					bind:annotations
					bind:notes
					bind:mode
					verse={verses[k]}
					{footnotes}
					{chapterKey}
					{lastKnownScrollPosition}
				></Verse>
			</span>
		{/each}

		<div class="mt-16"></div>

		{#if mode.value !== ''}
			<div class="mt-32"></div>
		{/if}
	{/if}
</div>

<style>
	.scrolled-to {
		/* @apply animate-pulse; */
	}
</style>
