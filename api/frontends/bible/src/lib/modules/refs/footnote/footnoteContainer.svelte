<script lang="ts">
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import ChevronDown from '$lib/components/chevronDown.svelte';
	import Asterisk from '$lib/components/svgs/asterisk.svelte';

	import KeyboardArrowDown from '$lib/components/svgs/keyboardArrowDown.svelte';
	import KeyboardArrowRight from '$lib/components/svgs/keyboardArrowRight.svelte';
	import ShortText from '$lib/components/svgs/shortText.svelte';
	import { numberToLetters } from '$lib/services/dynamicGrid.service';
	import { onMount } from 'svelte';

	let { isVerseRef, footnotes, chapterFootnotes } = $props();

	let fs: Footnote[] = $state([]);
	let toggle = $state(false);

	interface Footnote {
		key: string;
		html: string;
		toggle: boolean;
	}

	onMount(() => {
		setFootnotes();
	});

	function setFootnotes(): void {
		footnotes.forEach((f: any) => {
			let key = f?.split('_')[2];
			fs.push({
				key: numberToLetters(key),
				html: chapterFootnotes[key],
				toggle: false
			});
		});
	}

	function onToggleFootnotes(): void {
		toggle = !toggle;
	}

	function onToggleFootnote(fn: Footnote) {
		fn.toggle = !fn.toggle;
	}
</script>

{#if fs.length > 0}
	{#if fs.length > 1 || isVerseRef}
		<div class="flex flex-col">
			<div class="flex flex-row items-center">
				<KJVButton classes="" onClick={onToggleFootnotes}>
					{#if !toggle}
						<KeyboardArrowRight></KeyboardArrowRight>
					{:else}
						<KeyboardArrowDown></KeyboardArrowDown>
					{/if}
				</KJVButton>
				<Asterisk></Asterisk>
				<p class="ps-1 pe-4 capitalize">footnotes</p>
			</div>
			{#if toggle}
				{#each fs as f}
					<div class="ps-2">
						<p class="flex flex-row items-center pt-2">
							<KJVButton classes="" onClick={() => onToggleFootnote(f)}>
								{#if !f.toggle}
									<KeyboardArrowRight></KeyboardArrowRight>
								{:else}
									<KeyboardArrowDown></KeyboardArrowDown>
								{/if}
							</KJVButton>
							<ShortText></ShortText>
							<span class="px-2 ps-1">{f['key']} </span>
						</p>
						{#if f.toggle}
							<p class="ps-10">
								{@html f['html']}
							</p>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	{:else}
		<div class="flex flex-row items-center py-2">
			<span class="px-2">{fs[0]['key']} </span>

			<p class="ps-4">
				{@html fs[0]['html']}
			</p>
		</div>
	{/if}
{/if}
