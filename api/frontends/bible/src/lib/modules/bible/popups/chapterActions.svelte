<script lang="ts">
	// SVELTE
	import { onMount, untrack } from 'svelte';

	// COMPONENTS
	import ActionDropdown from './actionsPopup.svelte';
	import BookChapterPopup from './bookChapterPopup.svelte';
	import CopyVersePopup from './copyVersePopup.svelte';
	import NavReadingsList from '../plans/navReadingsList.svelte';
	import NotesContainer from '../../notes/notesContainer.svelte';
	import Settings from '../../settings/settings.svelte';

	// MODELS
	import type { Annotations } from '$lib/models/bible.model';

	// SERVICES
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
	import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';
	import DownChevron from '$lib/components/buttons/chevrons/downChevron.svelte';
	import Gear from '$lib/components/gear.svelte';

	// =============================== BINDINGS ================================

	let {
		mode = $bindable(),
		annotations = $bindable<Annotations>(),
		bibleLocationRef = $bindable(),
		clientHeight = $bindable<number>(),
		paneID
	} = $props();

	// ================================== VARS =================================

	let showBookChapterPopup: boolean = $state(false);
	let showNavReadingsPopup: boolean = $state(false);
	let showSettingsPopup: boolean = $state(false);
	let showActionsPopup: boolean = $state(false);
	let showCopyVersePopup: boolean = $state(false);
	let verses: string = $state('');
	let bookName: string = $state('');
	let bookChapter: number = $state(0);

	// =============================== LIFECYCLE ===============================

	onMount(() => {
		setBookNameAndChapter();
	});

	$effect(() => {
		bibleLocationRef;
		untrack(() => {
			setBookNameAndChapter();
			let [start, end] =
				bibleLocationReferenceService.extractVerses(bibleLocationRef);
			if (start + end > 0) {
				verses = `:${start + 1}-${end}`;
			} else {
				verses = '';
			}
		});
	});

	function setBookNameAndChapter() {
		let bookID = bibleLocationReferenceService.extractBookID(bibleLocationRef);
		bookName = bookNamesByIDService.get(bookID);
		bookChapter =
			bibleLocationReferenceService.extractChapter(bibleLocationRef);
	}

	// ============================== CLICK FUNCS ==============================

	function onBookChapterClick(event: Event) {
		event.stopPropagation();
		if (mode.navReadings) {
			showNavReadingsPopup = !showNavReadingsPopup;
		} else {
			showBookChapterPopup = !showBookChapterPopup;
		}
	}

	function onSettingsClick(event: Event) {
		event.stopPropagation();
		showSettingsPopup = !showSettingsPopup;
	}

	function onActionClick(e: Event) {
		e.stopPropagation();
		console.log('clicked');
		showActionsPopup = !showActionsPopup;
	}
</script>

<!-- book chapter selection -->

<div class="max-w-lg leading-tight">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span
		class="flex items-center
		justify-between rounded-s-full rounded-e-full bg-neutral-100 px-1 text-neutral-700 hover:cursor-pointer"
	>
		<Gear
			btnClasses="pe-1 py-1 hover:cursor-pointer"
			onClick={onSettingsClick}
			svgClasses="ml-2 h-5 w-5"
		></Gear>

		<span class="ml-2 h-[100%] border-s-2 border-neutral-300">&nbsp;</span>
		<span
			onclick={(e) => {
				onBookChapterClick(e);
			}}
			class="m-0 text-center text-neutral-700"
		>
			<span class="bookChapter flex items-center text-center"
				><span>
					{#if bookName && bookChapter}
						{bookName} {bookChapter}{verses}
					{/if}
				</span><span> </span></span
			>
		</span>
		<span class="mr-2 h-[100%] border-e-2 border-neutral-300">&nbsp;</span>

		<DownChevron
			onClick={onActionClick}
			svgClasses="mr-2 h-5 w-5"
			btnClasses="hover:cursor-pointer"
		></DownChevron>
		<span onclick={onActionClick}> </span>
	</span>
</div>
{#if showBookChapterPopup || showNavReadingsPopup || showSettingsPopup || showActionsPopup || mode.notePopup.show || showCopyVersePopup}
	<div
		style="height: {clientHeight}px"
		class="absolute z-[10000] h-full w-full max-w-lg"
	>
		{#if showBookChapterPopup}
			<BookChapterPopup bind:showBookChapterPopup bind:bibleLocationRef
			></BookChapterPopup>
		{/if}
		{#if showNavReadingsPopup}
			<NavReadingsList
				bind:showNavReadingsPopup
				bind:navReadings={mode.navReadings}
				bind:bibleLocationRef
			></NavReadingsList>
		{/if}
		{#if showSettingsPopup}
			<Settings
				onClose={() => {
					showSettingsPopup = false;
				}}
			></Settings>
		{/if}

		{#if showActionsPopup}
			<ActionDropdown
				{paneID}
				bind:showCopyVersePopup
				bind:showActionsDropdown={showActionsPopup}
			></ActionDropdown>
		{/if}

		{#if mode.notePopup.show}
			<NotesContainer bind:mode allNotes={false} bind:annotations
			></NotesContainer>
		{/if}

		{#if showCopyVersePopup}
			<CopyVersePopup {paneID} bind:showCopyVersePopup bind:bibleLocationRef
			></CopyVersePopup>
		{/if}
	</div>
{/if}
