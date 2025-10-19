<script lang="ts">
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';

	// SVELTE
	import { onMount } from 'svelte';

	// MODELS
	import { Modules } from '$lib/models/modules.model';

	// SERVICES
	import { notesService } from '$lib/services/notes.service';
	import { paneService } from '$lib/services/pane.service.svelte';
	import { toastService } from '$lib/services/toast.service';

	// APIS
	import { chapterApi } from '$lib/api/chapters.api';
	import { notesApi } from '$lib/api/notes.api';

	// OTHER
	import Quill from 'quill';
	import uuid4 from 'uuid4';
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import Save from '$lib/components/svgs/save.svelte';
	import Menu from '$lib/components/svgs/menu.svelte';
	import Close from '$lib/components/svgs/close.svelte';
	import Tag from '$lib/components/svgs/tag.svelte';
	import NoTag from '$lib/components/svgs/noTag.svelte';

	let { mode = $bindable(), note = $bindable() } = $props();

	let clientHeight = $state(0);
	let clientWidth = $state(0);
	let headerHeight = $state(0);

	let showTags: boolean = $state(false);

	let booknames: any = {};

	/**
	 * These variables are set once a user
	 * adds a new note or selects an existing
	 * note.
	 */
	let noteID: string = '';

	/**
	 * view toggles
	 */
	let showNoteActions = $state(false);
	let showNoteListActions = $state(false);
	let showConfirmDelete = $state(false);

	let editor = uuid4().replaceAll('-', '');
	let quill: Quill;

	/**
	 * inputs
	 */
	let tagInput: string = $state('');

	/**
	 * Note Actions
	 */
	let noteActions: any = {
		delete: () => {
			showConfirmDelete = true;
		},
		'split vertical': () => {
			paneService.onSplitPane(mode.paneID, 'v', Modules.MODULES, {});
			showNoteActions = false;
		},

		'split horizontal': () => {
			paneService.onSplitPane(mode.paneID, 'h', Modules.MODULES, {});
			showNoteActions = false;
		}
	};

	function onCloseNote() {
		if (!isShowingOptions()) {
			showNoteActions = false;
			showConfirmDelete = false;
			note = undefined;
			noteID = '';
		}
	}

	/** if an options menu is open close it instead
	 * of closing the view
	 */
	function isShowingOptions() {
		if (showConfirmDelete) {
			showConfirmDelete = false;
			return true;
		}

		if (showNoteActions) {
			showNoteActions = false;
			return true;
		}

		if (showNoteListActions) {
			showNoteListActions = false;
			return true;
		}

		return false;
	}

	function showNoteList() {
		showConfirmDelete = false;
		showNoteActions = false;
		showNoteListActions = false;
	}

	async function onConfirmDelete() {
		notesApi.delete(noteID);
		showNoteList();
	}

	async function onSave(toastMessage: string) {
		let savedNote = await notesApi.put(JSON.parse(JSON.stringify(note)));

		if (savedNote) {
			noteID = savedNote.id;
			note.id = savedNote.id;
			note.bibleLocationRef = savedNote.bibleLocationRef;
			note.version = savedNote.version;
			note.dateCreated = savedNote.dateCreated;
			note.dateUpdated = savedNote.dateUpdated;
			toastService.showToast(toastMessage);
			notesService.addNote('*', noteID, JSON.parse(JSON.stringify(note)));
		}
	}

	onMount(async () => {
		let element = document.getElementById(editor);
		booknames = await chapterApi.getBooknames();

		/* editor */
		if (element) {
			quill = new Quill(element, {
				theme: 'snow'
			});

			quill.on('text-change', (delta, oldDelta, source) => {
				if (source == 'api') {
					console.log('An API call triggered this change.');
				} else if (source == 'user') {
					note.html = quill.getSemanticHTML();
					note.text = quill.getText();
					note.title = note.text.split('\n')[0].substring(0, 20);
				}
			});

			let d = quill.clipboard.convert({ html: note?.html });
			quill.setContents(d, 'silent');
		}
	});

	// ================================ IMPORTS ================================
	// SVELTE
	// COMPONENTS
	// MODELS
	// SERVICES
	// =============================== BINDINGS ================================
	// ================================== VARS =================================
	// =============================== LIFECYCLE ===============================
	// ================================ FUNCS ==================================
	// ============================== CLICK FUNCS ==============================

	function onAddTag() {
		if (tagInput && tagInput.length < 1) {
			return;
		}

		let tagId = uuid4();
		if (!note.tags) {
			note.tags = [];
		}
		let now = Date.now();
		note.tags.push({
			id: tagId,
			created: now,
			modified: now,
			tag: tagInput
		});

		tagInput = '';
	}

	function onDeleteTag(tagID: string) {
		if (note) {
			note.tags = note.tags.filter((t: any) => {
				if (t.id !== tagID) {
					return t;
				}
			});
		}
	}
</script>

<!-- ================================ HEADER =============================== -->

