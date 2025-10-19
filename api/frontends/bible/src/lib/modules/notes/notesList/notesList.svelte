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
</script>

<!-- ================================ HEADER =============================== -->
{#snippet noteListHeader()}
	<header
		bind:clientHeight={headerHeight}
		class=" flex w-full max-w-lg flex-row items-center justify-between bg-neutral-100 text-neutral-700"
	>
		<button
			aria-label="close"
			onclick={() => {
				onAdd();
			}}
			class="h-12 w-12 px-2 pt-2 text-neutral-700"
		>
			<svg
				class="p-0.5"
				version="1.1"
				width="100%"
				height="100%"
				viewBox="0 0 105.50072 106.78786"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="g8" transform="translate(-11.214067,-10.602166)">
					<path
						class="fill-neutral-700"
						style="stroke-width:4.20363;stroke-linejoin:round"
						d="M 63.952348,10.627557 A 52.737736,53.368481 0 0 0 11.214067,63.996697 52.737736,53.368481 0 0 0 63.952348,117.36388 52.737736,53.368481 0 0 0 116.68868,63.996697 52.737736,53.368481 0 0 0 63.952348,10.627557 Z m -4.40625,34.925781 h 8.884766 v 14.335937 h 12.917969 v 8.138672 H 68.430864 V 82.438103 H 59.546098 V 68.027947 H 46.553911 v -8.138672 h 12.992187 z"
					/>
				</g>
			</svg>
		</button>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<p
			onclick={() => {
				showNoteListActions = !showNoteListActions;
			}}
			class="hover:cursor-pointer"
		>
			<span class="inline-block font-bold">Notes</span>
			<button aria-label="chevron down" class="h-4 w-4">
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 25.4 14.098638"
					version="1.1"
					xml:space="preserve"
					xmlns="http://www.w3.org/2000/svg"
					><g transform="translate(-53.644677,-127.79211)"
						><path
							class="fill-neutral-700"
							style="stroke-width:0.352778"
							d="m 59.906487,137.65245 -6.26181,-4.21622 v -2.82206 -2.82206 l 6.35,4.24282 6.35,4.24283 6.35,-4.24283 6.35,-4.24282 v 2.82222 2.82222 l -6.3429,4.23808 c -3.48859,2.33094 -6.38578,4.22817 -6.43819,4.21606 -0.0524,-0.0121 -2.91311,-1.91931 -6.3571,-4.23824 z"
							id="path179"
						/></g
					></svg
				>
			</button>
		</p>
		<button
			aria-label="close"
			onclick={() => {
				if (allNotes) {
					paneService.onDeletePane(paneService.rootPane, mode.paneID);
				} else {
					mode.notePopup.show = false;
				}
			}}
			class="h-12 w-12 px-2 pt-2 text-neutral-700"
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
	</header>
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
