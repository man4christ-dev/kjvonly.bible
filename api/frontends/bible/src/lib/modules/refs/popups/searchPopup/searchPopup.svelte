<script lang="ts">
	import Search from '$lib/modules/search/search.svelte';

	// ================================ IMPORTS ================================
	// SVELTE
	// COMPONENTS
	// MODELS
	// SERVICES
	// =============================== BINDINGS ================================
	let { popups = $bindable<any>() }: { popups: any } = $props();
	// ================================== VARS =================================
	// =============================== LIFECYCLE ===============================
	// ================================ FUNCS ==================================
	// ============================== CLICK FUNCS ==============================
</script>

<!-- ================================ HEADER =============================== -->
<!-- ================================= BODY ================================ -->
<!-- ================================ FOOTER =============================== -->
<!-- ============================== CONTAINER ============================== -->
<Search
	paneID={popups?.searchPopup?.paneID}
	showInput={true}
	searchTerms={popups?.searchPopup?.searchTerms}
	onClose={() => {
		popups.searchPopup = undefined;
	}}
	onFilterBibleLocationRef={popups?.searchPopup
		?.onFilterBibleLocationRefByBookID}
></Search>
