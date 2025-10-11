<script lang="ts">
	// ================================ IMPORTS ================================
	// SVELTE
	import { onMount } from 'svelte';

	// COMPONENTS
	import BufferBody from '$lib/components/bufferBody.svelte';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import Close from '$lib/components/buttons/close.svelte';
	import SearchInput from './searchInput.svelte';
	import SearchResults from './searchResults.svelte';

	// MODELS
	import type { Pane } from '$lib/models/pane.model';

	// SERVICES
	import { paneService } from '$lib/services/pane.service.svelte';
	import { searchService } from '$lib/services/search.service';

	// OTHER
	import uuid4 from 'uuid4';

	// =============================== BINDINGS ================================

	let {
		paneID = $bindable<string>(),
		pane = $bindable<Pane>(),
		showInput = true,
		searchTerms,
		onClose = undefined,
		onFilterBibleLocationRef = undefined
	} = $props();

	// ================================= VARS ==================================

	// DOM vars
	let clientHeight = $state(0);
	let headerHeight = $state(0);

	// component vars
	let searchID: string = uuid4();
	let searchText = $state('');

	// =============================== LIFECYCLE ===============================

	onMount(() => {
		if (searchTerms?.length > 0) {
			searchText = searchTerms;
			searchService.search(searchID, searchTerms);
		}
	});

	function applyOnClose() {
		if (onClose) {
			onClose();
		} else {
			paneService.onDeletePane(paneService.rootPane, paneID);
		}
	}
</script>

<!-- ================================ HEADER =============================== -->

{#snippet header()}
	<div class="flex w-full items-center justify-between">
		<span class="w-12"></span>
		<span class="flex-1 text-center">Search</span>
		<Close btnClasses="h-12 w-12" onClick={applyOnClose}></Close>
	</div>
{/snippet}

<!-- ================================= BODY ================================ -->

{#snippet body()}
	{#if showInput}
		<SearchInput bind:searchText ID={searchID} {onFilterBibleLocationRef}
		></SearchInput>
	{/if}
	<SearchResults {paneID} bind:searchText {searchID} {onFilterBibleLocationRef}
	></SearchResults>

	<div class="h-6"></div>
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
