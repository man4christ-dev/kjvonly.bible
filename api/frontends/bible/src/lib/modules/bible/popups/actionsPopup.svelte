<script lang="ts">
	// ================================ IMPORTS ================================

	//MODELS
	import { Modules } from '$lib/models/modules.model';

	// SERVICES
	import { notesService } from '$lib/services/notes.service';
	import { paneService } from '$lib/services/pane.service.svelte';
	import { toastService } from '$lib/services/toast.service';

	// API
	import { annotsApi } from '$lib/api/annots.api';

	// COMPONENTS
	import Close from '$lib/components/buttons/close.svelte';

	// OTHER
	import { deepMerge } from '$lib/utils/deepmerge';

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
			onExport();
		},
		'import data': () => {
			onImport();
		},
		close: () => {
			onClosePane();
		}
	};

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

	async function onExport() {
		toastService.showToast('starting export data');
		let data = await annotsApi.getAllAnnotations();

		var element = document.createElement('a');
		element.setAttribute(
			'href',
			'data:application/json;charset=utf-8,' +
				encodeURIComponent(JSON.stringify(data))
		);
		element.setAttribute('download', 'annotations');

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
		toastService.showToast('finished export data');
	}

	// ================================ FUNCS ==================================

	// pulled from https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
	/**
	 * Simple object check.
	 * @param item
	 * @returns {boolean}
	 */
	export function isObject(item: any) {
		return item && typeof item === 'object' && !Array.isArray(item);
	}

	/**
	 * Deep merge two objects.
	 * @param target
	 * @param ...sources
	 */
	export function mergeDeep(target: any, ...sources: any) {
		if (!sources.length) return target;
		const source = sources.shift();

		if (isObject(target) && isObject(source)) {
			for (const key in source) {
				if (isObject(source[key])) {
					if (!target[key]) Object.assign(target, { [key]: {} });
					mergeDeep(target[key], source[key]);
				} else {
					Object.assign(target, { [key]: source[key] });
				}
			}
		}

		return mergeDeep(target, ...sources);
	}

	function doImport(e: any) {
		const reader = new FileReader();
		reader.onload = (e2) => {
			let result: any = e2?.target?.result;
			(async () => {
				try {
					toastService.showToast('starting import data');
					let newAnnotations = JSON.parse(result);
					let annotations = await annotsApi.getAllAnnotations();

					if (!annotations) {
						annotations = {};
					}
					let annotationsMap: any = {};

					annotations.forEach((a: any) => {
						annotationsMap[a.id] = a;
					});

					let newAnnotationsMap: any = {};

					newAnnotations.forEach((a: any) => {
						newAnnotationsMap[a.id] = a;
					});

					// order of params mater, (target, source) source will update target.
					//const merged = mergeDeep(annotationsMap, newAnnotations);
					const merged = deepMerge(annotationsMap, newAnnotationsMap, {
						arrays: 'replace'
					});
					let mergedList: any[] = [];
					Object.keys(merged).forEach((k) => {
						mergedList.push(merged[k]);
					});

					await annotsApi.putAllAnnotations(mergedList);
					notesService.init();
					document.getElementById('kjvonly-import')?.remove();
					toastService.showToast('finished import data');
				} catch (ex) {
					console.log(`error importing file ${e.target.files[0]}`, ex);
					document.getElementById('kjvonly-import')?.remove();
				}
			})();
		};
		reader.readAsText(e.target.files[0]);
	}

	async function onImport() {
		var element = document.createElement('input');
		element.setAttribute('id', 'kjvonly-import');
		element.setAttribute('type', 'file');
		element.setAttribute('accept', '.json');
		element.onchange = doImport;

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();
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
