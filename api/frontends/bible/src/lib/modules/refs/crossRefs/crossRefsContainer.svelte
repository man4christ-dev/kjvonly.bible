<script lang="ts">
	// ================================ IMPORTS ================================
	// SVELTE
	import { onMount } from 'svelte';

	// COMPONENTS
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';

	// // SVG
	import Copy from '$lib/components/svgs/copy.svelte';
	import KeyboardArrowRight from '$lib/components/svgs/keyboardArrowRight.svelte';
	import KeyboardArrowDown from '$lib/components/svgs/keyboardArrowDown.svelte';
	import MenuBook from '$lib/components/svgs/menuBook.svelte';
	import SplitScreenBottom from '$lib/components/svgs/splitScreenBottom.svelte';
	import SplitScreenRight from '$lib/components/svgs/splitScreenRight.svelte';

	// MODELS
	import { Modules } from '$lib/models/modules.model';
	import type { CrossRef } from '$lib/models/bible.model';

	// SERVICES
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
	import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';
	import { paneService } from '$lib/services/pane.service.svelte';
	import { shortBookNamesByIDService } from '$lib/services/bibleMetadata/shortBookNamesByID.service';
	import { toastService } from '$lib/services/toast.service';
	import { verseService } from '$lib/services/bible/verse.service';

	// OTHER
	import uuid4 from 'uuid4';

	// =============================== BINDINGS ================================

	let {
		paneID,
		boundCrossRefs
	}: {
		paneID: string;
		boundCrossRefs: string[];
	} = $props();

	// ================================== VARS =================================

	let ID = uuid4();
	/**
	 * A user can click on a cross reference to view the clicked cross reference
	 * cross references. We store the cross references for each verse clicked
	 * in the cross reference matrix. The verse that was clicked is the first
	 * cross reference in the array.
	 */
	let crossRefMatrix: CrossRef[][] = $state([]);
	let toggleCrossRefs = $state(false);

	// =============================== LIFECYCLE ===============================

	onMount(async () => {
		setCrossRefs();
	});

	// ================================ FUNCS ==================================
	/**
	 * Add the cross references that were passed in via the props. This will be
	 * the first entry in the crossRefMatrix.
	 */
	async function setCrossRefs(): Promise<void> {
		addCrossRefs(boundCrossRefs);
	}

	async function addCrossRefs(crossRefs: string[]): Promise<void> {
		let crossRefsWithState: any = $state([]);
		crossRefs.forEach(async (crossRefStr: string) => {
			try {
				let crossRef = await getCrossRef(crossRefStr);
				crossRefsWithState.push(crossRef);
			} catch (ex) {
				console.log(`error fetching ref ${crossRefStr} : ${ex}`);
			}
		});
		crossRefMatrix.push(crossRefsWithState);
	}

	async function getCrossRef(crossRef: string): Promise<CrossRef> {
		let bibleLocationRef =
			bibleLocationReferenceService.convertCrossRefToBibleLocationRef(crossRef);
		let chapterNumber =
			bibleLocationReferenceService.extractChapter(bibleLocationRef);
		let verseNumber =
			bibleLocationReferenceService.extractVerse(bibleLocationRef);
		let bookID = bibleLocationReferenceService.extractBookID(bibleLocationRef);
		let bookName = bookNamesByIDService.get(bookID);
		let verse = await verseService.get(bibleLocationRef);
		let verseWithoutNumber = verse.text.slice(verse.text.indexOf(' ') + 1);

		return {
			crossRef: crossRef,
			bibleLocationRef: bibleLocationRef,
			bookName: bookName,
			chapterNumber: chapterNumber,
			verseNumber: verseNumber,
			text: verseWithoutNumber,
			bookId: bookID
		};
	}

	async function onCrossRefClicked(crossRef: CrossRef) {
		let bibleLocationRef =
			bibleLocationReferenceService.convertCrossRefToBibleLocationRef(
				crossRef.crossRef
			);
		let verse = await verseService.get(bibleLocationRef);
		let crossRefs = [crossRef.crossRef];
		verse?.words.forEach((w: any) => {
			w.href?.forEach((ref: string) => {
				let match = new RegExp('\\d+\/\\d+\/\\d+', 'gm').test(ref);
				if (match) {
					crossRefs.push(ref);
				}
			});
		});
		addCrossRefs(crossRefs);
	}

	function copyToClipboard(crossRef: CrossRef) {
		let verse = `${crossRef.bookName} ${crossRef.chapterNumber}:${crossRef.verseNumber}\n${crossRef.text}`;
		navigator.clipboard.writeText(verse);
		toastService.showToast('Copied Verse');
	}

	// ============================== CLICK FUNCS ==============================

	function onBreadcrumbCrossRefClicked(idx: number): void {
		if (idx <= crossRefMatrix.length - 1) {
			crossRefMatrix.splice(idx, crossRefMatrix.length);
		}
	}

	function onToggle(): void {
		toggleCrossRefs = !toggleCrossRefs;
	}

	function onSplitScreenHorizontal(crossRef: CrossRef): void {
		paneService.onSplitPane(paneID, 'h', Modules.BIBLE, {
			bibleLocationRef: `${crossRef.bookId}_${crossRef.chapterNumber}_${crossRef.verseNumber}`
		});
	}

	function onSplitScreenVertical(crossRef: CrossRef): void {
		paneService.onSplitPane(paneID, 'v', Modules.BIBLE, {
			bibleLocationRef: `${crossRef.bookId}_${crossRef.chapterNumber}_${crossRef.verseNumber}`
		});
	}
