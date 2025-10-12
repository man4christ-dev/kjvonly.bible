<script lang="ts">
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
</script>

<!-- ================================ HEADER =============================== -->
<!-- ================================= BODY ================================ -->
<!-- ================================ FOOTER =============================== -->
<!-- ============================== CONTAINER ============================== -->
