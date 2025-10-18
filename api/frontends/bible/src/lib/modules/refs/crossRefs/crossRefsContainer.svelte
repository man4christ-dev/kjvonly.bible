<script lang="ts">
	// ================================ IMPORTS ================================
	// SVELTE
	import { onMount } from 'svelte';
	// COMPONENTS
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	// // SVG
	import KeyboardArrowRight from '$lib/components/svgs/keyboardArrowRight.svelte';
	import KeyboardArrowDown from '$lib/components/svgs/keyboardArrowDown.svelte';
	import MenuBook from '$lib/components/svgs/menuBook.svelte';

	// MODELS
	import { Modules } from '$lib/models/modules.model';

	// SERVICES
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
	import { bookNamesByIDService } from '$lib/services/bibleMetadata/bookNamesByID.service';
	import { shortBookNamesByIDService } from '$lib/services/bibleMetadata/shortBookNamesByID.service';
	import { paneService } from '$lib/services/pane.service.svelte';
	import { verseService } from '$lib/services/bible/verse.service';
	import type { CrossRef } from '$lib/models/bible.model';

	// =============================== BINDINGS ================================

	let {
		paneID,
		boundCrossRefs
	}: {
		paneID: string;
		boundCrossRefs: string[];
	} = $props();

	// ================================== VARS =================================
	let crossRefMatrix: any[] = $state([]);
	let toggle = $state(false);

	// =============================== LIFECYCLE ===============================

	onMount(async () => {
		setCrossRefs();
	});

	// ================================ FUNCS ==================================
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
		let verseWithoutNumber = verse.text.slice(verse.text.indexOf(' '));

		return {
			ref: crossRef,
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
				crossRef.ref
			);
		let verse = await verseService.get(bibleLocationRef);
		let crossRefs = [crossRef.ref];
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
	}

	// ============================== CLICK FUNCS ==============================

	function onNavigateRefs(idx: number) {
		if (idx <= crossRefMatrix.length - 1) {
			crossRefMatrix.splice(idx, crossRefMatrix.length);
		}
	}

	function onToggle(): void {
		toggle = !toggle;
	}
</script>

