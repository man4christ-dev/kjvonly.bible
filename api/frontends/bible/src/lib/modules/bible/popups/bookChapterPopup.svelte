<script lang="ts">
	import type { BookGrouping } from '$lib/models/bible.model';
	import { bookGroupingsService } from '$lib/services/bibleMetadata/bookGroupingByBookID.service';
	import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';
	import { booksChaptersVerseCountByIDService } from '$lib/services/bibleMetadata/booksChaptersVerseCountByID.service';
	import { onMount } from 'svelte';

	let { bibleLocationRef = $bindable(), showBookChapterPopup = $bindable() } =
		$props();

	let bookIds: any;
	let bookNamesSorted: any[] = $state([]);
	let filteredBooks: any[] = $state([]);
	let filterText: string = $state('');
	let selectedBook: any = $state();
	let group = $state(true);
	let clientWidth = $state(0);
	let bookGroups: { [bookID: string]: BookGrouping } = $state({});
	let chapters: string[] = $state([]);

	$effect(() => {
		filterText;

		filteredBooks = bookNamesSorted.filter(
			(book: { name: string; id: number }) => {
				return book.name.toLowerCase().includes(filterText.toLowerCase());
			}
		);
	});

	onMount(async () => {
		setBookGroupings();
		setBookNames();
	});

	function setBookNames() {
		bookNamesSorted = bookNamesByIDService.map
			.entries()
			.toArray()
			.sort((a, b) => Number(a[0]) - Number(b[0]))
			.map((a) => {
				return { id: a[0], name: a[1] };
			});
		filteredBooks = [...bookNamesSorted];
	}

	function setBookGroupings() {
		bookGroups = bookGroupingsService.bookGroups;
	}

	function bookSelected(event: Event, bn: any) {
		event.stopPropagation();
		selectedBook = bn;
		chapters = booksChaptersVerseCountByIDService
			.get(selectedBook.id)
			?.keys()
			.toArray()
			.sort((a, b) => Number(a) - Number(b));
	}
	function chapterSelected(ch: any) {
		bibleLocationRef = `${selectedBook.id}_${ch}`;
		showBookChapterPopup = false;
		selectedBook = undefined;
	}

	let clientHeight = $state(0);
	let headerHeight = $state(0);
</script>

