<script lang="ts">
	import { type Settings } from '$lib/models/settings.model';

	// =============================== BINDINGS ================================

	let { settings = $bindable<Settings>() } = $props();

	// ================================== VARS =================================

	let fontFamilies = [
		{
			name: 'sans',
			fontTheme: 'sans'
		},
		{
			name: 'serif',
			fontTheme: 'serif'
		},
		{
			name: 'monospace',
			fontTheme: 'mono'
		},
		{
			name: 'KJV 1611',
			fontTheme: 'kjv'
		},
		{
			name: 'Roboto Mono',
			fontTheme: 'roboto-mono'
		},
		{
			name: 'JetBrains Mono',
			fontTheme: 'jetbrains-mono'
		}
	];

	// ============================== CLICK FUNCS ==============================

	function onFontThemeSelected(fontTheme: string) {
		settings.fontTheme = fontTheme;
	}
</script>

<div class="ps-4">Font Families</div>
<div class="grid grid-cols-3 gap-4 p-4">
	{#each fontFamilies as ff}
		<button
			class="font-{ff.fontTheme} {ff.fontTheme === settings?.fontTheme
				? 'bg-primary-500 text-neutral-100'
				: ''} border border-1 p-2 hover:cursor-pointer"
			onclick={() => onFontThemeSelected(ff.fontTheme)}
		>
			{ff.name}
		</button>
	{/each}
</div>
