<script lang="ts">
	import { searchService } from '$lib/services/search.service';
	import { onMount } from 'svelte';
	import { paneService } from '$lib/services/pane.service.svelte';
	import uuid4 from 'uuid4';
	import { toastService } from '$lib/services/toast.service';
	import { bibleDB } from '$lib/storer/bible.db';
	import { Modules } from '$lib/models/modules.model';
	import Copy from '$lib/components/buttons/copy.svelte';
	import HorizontalSplit from '$lib/components/buttons/horizontalSplit.svelte';
	import VerticalSplit from '$lib/components/buttons/verticalSplit.svelte';
	import Close from '$lib/components/buttons/close.svelte';
	import BufferBody from '$lib/components/bufferBody.svelte';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import SearchResultActions from './searchResultActions.svelte';

	// =============================== BINDINGS ================================

	let {
		paneId = $bindable(),
		pane = $bindable(),
		containerHeight = $bindable(),
		containerWidth = $bindable(),
		showInput = true,
		searchTerms,
		onClose = undefined,
		onFilterIndex = undefined
	} = $props();

	// ================================== VARS =================================

	let clientHeight = $state(0);
	let headerHeight = $state(0);

	let searchID = uuid4();
	let searchInputHeight: number = $state(0);
	let searchText = $state('');
	let searchResults: any[] = $state([]);
	let searchResultsObj: any = $state({});
	let loadedVerses: number = $state(0);

	// =============================== LIFECYCLE ===============================

	onMount(() => {
		searchService.subscribe(searchID, onSearchResult);
		if (searchTerms?.length > 0) {
			searchText = searchTerms;
			searchService.search(searchID, searchTerms);
		}

		let el = document.getElementById(`${searchID}-scroll-container`);

		el?.addEventListener('scroll', handleScroll);
	});

	// ================================ FUNCS ==================================

	function match(word: string) {
		let stripWord = word
			.toLowerCase()
			.replace(/[?.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
		let matchText = searchText.replaceAll('OR', '');
		return new RegExp('\\b' + stripWord + '\\b').test(matchText.toLowerCase());
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
			let j = 0;
			j < 10 && loadedVerses !== searchResultsObj.indexes?.length;
			j++, loadedVerses++
		) {
			let bcvKey = searchResultsObj.indexes[loadedVerses];

			let chatperKeyIndex = bcvKey.lastIndexOf('_');
			let chapterKey = bcvKey.substring(0, chatperKeyIndex);
			let verseNumber = bcvKey.substring(chatperKeyIndex + 1, bcvKey.length);
			let chapter = await bibleDB.getValue('chapters', chapterKey);
			let verse = chapter['verseMap'][verseNumber];

			let data = {
				key: bcvKey,
				bookName: chapter['bookName'],
				number: chapter['number'],
				verseNumber: verseNumber,
				text: verse
			};

			searchResults.push(data);
		}
	}

	function onSearchTextChanged() {
		onFilterIndex = undefined;
		if (searchText.length < 3) {
			loadedVerses = 0;
			searchResults = [];
			searchResultsObj = {};
		} else {
			searchService.search(searchID, searchText);
		}
	}

	async function onSearchResult(data: any) {
		if (onFilterIndex) {
			data.indexes = onFilterIndex(data.indexes);
		}
		searchResultsObj = data;
		loadedVerses = 0;
		searchResults = [];
		await loadMoreVerses();
	}

	function applyOnClose() {
		if (onClose) {
			onClose();
		} else {
			paneService.onDeletePane(paneService.rootPane, paneId);
		}
	}

	// ============================== CLICK FUNCS ==============================

	function onCopyToClipboard(v: any) {
		let verse = `${v.bookName} ${v.number}:${v.verseNumber}\n${v.text}`;
		navigator.clipboard.writeText(verse);
		toastService.showToast(`Copied ${v.bookName} ${v.number}:${v.verseNumber}`);
	}

	function onSearchResultClicked(v: any) {
		let pane = paneService.findNode(paneService.rootPane, paneId);
		if (pane) {
			pane.buffer.bag = {
				chapterKey: v.key
			};
			pane?.updateBuffer(Modules.BIBLE);
		}
	}
</script>

{#snippet actions(v: any)}{/snippet}

{#snippet searchResultsSnippet()}
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
				<SearchResultActions bind:paneID={paneId} searchResult={sr}
				></SearchResultActions>
			</div>
		</div>
	{/each}
{/snippet}

<!-- ================================ HEADER =============================== -->
{#snippet header()}
	<div class="flex w-full items-center justify-between">
		<span class="w-12"></span>
		<span class="flex-1 text-center">Search</span>
		<Close classes="h-12 w-12" onClose={() => applyOnClose()}></Close>
	</div>
{/snippet}

<!-- ================================= BODY =============================+== -->
{#snippet body()}
	{#if showInput}
		<div class="flex w-full max-w-lg justify-center px-2 pt-2">
			<input
				bind:clientHeight={searchInputHeight}
				class="border-primary-500 w-full max-w-3xl border-b bg-neutral-50 outline-none"
				oninput={onSearchTextChanged}
				bind:value={searchText}
				placeholder="search"
			/>
		</div>
		{#if searchResultsObj?.indexes && searchResultsObj?.indexes.length > 0}
			<p class="text-center">
				Showing {loadedVerses} of {searchResultsObj?.indexes.length}
			</p>
		{/if}
		<div class="p-4">
			<div
				id="{searchID}-scroll-container"
				style="height: {clientHeight - headerHeight}px"
				class="{searchResults?.length > 0 ? '' : 'hidden'}
                  -m-1 max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50
                  "
			>
				{@render searchResultsSnippet()}

				<div class="h-6"></div>
			</div>
		</div>
	{:else}
		<!-- for bible references -->
		{@render searchResultsSnippet()}
	{/if}
{/snippet}

<!-- ============================== CONTAINER ============================== -->

<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		{@render header()}
	</BufferHeader>

	<BufferBody bind:headerHeight bind:clientHeight>
		{@render body()}
	</BufferBody>
</BufferContainer>
