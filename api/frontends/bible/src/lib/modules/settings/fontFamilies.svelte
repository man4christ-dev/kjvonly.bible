<script lang="ts">
	import { type Settings } from '$lib/models/settings.model';

	// =============================== BINDINGS ================================

	let { settings = $bindable<Settings>() } = $props();

	// ================================== VARS =================================

	let selectedFontFamily = $state('sans');
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

	// ============================== CLICK FUNCS ==============================

	function onFontThemeSelected(fontTheme: string) {
		selectedFontFamily = fontTheme;
		settings.fontTheme = fontTheme;
	}
</script>

<div class="ps-4">Font Families</div>
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
