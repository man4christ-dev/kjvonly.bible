<script lang="ts">
	import Close from '$lib/components/buttons/close.svelte';
	import Copy from '$lib/components/buttons/copy.svelte';
	import type { Verse } from '$lib/models/bible.model';
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
	import { chapterService } from '$lib/services/bible/chapter.service';
	import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';
	import { shortBookNamesByIDService } from '$lib/services/bibleMetadata/shortBookNamesByID.service';
	import { toastService } from '$lib/services/toast.service';
	import { onMount } from 'svelte';

	let { bibleLocationRef = $bindable(), showCopyVersePopup = $bindable() } =
		$props();

	let verseKeys: string[] = $state([]);
	let checkedByVerseNumber: { [key: string]: { checked: boolean } } = $state(
		{}
	);
	let verses: Map<string, Verse> = $state(new Map());
	let checkAll = $state(false);

	let title = $state('');
	onMount(async () => {
		closePopupOnInvalidBibleLocationReference();
		setTitle();
		await loadVerses();
		initializeCheckedVersesByIdMap();
		setSortedAscVersesKeys();
	});

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
		verses.forEach((verse: Verse) => {
			checkedByVerseNumber[String(verse.number)] = { checked: false };
		});
	}

	function setTitle() {
		let bookID = bibleLocationReferenceService.extractBookID(bibleLocationRef);
		let bookName = bookNamesByIDService.get(bookID);
		let chapterNumber =
			bibleLocationReferenceService.extractChapter(bibleLocationRef);
		title = `${bookName} ${chapterNumber}`;
	}
	function closePopupOnInvalidBibleLocationReference() {
		if (bibleLocationRef.split('_') < 2) {
			showCopyVersePopup = false;
		}
	}

	function onCopy() {
		let checked: any = [];
		verses.map((v: any) => {
			if (checkedByVerseNumber[v].checked) {
				checked.push(verses[v].number);
			}
		});

		let sortedKeys: any = [];
		if (checked.length > 1) {
			sortedKeys = checked.sort((a: any, b: any) => {
				return parseInt(a) - parseInt(b);
			});
		} else {
			sortedKeys = checked;
		}

		let startKey = sortedKeys[0];
		let lastKey = sortedKeys[0];

		let copyText = '';

		let buckets = [];
		let range: string[] = [];
		sortedKeys.forEach((k: any) => {
			if (k - lastKey > 1) {
				buckets.push(range);
				range = [k];
				lastKey = k;
			} else {
				range.push(k);
				lastKey = k;
			}
		});

		buckets.push(range);

		buckets.forEach((r) => {
			let first = r[0];
			let last = r[r.length - 1];

			let text = '';
			if (first === last) {
				text = `${title}:${first}\n`;
			} else {
				text = `${title}:${first}-${last}\n`;
			}

			r.forEach((v) => {
				text += `${verses.get(v)?.text}\n`;
			});

			text += '\n';
			copyText += text;
		});

		navigator.clipboard.writeText(copyText);
		toastService.showToast('Copied Verses');
	}

	function toggleSelects() {
		verses.forEach((v: Verse) => {
			checkedByVerseNumber[`${v.number}`].checked = checkAll;
		});
	}

	let clientHeight = $state(0);
	let headerHeight = $state(0);

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
					<Copy onCopy></Copy>
					<p>
						<span>{title}</span>
					</p>
					<Close onClose></Close>
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
					bind:checked={checkAll}
					onchange={() => {
						toggleSelects();
					}}
				/>
			</div>
			{#each verseKeys as k}
				<div class="flex flex-row items-start space-y-4">
					<div>
						<input
							type="checkbox"
							class="accent-support-a-500 mx-4 h-5 w-5"
							bind:checked={checkedByVerseNumber[k].checked}
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
