<script lang="ts">
	import uuid4 from 'uuid4';

	let {
		ID = uuid4(),
		clientHeight = $bindable<number>(),
		headerHeight = $bindable<number>(),
		classes = 'px-4',
		children
	} = $props();
</script>

<div
	id="{ID}-scroll-container"
	style="height: {clientHeight - headerHeight}px"
	class="flex w-full max-w-lg flex-col overflow-y-scroll border border-neutral-400 {classes}"
>
	{@render children?.()}
</div>
