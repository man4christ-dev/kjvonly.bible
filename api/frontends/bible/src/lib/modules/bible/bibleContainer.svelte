<script lang="ts">
	// ================================ IMPORTS ================================
	// SVELTE
	import { onMount } from 'svelte';

	// COMPONENTS
	import Chapter from './chapter/chapter.svelte';
	import ChapterActions from './popups/chapterActions.svelte';
	import EditOptions from './chapter/editOptions.svelte';

	// MODELS
	import { newAnnotation, type Annotations } from '$lib/models/bible.model';
	import type { Pane } from '$lib/models/pane.model';

	// SERVICES
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
	import { paneService } from '$lib/services/pane.service.svelte';

	// OTHER
	import uuid4 from 'uuid4';
	import ChapterNavButtons from './components/chapterNavButtons.svelte';

	// =============================== BINDINGS ================================

	let {
		paneID = $bindable<string>(),
		pane = $bindable<Pane>()
	}: {
		paneID: string;
		pane: Pane;
	} = $props();

	// ================================= VARS ==================================

	let annotations: Annotations = $state(newAnnotation());
	let bookChapter: string = $state('');
	let bookName: string = $state('');
	let bibleLocationRef: string | null = $state(null);
	let clientHeight = $state(0);
	let id = $state(uuid4());
	let mode: any = $state({
		value: '',
		colorAnnotation: 'bg-highlighta',
		bibleLocationRef: '73_1_1_1',
		notePopup: { show: false }
	});

	// DOM related vars
	let lastKnownScrollPosition = $state(0);
	let ticking = false;
	let buttonTopOffset = $state(0);

	// =============================== LIFECYCLE ===============================
	onMount(() => {
		setModePaneID();
		setNavReadings();
		setBibleLocationRef();
		attachScrollEventListener();
		scrollToVerse();
		overrideContextMenu();
	});

	$effect(() => {
		bibleLocationRef;
		onBibleLocationRefChanged();
	});

	// ================================ FUNCS ==================================

	function setModePaneID() {
		mode.paneID = paneID;
	}

	function setNavReadings() {
		if (pane?.buffer?.bag?.navReadings) {
			mode.navReadings = pane?.buffer?.bag?.navReadings;
		}
	}
	function setBibleLocationRef() {
		let ref = pane.buffer.bag.bibleLocationRef;
		if (ref) {
			bibleLocationRef = ref;
		} else {
			bibleLocationRef = localStorage.getItem('lastBibleLocationReference');
			if (!bibleLocationRef) {
				bibleLocationRef = '50_3'; // John 3
			}
		}
	}

	function attachScrollEventListener() {
		let el = document.getElementById(id);
		if (el === null) {
			return;
		}

		el.addEventListener('scroll', (event) => {
			//lastKnownScrollPosition = window.scrollY;

			lastKnownScrollPosition = el.scrollTop;
			if (!ticking) {
				window.requestAnimationFrame(() => {
					setChapterNavigationButtonOffset(lastKnownScrollPosition);
					ticking = false;
				});
				ticking = true;
			}
		});
	}

	function scrollToVerse() {
		if (pane?.buffer?.bag?.lastVerse) {
			setTimeout(() => {
				let vel = document.getElementById(
					`${id}-vno-${pane.buffer.bag.lastVerse}`
				);
				vel?.scrollIntoView({
					behavior: 'instant',
					block: 'center'
				});
			}, 50);
		}
	}

	function overrideContextMenu() {
		setTimeout(() => {
			let cc = document.getElementById(`chapter-container-${id}`);
			cc?.addEventListener('contextmenu', (e) => e.preventDefault());
		}, 500);
	}

	function setChapterNavigationButtonOffset(sp: number) {
		let el = document.getElementById(id);
		if (el === null) {
			return;
		}

		const threshold = 200; // Adjust this value as needed
		const isReachBottom =
			el.scrollHeight - el.clientHeight - el.scrollTop <= threshold;

		if (isReachBottom) {
			// this function will be called when window height changes i.e. changing a chapter.
			// when this happens pos will be negative. If we remove this check the buttons will
			// end up in the header :)
			let pos = (el.scrollTop + el.clientHeight - el.scrollHeight) * -1;
			if (pos < 0) {
				return;
			}
			buttonTopOffset = (el.scrollTop + el.clientHeight - el.scrollHeight) * -1;
		} else {
			buttonTopOffset = el.scrollTop / 3;
		}
	}

	function onBibleLocationRefChanged() {
		if (bibleLocationRef) {
			pane.buffer.bag.bibleLocationRef =
				bibleLocationReferenceService.extractBookChapter(bibleLocationRef);
			localStorage.setItem(
				'lastBibleLocationReference',
				bibleLocationReferenceService.extractBookChapter(bibleLocationRef)
			);
			paneService.save();
		}
	}
</script>

<!-- ================================ HEADER =============================== -->

{#snippet header()}
	<div class="sticky top-0 z-[1500] flex w-full justify-center">
		<ChapterActions
			bind:mode
			bind:bibleLocationRef
			bind:annotations
			bind:clientHeight
			{bookName}
			{bookChapter}
			{paneID}
		></ChapterActions>
	</div>
{/snippet}

<!-- ================================= BODY ================================ -->

{#snippet body()}
	<div class="kjvonly-noselect flex justify-center">
		<div class="max-w-lg">
			<div id="chapter-container-{id}" class="w-full">
				<Chapter
					bind:bookName
					bind:bookChapter
					bind:bibleLocationRef
					bind:id
					bind:pane
					bind:mode
					bind:annotations
					{lastKnownScrollPosition}
				></Chapter>
			</div>
		</div>
	</div>
{/snippet}

<!-- ================================ FOOTER =============================== -->

{#snippet footer()}
	<div class="flex w-full justify-center">
		<div class="w-full max-w-6xl">
			<!-- Need to type mode.value -->
			{#if mode.value === ''}
				<ChapterNavButtons
					bind:mode
					bind:pane
					bind:bibleLocationRef
					bind:buttonTopOffset
				></ChapterNavButtons>
			{:else}
				<div
					style="transform: translate3d(0px, 0px, 0px); "
					class="sticky z-10"
				>
					<div class="absolute bottom-0 w-full">
						<EditOptions bind:mode bind:annotations></EditOptions>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/snippet}

<!-- ============================== CONTAINER ============================== -->

<div
	bind:clientHeight
	class="h-full overflow-hidden"
	role="document"
	oncontextmenu={() => {
		return false;
	}}
>
	<div {id} class="h-full overflow-y-scroll">
		{#if bibleLocationRef}
			{@render header()}
			{@render body()}
		{/if}
	</div>

	{#if bibleLocationRef}
		{@render footer()}
	{/if}
</div>
