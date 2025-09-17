<script lang="ts">
	import { sleep } from '$lib/utils/sleep';
	import { onMount } from 'svelte';
	import Header from '../components/header.svelte';
	import { PLANS_VIEWS, type BCV, type NavPlan, type Sub } from '../models';
	import Reading from '../components/reading.svelte';
	import uuid4 from 'uuid4';

	let {
		plansDisplay = $bindable(),
		pane = $bindable(),
		paneId,
		clientHeight = $bindable(),
		selectedSub = $bindable<Sub>()
	} = $props();

	let headerHeight = $state(0);
	let showCompletedReadings: boolean = $state(false);

	let subListReadingsToShow: number = $state(0);
	let subListViewID = uuid4();

	function loadMoreSubReadings() {
		let toShow = 0;
		let count = 0;
        const BATCH_SIZE_TO_SHOW = 30

		while (toShow !== BATCH_SIZE_TO_SHOW && count + subListReadingsToShow < selectedSub.plan.readings.length) {
			let hasCompletedReading = selectedSub.completedReadings[subListReadingsToShow + count];
			count++;
			if (hasCompletedReading && !showCompletedReadings) {
				continue;
			}
			toShow = toShow + 1;
		}

		subListReadingsToShow += count;
	}

	function onSelectedSubReading(idx: number, returnView: string) {
		let readings: BCV[] = selectedSub.plan.readings[idx];
		let updReadings: BCV[] = readings.map((r: any) => {
			r.chapterKey = `${r.bookID}_${r.chapter}_${r.verses}`;
			return r as BCV;
		});

		let np: NavPlan = {
			readings: updReadings,
			currentReadingsIndex: 0, // What to start at
			subID: selectedSub.id,
			readingIndex: idx,
			returnView: returnView
		};

		pane.buffer.bag.plan = np;

		pane.buffer.bag.chapterKey = updReadings[0].chapterKey;
		pane.updateBuffer('ChapterContainer');
	}

	function handleScroll() {
		let el = document.getElementById(`${subListViewID}-scroll-container`);
		if (el === null) {
			return;
		}

		const threshold = 20; // Adjust this value as needed
		const isReachBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= threshold;

		if (isReachBottom) {
			loadMoreSubReadings();
		}
	}

	function onCloseSubDetails() {
		plansDisplay = PLANS_VIEWS.SUBS_LIST;
	}

	$effect(() => {
		selectedSub;
		loadMoreSubReadings();
	});

	onMount(() => {
		loadMoreSubReadings();
		setTimeout(async () => {
			let el = document.getElementById(`${subListViewID}-scroll-container`);
			let retriesMax = 10;
			let count = 0;
			while (!el && count != retriesMax) {
				el = document.getElementById(`${subListViewID}-scroll-container`);
				await sleep(1000);
				count++;
			}

			if (count === 10) {
				return;
			}

			el?.addEventListener('scroll', handleScroll);
		}, 1000);
	});
</script>

{#snippet subListView(sub: any)}
	<div class="flex w-full flex-col">
		<div class="flex p-2">
			<span class="pb-2 text-2xl">{sub.plan.name}</span>
			<span class="flex-grow"></span>

			<label
				for="showCompleted"
				class="has-checked:bg-support-a-500 relative block h-8 w-14 rounded-full bg-neutral-300 transition-colors [-webkit-tap-highlight-color:_transparent]"
			>
				<input
					bind:checked={showCompletedReadings}
					type="checkbox"
					id="showCompleted"
					class="peer sr-only"
				/>

				<span
					class="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-neutral-100 transition-[inset-inline-start] peer-checked:start-6"
				></span>
			</label>
		</div>

		<div class="flex w-full flex-col text-base">
			{#each Array(subListReadingsToShow) as _, idx}
				{#if !sub.completedReadings.get(idx) || (sub.completedReadings.get(idx) && showCompletedReadings)}
					<button
						onclick={() => onSelectedSubReading(idx, PLANS_VIEWS.SUBS_DETAILS)}
						class="flex w-full flex-row px-2 py-4 text-base hover:cursor-pointer hover:bg-neutral-100"
					>
						<div class="flex w-full min-w-50">
							<Reading bind:planReading={sub.plan.readings[idx].bcvs}></Reading>
						</div>

						<div class="flex w-full min-w-50 flex-col">
							<div class="flex w-full">
								<span class="flex flex-grow"></span>
								<div class="text-lg {sub.completedReadings.get(idx)?.index === idx ? 'text-support-a-500' : ''}">
									{idx + 1} of {sub.plan.readings.length}
								</div>
							</div>
							<div class="flex w-full justify-end">
								<div class="text-base text-nowrap">
									Verses: {sub.plan.readings[idx].totalVerses}
								</div>
							</div>
						</div>
					</button>
				{/if}
			{/each}
		</div>
	</div>
{/snippet}

<Header
	bind:headerHeight
	title="My Plans"
	onClose={onCloseSubDetails}
	bind:plansDisplay
	menuDropdownToggleViews={undefined}
></Header>

<div class="flex w-full max-w-lg">
	<div
		id="{subListViewID}-scroll-container"
		style="max-height: {clientHeight - headerHeight}px; min-height: {clientHeight - headerHeight}px"
		class="flex w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
	>
		{@render subListView(selectedSub)}
	</div>
</div>
