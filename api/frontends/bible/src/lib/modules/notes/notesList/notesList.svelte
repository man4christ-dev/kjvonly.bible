<script lang="ts">
	// ================================ IMPORTS ================================
	// MODELS
	import { Modules } from '$lib/models/modules.model';

	// SERVICES
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
	import { paneService } from '$lib/services/pane.service.svelte';
	import { toastService } from '$lib/services/toast.service';
	import { verseService } from '$lib/services/bible/verse.service';

	// OTHER
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import { shortBookNamesByIDService } from '$lib/services/bibleMetadata/shortBookNamesByID.service';
	import uuid4 from 'uuid4';
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import Bible from '$lib/components/svgs/bible.svelte';
	import SplitScreenBottom from '$lib/components/svgs/splitScreenBottom.svelte';
	import SplitScreenRight from '$lib/components/svgs/splitScreenRight.svelte';
	import AddNote from '$lib/components/svgs/addNote.svelte';
	import Menu from '$lib/components/svgs/menu.svelte';
	import Close from '$lib/components/svgs/close.svelte';

	// =============================== BINDINGS ================================

	let {
		mode = $bindable(),
		allNotes,
		noteIDToOpen = '',
		noteKeys = $bindable(),
		notes = $bindable(),
		note = $bindable(),
		onFilterInputChanged,
		onAddNewNote
	}: {
		mode: any;
		allNotes: boolean;
		noteIDToOpen: string;
		noteKeys: string[];
		notes: any;
		note: any;
		onFilterInputChanged: any;
		onAddNewNote: any;
	} = $props();

	// ================================== VARS =================================

	let clientHeight = $state(0);
	let headerHeight = $state(0);

	let showNoteListActions = $state(false);
	let showNoteListFilter = $state(false);

	let filterInput: string = $state('');

	let filterParams = $state([
		{
			option: 'title',
			index: 'title',
			checked: true
		},
		{
			option: 'text',
			index: 'text',
			checked: true
		},
		{
			option: 'tags',
			index: 'tags[]:tag',
			checked: true
		}
	]);

	let noteListActions: any = {
		filter: () => {
			showNoteListFilter = !showNoteListFilter;
			showNoteListActions = false;
		},
		'export filtered notes': () => {
			onExport();
		},
		'split vertical': () => {
			paneService.onSplitPane(mode.paneID, 'v', Modules.MODULES, {});
			showNoteListActions = false;
		},

		'split horizontal': () => {
			paneService.onSplitPane(mode.paneID, 'h', Modules.MODULES, {});
			showNoteListActions = false;
		}
	};

	// ============================== CLICK FUNCS ==============================

	async function onExport() {
		toastService.showToast('starting export data');

		let data: any = {};
		noteKeys.forEach((k) => {
			let n = notes[k];
			let keys = n.bibleLocationRef.split('_');
			let bibleLocationRef = `${keys[0]}_${keys[1]}`;
			let verseNumber = `${keys[2]}`;
			let wordIdx = `${keys[3]}`;

			if (!data[bibleLocationRef]) {
				data[bibleLocationRef] = {
					id: bibleLocationRef
				};
			}

			if (!data[bibleLocationRef][verseNumber]) {
				data[bibleLocationRef][verseNumber] = {
					notes: {
						words: {}
					}
				};
			}

			if (!data[bibleLocationRef][verseNumber].notes.words[wordIdx]) {
				data[bibleLocationRef][verseNumber].notes.words[wordIdx] = {};
			}

			data[bibleLocationRef][verseNumber].notes.words[wordIdx][k] = n;
		});

		let dataList: any[] = [];
		Object.keys(data).forEach((k) => {
			dataList.push(data[k]);
		});

		var element = document.createElement('a');
		element.setAttribute(
			'href',
			'data:application/json;charset=utf-8,' +
				encodeURIComponent(JSON.stringify(dataList))
		);
		element.setAttribute('download', 'annotations');

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
		toastService.showToast('finished export data');
	}

	async function onAdd() {
		let keys = mode.bibleLocationRef?.split('_');
		let now = Date.now();
		let newNote = undefined;
		let noteID = uuid4();
		if (keys[0] === '0') {
			newNote = {
				id: noteID,
				bibleLocationRef: mode.bibleLocationRef,
				text: ``,
				html: ``,
				title: `Note`,
				dateCreated: now,
				dateUpdated: now,
				tags: [],
				version: 0
			};
		} else {
			let verse = await verseService.get(mode.bibleLocationRef);
			let bookName = bibleLocationReferenceService.extractShortBookName(
				mode.bibleLocationRef
			);
			let title = `${bookName} ${keys[1]}:${keys[2]}${keys[3] > 0 ? ':' + keys[3] : ''}`;
			newNote = {
				id: noteID,
				bibleLocationRef: mode.bibleLocationRef,
				bcv: `${shortBookNamesByIDService.get(keys[0])} ${keys[1]}:${keys[2]}`,
				text: `${title}\n${verse}`,
				html: `<h1>${title}</h1><p><italic>${verse}</italic></p>`,
				title: `${title}`,
				dateCreated: now,
				dateUpdated: now,
				tags: [],
				version: 0
			};
		}

		onAddNewNote(newNote);
	}

	async function onSelectedNote(noteId: string) {
		note = notes[noteId];
	}

	function onBibleClicked(e: Event): void {
		e.stopPropagation();
		paneService.onSplitPane(mode.paneID, 'h', Modules.BIBLE, {
			bibleLocationRef: note.bibleLocationRef
		});
	}

	function onHorizontalClicked(e: Event, noteID: string): void {
		e.stopPropagation();
		paneService.onSplitPane(mode.paneID, 'h', Modules.NOTES, {
			noteID: noteID
		});
	}

	function onVerticalClicked(e: Event, noteID: string): void {
		e.stopPropagation();
		paneService.onSplitPane(mode.paneID, 'v', Modules.NOTES, {
			noteID: noteID
		});
	}

	function onClose(): void {
		if (allNotes) {
			paneService.onDeletePane(paneService.rootPane, mode.paneID);
		} else {
			mode.notePopup.show = false;
		}
	}
