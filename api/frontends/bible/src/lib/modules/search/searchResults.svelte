<script lang="ts">
	import { Modules } from '$lib/models/modules.model';
	import { paneService } from '$lib/services/pane.service.svelte';
	import { searchService } from '$lib/services/search.service';
	import { onDestroy, onMount } from 'svelte';
	import SearchResultActions from './searchResultActions.svelte';
	import { CHAPTERS } from '$lib/storer/bible.db';
	import type {
		SearchResult,
		SearchResultResponse
	} from '$lib/models/search.model';
	import { bibleStorer } from '$lib/storer/bible.storer';
	import {
		extractBookChapter,
		extractBookID,
		extractBookName,
		extractChapter,
		extractVerse
	} from '$lib/utils/chapter';
	import { jsonToChapter, type Chapter } from '$lib/models/bible.model';
	import { verseService } from '$lib/services/verse.service';
	import {
		bookNamesByIDService,
		BookNamesByIDService
	} from '$lib/services/bibleMetadata/bookNamesByID.service';

	// =============================== BINDINGS ================================

	let {
		paneID,
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

	let searchResults: SearchResult[] = $state([]);
	let searchResultsResponse: any = $state({});
	let loadedVersesCount: number = $state(0);

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

	async function onSearchResult(srr: SearchResultResponse) {
		if (onFilterIndex) {
			srr.indexes = onFilterIndex(srr.indexes);
		}
		searchResultsResponse = srr;
		loadedVersesCount = 0;
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
			i < 10 && loadedVersesCount !== searchResultsResponse.indexes?.length;
			i++, loadedVersesCount++
		) {
			let sr = await searchResultIndexToSearchResult(
				searchResultsResponse.indexes[loadedVersesCount]
			);
			if (!sr) {
				continue;
			}
			searchResults.push(sr);
		}
	}

	async function searchResultIndexToSearchResult(
		bcvKey: string
	): Promise<SearchResult | undefined> {
		let verse = await verseService.get(bcvKey);
		if (!verse) {
			return;
		}

		let sr: SearchResult = {
			key: bcvKey,
			bookName: extractBookName(bcvKey),
			number: extractChapter(bcvKey),
			verseNumber: verse.number,
			text: verse.text
		};

		return sr;
	}

	// ============================== CLICK FUNCS ==============================

	function onSearchResultClicked(sr: SearchResult) {
		let pane = paneService.findNode(paneService.rootPane, paneID);
		if (pane) {
			pane.buffer.bag = {
				chapterKey: sr.key
			};
			pane?.updateBuffer(Modules.BIBLE);
		}
	}
</script>

{#if searchResultsResponse?.indexes && searchResultsResponse?.indexes.length > 0}
	<p class="sticky top-10 bg-neutral-50 text-center">
		Showing {loadedVersesCount} of {searchResultsResponse?.indexes.length}
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
				<SearchResultActions {paneID} searchResult={sr}></SearchResultActions>
			</div>
		</div>
	{/each}
	<div class="h-6"></div>
</div>