<!-- ================================= BODY ================================ -->
{#snippet actions(crossRef: CrossRef)}
	<div class="flex flex-row justify-end space-x-4 py-2">
		<!-- copy -->
		<button
			aria-label="copy button"
			onclick={() => {
				copyToClipboard(crossRef);
			}}
		>
			<svg
				class="h-8 w-8"
				version="1.1"
				width="100%"
				height="100%"
				viewBox="0 0 106.96539 106.83998"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs id="defs6" />
				<g id="g8" transform="translate(-9.1541294,-7.1649487)">
					<path
						class="fill-neutral-400"
						d="M 9.2233551,92.567516 H 19.890021 V 17.900849 H 94.55669 V 7.2341829 l -57.333069,0.004 c -7.420266,0.018 -17.579333,-1.0826537 -23.3292,4.6670661 -5.7497329,5.749867 -4.6490529,15.908934 -4.6670529,23.3292 l -0.004,57.333067 M 38.105088,31.106449 c -5.949867,3.266267 -7.0848,9.945334 -7.402,16.15 -0.7004,13.7028 -0.224533,27.591334 -0.133467,41.31 0.0428,6.435867 -0.4952,14.477741 3.859334,19.780261 4.1912,5.1036 11.393466,5.3456 17.4684,5.49387 12.426933,0.30333 24.895195,0.1036 37.325465,0.0529 6.182,-0.0252 13.5064,0.54933 19.1188,-2.5316 5.94987,-3.26627 7.0848,-9.94532 7.402,-16.149994 0.7004,-13.7028 0.22454,-27.591333 0.13347,-41.31 -0.0428,-6.435867 0.4952,-14.477733 -3.85933,-19.780267 -4.1912,-5.1036 -11.39347,-5.3456 -17.46841,-5.493866 -12.42693,-0.303334 -24.895195,-0.1036 -37.325462,-0.05293 -6.182,0.0252 -13.5064,-0.549333 -19.1188,2.5316 m 67.118272,8.127734 V 103.23419 H 41.223355 V 39.234183 Z"
						id="path1212"
					/>
				</g>
			</svg>
		</button>

		<!-- horizontal split -->
		<button
			aria-label="horizontal split"
			onclick={() => {
				paneService.onSplitPane(paneID, 'h', Modules.BIBLE, {
					bibleLocationRef: `${crossRef.bookId}_${crossRef.chapterNumber}_${crossRef.verseNumber}`
				});
			}}
		>
			<svg
				class=" h-8 w-8"
				version="1.1"
				width="100%"
				height="100%"
				viewBox="0 0 94.018994 99.168052"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="g8" transform="translate(-16.573607,-13.492392)">
					<rect
						style="stroke-width:5;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1"
						class="fill-none stroke-neutral-400"
						width="90"
						height="42.665619"
						x="-108.58311"
						y="-58.167511"
						transform="scale(-1)"
					/>
					<rect
						style="stroke-width:5;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1"
						class="fill-none stroke-neutral-400"
						width="90"
						height="42.665619"
						x="-108.58311"
						y="-110.65095"
						transform="scale(-1)"
					/>
				</g>
			</svg>
		</button>

		<!-- vertical split -->
		<button
			aria-label="horizontal split"
			onclick={() => {
				paneService.onSplitPane(paneID, 'v', Modules.BIBLE, {
					bibleLocationRef: `${crossRef.bookId}_${crossRef.chapterNumber}_${crossRef.verseNumber}`
				});
			}}
		>
			<svg
				class="h-8 w-8"
				version="1.1"
				id="svg2"
				width="100%"
				height="100%"
				viewBox="0 0 94.018994 99.168052"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="g8" transform="translate(-16.898488,-13.804183)">
					<rect
						style="stroke-width:5;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1"
						class="fill-none stroke-neutral-400"
						id="rect2158"
						width="90"
						height="42.665619"
						x="-105.81368"
						y="18.907988"
						transform="rotate(-90)"
					/>
					<rect
						style="stroke-width:5;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1"
						class="fill-none stroke-neutral-400"
						id="rect2330"
						width="90"
						height="42.665619"
						x="-105.81368"
						y="70.164314"
						transform="rotate(-90)"
					/>
				</g>
			</svg>
		</button>
	</div>
{/snippet}

{#snippet refCurrentVerse(crossRef: CrossRef)}
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
			{#if !toggle}
				<KeyboardArrowRight></KeyboardArrowRight>
			{:else}
				<KeyboardArrowDown></KeyboardArrowDown>
			{/if}
		</KJVButton>
		<MenuBook></MenuBook>
		<p class="ps-1 pe-4 capitalize">Verses:</p>
	</div>
{/snippet}

<!-- ============================== CONTAINER ============================== -->
<div>
	<div class="">
		{@render versesToggle()}
		{#if toggle}
			<div class="py-4 ps-2">
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
								onNavigateRefs(idx + 1);
							}}
						>
							<span class="underline underline-offset-8"
								>{shortBookNamesByIDService.get(refs[0].bookId)}
								{refs[0].chapterNumber}:{refs[0].verseNumber}</span
							></button
						>
					{/if}
				{/each}

				<div class="h-2"></div>
				{#if crossRefMatrix.length > 0}
					{@const crossRef = crossRefMatrix[crossRefMatrix.length - 1][0]}

					{@render refCurrentVerse(crossRef)}

					{#if crossRefMatrix[crossRefMatrix.length - 1].length > 1}
						{#each crossRefMatrix[crossRefMatrix.length - 1].slice(1, crossRefMatrix[crossRefMatrix.length - 1].length) as crossRef}
							{@render refVerse(crossRef)}
						{/each}
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>
<span>&nbsp;</span>
