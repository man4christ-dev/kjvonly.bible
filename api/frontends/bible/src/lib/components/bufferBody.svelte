<script lang="ts">
	import uuid4 from 'uuid4';

	let {
		ID = uuid4(),
		clientHeight = $bindable<number>(),
		headerHeight = $bindable<number>(),
		children
	} = $props();
</script>

<div
	id="{ID}-scroll-container"
	style="height: {clientHeight - headerHeight}px"
	class="flex w-full max-w-lg flex-col overflow-y-scroll border border-neutral-400"
>
	{@render children?.()}

	<!-- <span class="h-full flex-1"></span> -->
</div>
