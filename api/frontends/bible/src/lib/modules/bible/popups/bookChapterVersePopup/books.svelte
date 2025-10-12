<script lang="ts">
	// ================================ IMPORTS ================================
	// SVELTE
	import { onMount, untrack } from 'svelte';

	// COMPONENTS
	import BufferBody from '$lib/components/bufferBody.svelte';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';

	// // SVGS
	import Close from '$lib/components/svgs/close.svelte';
	import Grid from '$lib/components/svgs/grid.svelte';
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import List from '$lib/components/svgs/list.svelte';

	// MODELS
	import type { Book, BookGrouping } from '$lib/models/bible.model';

	// SERVICES
	import { bookGroupingsService } from '$lib/services/bibleMetadata/bookGroupingByBookID.service';
	import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';

	// =============================== BINDINGS ================================
	let {
		showBookChapterPopup = $bindable<boolean>(),
		selectedBookID = $bindable<string>()
	}: {
		showBookChapterPopup: boolean;
		selectedBookID: string;
	} = $props();

	// ================================== VARS =================================

	let clientHeight: number = $state(0);
	let clientWidth: number = $state(0);
	let headerHeight: number = $state(0);

	let bookGroups: { [bookID: string]: BookGrouping } = $state({});
	let bookNamesSorted: Book[] = $state([]);
	let filteredBooks: Book[] = $state([]);
	let filterText: string = $state('');
	let showBookByGroup: boolean = $state(true);
	let showBookByList: boolean = $state(false);

	// =============================== LIFECYCLE ===============================
	onMount(async () => {
		setBookGroupings();
		setBookNames();
	});

	$effect(() => {
		filterText;
		untrack(() => {
			filterBooks();
		});
	});

	// ================================ FUNCS ==================================

	function filterBooks(): void {
		filteredBooks = bookNamesSorted.filter((b: Book) => {
			return b.name.toLowerCase().includes(filterText.toLowerCase());
		});
	}

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

	function onCloseClick(e: Event): void {
		e.stopPropagation();
		showBookChapterPopup = false;
	}

	function onListClick(e: Event): void {
		e.stopPropagation();
		showBookByGroup = false;
		showBookByList = true;
	}

	function onGridClick(e: Event): void {
		e.stopPropagation();
		showBookByGroup = true;
		showBookByList = false;
	}

	function onBookSelected(e: Event, bookID: any): void {
		e.stopPropagation();
		selectedBookID = bookID;
	}
</script>

<!-- ================================ HEADER =============================== -->
{#snippet header()}
	{#if showBookByGroup}
		<KJVButton classes="" onClick={onListClick}>
			<List classes=""></List>
		</KJVButton>
	{:else}
		<KJVButton classes="" onClick={onGridClick}>
			<Grid classes=""></Grid>
		</KJVButton>
	{/if}

	<KJVButton classes="" onClick={onCloseClick}>
		<Close classes=""></Close>
	</KJVButton>
{/snippet}

<!-- ================================= BODY ================================ -->
{#snippet body()}
	{@render filterInput()}
	{@render listBody()}
	{@render gridBody()}
{/snippet}

{#snippet filterInput()}
	<div bind:clientWidth class="sticky top-0 bg-neutral-50 py-2">
		<label class="sr-only" for="name">Name</label>
		<input
			class=" border-primary-500 w-full border-b-1 outline-none"
			placeholder="filter books"
			type="text"
			id="name"
			bind:value={filterText}
		/>
	</div>
{/snippet}

{#snippet gridBody()}
	{#if showBookByGroup}
		<div
			class="grid w-full {clientWidth < 250
				? 'grid-cols-3'
				: 'grid-cols-5'} gap-1"
		>
			{#each filteredBooks as b}
				<button
					onclick={(event) => onBookSelected(event, b.id)}
					class="cols-span-1 py-6 text-center text-wrap
							{bookGroups[b.id].bgcolor}  {bookGroups[b.id].textcolor}
							"
				>
					{bookGroups[b.id].name}
				</button>
			{/each}
		</div>
	{/if}
{/snippet}

{#snippet listBody()}
	{#if showBookByList}
		{#each filteredBooks as bn}
			<div class="w-full">
				<button
					onclick={(event) => onBookSelected(event, bn)}
					class="hover:bg-primary-50 w-full bg-neutral-50 p-4 text-start"
					>{bn.name}</button
				>
			</div>
		{/each}
	{/if}
{/snippet}

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
