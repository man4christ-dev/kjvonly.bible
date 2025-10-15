<script lang="ts">
	import { onMount } from 'svelte';
	import StrongsRefsContainer from '../strongs-refs/strongsRefsContainer.svelte';
	import VerseRefsContainer from '../verses-refs/verseRefsContainer.svelte';
	import FootnoteContainer from '../footnote/footnoteContainer.svelte';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import BufferBody from '$lib/components/bufferBody.svelte';
	import StrongsVersesRefsHeader from './strongsVersesRefsHeader.svelte';

	let {
		paneID,
		pane = $bindable(),
		containerHeight = $bindable(),
		containerWidth = $bindable()
	} = $props();

	let clientHeight: number = $state(0);
	let headerHeight: number = $state(0);
	let zeroHeaderHeight: number = $state(0);
	let strongsRefs: string[] = $state([]);
	let footnotes: string[] = $state([]);
	let verseRefs: string[] = $state([]);
	let text = $state('');

	onMount(() => {
		let refs: string[] = [];
		if (pane?.buffer?.bag?.refs) {
			refs = pane?.buffer?.bag?.refs;
		} else {
			if (pane?.buffer?.bag?.word?.href) {
				refs = pane?.buffer?.bag?.word?.href;
			}
		}

		refs.forEach((ref: string) => {
			let match = new RegExp('^[GH]', 'm').test(ref);

			if (match) {
				strongsRefs.push(ref);
			}

			match = new RegExp('\\d+_\\d+_\\d+', 'gm').test(ref);
			if (match) {
				footnotes.push(ref);
			}

			match = new RegExp('\\d+\/\\d+\/\\d+', 'gm').test(ref);
			if (match) {
				verseRefs.push(ref);
			}
		});

		if (verseRefs.length > 0) {
			if (pane?.buffer?.bag?.currentVerseRef) {
				verseRefs = [pane?.buffer?.bag?.currentVerseRef, ...verseRefs];
			}
		}

		if (pane?.buffer?.bag?.word?.text) {
			text = pane.buffer.bag.word.text.replace(
				/[?.,\/#!$%\^&\*;:{}=\-_`~()]/g,
				''
			);
		}
	});
	$effect(() => {
		headerHeight;
		console.log(headerHeight);
	});
</script>

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
			isVerseRef={verseRefs.length > 0}
			strongsWords={pane?.buffer?.bag?.strongsWords}
			{text}
			{strongsRefs}
			{paneID}
			{containerHeight}
		></StrongsRefsContainer>
	{/if}

	{#if verseRefs.length > 0}
		<VerseRefsContainer paneID={pane?.id} {verseRefs}></VerseRefsContainer>
	{/if}
{/snippet}

{#snippet header()}
	<StrongsVersesRefsHeader bind:clientHeight {paneID}></StrongsVersesRefsHeader>
{/snippet}

<BufferContainer bind:clientHeight>
	<BufferHeader
		bind:headerHeight
		classes="flex w-full justify-between outline outline-neutral-400 text-neutral-700"
	>
		{@render header()}
	</BufferHeader>
	<BufferBody
		bind:clientHeight
		bind:headerHeight
		classes="clear-default-classes"
	>
		{@render body()}
	</BufferBody>
</BufferContainer>
