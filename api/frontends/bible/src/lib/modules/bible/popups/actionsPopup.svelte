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
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import BufferBody from '$lib/components/bufferBody.svelte';

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

<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		<div class="flex w-full justify-end">
			<Close onClose={onCloseActionsDropdown}></Close>
		</div>
	</BufferHeader>
	<BufferBody
		bind:clientHeight
		bind:headerHeight
		classes={'remove-default-class'}
	>
		{#each Object.keys(actions) as a}
			<div class="w-full">
				<button
					onclick={(event) => actions[a]()}
					class="hover:bg-primary-50 w-full bg-neutral-50 p-4 text-start capitalize hover:cursor-pointer"
					>{a}</button
				>
			</div>
		{/each}
	</BufferBody>
</BufferContainer>
