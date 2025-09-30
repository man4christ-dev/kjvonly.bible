<script lang="ts">
	import { onMount } from 'svelte';
	import { settingsService } from '$lib/services/settings.service';
	import Save from '$lib/components/buttons/save.svelte';
	import Sun from '$lib/components/buttons/sun.svelte';
	import Moon from '$lib/components/buttons/moon.svelte';

	let { onClose } = $props();
	let headerHeight = $state(0);
	let clientHeight = $state(0);
	let settings: any = $state();

	let fontSize = $state(12);
	let selectedFontFamily = $state('sans');
	let selectedFontWeight = $state(400);

	let fontFamilies = [
		{
			name: 'sans-serif',
			fontFamily: 'sans-serif',
			fontTheme: 'sans',
			class: 'font-sans'
		},
		{
			name: 'serif',
			fontFamily: 'serif',
			fontTheme: 'serif',
			class: 'font-serif'
		},
		{
			name: 'monospace',
			fontFamily: 'monospace',
			fontTheme: 'mono',
			class: 'font-mono'
		},
		{
			name: 'KJV1611',
			fontFamily: 'font-kjv',
			fontTheme: 'kjv',
			class: 'font-kjv'
		},
		{
			name: 'Roboto Mono',
			fontFamily: 'monospace',
			fontTheme: 'roboto-mono',
			class: 'font-roboto-mono'
		},
		{
			name: 'JetBrains Mono',
			fontFamily: 'monospace',
			fontTheme: 'jetbrains-mono',
			class: 'font-jetbrains-mono'
		}
	];

	let fontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

	$effect(() => {
		settings;

		if (settings !== undefined) {
			localStorage.setItem('settings', JSON.stringify(settings));
		}

		/* update color theme */
		if (settings && settings.colorTheme) {
			settingsService.setTheme(settings?.colorTheme);
		}
		if (settings && settings.fontTheme) {
			selectedFontFamily = settings.fontTheme;
		}

		if (settings && settings.fontWeight) {
			selectedFontWeight = settings.fontWeight;
		}
	});

	onMount(async () => {
		settings = settingsService.getSettings();

		if (settings.fontSize) {
			fontSize = settings.fontSize;
		}
	});

	function onSizeSelected(newFontSize: number) {
		fontSize = newFontSize;
		settings.fontSize = fontSize;
	}

	function onFontThemeSelected(fontTheme: string) {
		selectedFontFamily = fontTheme;
		settings.fontTheme = fontTheme;
	}

	function onFontWeightSelected(fontWeight: number) {
		settings.fontWeight = fontWeight;
	}
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

				<button
					aria-label="close"
					onclick={() => {
						onClose();
					}}
					class="h-12 w-12 px-2 text-neutral-700"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="100%"
						height="100%"
					>
						<path
							class="fill-neutral-700"
							d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M17,15.59L15.59,17L12,13.41L8.41,17L7,15.59 L10.59,12L7,8.41L8.41,7L12,10.59L15.59,7L17,8.41L13.41,12L17,15.59z"
						/>
					</svg>
				</button>
			</div>
		</header>

		<div
			style="height: {clientHeight - headerHeight}px"
			class="flex w-full flex-col overflow-y-scroll border"
		>
			<div class="flex flex-row p-4">
				<Sun
					onClick={() => (settings.isDarkTheme = false)}
					buttonClass={settings?.isDarkTheme === false
						? 'bg-primary-500 '
						: ' '}
					svgClass={settings?.isDarkTheme === true
						? 'fill-neutral-700'
						: 'fill-neutral-100'}
				></Sun>
				<Moon
					onClick={() => (settings.isDarkTheme = true)}
					buttonClass={settings?.isDarkTheme ? 'bg-primary-500 ' : ''}
					svgClass={settings?.isDarkTheme === true
						? ' fill-neutral-100'
						: 'fill-neutral-700'}
				></Moon>
			</div>

			<div class="flex w-full flex-col bg-neutral-50 p-4 font-bold">
				{#if settings?.colorTheme}
					<select
						name="HeadlineAct"
						id="HeadlineAct"
						class="bg-primary-500 w-full flex-1 rounded-lg p-4 font-bold text-neutral-50 uppercase"
						bind:value={settings.colorTheme}
						onchange={() => {
							settings = settings;
						}}
					>
						<option value="red">RED</option>
						<option value="light-blue">LIGHT BLUE</option>
						<option value="purple">PURPLE</option>
						<option value="cyan">CYAN</option>
						<option value="pink">PINK</option>
					</select>
				{/if}
				<div class="felx w-full pt-2">
					<div class="flex justify-center space-x-4">
						<button
							aria-label="color-a"
							class="bg-highlighta h-8 w-8 rounded-full"
						></button>
						<button
							aria-label="color-b"
							class="bg-highlightb h-8 w-8 rounded-full"
						></button>
						<button
							aria-label="color-c"
							class="bg-highlightc h-8 w-8 rounded-full"
						></button>
						<button
							aria-label="color-d"
							class="bg-highlightd h-8 w-8 rounded-full"
						></button>
						<button
							aria-label="color-e"
							class="bg-highlighte h-8 w-8 rounded-full"
						></button>
					</div>
				</div>
			</div>

			<div class="p-4">
				<div class="flex w-full flex-col">
					<p class="flex w-full items-center text-nowrap capitalize">
						font size
					</p>
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
						Ephesians 2:8 <br />For by grace are ye saved through faith; and
						that not of yourselves: it is the gift of God:
					</p>
				</div>
			</div>

			<div class="ps-4">Font Family</div>
			<div class="grid grid-cols-3 gap-4 p-4">
				{#each fontFamilies as ff}
					<button
						class="{ff.class} {ff.fontTheme === settings?.fontTheme
							? 'bg-primary-500 text-neutral-100'
							: ''} border border-1 p-2 hover:cursor-pointer"
						onclick={() => onFontThemeSelected(ff.fontTheme)}
					>
						{ff.name}
					</button>
				{/each}
			</div>

			<div class="ps-4">Font Weight</div>
			<div class="grid grid-cols-3 gap-4 p-4">
				{#each fontWeights as fw}
					<button
						style="font-weight: {fw}"
						class="{fw === selectedFontWeight
							? 'bg-primary-500 text-neutral-100'
							: ''} border border-1 p-2 hover:cursor-pointer"
						onclick={() => onFontWeightSelected(fw)}
					>
						{fw}
					</button>
				{/each}
			</div>

			<span class="h-full flex-1"></span>
		</div>
	</div>
</div>

<style>
</style>
