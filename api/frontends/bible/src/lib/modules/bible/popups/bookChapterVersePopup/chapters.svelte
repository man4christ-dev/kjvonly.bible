<script lang="ts">
	import BufferBody from '$lib/components/bufferBody.svelte';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import Close from '$lib/components/svgs/close.svelte';
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import { booksChaptersVerseCountByIDService } from '$lib/services/bibleMetadata/booksChaptersVerseCountByID.service';

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

	function setChapters(): void {
		chapters = booksChaptersVerseCountByIDService
			.get(bookID)
			?.keys()
			.toArray()
			.sort((a, b) => Number(a) - Number(b));
	}
	function chapterSelected(ch: any) {
		bibleLocationRef = `${bookID}_${ch}`;
		showBookChapterPopup = false;
	}

	// ================================ FUNCS ==================================
	// ============================== CLICK FUNCS ==============================
	function onCloseClick(e: Event): void {}
</script>

<!-- ================================ HEADER =============================== -->
{#snippet header()}
	<KJVButton classes="" onClick={onCloseClick}>
		<Close classes=""></Close>
	</KJVButton>
{/snippet}
<!-- ================================= BODY ================================ -->
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