<!-- START NOTE SNIPPETS -->
{#snippet noteHeaderSnippet()}
	<div class="grid w-full grid-cols-5 place-items-center">
		<KJVButton classes="" onClick={() => onSave(`Saved Note: ${note.title}`)}>
			<Save></Save>
		</KJVButton>

		<KJVButton classes="" onClick={() => (showTags = !showTags)}>
			{#if showTags}
				<NoTag></NoTag>
			{:else}
				<Tag></Tag>
			{/if}
		</KJVButton>
		<span class="text-center"
			>{note.title}{note.title?.length === 20 ? '...' : ''}</span
		>
		<KJVButton classes="" onClick={() => (showNoteActions = !showNoteActions)}>
			<Menu></Menu>
		</KJVButton>

		<KJVButton classes="" onClick={onCloseNote}>
			<Close></Close>
		</KJVButton>
	</div>
{/snippet}
<!-- ================================= BODY ================================ -->

{#snippet noteActionsSnippet()}
	<div
		class="flex h-full w-full max-w-lg flex-col items-start justify-start border border-neutral-100"
	>
		{#each Object.keys(noteActions) as na}
			<button
				class="hover:bg-primary-50 w-full py-4 ps-2 text-left capitalize"
				aria-label="note action button"
				onclick={() => noteActions[na]()}
			>
				{na}
			</button>
		{/each}
	</div>
{/snippet}

{#snippet noteConfirmDeleteSnippet()}
	<div
		class="flex h-full w-full max-w-lg flex-col items-center justify-center border border-neutral-100"
	>
		<p class="p-4 capitalize">
			confirm delete <span class="font-semibold"
				>{note.title} {note.title?.length === 20 ? '...' : ''}</span
			>
		</p>
		<div class="flex flex-row space-x-5">
			<button
				onclick={() => {
					onConfirmDelete();
				}}
				aria-label="delete button"
				class="hover:bg-primary-50 rounded-lg bg-neutral-100 p-4 capitalize"
				>delete</button
			>
			<button
				onclick={() => {
					showConfirmDelete = false;
				}}
				aria-label="cancel button"
				class="hover:bg-primary-50 rounded-lg bg-neutral-100 p-4 capitalize"
				>cancel</button
			>
		</div>
	</div>
{/snippet}

{#snippet noteTagInputSnippet()}
	{#if showTags}
		<div class="flex justify-center px-2">
			<label
				for="tags"
				class="focus-within:border-support-a-600 relative block overflow-hidden border-b border-neutral-200 bg-transparent pt-3"
			>
				<div class="flex items-center">
					<input
						type="tags"
						id="tags"
						placeholder="add tags..."
						bind:value={tagInput}
						class="focus:ring-none peer h-8 w-full border-none bg-transparent p-0 outline-none focus:border-transparent focus:outline-hidden"
					/>

					<button
						onclick={() => {
							onAddTag();
						}}
						class="float-end h-8 w-8 p-0.5"
						aria-label="add tag button"
					>
						<svg
							version="1.1"
							id="svg2"
							width="100%"
							height="100%"
							viewBox="0 0 105.50072 106.78786"
							xmlns="http://www.w3.org/2000/svg"
						>
							<defs id="defs6" />
							<g id="g8" transform="translate(-11.214067,-10.602166)">
								<path
									id="path478"
									class="fill-neutral-400"
									style="stroke-width:4.20363;stroke-linejoin:round"
									d="M 63.952348,10.627557 A 52.737736,53.368481 0 0 0 11.214067,63.996697 52.737736,53.368481 0 0 0 63.952348,117.36388 52.737736,53.368481 0 0 0 116.68868,63.996697 52.737736,53.368481 0 0 0 63.952348,10.627557 Z m -4.40625,34.925781 h 8.884766 v 14.335937 h 12.917969 v 8.138672 H 68.430864 V 82.438103 H 59.546098 V 68.027947 H 46.553911 v -8.138672 h 12.992187 z"
								/>
							</g>
						</svg>
					</button>
				</div>
			</label>
		</div>
	{/if}
{/snippet}

{#snippet noteTagsSnippet()}
	{#if showTags}
		<div style="width: {clientWidth}px" class="max-w-lg overflow-hidden">
			<div
				class="flex flex-row items-end space-y-2 space-x-2 overflow-x-scroll p-2"
			>
				{#each [...note.tags].reverse() as t}
					<span
						class="border-support-a-500 text-support-a-700 inline-flex h-8 items-center justify-center rounded-full border px-2.5 py-0.5"
					>
						<p class="text-sm whitespace-nowrap">{t.tag}</p>

						<button
							aria-label="delete tag"
							onclick={() => {
								onDeleteTag(t.id);
							}}
							class="bg-support-a-200 text-support-a-700 hover:bg-support-a-300 ms-1.5 -me-1 inline-block rounded-full p-0.5 transition"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-3"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</span>
				{/each}
			</div>
		</div>
	{/if}
{/snippet}
<!-- ================================ FOOTER =============================== -->
<!-- ============================== CONTAINER ============================== -->
{#snippet noteBody()}
	{#if showNoteActions}
		{#if !showConfirmDelete}
			{@render noteActionsSnippet()}
		{/if}
		{#if showConfirmDelete}
			{@render noteConfirmDeleteSnippet()}
		{/if}
	{:else}
		<div class="flex w-full max-w-lg flex-col items-start justify-start">
			{@render noteTagInputSnippet()}
			{#if note?.tags}
				{@render noteTagsSnippet()}
			{/if}
		</div>
	{/if}
	<!-- keep the editor in the dom the while notes container is open. toggle the hidden params. Otherwise we'd need to keep creating this. -->
	<div
		style="height: {clientHeight - headerHeight}px"
		class=" {showNoteActions || !note
			? 'hidden'
			: ''} flex w-full max-w-lg flex-col overflow-y-scroll border"
	>
		<div id={editor}></div>
	</div>
{/snippet}

<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		{@render noteHeaderSnippet()}
	</BufferHeader>
	{@render noteBody()}
</BufferContainer>
