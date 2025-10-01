<script lang="ts">
	let { headerHeight = $bindable<number>(), children } = $props();
</script>

<header
	bind:clientHeight={headerHeight}
	class="sticky top-0 w-full flex-col border-b-2 bg-neutral-100 text-neutral-700"
>
	<div
		class="sticky top-0 flex w-full justify-between px-2 pt-2 text-neutral-700"
	>
		{@render children?.()}
	</div>
</header>
