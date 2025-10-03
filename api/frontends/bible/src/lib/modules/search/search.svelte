<script lang="ts">
	import { searchService } from '$lib/services/search.service';
	import { onMount } from 'svelte';
	import { paneService } from '$lib/services/pane.service.svelte';
	import uuid4 from 'uuid4';
	import Close from '$lib/components/buttons/close.svelte';
	import BufferBody from '$lib/components/bufferBody.svelte';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import SearchResults from './searchResults.svelte';

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

	let searchID: string = uuid4();
	let searchInputHeight: number = $state(0);
	let searchText = $state('');

	// =============================== LIFECYCLE ===============================

	onMount(() => {
		if (searchTerms?.length > 0) {
			searchText = searchTerms;
			searchService.search(searchID, searchTerms);
		}
	});

	function onSearchTextChanged() {
		onFilterIndex = undefined;
		if (searchText.length > 2) {
			console.log(searchText);
			searchService.search(searchID, searchText);
		}
	}

	function applyOnClose() {
		if (onClose) {
			onClose();
		} else {
			paneService.onDeletePane(paneService.rootPane, paneId);
		}
	}

	// ============================== CLICK FUNCS ==============================
</script>

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

		<SearchResults
			bind:paneID={paneId}
			bind:searchText
			{searchID}
			{onFilterIndex}
		></SearchResults>

		<div class="h-6"></div>
	{:else}
		<!-- for bible references -->
		<SearchResults
			bind:paneID={paneId}
			bind:searchText
			{searchID}
			{onFilterIndex}
		></SearchResults>
	{/if}
{/snippet}

<!-- ============================== CONTAINER ============================== -->

<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		{@render header()}
	</BufferHeader>

	<BufferBody ID={searchID} bind:headerHeight bind:clientHeight>
		{@render body()}
	</BufferBody>
</BufferContainer>
