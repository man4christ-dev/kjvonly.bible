<script lang="ts">
	import LeftChevron from '$lib/components/buttons/chevrons/leftChevron.svelte';
	import RightChevron from '$lib/components/buttons/chevrons/rightChevron.svelte';
	import { Modules } from '$lib/models/modules.model';
	import type { NavReadings } from '$lib/models/plans.model';
	import { bibleNavigationService } from '$lib/services/bible/bibleNavigation.service';
	import { attachEvents } from '$lib/utils/eventHandlers';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let {
		mode = $bindable(),
		pane = $bindable(),
		bibleLocationRef = $bindable(),
		showNavButtons = $bindable(),
		ID
	} = $props();

	onMount(() => {
		attachScrolls();
	});

	function attachScrolls() {
		attachEvents(`${ID}-scroll-container`, 'scroll', handleNavButtonVisibility);
	}

	function handleNavButtonVisibility() {
		let el = document.getElementById(`${ID}-scroll-container`);
		if (!el) {
			return;
		}

		if (el.scrollTop === 0) {
			showNavButtons = true;
			return;
		}

		if (el.scrollHeight + el.clientHeight + el.scrollTop === 0) {
			return;
		}
		showNavButtons = false;

		const threshold = 40; // Adjust this value as needed
		const isReachBottom =
			el.scrollHeight - el.clientHeight - el.scrollTop <= threshold;

		if (isReachBottom) {
			showNavButtons = true;
		}
	}

	// ============================== CLICK FUNCS ==============================

	async function _nextPlanChapter() {
		let plan: NavReadings = mode.navReadings;
		let ci = plan.currentNavReadingsIndex;
		let nextIndex = ci + 1;
		if (nextIndex > plan.readings.bcvs.length - 1) {
			pane.updateBuffer(Modules.PLANS);
		} else {
			plan.currentNavReadingsIndex = nextIndex;
			bibleLocationRef = plan.readings.bcvs[nextIndex].bibleLocationRef;
		}
	}

	async function _previousPlanChapter() {
		let nr: NavReadings = mode.navReadings;
		let ci = nr.currentNavReadingsIndex;
		let nextIndex = ci - 1;
		if (nextIndex >= 0) {
			nr.currentNavReadingsIndex = nextIndex;
			bibleLocationRef = nr.readings.bcvs[nextIndex].bibleLocationRef;
		}
	}

	async function _nextChapter(e: Event) {
		e.stopPropagation();
		if (mode.navReadings) {
			_nextPlanChapter();
			return;
		}
		if (bibleLocationRef) {
			bibleLocationRef = bibleNavigationService.next(bibleLocationRef);
		}
	}

	async function _previousChapter(e: Event) {
		e.stopPropagation();
		if (mode.navReadings) {
			_previousPlanChapter();
			return;
		}

		if (bibleLocationRef) {
			bibleLocationRef = bibleNavigationService.previous(bibleLocationRef);
		}
	}
</script>

{#if showNavButtons}
	<div
		style="transform: translate3d(0px, 0px, 0px);"
		class="sticky z-10 transition-opacity duration-500"
		transition:fade={{ duration: 500 }}
	>
		<div class="absolute bottom-2 left-4">
			<LeftChevron onClick={_previousChapter}></LeftChevron>
		</div>
	</div>
{/if}
{#if showNavButtons}
	<div
		style="transform: translate3d(0px, 0px, 0px); "
		class="sticky z-10 transition-opacity duration-500"
		transition:fade={{ duration: 500 }}
	>
		<div class="absolute right-4 bottom-2">
			<RightChevron onClick={_nextChapter}></RightChevron>
		</div>
	</div>
{/if}
