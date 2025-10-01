<script lang="ts">
	let { clientHeight = $bindable<number>(), children } = $props();
</script>

<div bind:clientHeight class="flex h-full w-full justify-center bg-neutral-50">
	<div class="w-full max-w-lg">
		{@render children?.()}
	</div>
</div>
