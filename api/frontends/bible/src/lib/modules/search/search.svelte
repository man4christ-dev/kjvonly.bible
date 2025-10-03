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
	// =============================== BINDINGS ================================

	let {
		paneId,
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

{#snippet actions(v: any)}
	<div class="flex flex-row justify-end space-x-4">
		<Copy
			onCopy={() => {
				onCopyToClipboard(v);
			}}
		></Copy>

		<HorizontalSplit
			paneID={paneId}
			module={Modules.BIBLE}
			data={{ chapterKey: v.key }}
		></HorizontalSplit>

		<VerticalSplit
			paneID={paneId}
			module={Modules.BIBLE}
			data={{ chapterKey: v.key }}
		></VerticalSplit>
	</div>
{/snippet}
{#snippet searchResultsSnippet()}
	{#each searchResults as v}
		<div
			tabindex="0"
			role="button"
			class="leading-loose"
			onclick={() => {
				onSearchResultClicked(v);
			}}
			onkeydown={() => {
				onSearchResultClicked(v);
			}}
		>
			<div class="text-left whitespace-normal hover:cursor-pointer">
				<span class="py-2 text-left font-bold"
					>{v.bookName} {v.number}:{v.verseNumber}</span
				>
				<span class="flex-fill flex"></span>
				{#each v.text.split(' ') as w, idx}
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
				{@render actions(v)}
			</div>
		</div>
	{/each}
{/snippet}

{#if showInput}
	<div bind:clientHeight style={containerHeight} class="overflow-hidden">
		<div class="flex flex-col items-center justify-center">
			<div
				bind:clientHeight={headerHeight}
				class="flex w-full flex-col items-center"
			>
				<div class="flex w-full max-w-lg justify-end bg-neutral-100">
					<button
						aria-label="close"
						onclick={() => {
							if (onClose) {
								onClose();
							} else {
								paneService.onDeletePane(paneService.rootPane, paneId);
							}
						}}
						class="h-12 w-12 px-2 pt-2 text-neutral-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="100%"
							height="100%"
						>
							<path
								class="fill-neutral-700"
								d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M17,15.59L15.59,17L12,13.41L8.41,17L7,15.59 L10.59,12L7,8.41L8.41,7L12,10.59L15.59,7L17,8.41L13.41,12L17,15.59z"
							/>
						</svg>
					</button>
				</div>
				<div class="flex w-full max-w-lg justify-center px-2 pt-2">
					<input
						bind:clientHeight={searchInputHeight}
						class=" border-primary-500 w-full max-w-3xl border-b bg-neutral-50 outline-none"
						oninput={onSearchTextChanged}
						bind:value={searchText}
						placeholder="search"
					/>
				</div>
				{#if searchResultsObj?.indexes && searchResultsObj?.indexes.length > 0}
					<p>Showing {loadedVerses} of {searchResultsObj?.indexes.length}</p>
				{/if}
			</div>
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
		</div>
	</div>
{:else}
	{@render searchResultsSnippet()}
{/if}

<style>
	@reference "../../../app.css";
</style>
