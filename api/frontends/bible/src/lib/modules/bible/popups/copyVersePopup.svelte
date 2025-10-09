<script lang="ts">
	// ================================ IMPORTS ================================
	//SVELTE
	import { onMount, untrack } from 'svelte';

	//MODELS
	import type { Verse } from '$lib/models/bible.model';

	// SERVICES
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
	import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';
	import { chapterService } from '$lib/services/bible/chapter.service';
	import { toastService } from '$lib/services/toast.service';

	// COMPONENTS
	import Close from '$lib/components/buttons/close.svelte';
	import Copy from '$lib/components/buttons/copy.svelte';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import BufferBody from '$lib/components/bufferBody.svelte';
	import HorizontalSplit from '$lib/components/buttons/horizontalSplit.svelte';
	import VerticalSplit from '$lib/components/buttons/verticalSplit.svelte';
	import { Modules } from '$lib/models/modules.model';

	// =============================== BINDINGS ================================

	let {
		bibleLocationRef = $bindable<string>(),
		showCopyVersePopup = $bindable<boolean>(),
		paneID
	}: {
		bibleLocationRef: string;
		showCopyVersePopup: boolean;
		paneID: string;
	} = $props();

	// ================================= VARS ==================================
	// DOM
	let clientHeight = $state(0);
	let headerHeight = $state(0);

	let allChecked = $state(false);
	let checked: boolean[] = $state([]);
	let verseNumbers: string[] = $state([]);
	let verses: Map<string, Verse> = $state(new Map());
	let title = $state('');
	let selectedVerseRangeText = $state('');

	// =============================== LIFECYCLE ===============================

	onMount(async () => {
		closePopupOnInvalidBibleLocationReference();
		setTitle();
		await loadVerses();
		initializeCheckedVersesByIdMap();
		setSortedAscVersesKeys();
	});

	$effect(() => {
		checked;
		console.log('clicked');
		untrack(() => {
			setSelectedVerses();
		});
	});

	// ================================ FUNCS ==================================

	async function loadVerses() {
		let chapter = await chapterService.get(bibleLocationRef);
		verses = chapter.verses;
	}

	function setSortedAscVersesKeys() {
		verseNumbers = verses
			.keys()
			.toArray()
			.sort((a, b) => {
				return parseInt(a) - parseInt(b);
			});
	}

	function initializeCheckedVersesByIdMap() {
		checked = Array<boolean>(verses.size);
	}

	function setTitle() {
		let bookID = bibleLocationReferenceService.extractBookID(bibleLocationRef);
		let bookName = bookNamesByIDService.get(bookID);
		let chapterNumber =
			bibleLocationReferenceService.extractChapter(bibleLocationRef);
		title = `${bookName} ${chapterNumber}`;
	}

	function closePopupOnInvalidBibleLocationReference() {
		if (bibleLocationRef.split('_').length < 2) {
			showCopyVersePopup = false;
		}
	}

	function getAllVerseRangeText(): string {
		let checkedVerseNumbers: number[] = getCheckedVerses();
		let verseRangesToCopy = groupConsecutiveVerseRanges(checkedVerseNumbers);
		let allVerseRangeText = verseRangesToCopy.map((verseRange) => {
			return getVerseRangeText(verseRange);
		});
		return concatVerseRangeText(allVerseRangeText);
	}

	function concatVerseRangeText(allVerseRangeText: string[]) {
		return allVerseRangeText
			.map((vrt: string) => {
				return `${vrt}\n`;
			})
			.join('');
	}

	function getVerseRangeText(verseRange: number[]): string {
		let [start, end] = getStartAndEndVerseNumbers(verseRange);
		let verseRangeText = getVerseRangeTitle(start, end);
		let versesToCopy = Array.from(
			{ length: end - start + 1 },
			(_, i) => start + i
		);

		versesToCopy.forEach((verseNumber: number) => {
			verseRangeText += `${verses.get(String(verseNumber))?.text}\n`;
		});

		return verseRangeText;
	}

	function getStartAndEndVerseNumbers(r: number[]): number[] {
		return [r[0], r[r.length - 1]];
	}

	function getVerseRangeTitle(start: number, end: number): string {
		let rangeTitle = '';
		if (start === end) {
			rangeTitle = `${title}:${start}\n`;
		} else {
			rangeTitle = `${title}:${start}-${end}\n`;
		}

		return rangeTitle;
	}

	function getCheckedVerses(): number[] {
		let checkedVerses: number[] = [];
		checked.forEach((c, idx) => {
			if (c) {
				checkedVerses.push(idx + 1);
			}
		});
		return checkedVerses;
	}

	/**
	 * We want to group consecutive verse numbers like this:
	 * [[1,3], [5, 5], [18,21]]
	 * meaning verses 1, 2, and 3 were selected,
	 * 		   verse 5 was selected
	 *         verses 18, 19, 20, and 21 were selected
	 *
	 *  [5, 5] means verse 5 was selected without verse 4 and 6
	 *
	 * @param checkedVerses the verseNumber checked by the user to copy
	 */
	function groupConsecutiveVerseRanges(checkedVerses: number[]): number[][] {
		if (checkedVerses.length === 0) {
			return [];
		}
		let groupedVerseRanges: number[][] = [];
		let verseRange: number[] = [checkedVerses[0]];
		let lastVerseNumber = checkedVerses[0];
		for (let currentVerseNumber of checkedVerses) {
			if (isInconsecutive(lastVerseNumber, currentVerseNumber)) {
				verseRange.push(lastVerseNumber);
				groupedVerseRanges.push(verseRange);
				verseRange = [currentVerseNumber];
			}
			lastVerseNumber = currentVerseNumber;
		}
		verseRange.push(lastVerseNumber);
		groupedVerseRanges.push(verseRange);
		return groupedVerseRanges;
	}

	function isInconsecutive(
		lastVerseNumber: number,
		currentVerseNumber: number
	) {
		return currentVerseNumber - lastVerseNumber > 1;
	}

	function toggleSelects() {
		checked = Array(verses.size).fill(allChecked);
	}

	function areAllVersesChecked() {
		allChecked = checked.filter((c) => c).length == checked.length;
	}

	function getVerseBibleLocationReference(verseNumber: number) {
		let bookID = bibleLocationReferenceService.extractBookID(bibleLocationRef);
		let chapter =
			bibleLocationReferenceService.extractChapter(bibleLocationRef);
		return bibleLocationReferenceService.makeBibleLocationRef(
			bookID,
			chapter,
			verseNumber
		);
	}

	function setSelectedVerses() {
		let checkedVerseNumbers: number[] = getCheckedVerses();
		let verseRanges = groupConsecutiveVerseRanges(checkedVerseNumbers);
		selectedVerseRangeText = getSelectedVerseRangeVersesText(verseRanges);
	}

	function getSelectedVerseRangeVersesText(verseRanges: number[][]): string {
		return verseRanges
			?.map((vr) =>
				vr[0] === vr[vr.length - 1]
					? `${vr[0]}`
					: `${vr[0]}-${vr[vr.length - 1]}`
			)
			.join();
	}

	// ============================== CLICK FUNCS ==============================

	function onCopy() {
		if (checked.filter((c) => c).length > 0) {
			let copyText = getAllVerseRangeText();
			navigator.clipboard.writeText(copyText);
			toastService.showToast('Copied Verses');
		} else {
			toastService.showToast('No Verses Selected');
		}
	}

	function onClose() {
		showCopyVersePopup = false;
	}

	function onVerseClicked(idx: number) {
		checked[idx] = !checked[idx];
		areAllVersesChecked();
		setSelectedVerses();
	}

	function onCopyVerseClicked(verseNumber: number) {
		let verseRange = [verseNumber, verseNumber];
		let copyText = getVerseRangeText(verseRange);
		navigator.clipboard.writeText(copyText);
		toastService.showToast('Copied Verses');
	}
