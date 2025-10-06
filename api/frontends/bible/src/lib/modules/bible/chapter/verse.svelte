<script lang="ts">
	import Word from './word.svelte';

	let {
		annotations = $bindable(),
		pane = $bindable(),
		mode = $bindable(),
		notes = $bindable(),
		bibleLocationRef,
		footnotes,
		lastKnownScrollPosition,
		verse
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
