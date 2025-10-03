<script lang="ts">
	let { headerHeight = $bindable<number>(), children } = $props();
</script>

<header
	bind:clientHeight={headerHeight}
	class="sticky top-0 w-full flex-col bg-neutral-100 text-neutral-700"
>
	<div
		class="flex w-full justify-between border-s-1 border-e-1 border-t-1 border-neutral-400 px-2 text-neutral-700"
	>
		{@render children?.()}
	</div>
</header>
