<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		headerHeight = $bindable<number>(),
		classes = 'flex w-full justify-between  border-neutral-400 px-2 text-neutral-700',
		children
	}: {
		headerHeight: number;
		classes?: string;
		children: Snippet;
	} = $props();
</script>

<header
	bind:clientHeight={headerHeight}
	class="sticky top-0 z-[1500] w-full bg-neutral-100 text-neutral-700"
>
	<div class="{classes} relative">
		{@render children?.()}
	</div>
</header>
