<script lang="ts">
	import { onMount } from 'svelte';
	import type { Settings } from '../../models/settings.model';
	import { settingsService } from '$lib/services/settings.service';

	let { showSettingsPopup = $bindable() } = $props();
	let headerHeight = $state(0);
	let clientHeight = $state(0);
	let settings: any = $state();

	let fontSize = $state(12);
	let fontSizes = [
		{
			height: 'h-10 w-10'
		}
	];

	let fontFamilies = [
		{
			name: 'sans',
			fontFamily: 'font-sans',
			fontTheme: 'sans'
		},
		{
			name: 'KJV1611',
			fontFamily: 'font-kjv',
			fontTheme: 'kjv'
		}
	];

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

		if (settings.fontSize) {
			fontSize = settings.fontSize;
		}
	});

	function onSizeSelected(newFontSize: number) {
		fontSize = newFontSize;
		settings.fontSize = fontSize;
	}

	function onFontThemeSelected(fontTheme: string) {
		settings.fontTheme = fontTheme;
	}
</script>

<div
	bind:clientHeight
	class="flex h-full w-full justify-center overflow-y-scroll bg-neutral-50 text-neutral-700"
>
	<div class="w-full max-w-lg">
		<header
			bind:clientHeight={headerHeight}
			class="items w-full flex-col border-b-2 bg-neutral-100"
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
						showSettingsPopup = false;
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
			class="flex flex-col justify-center border bg-neutral-50"
		>
			<div class="flex flex-row p-4">
				<button
					onclick={() => {
						settings.isDarkTheme = false;
					}}
					class=" {settings?.isDarkTheme === false
						? 'bg-primary-500 '
						: ' '} flex h-16 w-1/2 items-center justify-center border"
					aria-label="font-size button"
				>
					<svg
						class="h-6"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="24px"
						height="24px"
					>
						<path
							class={settings?.isDarkTheme === true
								? 'fill-neutral-700'
								: 'fill-neutral-100'}
							d="M 12 0 C 11.4 0 11 0.4 11 1 L 11 2 C 11 2.6 11.4 3 12 3 C 12.6 3 13 2.6 13 2 L 13 1 C 13 0.4 12.6 0 12 0 z M 4.1992188 3.1992188 C 3.9492188 3.1992187 3.7 3.3 3.5 3.5 C 3.1 3.9 3.1 4.5003906 3.5 4.9003906 L 4.1992188 5.5996094 C 4.5992187 5.9996094 5.1996094 5.9996094 5.5996094 5.5996094 C 5.9996094 5.1996094 5.9996094 4.5992188 5.5996094 4.1992188 L 4.9003906 3.5 C 4.7003906 3.3 4.4492188 3.1992188 4.1992188 3.1992188 z M 19.800781 3.1992188 C 19.550781 3.1992188 19.299609 3.3 19.099609 3.5 L 18.400391 4.1992188 C 18.000391 4.5992187 18.000391 5.1996094 18.400391 5.5996094 C 18.800391 5.9996094 19.400781 5.9996094 19.800781 5.5996094 L 20.5 4.9003906 C 20.9 4.5003906 20.9 3.9 20.5 3.5 C 20.3 3.3 20.050781 3.1992188 19.800781 3.1992188 z M 12 5 A 7 7 0 0 0 5 12 A 7 7 0 0 0 12 19 A 7 7 0 0 0 19 12 A 7 7 0 0 0 12 5 z M 1 11 C 0.4 11 0 11.4 0 12 C 0 12.6 0.4 13 1 13 L 2 13 C 2.6 13 3 12.6 3 12 C 3 11.4 2.6 11 2 11 L 1 11 z M 22 11 C 21.4 11 21 11.4 21 12 C 21 12.6 21.4 13 22 13 L 23 13 C 23.6 13 24 12.6 24 12 C 24 11.4 23.6 11 23 11 L 22 11 z M 4.9003906 18.099609 C 4.6503906 18.099609 4.3992188 18.200391 4.1992188 18.400391 L 3.5 19.099609 C 3.1 19.499609 3.1 20.1 3.5 20.5 C 3.9 20.9 4.5003906 20.9 4.9003906 20.5 L 5.5996094 19.800781 C 5.9996094 19.400781 5.9996094 18.800391 5.5996094 18.400391 C 5.3996094 18.200391 5.1503906 18.099609 4.9003906 18.099609 z M 19.099609 18.099609 C 18.849609 18.099609 18.600391 18.200391 18.400391 18.400391 C 18.000391 18.800391 18.000391 19.400781 18.400391 19.800781 L 19.099609 20.5 C 19.499609 20.9 20.1 20.9 20.5 20.5 C 20.9 20.1 20.9 19.499609 20.5 19.099609 L 19.800781 18.400391 C 19.600781 18.200391 19.349609 18.099609 19.099609 18.099609 z M 12 21 C 11.4 21 11 21.4 11 22 L 11 23 C 11 23.6 11.4 24 12 24 C 12.6 24 13 23.6 13 23 L 13 22 C 13 21.4 12.6 21 12 21 z"
						/>
					</svg>
				</button>
				<button
					onclick={() => {
						settings.isDarkTheme = true;
					}}
					class=" {settings?.isDarkTheme
						? 'bg-primary-500 '
						: ''} flex h-16 w-1/2 items-center justify-center border"
					aria-label="font-size button"
				>
					<svg
						class="h-6"
						version="1.1"
						id="svg473"
						width="94.847404"
						height="106.27697"
						viewBox="0 0 94.847404 106.27697"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g id="g479" transform="translate(-83.478769,-13.695354)">
							<path
								class={settings?.isDarkTheme === true
									? ' fill-neutral-100'
									: 'fill-neutral-700'}
								d="m 123.63575,118.71778 c -8.26967,-1.94139 -20.37754,-9.06807 -26.273747,-15.4647 -2.994481,-3.24864 -7.343225,-9.914372 -9.663873,-14.812752 -3.815837,-8.054396 -4.219361,-10.117536 -4.219361,-21.572812 0,-11.455276 0.403524,-13.518416 4.219361,-21.572812 5.675823,-11.980419 13.42575,-20.064811 24.58783,-25.648972 12.91273,-6.459976 29.19281,-8.044725 29.19281,-2.841712 0,0.966241 -1.47081,2.720513 -3.26847,3.898383 -5.66308,3.710594 -10.23082,9.25226 -13.87367,16.83178 -2.96523,6.16963 -3.52199,9.131782 -3.50853,18.666666 0.0195,13.848922 2.44031,19.160356 13.22484,29.016804 9.75394,8.91455 17.24958,11.411006 32.39029,10.787724 13.53878,-0.557336 14.54362,0.447272 7.85384,7.852063 -11.41863,12.63905 -33.07019,18.99005 -50.66132,14.86034 z"
								id="path483"
							/>
						</g>
					</svg>
				</button>
			</div>

			<div class="flex w-full flex-row bg-neutral-50 p-4 font-bold">
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
			</div>

			<div class="p-4">
				<div class="flex w-full flex-row">
					<input
						bind:value={fontSize}
						class="flex w-full text-center outline-none"
						type="number"
					/>
					<button
						aria-label="close"
						onclick={() => {
							onSizeSelected(fontSize);
						}}
						class="h-12 w-12 px-2 pt-2 text-neutral-700 hover:cursor-pointer"
					>
						<svg
							version="1.1"
							id="svg2"
							width="100%"
							height="100%"
							viewBox="0 0 96.130432 96"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g id="g8" transform="translate(-16,-16)">
								<path
									class="fill-neutral-700"
									style="stroke-width:1.33333"
									d="M 19.272727,108.72727 16,105.45455 V 64 22.545455 L 19.272727,19.272727 22.545455,16 h 33.641558 33.641559 l 11.150928,11.150928 11.15093,11.150928 -0.39855,34.302125 c -0.3976,34.220589 -0.40603,34.308179 -3.54626,36.849069 C 105.2389,111.83737 102.4042,112 63.791681,112 H 22.545455 Z m 55.9361,-12.654045 c 3.502058,-3.50206 4.124506,-5.122865 4.124506,-10.739892 0,-5.693716 -0.607301,-7.222686 -4.358974,-10.974358 C 71.222687,70.607301 69.693716,70 64,70 c -5.693716,0 -7.222687,0.607301 -10.974359,4.358975 -3.737012,3.73701 -4.358974,5.291226 -4.358974,10.892581 0,6.853933 3.398442,12.271284 9.333333,14.877974 4.985283,2.1896 12.806448,0.34607 17.208827,-4.056305 z M 78.4,46.4 c 2.077387,-2.077387 2.077387,-16.055947 0,-18.133333 -2.250848,-2.250848 -47.882485,-2.250848 -50.133333,0 -2.077387,2.077386 -2.077387,16.055946 0,18.133333 2.250848,2.250848 47.882485,2.250848 50.133333,0 z"
									id="path293"
								/>
							</g>
						</svg>
					</button>
				</div>
				<div class="mt-4 outline">
					<p class="p-4" style="font-size: {fontSize}px">
						Ephesians 2:8 <br />For by grace are ye saved through faith; and
						that not of yourselves: it is the gift of God:
					</p>
				</div>
			</div>

			<div class="flex w-full flex-row pt-4">
				{#each fontFamilies as ff}
					<button
						onclick={() => onFontThemeSelected(ff.fontTheme)}
						class="{settings?.fontTheme === ff.fontTheme
							? 'bg-primary-500 text-neutral-100 '
							: ' '} {ff.fontFamily} flex h-16 w-1/2 items-center justify-center border text-lg font-bold"
						aria-label="font-size button"
					>
						{ff.name}
					</button>
				{/each}
			</div>
			<span class="h-full flex-1"></span>
		</div>
	</div>
</div>

<style>
</style>
