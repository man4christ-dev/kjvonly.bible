<script lang="ts">
	let { clientHeight = $bindable<number>(), children } = $props();
</script>

<div
	bind:clientHeight
	class="relative flex h-full w-full justify-center bg-neutral-50"
>
	<div class="w-full max-w-lg outline outline-neutral-400">
		{@render children?.()}
	</div>
</div>
