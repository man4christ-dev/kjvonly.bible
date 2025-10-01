<script lang="ts">
	import Moon from '$lib/components/buttons/moon.svelte';
	import Sun from '$lib/components/buttons/sun.svelte';

	let { settings = $bindable() } = $props();
</script>

<div class="flex flex-row p-4">
	<Sun
		onClick={() => (settings.isDarkTheme = false)}
		buttonClass={settings?.isDarkTheme === false ? 'bg-primary-500 ' : ' '}
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