</script>

<!-- ================================ HEADER =============================== -->
{#snippet noteListHeader()}
	<KJVButton onClick={onAdd} classes="">
		<AddNote></AddNote>
	</KJVButton>

	<span></span>
	<span class="">Notes</span>
	<KJVButton
		classes=""
		onClick={() => (showNoteListActions = !showNoteListActions)}
	>
		<Menu></Menu>
	</KJVButton>
	<KJVButton classes="" onClick={onClose}>
		<Close></Close>
	</KJVButton>
{/snippet}

<!-- ================================= BODY ================================ -->

{#snippet noteListFilter()}
	<div class="flex flex-col justify-start px-2">
		<label
			for="tags"
			class="focus-within:border-support-a-600 relative block overflow-hidden border-b border-neutral-200 bg-transparent pt-3"
		>
			<div class="flex items-center">
				<input
					type="tags"
					id="tags"
					placeholder="Search Notes..."
					bind:value={filterInput}
					oninput={onFilterInputChanged}
					class="focus:ring-none peer h-8 w-full border-none bg-transparent p-0 outline-none focus:border-transparent focus:outline-hidden"
				/>
			</div>
		</label>
		<div>
			<fieldset>
				{#each filterParams as fp}
					<div class="space-y-2">
						<label for="Option1" class="flex cursor-pointer items-start gap-4">
							<div class="flex items-center">
								&#8203;
								<input
									bind:checked={fp.checked}
									type="checkbox"
									class="accent-support-a-300 size-4 rounded-sm border-neutral-200"
									id="Option1"
								/>
							</div>

							<div>
								<strong class="text-neutral-500 capitalize">
									{fp.option}
								</strong>
							</div>
						</label>
					</div>
				{/each}
			</fieldset>
		</div>
	</div>
{/snippet}

{#snippet actions(note: any, nk: string)}
	<div class="flex w-full flex-row justify-end space-x-4">
		<!-- bible -->
		{#if !note?.bibleLocationRef?.startsWith('0')}
			<KJVButton classes="" onClick={onBibleClicked}>
				<Bible></Bible>
			</KJVButton>
		{/if}

		<KJVButton onClick={(e: Event) => onHorizontalClicked(e, nk)} classes="">
			<SplitScreenBottom></SplitScreenBottom>
		</KJVButton>

		<KJVButton onClick={(e: Event) => onVerticalClicked(e, nk)} classes="">
			<SplitScreenRight></SplitScreenRight>
		</KJVButton>
	</div>
{/snippet}

{#snippet noteListSnippet()}
	{#each noteKeys as nk}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			onclick={() => {
				onSelectedNote(nk);
			}}
			class="flex w-full flex-nowrap p-2 text-left hover:cursor-pointer hover:bg-neutral-100"
		>
			<div class="flex w-full flex-col">
				<span
					>{notes[nk].title}{notes[nk].title.length === 20 ? '...' : ''}</span
				>
				<span class="text-neutral-400"
					>{new Date(notes[nk].dateUpdated).toLocaleDateString()}
					{new Date(notes[nk].dateUpdated).toLocaleTimeString()}</span
				>
				{#if notes[nk].bcv}
					<span class="text-neutral-400">{notes[nk].bcv}</span>
				{/if}
				<div class="flex flex-wrap items-center justify-start space-x-2 pt-2">
					{#each notes[nk].tags as t}
						<span
							class="border-support-a-500 text-support-a-700 mt-2 inline-flex h-8 items-center justify-center rounded-full border px-2.5 py-2.5"
						>
							<p class="text-sm whitespace-nowrap">{t.tag}</p>
						</span>
					{/each}
				</div>
				<div class="flex flex-wrap items-center justify-end space-x-2 pt-2">
					{@render actions(notes[nk], nk)}
				</div>
			</div>
		</div>
	{/each}
{/snippet}

{#snippet noteListActionsSnippet()}
	<div
		class="flex h-full w-full max-w-lg flex-col items-start justify-start border border-neutral-100"
	>
		{#each Object.keys(noteListActions) as na}
			<button
				class="hover:bg-primary-50 w-full py-4 ps-2 text-left capitalize"
				aria-label="note action button"
				onclick={() => noteListActions[na]()}
			>
				{na}
			</button>
		{/each}
	</div>
{/snippet}

{#snippet noteListBody()}
	{#if !showNoteListActions}
		<div
			class="flex h-full w-full max-w-lg flex-col overflow-hidden overflow-y-scroll border border-neutral-100"
		>
			{#if showNoteListFilter}
				{@render noteListFilter()}
			{/if}
			{@render noteListSnippet()}
		</div>
	{/if}
	{#if showNoteListActions}
		{@render noteListActionsSnippet()}
	{/if}
{/snippet}

<!-- ============================== CONTAINER ============================== -->

<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		{@render noteListHeader()}
	</BufferHeader>
	{@render noteListBody()}
</BufferContainer>
