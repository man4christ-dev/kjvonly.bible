<script lang="ts">
	// ================================ IMPORTS ================================
	//SVELTE
	import { onMount } from 'svelte';

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

	// =============================== BINDINGS ================================

	let {
		bibleLocationRef = $bindable<string>(),
		showCopyVersePopup = $bindable<boolean>()
	}: {
		bibleLocationRef: string;
		showCopyVersePopup: boolean;
	} = $props();

	// ================================= VARS ==================================
	// DOM
	let clientHeight = $state(0);
	let headerHeight = $state(0);

	let allChecked = $state(false);
	let checked: boolean[] = $state([]);
	let verseKeys: string[] = $state([]);
	let verses: Map<string, Verse> = $state(new Map());
	let title = $state('');

	// =============================== LIFECYCLE ===============================

	onMount(async () => {
		closePopupOnInvalidBibleLocationReference();
		setTitle();
		await loadVerses();
		initializeCheckedVersesByIdMap();
		setSortedAscVersesKeys();
	});

	// ================================ FUNCS ==================================

	async function loadVerses() {
		let chapter = await chapterService.get(bibleLocationRef);
		verses = chapter.verses;
	}

	function setSortedAscVersesKeys() {
		verseKeys = verses
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

	// ============================== CLICK FUNCS ==============================

	function onCopy() {
		let copyText = getAllVerseRangeText();
		navigator.clipboard.writeText(copyText);
		toastService.showToast('Copied Verses');
	}

	function onClose() {
		showCopyVersePopup = false;
	}
</script>

<div bind:clientHeight class="flex h-full w-full justify-center bg-neutral-50">
	<div class="w-full max-w-lg">
		<header
			bind:clientHeight={headerHeight}
			class="sticky top-0 w-full flex-col border-b-2 bg-neutral-100 text-neutral-700"
		>
			<div class="flex w-full justify-between p-2">
				<header
					bind:clientHeight={headerHeight}
					class=" flex w-full max-w-lg flex-row items-center justify-between bg-neutral-100 text-neutral-700"
				>
					<Copy {onCopy}></Copy>
					<p>
						<span>{title}</span>
					</p>
					<Close {onClose}></Close>
				</header>
			</div>
		</header>
		<div
			style="height: {clientHeight - headerHeight}px"
			class="flex w-full flex-col overflow-y-scroll border"
		>
			<div>
				<input
					type="checkbox"
					class="accent-support-a-500 mx-4 mt-5 h-5 w-5"
					bind:checked={allChecked}
					onchange={() => {
						toggleSelects();
					}}
				/>
			</div>
			{#each verseKeys as k, idx}
				<div class="flex flex-row items-start space-y-4">
					<div>
						<input
							type="checkbox"
							class="accent-support-a-500 mx-4 h-5 w-5"
							bind:checked={checked[idx]}
						/>
					</div>
					<p>
						<span class="vno">{verses.get(k)?.text.split(' ')[0]}</span>
						{verses.get(k)?.text.split(' ').slice(1).join(' ')}
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>
