<script lang="ts">
	// ================================ IMPORTS ================================

	//MODELS
	import { Modules } from '$lib/models/modules.model';

	// SERVICES
	import { exporterService } from '$lib/services/importExport/exporter.service';
	import { importerService } from '$lib/services/importExport/importer.service';
	import { paneService } from '$lib/services/pane.service.svelte';

	// COMPONENTS
	import Close from '$lib/components/buttons/close.svelte';

	// =============================== BINDINGS ================================

	let {
		showActionsDropdown = $bindable<boolean>(),
		showCopyVersePopup = $bindable<boolean>(),
		paneID
	}: {
		showActionsDropdown: boolean;
		showCopyVersePopup: boolean;
		paneID: string;
	} = $props();

	// ================================= VARS ==================================
	let clientHeight = $state(0);
	let headerHeight = $state(0);

	let actions: any = {
		'copy verses': () => {
			showActionsDropdown = false;
			showCopyVersePopup = true;
		},
		search: () => {
			let p = paneService.findNode(paneService.rootPane, paneID);
			p?.updateBuffer(Modules.SEARCH);
		},
		notes: () => {
			let p = paneService.findNode(paneService.rootPane, paneID);
			p?.updateBuffer(Modules.NOTES);
		},
		'split vertical': () => {
			onSplitVertical();
		},
		'split horizontal': () => {
			onSplitHorizontal();
		},
		'export data': () => {
			exporterService.export();
		},
		'import data': () => {
			importerService.import();
		},
		close: () => {
			onClosePane();
		}
	};

	// ============================== CLICK FUNCS ==============================

	function onSplitVertical(): void {
		paneService.onSplitPane(paneID, 'v', Modules.MODULES, {});
		showActionsDropdown = false;
	}

	function onSplitHorizontal() {
		paneService.onSplitPane(paneID, 'h', Modules.MODULES, {});
		showActionsDropdown = false;
	}

	function onClosePane() {
		paneService.onDeletePane(paneService.rootPane, paneID);
	}

	function onCloseActionsDropdown() {
		showActionsDropdown = false;
	}
</script>

<div bind:clientHeight class="flex h-full w-full justify-center bg-neutral-50">
	<div class="w-full max-w-lg justify-center">
		<header
			bind:clientHeight={headerHeight}
			class="sticky top-0 w-full flex-col border-b-2 bg-neutral-100 text-neutral-700"
		>
			<div class="flex w-full justify-end p-2">
				<Close onClose={onCloseActionsDropdown}></Close>
			</div>
		</header>

		<div
			style="height: {clientHeight - headerHeight}px"
			class="flex w-full flex-col overflow-y-scroll border"
		>
			{#each Object.keys(actions) as a}
				<div class="w-full">
					<button
						onclick={(event) => actions[a]()}
						class="hover:bg-primary-50 w-full bg-neutral-50 p-4 text-start capitalize"
						>{a}</button
					>
				</div>
			{/each}
		</div>
	</div>
</div>
