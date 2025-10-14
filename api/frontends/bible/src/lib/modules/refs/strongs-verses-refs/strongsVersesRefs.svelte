<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import StrongsRefsContainer from '../strongs-refs/strongsRefsContainer.svelte';
	import VerseRefsContainer from '../verses-refs/verseRefsContainer.svelte';
	import { paneService } from '$lib/services/pane.service.svelte';
	import FootnoteContainer from '../footnote/footnoteContainer.svelte';
	import uuid4 from 'uuid4';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import BufferBody from '$lib/components/bufferBody.svelte';
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import Close from '$lib/components/svgs/close.svelte';

	let {
		paneID,
		pane = $bindable(),
		containerHeight = $bindable(),
		containerWidth = $bindable()
	} = $props();

	let clientHeight: number = $state(0);
	let headerHeight: number = $state(0);
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

	function onClose(e: Event): void {
		e.stopPropagation();
		paneService.onDeletePane(paneService.rootPane, paneID);
	}
</script>

{#snippet header()}
	<span class="flex-1"></span>
	<span>Strongs / Refs</span>
	<div class="flex flex-1 justify-end">
		<KJVButton onClick={onClose} classes="">
			<Close classes=""></Close>
		</KJVButton>
	</div>
{/snippet}

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
<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		{@render header()}
	</BufferHeader>
	<BufferBody bind:clientHeight bind:headerHeight>
		{@render body()}
	</BufferBody>
</BufferContainer>
