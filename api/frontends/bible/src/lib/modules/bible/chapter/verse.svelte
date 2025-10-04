<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import Word from './word.svelte';
	let {
		lastKnownScrollPosition,
		bibleLocationRef,
		footnotes,
		verse,
		pane = $bindable(),
		annotations = $bindable(),
		notes = $bindable(),
		mode = $bindable()
	} = $props();

	function a() {}
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
