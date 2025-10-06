<script lang="ts">
	// ================================ IMPORTS ================================
	// SVELTE
	import { onMount } from 'svelte';

	// MODELS
	import { Modules } from '$lib/models/modules.model';

	// SERVICES
	import { bibleLocationReferenceService } from '$lib/services/bible/bibleLocationReference.service';
	import { paneService } from '$lib/services/pane.service.svelte';
	import type { Pane } from '$lib/models/pane.model';
	import type { Verse, Word } from '$lib/models/bible.model';

	// =============================== BINDINGS ================================

	let {
		annotations = $bindable(),
		pane = $bindable(),
		mode = $bindable(),
		notes = $bindable(),
		bibleLocationRef,
		footnotes,
		lastKnownScrollPosition,
		verse,
		word,
		wordIdx
	}: {
		annotations: any;
		pane: Pane;
		mode: any;
		notes: any;
		bibleLocationRef: string;
		footnotes: Map<string, string>;
		lastKnownScrollPosition: number;
		verse: Verse;
		word: Word;
		wordIdx: number;
	} = $props();

	// ================================= VARS ==================================

	let track: any = {};
	let wordAnnotations: any = $state();
	let wordHasNotes: boolean = $state(false);
	let verseHasReferences = $state(false);
	let pressThresholdInMilliseconds = 1000;

	// =============================== LIFECYCLE ===============================

	$effect(() => {
		annotations;
		setWordAnnotations();
	});

	$effect(() => {
		notes;
		setWordHasNotes();
	});

	onMount(() => {
		setVerseHasReferences();
	});

	// ================================ FUNCS ==================================

	function setVerseHasReferences() {
		if (isWordAVerseNumber()) {
			for (let w of verse.words) {
				for (var h of w.href || []) {
					if (h.includes('/')) {
						verseHasReferences = true;
						return;
					}
				}
			}
		}
		verseHasReferences = false;
	}

	function setWordAnnotations() {
		if (
			annotations.annots &&
			annotations.annots[verse.number] &&
			annotations.annots[verse.number][wordIdx]
		) {
			wordAnnotations = annotations.annots[verse.number][wordIdx];
		}
	}

	function setWordHasNotes() {
		if (notes) {
			let bookIDChapter =
				bibleLocationReferenceService.extractBookIDChapter(bibleLocationRef);
			let wordKey = `${bookIDChapter}_${verse.number}_${wordIdx}`;
			wordHasNotes = wordKey in notes;
		}
	}

	function updateMode(updMode: string) {
		let bookIDChapter =
			bibleLocationReferenceService.extractBookIDChapter(bibleLocationRef);
		mode.bibleLocationRef = `${bookIDChapter}_${verse.number}_${wordIdx}`;
		mode.value = updMode;
	}

	function initWordAnnotations(wordIndex: number) {
		if (!annotations.annots[verse.number]) {
			annotations.annots[verse.number] = {};
		}

		if (!annotations.annots[verse.number][wordIndex]) {
			annotations.annots[verse.number][wordIndex] = {};
		}

		if (!annotations.annots[verse.number][wordIndex].class) {
			annotations.annots[verse.number][wordIndex].class = [];
		}

		return annotations.annots[verse.number][wordIndex];
	}

	// ============================== CLICK FUNCS ==============================

	function onWordClicked(e: Event, word: any) {
		e.stopPropagation();

		let crossRef = getBibleCrossReference();

		if (isWordAVerseNumber()) {
			let refs = extractAllVerseRefs();
			let strongsWords = extractStrongsWords();

			paneService.onSplitPane(pane.id, 'h', Modules.STRONGS, {
				footnotes: footnotes,
				currentVerseRef: crossRef,
				refs: refs,
				strongsWords: strongsWords
			});
		} else {
			paneService.onSplitPane(pane.id, 'h', Modules.STRONGS, {
				word: word,
				footnotes: footnotes,
				currentVerseRef: crossRef
			});
		}
	}

	function isWordAVerseNumber(): boolean {
		return wordIdx === 0;
	}

	function extractAllVerseRefs(): string[] {
		return verse.words
			.flatMap((w: Word) => {
				return w.href;
			})
			.filter((s: string | null) => {
				return s !== null;
			});
	}

	function extractStrongsWords(): string[] {
		return verse.words
			.filter((w: Word) => {
				return w.href?.find((ref: string) => {
					return ref.startsWith('G') || ref.startsWith('H');
				});
			})
			.map((w: Word) => {
				return w.text;
			});
	}

	function getBibleCrossReference(): string {
		let bookIDChapter =
			bibleLocationReferenceService.extractBookIDChapter(bibleLocationRef);
		let bookIDChapterVerse = `${bookIDChapter}_${verse.number}`;
		return bookIDChapterVerse.replaceAll('_', '/');
	}

	function onMouseDownTouchStart() {
		track[wordIdx] = {
			startTime: Date.now(),
			lastKnownScrollPosition: lastKnownScrollPosition,
			finished: false
		};

		track[wordIdx].timeoutID = setTimeout(() => {
			if (track[wordIdx].finished) {
				return;
			}

			if (track[wordIdx].lastKnownScrollPosition != lastKnownScrollPosition) {
				delete track[wordIdx];
				return;
			}

			updateMode('edit');

			track[wordIdx].finished = true;
		}, pressThresholdInMilliseconds);
	}

	function onMouseUpTouchEnd() {
		if (track[wordIdx]) {
			const differenceInMilliseconds = Date.now() - track[wordIdx].startTime;
			if (differenceInMilliseconds < pressThresholdInMilliseconds) {
				clearTimeout(track[wordIdx].timeoutID);
			}
		}
	}

	function onEditClick() {
		if (mode.value == '') {
			return;
		}

		let wordIndexes = [];
		if (word.class?.includes('vno')) {
			for (let i = 0; i < verse.words.length; i++) {
				wordIndexes.push(i);
			}
		} else {
			wordIndexes.push(wordIdx);
		}

		let shouldAdd = true;
		if (wordIndexes.length > 1) {
			let w = initWordAnnotations(0);
			w.class.forEach((c: string) => {
				if (c.startsWith('bg')) {
					shouldAdd = false;
				}
			});
		}

		wordIndexes.forEach((i) => {
			let w = initWordAnnotations(i);

			let indexOf: number | undefined;
			w.class.forEach((c: string, idx: number) => {
				if (c.startsWith(mode.type)) {
					indexOf = idx;
				}
			});

			if (indexOf !== undefined || !shouldAdd) {
				w.class.splice(indexOf, 1);
				if (mode.type === 'decoration') {
					w.class = w.class.filter((c: string) => {
						if (c === 'underline' || c.startsWith('decoration')) {
							return;
						}
						return c;
					});
				}
			} else {
				w.class.push(mode.colorAnnotation);
				if (mode.type === 'decoration') {
					w.class.push('underline', 'decoration-solid');
				}
			}
		});
	}

	function onNotesClicked() {
		let bookIDChapter =
			bibleLocationReferenceService.extractBookIDChapter(bibleLocationRef);

		mode.bibleLocationRef = `${bookIDChapter}_${verse.number}_${wordIdx}`;
		mode.notePopup.show = true;
	}
