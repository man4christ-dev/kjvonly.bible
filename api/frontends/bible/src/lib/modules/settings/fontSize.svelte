<script lang="ts">
	import Save from '$lib/components/buttons/save.svelte';
	import type { Settings } from '$lib/models/settings.model';

	// =============================== BINDINGS ================================

	let { settings = $bindable<Settings>() } = $props();

	// ================================== VARS =================================

	let fontSize = $state(12);

	// =============================== LIFECYCLE ===============================

	$effect(() => {
		settings;

		let fs = parseInt(settings?.fontSize);

		if (fs) {
			fontSize = fs;
		}
	});

	// ============================== CLICK FUNCS ==============================

	function onSizeSelected(newFontSize: number) {
		fontSize = newFontSize;
		settings.fontSize = fontSize;
	}
</script>

<div class="p-4">
	<div class="flex w-full flex-col">
		<p class="flex w-full items-center text-nowrap capitalize">font size</p>
		<div class="flex flex-row pt-4">
			<input
				bind:value={fontSize}
				class="flex w-full border border-2 p-2 text-center"
				type="number"
			/>
			<Save
				onClick={() => {
					onSizeSelected(fontSize);
				}}
			></Save>
		</div>
	</div>
	<div class="mt-4 outline">
		<p class="p-4" style="font-size: {fontSize}px">
			Ephesians 2:8 <br />For by grace are ye saved through faith; and that not
			of yourselves: it is the gift of God:
		</p>
	</div>
</div>
