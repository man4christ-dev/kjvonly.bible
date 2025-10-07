<script lang="ts">
	import {
		type Annotations,
		type BibleMode,
		type Verse
	} from '$lib/models/bible.model';
	import type { Pane } from '$lib/models/pane.model';
	import Word from './word.svelte';

	let {
		annotations = $bindable<Annotations>(),
		pane = $bindable<Pane>(),
		mode = $bindable<BibleMode>(),
		notes = $bindable<any>(),
		bibleLocationRef,
		footnotes,
		lastKnownScrollPosition,
		verse
	}: {
		annotations: Annotations;
		pane: Pane;
		mode: BibleMode;
		notes: any;
		bibleLocationRef: string;
		footnotes: Map<string, string>;
		lastKnownScrollPosition: number;
		verse: Verse;
	} = $props();
</script>

{#if verse}
	<span class="inline-block">
		{#each verse.words.slice(0, 2) as word, idx}
			<Word
				bind:pane
				bind:annotations
				bind:notes
				bind:mode
				{verse}
				{word}
				{footnotes}
				{bibleLocationRef}
				{lastKnownScrollPosition}
				wordIdx={idx}
			></Word>
		{/each}
	</span>{#each verse.words.slice(2) as word, idx}
		<Word
			bind:pane
			bind:annotations
			bind:notes
			bind:mode
			{verse}
			{word}
			{footnotes}
			{bibleLocationRef}
			{lastKnownScrollPosition}
			wordIdx={idx + 2}
		></Word>
	{/each}
{/if}