<div bind:clientHeight class="flex h-full w-full justify-center bg-neutral-50">
	<div class="w-full md:max-w-lg">
		<header
			bind:clientHeight={headerHeight}
			class="sticky top-0 w-full flex-col border-b-2 bg-neutral-100 text-neutral-700"
		>
			<div class="flex w-full items-center justify-between p-2">
				{#if !selectedBook}
					<button
						onclick={() => {
							group = !group;
						}}
						class="h-8 w-8"
					>
						{#if !group}
							<svg
								version="1.1"
								id="svg2"
								width="100%"
								height="100%"
								viewBox="0 0 133.33333 133.33333"
								xmlns="http://www.w3.org/2000/svg"
							>
								<defs id="defs6" />
								<g id="g8">
									<path
										class="fill-neutral-700"
										d="m 11.555555,121.77777 c -0.488889,-0.48888 -0.888889,-5.88888 -0.888889,-12 V 98.666664 h 12 12 v 11.999996 12 H 23.555555 c -6.111111,0 -11.511111,-0.4 -12,-0.88889 z M 39.999999,110.66666 V 98.666664 h 12 11.999999 v 11.999996 12 h -11.999999 -12 z m 29.333333,0 V 98.666664 h 11.999999 12 v 11.999996 12 h -12 -11.999999 z m 29.333332,0.0519 V 98.666664 h 12.051906 12.05191 L 122.38524,110.33333 122,122 l -11.66667,0.38524 -11.666666,0.38524 z M 10.666666,81.333331 V 69.333332 h 12 12 v 11.999999 12 h -12 -12 z m 29.333333,0 V 69.333332 h 12 11.999999 v 11.999999 12 h -11.999999 -12 z m 29.333333,0 V 69.333332 h 11.999999 12 v 11.999999 12 h -12 -11.999999 z m 29.333332,0 V 69.333332 h 11.999996 12 v 11.999999 12 h -12 -11.999996 z M 10.666666,51.999999 v -12 h 12 12 v 12 11.999999 h -12 -12 z m 29.333333,0 v -12 h 12 11.999999 v 12 11.999999 h -11.999999 -12 z m 29.333333,0 v -12 h 11.999999 12 v 12 11.999999 h -12 -11.999999 z m 29.333332,0 v -12 h 11.999996 12 v 12 11.999999 h -12 -11.999996 z m -87.718575,-29 0.385244,-11.666666 11.666666,-0.385244 11.666667,-0.385244 v 12.05191 12.051911 H 22.614755 10.562845 Z m 29.05191,-0.333333 v -12 h 12 11.999999 v 12 12 h -11.999999 -12 z m 29.333333,0 v -12 h 11.999999 12 v 12 12 h -12 -11.999999 z m 29.333332,-0.05191 V 10.562845 L 110.33333,10.948089 122,11.333333 l 0.38524,11.666666 0.38524,11.666667 H 110.71857 98.666664 Z"
										id="path170"
									/>
								</g>
							</svg>
						{:else}
							<svg
								version="1.1"
								id="svg252"
								width="100%"
								height="100%"
								viewBox="0 0 64 64"
								xmlns="http://www.w3.org/2000/svg"
							>
								<defs id="defs256" />
								<g id="g258">
									<path
										class="fill-neutral-700"
										d="m 4.5180539,50.093516 c -1.3275582,-3.459561 0.533177,-6.318913 3.8093184,-5.853699 4.2727997,0.606742 4.2727997,6.913624 0,7.520366 -1.803039,0.256033 -3.3274476,-0.410932 -3.8093184,-1.666667 z M 18.666667,48 c 0,-2.548148 0.888889,-2.666667 20,-2.666667 19.11111,0 20,0.11852 20,2.666667 0,2.548148 -0.88889,2.666667 -20,2.666667 -19.111111,0 -20,-0.11852 -20,-2.666667 z M 4.5180539,34.093516 c -1.3275582,-3.459561 0.533177,-6.318913 3.8093184,-5.853699 4.2727997,0.606742 4.2727997,6.913624 0,7.520366 -1.803039,0.256033 -3.3274476,-0.410932 -3.8093184,-1.666667 z M 18.666667,32 c 0,-2.548148 0.888889,-2.666667 20,-2.666667 19.11111,0 20,0.11852 20,2.666667 0,2.548148 -0.88889,2.666667 -20,2.666667 -19.111111,0 -20,-0.11852 -20,-2.666667 z M 4.5180539,18.093516 c -1.3275582,-3.459561 0.533177,-6.318913 3.8093184,-5.853698 4.2727997,0.606741 4.2727997,6.913623 0,7.520365 -1.803039,0.256033 -3.3274476,-0.410932 -3.8093184,-1.666667 z M 18.666667,16 c 0,-2.548148 0.888889,-2.666667 20,-2.666667 19.11111,0 20,0.11852 20,2.666667 0,2.548148 -0.88889,2.666667 -20,2.666667 -19.111111,0 -20,-0.11852 -20,-2.666667 z"
										id="path264"
									/>
								</g>
							</svg>
						{/if}
					</button>
				{/if}
				{#if selectedBook}
					<div class="h-12 w-12">
						<button
							onclick={() => {
								selectedBook = undefined;
							}}
							hidden={selectedBook === undefined}
							aria-label="back to book button"
						>
							<svg
								class="h-12 w-12 p-4"
								version="1.1"
								width="34.484818"
								height="58.242714"
								viewBox="0 0 34.484818 58.242714"
								xmlns="http://www.w3.org/2000/svg"
							>
								<g id="g8" transform="translate(-40,-34.843996)">
									<path
										class="fill-neutral-700"
										style="stroke-width:1.33333"
										d="M 53,80.35758 C 43.505656,70.810684 40,66.386425 40,63.951131 c 0,-2.445847 3.49976,-6.821123 13.132229,-16.417448 11.374404,-11.331724 13.649954,-13.023883 17,-12.641652 2.904499,0.331396 3.980004,1.235166 4.318418,3.62886 0.353064,2.497337 -1.95028,5.601021 -10.637231,14.333333 L 52.725541,64 63.813416,75.145776 C 72.500367,83.878088 74.803711,86.981772 74.450647,89.479109 74.105181,91.922689 73.066399,92.755693 70,93.048101 66.510733,93.380832 64.340117,91.760465 53,80.35758 Z"
										id="path170"
									/>
								</g>
							</svg>
						</button>
					</div>
				{/if}
				<div class="flex items-center justify-center">
					{#if selectedBook}
						<h1 class=" text-center">CHAPTER</h1>
					{:else}
						<h1 class=" text-center">Book</h1>
					{/if}
				</div>

				<button
					aria-label="close"
					onclick={() => {
						showBookChapterPopup = false;
					}}
					class="h-12 w-12 px-2 text-neutral-700"
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

		<div
			bind:clientWidth
			style="height: {clientHeight - headerHeight}px"
			class="flex w-full flex-col overflow-y-scroll border"
		>
			{#if selectedBook}
				<div class="grid w-[100%] grid-cols-5">
					{#each chapters as ch}
						<button
							onclick={() => chapterSelected(ch)}
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
