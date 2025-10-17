<script lang="ts">
	// ================================ IMPORTS ================================
	// SVELTE
	import { onMount } from 'svelte';

	// COMPONENTS
	import BufferBody from '$lib/components/bufferBody.svelte';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import FootnoteContainer from '../footnote/footnoteContainer.svelte';
	import StrongsRefsContainer from '../strongs-refs/strongsRefsContainer.svelte';
	import StrongsVersesRefsHeader from './strongsVersesRefsHeader.svelte';
	import VerseRefsContainer from '../verses-refs/verseRefsContainer.svelte';

	// MODELS
	import {
		newStrongsPopups,
		type StrongsPopups
	} from '$lib/models/strongs.model';

	// =============================== BINDINGS ================================

	let { paneID, pane = $bindable() } = $props();

	// ================================== VARS =================================

	let clientHeight: number = $state(0);
	let headerHeight: number = $state(0);

	let footnotes: string[] = $state([]);
	let popups: StrongsPopups = $state(newStrongsPopups());
	let strongsRefs: string[] = $state([]);
	let text = $state('');
	let verseRefs: string[] = $state([]);

	// =============================== LIFECYCLE ===============================

	onMount(() => {
		setRefs();
		setCurrentVerseRef();
		setWordText();
	});

	// ================================ FUNCS ==================================

	function setRefs(): void {
		let refs: string[] = getRefs();
		refs.forEach((ref: string) => {
			matchStrongsRef(ref);
			matchFootnote(ref);
			matchVerseRef(ref);
		});
	}

	/**
	 * Refs are passed to component via buffer bag
	 */
	function getRefs(): string[] {
		let refs: string[] = [];
		// TODO ADD TYPE
		if (pane?.buffer?.bag?.refs) {
			refs = pane?.buffer?.bag?.refs;
		} else {
			if (pane?.buffer?.bag?.word?.href) {
				refs = pane?.buffer?.bag?.word?.href;
			}
		}
		return refs;
	}

	function matchStrongsRef(ref: string): void {
		let match = new RegExp('^[GH]', 'm').test(ref);
		if (match) {
			strongsRefs.push(ref);
		}
	}

	function matchFootnote(ref: string): void {
		let match = new RegExp('\\d+_\\d+_\\d+', 'gm').test(ref);
		if (match) {
			footnotes.push(ref);
		}
	}

	function matchVerseRef(ref: string): void {
		let match = new RegExp('\\d+\/\\d+\/\\d+', 'gm').test(ref);
		if (match) {
			verseRefs.push(ref);
		}
	}

	/**
	 * If a word is selected and that word has verse references, add the
	 * current verse to the {@link verseRefs} at index 0. This way the user
	 * has visual queue for the verse that was clicked.
	 */
	function setCurrentVerseRef(): void {
		if (hasVerseRefs()) {
			if (pane?.buffer?.bag?.currentVerseRef) {
				verseRefs = [pane?.buffer?.bag?.currentVerseRef, ...verseRefs];
			}
		}
	}

	function hasVerseRefs(): boolean {
		return verseRefs.length > 0;
	}

	function setWordText(): void {
		if (pane?.buffer?.bag?.word?.text) {
			text = pane.buffer.bag.word.text.replace(
				/[?.,\/#!$%\^&\*;:{}=\-_`~()]/g,
				''
			);
		}
	}
	// ============================== CLICK FUNCS ==============================
</script>

<!-- ================================ HEADER =============================== -->
{#snippet header()}
	<StrongsVersesRefsHeader bind:popups bind:clientHeight {paneID}
	></StrongsVersesRefsHeader>
{/snippet}

<!-- ================================= BODY ================================ -->
{#snippet body()}
	{#if footnotes.length > 0}
		<FootnoteContainer
			isVerseRef={pane?.buffer?.bag?.refs !== undefined}
			{footnotes}
			chapterFootnotes={pane?.buffer?.bag?.footnotes}
		></FootnoteContainer>
	{/if}

	{#if strongsRefs.length > 0}
		<StrongsRefsContainer
			bind:clientHeight
			bind:popups
			{text}
			{strongsRefs}
			{paneID}
			isVerseRef={verseRefs.length > 0}
			strongsWords={pane?.buffer?.bag?.strongsWords}
		></StrongsRefsContainer>
	{/if}

	{#if verseRefs.length > 0}
		<VerseRefsContainer paneID={pane?.id} {verseRefs}></VerseRefsContainer>
	{/if}
{/snippet}

<!-- ============================== CONTAINER ============================== -->

<BufferContainer bind:clientHeight>
	<BufferHeader
		bind:headerHeight
		classes="flex w-full justify-between outline outline-neutral-400 text-neutral-700"
	>
		{@render header()}
	</BufferHeader>
	<BufferBody bind:clientHeight bind:headerHeight>
		{@render body()}
	</BufferBody>
</BufferContainer>
