<script lang="ts">
	import { Modules } from '$lib/models/modules.model';
	import type { NavReadings } from '$lib/models/plans.model';
	import { bibleNavigationService } from '$lib/services/bible/bibleNavigation.service';
	import { onMount } from 'svelte';

	let {
		mode = $bindable(),
		pane = $bindable(),
		bibleLocationRef = $bindable(),
		buttonTopOffset = $bindable()
	} = $props();

	onMount(() => {});

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

<div
	style="transform: translate3d(0px, {buttonTopOffset}px, 0px);"
	class="sticky z-10"
>
	<div class="absolute bottom-2 left-4">
		<button
			onclick={_previousChapter}
			class="rounded-full bg-neutral-100 text-neutral-700 shadow-lg ring-2 ring-neutral-300"
			aria-label="left arrow"
		>
			<svg
				class="h-12 w-12 p-4"
				version="1.1"
				width="34.484818"
				height="58.242714"
				viewBox="0 0 34.484818 58.242714"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="g8" transform="translate(-40,-34.843996)">
					<path
						class="fill-neutral-700"
						style="stroke-width:1.33333"
						d="M 53,80.35758 C 43.505656,70.810684 40,66.386425 40,63.951131 c 0,-2.445847 3.49976,-6.821123 13.132229,-16.417448 11.374404,-11.331724 13.649954,-13.023883 17,-12.641652 2.904499,0.331396 3.980004,1.235166 4.318418,3.62886 0.353064,2.497337 -1.95028,5.601021 -10.637231,14.333333 L 52.725541,64 63.813416,75.145776 C 72.500367,83.878088 74.803711,86.981772 74.450647,89.479109 74.105181,91.922689 73.066399,92.755693 70,93.048101 66.510733,93.380832 64.340117,91.760465 53,80.35758 Z"
						id="path170"
					/>
				</g>
			</svg>
		</button>
	</div>
</div>
<div
	style="transform: translate3d(0px, {buttonTopOffset}px, 0px); "
	class="sticky z-10"
>
	<div class="absolute right-4 bottom-2">
		<button
			onclick={_nextChapter}
			class="h-12 w-12 rounded-full bg-neutral-100 text-neutral-700 ring-2 ring-neutral-300"
			aria-label="next chapter arrow"
		>
			<svg
				class="h-12 w-12 p-4"
				version="1.1"
				id="svg2"
				width="34.484821"
				height="58.242714"
				viewBox="0 0 34.484822 58.242714"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="g8" transform="translate(-105.93567,-41.081576)">
					<path
						class="fill-neutral-700"
						style="stroke-width:1.33333"
						d="m 127.42049,86.59516 c 9.49434,-9.546896 13,-13.971155 13,-16.406449 0,-2.445847 -3.49976,-6.821123 -13.13223,-16.417448 -11.37441,-11.331724 -13.64996,-13.023883 -17,-12.641652 -2.9045,0.331396 -3.98001,1.235166 -4.31842,3.62886 -0.35306,2.497337 1.95028,5.601021 10.63723,14.333333 l 11.08788,11.145776 -11.08788,11.145776 c -8.68695,8.732312 -10.99029,11.835996 -10.63723,14.333333 0.34547,2.44358 1.38425,3.276584 4.45065,3.568992 3.48926,0.332731 5.65988,-1.287636 17,-12.690521 z"
						id="path170"
					/>
				</g>
			</svg>
		</button>
	</div>
</div>
