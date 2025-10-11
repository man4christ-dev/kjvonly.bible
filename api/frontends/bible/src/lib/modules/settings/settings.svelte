<script lang="ts">
	import { onMount } from 'svelte';
	import { settingsService } from '$lib/services/settings.service';
	import FontFamilies from './fontFamilies.svelte';
	import FontWeights from './fontWeights.svelte';
	import FontSize from './fontSize.svelte';
	import ColorTheme from './colorTheme.svelte';
	import LightDarkMode from './lightDarkMode.svelte';
	import Close from '$lib/components/buttons/close.svelte';
	import { newSettings, type Settings } from '$lib/models/settings.model';
	import BufferHeader from '../../components/bufferHeader.svelte';
	import BufferBody from '../../components/bufferBody.svelte';
	import BufferContainer from '../../components/bufferContainer.svelte';

	// =============================== BINDINGS ================================

	let { onClose } = $props();

	// ================================== VARS =================================

	let headerHeight = $state(0);
	let clientHeight = $state(0);
	let settings: Settings = $state(newSettings());

	// =============================== LIFECYCLE ===============================

	onMount(async () => {
		settings = settingsService.getSettings();
	});

	$effect(() => {
		settings;

		if (settings !== undefined) {
			localStorage.setItem('settings', JSON.stringify(settings));
		}

		if (settings && settings.colorTheme) {
			settingsService.applySettings();
		}
	});
</script>

<!-- ================================ HEADER =============================== -->

{#snippet header()}
	<div class="flex items-center justify-center">
		<h1 class="text-start">Settings</h1>
	</div>
	<Close onClick={onClose}></Close>
{/snippet}

<!-- ================================= BODY =============================+== -->

{#snippet body()}
	<LightDarkMode bind:settings></LightDarkMode>

	<ColorTheme bind:settings></ColorTheme>

	<FontSize bind:settings></FontSize>

	<FontFamilies bind:settings></FontFamilies>

	<FontWeights bind:settings></FontWeights>
{/snippet}

<!-- ============================== CONTAINER ============================== -->

<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		{@render header()}
	</BufferHeader>

	<BufferBody bind:headerHeight bind:clientHeight>
		{@render body()}
	</BufferBody>
</BufferContainer>
