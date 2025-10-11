<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	let {
		onClick,
		classes = 'h-12 w-12 rounded-full bg-neutral-100 text-neutral-700 ring-2 ring-neutral-300',
		children
	}: {
		onClick: MouseEventHandler<HTMLButtonElement>;
		classes?: string;
		children: Snippet;
	} = $props();
</script>

<button onclick={onClick} class={classes}>
	{@render children?.()}
</button>
