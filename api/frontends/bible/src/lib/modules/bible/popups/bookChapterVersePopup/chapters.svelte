<script lang="ts">
	import BufferBody from '$lib/components/bufferBody.svelte';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import Close from '$lib/components/svgs/close.svelte';
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import { booksChaptersVerseCountByIDService } from '$lib/services/bibleMetadata/booksChaptersVerseCountByID.service';
	import ChevronLeft from '$lib/components/svgs/chevronLeft.svelte';
	import ArrowBack from '$lib/components/svgs/arrowBack.svelte';
	import { onMount } from 'svelte';

	// ================================ IMPORTS ================================
	// SVELTE
	// COMPONENTS
	// MODELS
	// SERVICES
	// =============================== BINDINGS ================================
	// ================================== VARS =================================
	let {
		bookID = $bindable<string>(),
		bibleLocationRef = $bindable<string>(),
		showBookChapterPopup = $bindable<boolean>()
	}: {
		bookID: string;
		bibleLocationRef: string;
		showBookChapterPopup: boolean;
	} = $props();

	let clientHeight = $state(0);
	let headerHeight = $state(0);

	let chapters: string[] = $state([]);

	// =============================== LIFECYCLE ===============================
	onMount(() => {
		setChapters();
	});

	// ================================ FUNCS ==================================

	function setChapters(): void {
		chapters = booksChaptersVerseCountByIDService
			.get(bookID)
			?.keys()
			.toArray()
			.sort((a, b) => Number(a) - Number(b));
	}

	function chapterSelected(ch: any): void {
		bibleLocationRef = `${bookID}_${ch}`;
		showBookChapterPopup = false;
	}

	// ============================== CLICK FUNCS ==============================
	function onBackClicked(e: Event): void {
		e.stopPropagation();
		bookID = '';
	}
</script>

<!-- ================================ HEADER =============================== -->
{#snippet header()}
	<KJVButton classes="" onClick={onBackClicked}>
		<ArrowBack classes=""></ArrowBack>
	</KJVButton>
{/snippet}
<!-- ================================= BODY ================================ -->
{#snippet body()}
	<div class="grid w-[100%] grid-cols-5">
		{#each chapters as ch}
			<button
				class="hover:bg-primary-50 row-span-1 bg-neutral-50 p-4"
				onclick={() => {
					chapterSelected(ch);
				}}
			>
				{ch}
			</button>
		{/each}
	</div>
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
