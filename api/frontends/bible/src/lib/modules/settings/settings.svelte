<script lang="ts">
	import { onMount } from 'svelte';
	import { settingsService } from '$lib/services/settings.service';
	import FontFamilies from './fontFamilies.svelte';
	import FontWeights from './fontWeights.svelte';
	import FontSize from './fontSize.svelte';
	import ColorTheme from './colorTheme.svelte';
	import LightDarkMode from './lightDarkMode.svelte';
	import Close from '$lib/components/buttons/close.svelte';

	let { onClose } = $props();
	let headerHeight = $state(0);
	let clientHeight = $state(0);
	let settings: any = $state();

	$effect(() => {
		settings;

		if (settings !== undefined) {
			localStorage.setItem('settings', JSON.stringify(settings));
		}

		/* update color theme */
		if (settings && settings.colorTheme) {
			settingsService.setTheme(settings?.colorTheme);
		}
	});

	onMount(async () => {
		settings = settingsService.getSettings();
	});
</script>

<div bind:clientHeight class="flex h-full w-full justify-center bg-neutral-50">
	<div class="w-full max-w-lg">
		<header
			bind:clientHeight={headerHeight}
			class="sticky top-0 w-full flex-col border-b-2 bg-neutral-100 text-neutral-700"
		>
			<div
				class="sticky top-0 flex w-full justify-between px-2 pt-2 text-neutral-700"
			>
				<div class="flex items-center justify-center">
					<h1 class="text-start">Settings</h1>
				</div>

				<Close {onClose}></Close>
			</div>
		</header>

		<div
			style="height: {clientHeight - headerHeight}px"
			class="flex w-full flex-col overflow-y-scroll border"
		>
			<LightDarkMode bind:settings></LightDarkMode>

			<ColorTheme bind:settings></ColorTheme>

			<FontSize bind:settings></FontSize>

			<FontFamilies bind:settings></FontFamilies>

			<FontWeights bind:settings></FontWeights>

			<span class="h-full flex-1"></span>
		</div>
	</div>
</div>