</script>

{#if wordHasNotes}
	<span class={wordAnnotations?.class?.join(' ')}>
		&nbsp;<button
			onclick={onNotesClicked}
			aria-label="note"
			class="inline-block h-4 w-4 hover:cursor-pointer"
		>
			<svg
				version="1.1"
				id="svg798"
				width="100%"
				height="100%"
				viewBox="0 0 96 96"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="g804" transform="translate(-16,-16)">
					<path
						class="fill-support-a-500"
						style="stroke-width:1.33333"
						d="M 19.272727,108.72727 16,105.45455 V 64 22.545455 L 19.272727,19.272727 22.545455,16 H 64 105.45455 l 3.27272,3.272727 C 111.99725,22.542709 112,22.569285 112,50.959401 V 79.373349 L 95.647413,95.686675 79.294825,112 H 50.92014 c -28.348432,0 -28.377713,-0.003 -31.647413,-3.27273 z M 74.666667,88 V 74.666667 H 88 101.33333 v -24 -24 H 64 26.666667 V 64 101.33333 h 24 24 z M 37.333333,64 V 58.666667 H 50.666667 64 V 64 69.333333 H 50.666667 37.333333 Z m 0,-21.333333 V 37.333333 H 64 90.666667 V 42.666667 48 H 64 37.333333 Z"
						id="path925"
					/>
				</g>
			</svg>
		</button>
	</span>
{/if}{#if word && word.class && (word.class.includes('xref') || word.class.includes('FOOTNO') || word.class.includes('vno'))}
	<span class={wordAnnotations?.class?.join(' ')}>
		<span class="">&nbsp;</span
		><!-- svelte-ignore a11y_no_static_element_interactions --><!-- svelte-ignore a11y_click_events_have_key_events --><span
			onclick={(e) => {
				if (mode.value !== '') {
					onEditClick();
					return;
				}

				if (track[wordIdx] && track[wordIdx].finished) {
					return;
				}

				if (track[wordIdx]) {
					track[wordIdx].finished = true;
				}

				onWordClicked(e, word);
			}}
			ontouchstart={onMouseDownTouchStart}
			ontouchend={onMouseUpTouchEnd}
			onmousedown={onMouseDownTouchStart}
			onmouseup={onMouseUpTouchEnd}
			class="{word.class?.join(' ')} {verseHasReferences ? 'vno-refs' : ''} "
			>{word.text}</span
		></span
	>
{:else}
	<span class=" {wordAnnotations?.class?.join(' ')}">
		<span class="">&nbsp;</span><span
			tabindex="-1"
			role="button"
			onkeydown={() => {}}
			ontouchstart={onMouseDownTouchStart}
			ontouchend={onMouseUpTouchEnd}
			onmousedown={onMouseDownTouchStart}
			onmouseup={onMouseUpTouchEnd}
			onclick={onEditClick}
			class={word.class?.join(' ')}>{word.text}</span
		></span
	>
{/if}

<style>
	@reference "../../../../app.css";
	.FOOTNO {
		cursor: pointer;
		vertical-align: baseline;
		position: relative;
		top: -0.6em;
		z-index: 0;
		height: 100%;
		@apply ps-1 pe-2 text-xs text-neutral-700 md:text-base;
	}

	.redtxt {
		@apply text-redtxt;
	}

	.vno {
		@apply cursor-pointer text-neutral-700;
	}

	.vno-refs {
		@apply underline decoration-dotted;
	}

	.xref {
		/* @apply underline decoration-dotted !important; */
		@apply underline decoration-dotted;
		cursor: pointer;
	}

	span {
		display: inline-block;
	}
</style>
