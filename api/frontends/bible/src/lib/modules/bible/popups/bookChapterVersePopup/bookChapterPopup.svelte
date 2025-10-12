<script lang="ts">
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import Close from '$lib/components/svgs/close.svelte';
	import List from '$lib/components/svgs/list.svelte';
	import type { BookGrouping } from '$lib/models/bible.model';
	import { bookGroupingsService } from '$lib/services/bibleMetadata/bookGroupingByBookID.service';
	import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';
	import { booksChaptersVerseCountByIDService } from '$lib/services/bibleMetadata/booksChaptersVerseCountByID.service';
	import { onMount } from 'svelte';
	import Books from './books.svelte';

	let { bibleLocationRef = $bindable(), showBookChapterPopup = $bindable() } =
		$props();

	let bookNamesSorted: any[] = $state([]);
	let filteredBooks: any[] = $state([]);
	let filterText: string = $state('');
	let selectedBook: any = $state();
	let group = $state(true);
	let clientWidth = $state(0);
	let bookGroups: { [bookID: string]: BookGrouping } = $state({});
	let chapters: string[] = $state([]);

	function bookSelected(event: Event, bn: any) {
		event.stopPropagation();
		selectedBook = bn;
	}

	let clientHeight = $state(0);
	let headerHeight = $state(0);

	function onListClick(): void {
		group = !group;
	}
	function onCloseClick(): void {
		if (selectedBook) {
			selectedBook === undefined;
		} else {
			showBookChapterPopup = false;
		}
	}
</script>

{#snippet headerLeft()}
	{#if !selectedBook}
		{#if group}
			<KJVButton classes="" onClick={onListClick}>
				<List classes="h-5 w-5"></List>
			</KJVButton>
		{:else}{/if}
	{/if}
{/snippet}

{#snippet headerCenter()}
	<div class="flex items-center justify-center">
		{#if selectedBook}
			<h1 class=" text-center">CHAPTER</h1>
		{:else}
			<h1 class=" text-center">Book</h1>
		{/if}
	</div>
{/snippet}

{#snippet headerRight()}
	<KJVButton classes="" onClick={onCloseClick}>
		<Close classes="h-5 w-5"></Close>
	</KJVButton>
{/snippet}

{#snippet header()}
	<header
		bind:clientHeight={headerHeight}
		class="sticky top-0 w-full flex-col border-b-2 bg-neutral-100 text-neutral-700"
	>
		<div class="flex w-full items-center justify-between p-2">
			{@render headerLeft()}
			{@render headerCenter()}
			{@render headerRight()}
		</div>

		{#if selectedBook === undefined}
			<div class="p-2">
				<label class="sr-only" for="name">Name</label>
				<input
					class="w-full rounded-lg border-none bg-neutral-50 p-3 text-sm outline-none"
					placeholder="Filter Books..."
					type="text"
					id="name"
					bind:value={filterText}
				/>
			</div>
		{/if}
	</header>
{/snippet}
{#if false}
	<div
		bind:clientHeight
		class="flex h-full w-full justify-center bg-neutral-50"
	>
		<div class="w-full md:max-w-lg">
			{@render header()}
			<div
				bind:clientWidth
				style="height: {clientHeight - headerHeight}px"
				class="flex w-full flex-col overflow-y-scroll border"
			>
				{#if selectedBook}
					<div class="grid w-[100%] grid-cols-5">
						{#each chapters as ch}
							<button
								onclick={() => {}}
								class="hover:bg-primary-50 row-span-1 bg-neutral-50 p-4"
								>{ch}</button
							>
						{/each}
					</div>
				{:else if group}
					<div
						class="grid w-full {clientWidth < 250
							? 'grid-cols-3'
							: 'grid-cols-5'} gap-1"
					>
						{#each filteredBooks as bn}
							<button
								onclick={(event) => bookSelected(event, bn)}
								class="cols-span-1 py-6 text-center text-wrap hover:cursor-pointer
							{bookGroups[bn.id].bgcolor}  {bookGroups[bn.id].textcolor}
							"
							>
								{bookGroups[bn.id].name}
							</button>
						{/each}
					</div>
				{:else}
					{#each filteredBooks as bn}
						<div class="w-full">
							<button
								onclick={(event) => bookSelected(event, bn)}
								class="hover:bg-primary-50 w-full bg-neutral-50 p-4 text-start"
								>{bn.name}</button
							>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}

<Books bind:showBookChapterPopup></Books>