</script>

<!-- ================================= BODY ================================ -->
{#snippet actions(crossRef: CrossRef)}
	<div class="flex flex-row justify-end space-x-4 py-2">
		<KJVButton classes="" onClick={() => copyToClipboard(crossRef)}>
			<Copy></Copy>
		</KJVButton>

		<KJVButton classes="" onClick={() => onSplitScreenHorizontal(crossRef)}>
			<SplitScreenBottom></SplitScreenBottom>
		</KJVButton>

		<KJVButton classes="" onClick={() => onSplitScreenVertical(crossRef)}>
			<SplitScreenRight></SplitScreenRight>
		</KJVButton>
	</div>
{/snippet}

{#snippet crossRefCurrentVerse(crossRef: CrossRef)}
	{#if crossRef}
		<p class="px-4 py-2 text-left">
			<span class="font-bold text-neutral-500"
				>{crossRef.bookName}
				{crossRef.chapterNumber}:{crossRef.verseNumber}</span
			><br />
			{#each crossRef.text.trim().split(' ') as w}
				<span class="inline-block">{w}</span>&nbsp;
			{/each}
		</p>
		{@render actions(crossRef)}
	{/if}
{/snippet}

{#snippet refVerse(crossRef: CrossRef)}
	{#if crossRef}
		<button
			onclick={() => {
				onCrossRefClicked(crossRef);
			}}
		>
			<p class="hover:bg-primary-100 cursor-pointer px-4 py-2 text-left">
				<span class="font-bold text-neutral-500"
					>{crossRef.bookName}
					{crossRef.chapterNumber}:{crossRef.verseNumber}</span
				><br />
				{#each crossRef.text.trim().split(' ') as w}
					<span class="inline-block">{w}</span>&nbsp;
				{/each}
			</p>
		</button>
		{@render actions(crossRef)}
	{/if}
{/snippet}

<!-- ================================ HEADER =============================== -->
{#snippet versesToggle()}
	<div class="flex flex-row items-center">
		<KJVButton classes="" onClick={onToggle}>
			{#if !toggleCrossRefs}
				<KeyboardArrowRight></KeyboardArrowRight>
			{:else}
				<KeyboardArrowDown></KeyboardArrowDown>
			{/if}
		</KJVButton>
		<MenuBook></MenuBook>
		<p class="ps-1 pe-4 capitalize">Cross References:</p>
	</div>
{/snippet}

{#snippet breadcrumbCrossRefs()}
	<div id="{ID}-breadcrumb">
		{#each crossRefMatrix as refs, idx}
			{#if idx > crossRefMatrix.length - 4 && refs[0]}
				{#if crossRefMatrix.length > 3 && idx === crossRefMatrix.length - 3}
					<span class="underline underline-offset-8">...</span>
				{/if}
				{#if idx !== 0}
					<span>&nbsp;/ </span>
				{/if}
				<button
					onclick={() => {
						onBreadcrumbCrossRefClicked(idx + 1);
					}}
				>
					<span class="underline underline-offset-8"
						>{shortBookNamesByIDService.get(refs[0].bookId)}
						{refs[0].chapterNumber}:{refs[0].verseNumber}</span
					></button
				>
			{/if}
		{/each}
	</div>
{/snippet}

{#snippet verseCrossRefs()}
	{#if crossRefMatrix.length > 0}
		{@const crossRef = crossRefMatrix[crossRefMatrix.length - 1][0]}

		<div class="py-2">
			{@render crossRefCurrentVerse(crossRef)}

			{#if crossRefMatrix[crossRefMatrix.length - 1].length > 1}
				{#each crossRefMatrix[crossRefMatrix.length - 1].slice(1, crossRefMatrix[crossRefMatrix.length - 1].length) as crossRef}
					{@render refVerse(crossRef)}
				{/each}
			{/if}
		</div>
	{/if}
{/snippet}
<!-- ============================== CONTAINER ============================== -->
<div>
	<div class="">
		{@render versesToggle()}
		{#if toggleCrossRefs}
			<div class="py-4 ps-2">
				{@render breadcrumbCrossRefs()}
				<div class="h-2"></div>
				{@render verseCrossRefs()}
			</div>
		{/if}
	</div>
</div>
