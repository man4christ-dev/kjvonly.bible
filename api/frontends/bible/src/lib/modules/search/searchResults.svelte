<script lang="ts">
	import { Modules } from '$lib/models/modules.model';
	import { paneService } from '$lib/services/pane.service.svelte';
	import { searchService } from '$lib/services/search.service';
	import { onDestroy, onMount } from 'svelte';
	import SearchResultActions from './searchResultActions.svelte';
	import { bibleDB, CHAPTERS } from '$lib/storer/bible.db';
	import type { SearchResult } from '$lib/models/search.model';
	import { bibleStorer } from '$lib/storer/bible.storer';
	import { extractBookChapter, extractVerse } from '$lib/utils/chapter';

	// =============================== BINDINGS ================================

	let {
		paneID = $bindable(),
		searchText = $bindable(),
		searchID,
		onFilterIndex = $bindable()
	}: {
		paneID: string;
		searchText: string;
		searchID: string;
		onFilterIndex: any;
	} = $props();

	// ================================== VARS =================================

	let searchResults: any[] = $state([]);
	let searchResultsObj: any = $state({});
	let loadedVerses: number = $state(0);

	// =============================== LIFECYCLE ===============================

	onMount(() => {
		searchService.subscribe(searchID, onSearchResult);

		let el = document.getElementById(`${searchID}-scroll-container`);

		el?.addEventListener('scroll', handleScroll);
	});

	onDestroy(() => {
		searchService.unsubscribe(searchID);
	});

	function match(word: string) {
		let stripWord = word
			.toLowerCase()
			.replace(/[?.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
		let matchText = searchText.replaceAll('OR', '');
		return new RegExp('\\b' + stripWord + '\\b').test(matchText.toLowerCase());
	}

	// ================================ FUNCS ==================================

	async function onSearchResult(data: any) {
		if (onFilterIndex) {
			data.indexes = onFilterIndex(data.indexes);
		}
		searchResultsObj = data;
		loadedVerses = 0;
		searchResults = [];
		await loadMoreVerses();
	}

	function handleScroll() {
		let el = document.getElementById(`${searchID}-scroll-container`);
		if (el === null) {
			return;
		}

		const threshold = 20; // Adjust this value as needed
		const isReachBottom =
			el.scrollHeight - el.clientHeight - el.scrollTop <= threshold;

		if (isReachBottom) {
			loadMoreVerses();
		}
	}

	async function loadMoreVerses() {
		for (
			let i = 0;
			i < 10 && loadedVerses !== searchResultsObj.indexes?.length;
			i++, loadedVerses++
		) {
			let bcvKey = searchResultsObj.indexes[loadedVerses];

			let chapterKey = extractBookChapter(bcvKey);
			let verseNumber = extractVerse(bcvKey);
			let chapter = await bibleStorer.getValue(CHAPTERS, chapterKey);
			let verse = chapter['verseMap'][verseNumber];

			let data: SearchResult = {
				key: bcvKey,
				bookName: chapter['bookName'],
				number: chapter['number'],
				verseNumber: verseNumber,
				text: verse
			};

			searchResults.push(data);
		}
	}

	// ============================== CLICK FUNCS ==============================

	function onSearchResultClicked(v: any) {
		let pane = paneService.findNode(paneService.rootPane, paneID);
		if (pane) {
			pane.buffer.bag = {
				chapterKey: v.key
			};
			pane?.updateBuffer(Modules.BIBLE);
		}
	}
</script>

{#if searchResultsObj?.indexes && searchResultsObj?.indexes.length > 0}
	<p class="sticky top-10 bg-neutral-50 text-center">
		Showing {loadedVerses} of {searchResultsObj?.indexes.length}
	</p>
{/if}

<div class={searchResults?.length > 0 ? '' : 'hidden'}>
	{#each searchResults as sr}
		<div
			tabindex="0"
			role="button"
			class="leading-loose"
			onclick={() => {
				onSearchResultClicked(sr);
			}}
			onkeydown={(e: KeyboardEvent) => {
				if (e.key === 'Enter') {
					onSearchResultClicked(sr);
				}
			}}
		>
			<div class="text-left whitespace-normal hover:cursor-pointer">
				<span class="py-2 text-left font-bold"
					>{sr.bookName} {sr.number}:{sr.verseNumber}</span
				>
				<span class="flex-fill flex"></span>
				{#each sr.text.split(' ') as w, idx}
					{#if match(w)}
						<span>
							{#if idx !== 0}<span>&nbsp;</span>{/if}
							<span class="text-redtxt">{w}</span>
						</span>
					{:else}
						<span>
							{#if idx !== 0}<span>&nbsp;</span>{/if}
							<span class="">{w}</span>
						</span>
					{/if}
				{/each}
				<SearchResultActions bind:paneID searchResult={sr}
				></SearchResultActions>
			</div>
		</div>
	{/each}
	<div class="h-6"></div>
</div>