</script>

{#snippet body()}
	{@render abc()}

	{#each verseNumbers as verseNumber, idx}
		<div
			role="button"
			tabindex="-1"
			onkeydown={() => {}}
			onclick={() => onVerseClicked(idx)}
			class="hover:bg-primary-100 flex flex-row items-center justify-center py-6 leading-loose hover:cursor-pointer"
		>
			<div class="flex min-w-16 justify-center">
				<input
					type="checkbox"
					class="accent-support-a-600 h-5 w-5"
					bind:checked={checked[idx]}
					onchange={areAllVersesChecked}
				/>
			</div>
			<div class="flex flex-col px-4">
				<span class="whitespace-normal">
					{verses.get(verseNumber)?.text}
				</span>
				<span class="flex-fill flex"></span>
				{@render actions(parseInt(verseNumber))}
			</div>
		</div>
	{/each}
{/snippet}

{#snippet abc()}
	<div
		class=" relative sticky top-0 flex flex-row justify-between bg-neutral-50"
	>
		<span class="absolute w-full">
			<span class="flex-fill flex justify-center p-2 text-nowrap">
				{selectedVerseRangeText}
			</span>
		</span>
		<div class="p-2">
			<label
				for="showCompleted"
				class="has-checked:bg-support-a-600 relative block h-8 w-14 rounded-full bg-neutral-300 transition-colors [-webkit-tap-highlight-color:_transparent] hover:cursor-pointer"
			>
				<input
					bind:checked={allChecked}
					onchange={toggleSelects}
					type="checkbox"
					id="showCompleted"
					class="peer sr-only"
				/>

				<span
					class="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-neutral-100 transition-[inset-inline-start] peer-checked:start-6"
				></span>
			</label>
		</div>
	</div>
{/snippet}

{#snippet actions(verseNumber: number)}
	<div class="flex flex-row justify-end space-x-4">
		<Copy onCopy={() => onCopyVerseClicked(verseNumber)}></Copy>

		<HorizontalSplit
			bind:paneID
			module={Modules.BIBLE}
			data={{ bibleLocationRef: getVerseBibleLocationReference(verseNumber) }}
		></HorizontalSplit>

		<VerticalSplit
			bind:paneID
			module={Modules.BIBLE}
			data={{ bibleLocationRef: getVerseBibleLocationReference(verseNumber) }}
		></VerticalSplit>
	</div>
{/snippet}

<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		<Copy {onCopy}></Copy>
		<span class="m-auto text-center">{title}</span>
		<Close {onClose}></Close>
	</BufferHeader>
	<BufferBody bind:clientHeight bind:headerHeight classes="">
		{@render body()}
	</BufferBody>
</BufferContainer>
