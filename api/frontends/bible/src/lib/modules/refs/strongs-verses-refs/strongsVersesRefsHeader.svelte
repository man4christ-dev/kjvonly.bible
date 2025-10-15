<script lang="ts">
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import Close from '$lib/components/svgs/close.svelte';
	import Search from '$lib/modules/search/search.svelte';
	import { paneService } from '$lib/services/pane.service.svelte';
	import PopupContainer from '../popupContainer.svelte';
	import SearchPopup from '../popups/searchPopup/searchPopup.svelte';

	// ================================ IMPORTS ================================
	// SVELTE
	// COMPONENTS
	// MODELS
	// SERVICES
	// =============================== BINDINGS ================================

	let {
		paneID,
		clientHeight = $bindable<number>(),
		headerHeight = $bindable<number>()
	} = $props();

	// ================================== VARS =================================

	let hheight = $state(0);
	// =============================== LIFECYCLE ===============================
	// ================================ FUNCS ==================================
	// ============================== CLICK FUNCS ==============================

	function onClose(e: Event): void {
		e.stopPropagation();
		paneService.onDeletePane(paneService.rootPane, paneID);
	}
</script>

<!-- ================================ HEADER =============================== -->
<!-- ================================= BODY ================================ -->
<!-- ================================ FOOTER =============================== -->
<!-- ============================== CONTAINER ============================== -->
{#snippet searchPopup()}
	<PopupContainer bind:clientHeight>
		<Search searchTerms=""></Search>
		<SearchPopup></SearchPopup>
	</PopupContainer>
{/snippet}

<div
	bind:clientHeight={headerHeight}
	id="test"
	class="absolute flex w-full max-w-lg flex-row bg-neutral-100 py-2 leading-tight outline outline-neutral-400"
>
	<span class="flex-1"></span>
	<span class="text-center">Strongs / Refs</span>
	<div class="flex flex-1 justify-end pe-4">
		<KJVButton onClick={onClose} classes="">
			<Close classes=""></Close>
		</KJVButton>
	</div>
</div>

<!-- {@render searchPopup()} -->
