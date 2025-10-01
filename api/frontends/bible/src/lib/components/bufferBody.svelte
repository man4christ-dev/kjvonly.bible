<script lang="ts">
	let {
		clientHeight = $bindable<number>(),
		headerHeight = $bindable<number>(),
		children
	} = $props();
</script>

<div
	style="height: {clientHeight - headerHeight}px"
	class="flex w-full max-w-lg flex-col overflow-y-scroll border"
>
	{@render children?.()}

	<!-- <span class="h-full flex-1"></span> -->
</div>
