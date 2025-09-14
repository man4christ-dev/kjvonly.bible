<script lang="ts">
    let { actionItems} = $props()
</script>

	<div class="flex w-full flex-col">
		{#each Object.keys(actionItems) as a}
			<button
				onclick={(event) => actionItems[a]()}
				class="hover:bg-primary-50 flex w-full bg-neutral-50 p-4 text-start capitalize hover:cursor-pointer"
				>{a}</button
			>
		{/each}
	</div>

