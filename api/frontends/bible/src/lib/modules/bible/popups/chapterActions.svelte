<script lang="ts">
	// SVELTE
	import { onMount, untrack, type Component, type Snippet } from 'svelte';

	// COMPONENTS
	import ActionDropdown from './actionsPopup.svelte';
	import BookChapterPopup from './bookChapterPopup.svelte';
	import CopyVersePopup from './copyVersePopup.svelte';
	import NavReadingsList from '../plans/navReadingsList.svelte';
	import NotesContainer from '../../notes/notesContainer.svelte';
	import Settings from '../../settings/settings.svelte';

	// MODELS
	import {
		BIBLE_MODES,
		ToolbarItems,
		type Annotations
	} from '$lib/models/bible.model';

	// SERVICES
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
	import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';
	import Gear from '$lib/components/gear.svelte';

	import EditPencil from '$lib/components/buttons/edit-pencil.svelte';

	import Search from '$lib/components/svgs/search.svelte';
	import { paneService } from '$lib/services/pane.service.svelte';
	import Close from '$lib/components/svgs/close.svelte';
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import Menu from '$lib/components/svgs/menu.svelte';
	import { Modules } from '$lib/models/modules.model';
	import Copy from '$lib/components/svgs/copy.svelte';
	import { get } from 'svelte/store';
	import { shortBookNamesByIDService } from '$lib/services/bibleMetadata/shortBookNamesByID.service';

	// =============================== BINDINGS ================================

	let {
		mode = $bindable(),
		annotations = $bindable<Annotations>(),
		bibleLocationRef = $bindable(),
		clientHeight = $bindable<number>(),
		headerHeight = $bindable<number>(),
		paneID
	} = $props();

	// ================================== VARS =================================

	let showBookChapterPopup: boolean = $state(false);
	let showNavReadingsPopup: boolean = $state(false);
	let showSettingsPopup: boolean = $state(false);
	let showActionsPopup: boolean = $state(false);
	let showCopyVersePopup: boolean = $state(false);

	let bookName: string = $state('');
	let bookChapter: number = $state(0);
	let verses: string = $state('');
	let headerGridCols = $state(7);

	let toolbar = [
		ToolbarItems.EDIT,
		ToolbarItems.SETTINGS,
		ToolbarItems.Copy,
		ToolbarItems.BOOK_CHAPTER_VERSE,
		ToolbarItems.SEARCH,
		ToolbarItems.MENU,
		ToolbarItems.Close
	];

	// =============================== LIFECYCLE ===============================

	onMount(() => {
		setBookNameAndChapter();
	});

	$effect(() => {
		bibleLocationRef;
		untrack(() => {
			setBookNameAndChapter();
			let [start, end] =
				bibleLocationReferenceService.extractVersesOrOne(bibleLocationRef);
			if (start + end > 0) {
				verses = `:${start + 1}-${end}`;
			} else {
				verses = '';
			}
		});
	});

	function setBookNameAndChapter() {
		let bookID = bibleLocationReferenceService.extractBookID(bibleLocationRef);
		bookName = shortBookNamesByIDService.get(bookID);
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

	function onEditClick(e: Event) {
		e.stopPropagation();
		let bookIDChapter =
			bibleLocationReferenceService.extractBookIDChapter(bibleLocationRef);
		let verseNumber =
			bibleLocationReferenceService.extractVersesOrOne(bibleLocationRef);
		let wordIdx =
			bibleLocationReferenceService.extractWordIndexOrDefault(bibleLocationRef);
		mode.bibleLocationRef = `${bookIDChapter}_${verseNumber}_${wordIdx}`;
		mode.value = BIBLE_MODES.EDIT;
	}

	function onCloseClick() {
		paneService.onDeletePane(paneService.rootPane, paneID);
	}

	function onSearchClick() {
		paneService.onSplitPane(paneID, 'h', Modules.SEARCH, {});
	}

	function onCopyClick() {
		showCopyVersePopup = true;
	}
</script>

{#snippet noButton()}{/snippet}
{#snippet copyButton()}
	<KJVButton onClick={onCopyClick} classes="">
		<Copy classes="h-5 w-5"></Copy>
	</KJVButton>
{/snippet}

{#snippet closeButton()}
	<KJVButton onClick={onCloseClick} classes="">
		<Close classes="h-5 w-5"></Close>
	</KJVButton>
{/snippet}

{#snippet bookChapterVerseButton()}
	<button onclick={onBookChapterClick} class=" text-center text-neutral-700">
		<span class="kjvonly-noselect flex items-center text-center">
			{#if bookName && bookChapter}
				{bookName} {bookChapter}{verses}
			{/if}
		</span>
	</button>
{/snippet}
{#snippet settingsButton()}
	<Gear btnClasses="px-2 py-1" onClick={onSettingsClick} svgClasses="h-5 w-5"
	></Gear>
{/snippet}
{#snippet bibleActionsMenuButton()}
	<KJVButton onClick={onActionClick} classes="">
		<Menu classes="h-5 w-5"></Menu>
	</KJVButton>
{/snippet}

{#snippet editButton()}
	<EditPencil onClick={onEditClick} btnClasses="px-2 py-1" svgClasses="h-5 w-5"
	></EditPencil>
{/snippet}

{#snippet searchButton()}
	<KJVButton onClick={onSearchClick} classes="">
		<Search classes="h-5 w-5"></Search>
	</KJVButton>
{/snippet}

{#snippet actionsHeader()}
	<div
		bind:clientHeight={headerHeight}
		class="absolute w-full max-w-lg border-b-1 border-neutral-400 leading-tight"
	>
		<span
			class="grid {'grid-cols-' +
				headerGridCols} w-full place-items-center bg-neutral-100 text-neutral-700"
		>
			{#each toolbar as item}
				{#if item === ToolbarItems.EDIT}
					{@render editButton()}
				{/if}
				{#if item === ToolbarItems.Copy}
					{@render copyButton()}
				{/if}
				{#if item === ToolbarItems.SETTINGS}
					{@render settingsButton()}
				{/if}
				{#if item === ToolbarItems.BOOK_CHAPTER_VERSE}
					{@render bookChapterVerseButton()}
				{/if}
				{#if item === ToolbarItems.SEARCH}
					{@render searchButton()}
				{/if}
				{#if item === ToolbarItems.MENU}
					{@render bibleActionsMenuButton()}
				{/if}
				{#if item === ToolbarItems.Close}
					{@render closeButton()}
				{/if}
			{/each}
		</span>
	</div>
{/snippet}

{@render actionsHeader()}
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
