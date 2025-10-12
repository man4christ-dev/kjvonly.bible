<script lang="ts">
	// ================================ IMPORTS ================================
	// SVELTE

	// COMPONENTS
	import Close from '$lib/components/svgs/close.svelte';
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import { onMount } from 'svelte';
	import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';
	import type { BookGrouping } from '$lib/models/bible.model';
	import { bookGroupingsService } from '$lib/services/bibleMetadata/bookGroupingByBookID.service';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import BufferBody from '$lib/components/bufferBody.svelte';
	import List from '$lib/components/svgs/list.svelte';
	import Grid from '$lib/components/svgs/grid.svelte';

	// MODELS
	// SERVICES
	// =============================== BINDINGS ================================
	// ================================== VARS =================================

	let {
		showBookChapterPopup = $bindable<boolean>()
	}: {
		showBookChapterPopup: boolean;
	} = $props();

	interface book {
		id: string;
		name: string;
	}

	let clientHeight: number = $state(0);
	let headerHeight: number = $state(0);

	let bookGroups: { [bookID: string]: BookGrouping } = $state({});
	let bookNamesSorted: book[] = $state([]);
	let filteredBooks: book[] = $state([]);
	let filterText: string = $state('');
	let group: boolean = $state(true);

	let selectedBook = $state();

	// =============================== LIFECYCLE ===============================
	onMount(async () => {
		setBookGroupings();
		setBookNames();
	});

	$effect(() => {
		filterText;
		filteredBooks = bookNamesSorted.filter((b: book) => {
			return b.name.toLowerCase().includes(filterText.toLowerCase());
		});
	});

	// ================================ FUNCS ==================================

	function setBookNames(): void {
		bookNamesSorted = bookNamesByIDService.map
			.entries()
			.toArray()
			.sort((a, b) => Number(a[0]) - Number(b[0]))
			.map((a) => {
				return { id: a[0], name: a[1] };
			});
		filteredBooks = [...bookNamesSorted];
	}

	function setBookGroupings(): void {
		bookGroups = bookGroupingsService.bookGroups;
	}

	// ============================== CLICK FUNCS ==============================

	// ================================ IMPORTS ================================

	// ============================== CLICK FUNCS ==============================

	function onCloseClick(): void {
		if (selectedBook) {
			selectedBook === undefined;
		} else {
			showBookChapterPopup = false;
		}
	}

	function onListClick(): void {
		group = !group;
	}
</script>

<!-- ================================ HEADER =============================== -->
{#snippet header()}
	<div>
		{#if group}
			<KJVButton classes="" onClick={onListClick}>
				<List classes="h-24 w-24"></List>
			</KJVButton>
		{:else}
			<KJVButton classes="" onClick={onListClick}>
				<Grid classes="h-6 w-6"></Grid>
			</KJVButton>
		{/if}
	</div>
	<KJVButton classes="" onClick={onCloseClick}>
		<Close classes=""></Close>
	</KJVButton>
{/snippet}

<!-- ================================= BODY ================================ -->
{#snippet listBody()}{/snippet}

{#snippet gridBody()}{/snippet}

{#snippet body()}{/snippet}

<!-- ================================ FOOTER =============================== -->
<!-- ============================== CONTAINER ============================== -->
<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		{@render header()}
	</BufferHeader>
	<BufferBody bind:clientHeight bind:headerHeight>
		{@render body()}
	</BufferBody>
</BufferContainer>
