<script lang="ts">
	import { Modules } from '$lib/models/modules.model';
	import { paneService } from '$lib/services/pane.service.svelte';
	import { searchService } from '$lib/services/search.service';
	import { onDestroy, onMount } from 'svelte';
	import SearchResultActions from './searchResultActions.svelte';
	import { bibleDB } from '$lib/storer/bible.db';

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

	let searchResults: any[] = $state([]);
	let searchResultsObj: any = $state({});
	let loadedVerses: number = $state(0);
	// =============================== LIFECYCLE ===============================

	onMount(() => {
		searchService.subscribe(searchID, onSearchResult);

		let el = document.getElementById(`${searchID}-scroll-container`);

		el?.addEventListener('scroll', handleScroll);
	});

	function match(word: string) {
		let stripWord = word
			.toLowerCase()
			.replace(/[?.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
		let matchText = searchText.replaceAll('OR', '');
		return new RegExp('\\b' + stripWord + '\\b').test(matchText.toLowerCase());
	}

	function onSearchResultClicked(v: any) {
		let pane = paneService.findNode(paneService.rootPane, paneID);
		if (pane) {
			pane.buffer.bag = {
				chapterKey: v.key
			};
			pane?.updateBuffer(Modules.BIBLE);
		}
	}

	// ================================ FUNCS ==================================
	async function onSearchResult(data: any) {
		console.log(data, 'on search result2');
		if (onFilterIndex) {
			data.indexes = onFilterIndex(data.indexes);
		}
		console.log('before load');

		searchResultsObj = data;
		loadedVerses = 0;
		searchResults.length = 0;
		console.log('before load');
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
		console.log('load');
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

			console.log('push');
			searchResults.push(data);
		}
	}

	onDestroy(() => {
		searchService.unsubscribe(searchID);
	});
</script>

{#if searchResultsObj?.indexes && searchResultsObj?.indexes.length > 0}
	<p class="text-center">
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
</div>
