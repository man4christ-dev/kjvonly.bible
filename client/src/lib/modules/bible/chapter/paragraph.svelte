<script lang="ts">
	// =============================== BINDINGS ================================

	let {
		verseNumber = $bindable(),
		bibleLocationRef = $bindable(),
		paragraphs = $bindable()
	} = $props();
</script>

{#if paragraphs && paragraphs[`${bibleLocationRef}_${verseNumber}_0`] && verseNumber !== 1}
	<br />
	<br />
{/if}
