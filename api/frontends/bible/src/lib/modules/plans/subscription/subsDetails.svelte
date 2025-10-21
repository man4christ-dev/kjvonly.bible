<script lang="ts">
	import { sleep } from '$lib/utils/sleep';
	import { onMount, untrack } from 'svelte';
	import Header from '../components/header.svelte';
	import ReadingsComponent from '../components/readings.svelte';
	import uuid4 from 'uuid4';
	import {
		PLANS_VIEWS,
		type NavReadings,
		type Readings,
		type Sub
	} from '$lib/models/plans.model';
	import type { BCV } from '$lib/models/bible.model';
	import { Modules } from '$lib/models/modules.model';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import BufferBody from '$lib/components/bufferBody.svelte';
	import Close from '$lib/components/svgs/close.svelte';
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import Pending from '$lib/components/svgs/pending.svelte';
	import CheckCircle from '$lib/components/svgs/checkCircle.svelte';
	import type { Pane } from '$lib/models/pane.model';

	// =============================== BINDINGS ================================

	let {
		plansDisplay = $bindable<PLANS_VIEWS>(),
		pane = $bindable<Pane>(),
		paneID = $bindable<string>(),
		clientHeight = $bindable(),
		selectedSub = $bindable<Sub>()
	}: {
		plansDisplay: PLANS_VIEWS;
		pane: Pane;
		paneID: string;
		clientHeight: number;
		selectedSub: Sub;
	} = $props();

	// ================================== VARS =================================
	let hasCompletedReading = $state(false);
	let headerHeight = $state(0);
	let showCompletedReadings: boolean = $state(false);
	let subListReadingsToShow: number = $state(0);
	let subListViewID = uuid4();

	// =============================== LIFECYCLE ===============================

	onMount(() => {
		loadMoreSubReadings();
		setHasCompletedReadings();
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

	$effect(() => {
		selectedSub;
		untrack(() => {
			loadMoreSubReadings();
		});
	});

	// ================================ FUNCS ==================================

	function loadMoreSubReadings() {
		let toShow = 0;
		let count = 0;
		const BATCH_SIZE_TO_SHOW = 30;

		while (
			toShow !== BATCH_SIZE_TO_SHOW &&
			count + subListReadingsToShow < selectedSub.nestedReadings.length
		) {
			let hasCompletedReading = selectedSub.completedReadings.get(
				subListReadingsToShow + count
			);
			count++;
			if (hasCompletedReading && !showCompletedReadings) {
				continue;
			}
			toShow = toShow + 1;
		}

		subListReadingsToShow += count;
	}

	function handleScroll() {
		let el = document.getElementById(`${subListViewID}-scroll-container`);
		if (el === null) {
			return;
		}

		const threshold = 20; // Adjust this value as needed
		const isReachBottom =
			el.scrollHeight - el.clientHeight - el.scrollTop <= threshold;

		if (isReachBottom) {
			loadMoreSubReadings();
		}
	}

	function setHasCompletedReadings(): void {
		hasCompletedReading = selectedSub.completedReadings.size > 0;
	}

	// ============================== CLICK FUNCS ==============================

	function onSelectedSubReading(
		subNestedReadingsIndex: number,
		returnView: PLANS_VIEWS
	): void {
		let readings: Readings = selectedSub.nestedReadings[subNestedReadingsIndex];
		readings.bcvs = readings.bcvs.map((r: any) => {
			r.bibleLocationRef = `${r.bookID}_${r.chapter}_${r.verses}`;
			return r as BCV;
		});

		let np: NavReadings = {
			subID: selectedSub.id,
			subNestedReadingsIndex: subNestedReadingsIndex,
			readings: readings,
			currentNavReadingsIndex: 0,
			returnView: returnView
		};

		pane.buffer.bag.navReadings = np;

		pane.buffer.bag.bibleLocationRef = readings.bcvs[0].bibleLocationRef;
		pane.updateBuffer(Modules.BIBLE);
	}

	function onCloseSubDetails(): void {
		plansDisplay = PLANS_VIEWS.SUBS_LIST;
	}

	function onToggleCompletedReadings(): void {
		showCompletedReadings = !showCompletedReadings;
	}
</script>

{#snippet subListView(sub: any)}
	<div class="flex w-full flex-col">
		<div class="flex p-2">
			<span class="pb-2 text-2xl">{sub.name}</span>
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
							<ReadingsComponent bind:readings={sub.nestedReadings[idx].bcvs}
							></ReadingsComponent>
						</div>

						<div class="flex w-full min-w-50 flex-col">
							<div class="flex w-full">
								<span class="flex flex-grow"></span>
								<div
									class="text-lg {sub.completedReadings.get(idx)?.index === idx
										? 'text-support-a-500'
										: ''}"
								>
									{idx + 1} of {sub.nestedReadings.length}
								</div>
							</div>
							<div class="flex w-full justify-end">
								<div class="text-base text-nowrap">
									Verses: {sub.nestedReadings[idx].totalVerses}
								</div>
							</div>
						</div>
					</button>
				{/if}
			{/each}
		</div>
	</div>
{/snippet}

{#snippet header()}
	<div class="grid w-full grid-cols-5 place-items-center">
		<span></span>
		<span></span>
		<span class="text-center">My plans</span>
		<KJVButton
			classes=""
			disabled={!hasCompletedReading}
			onClick={onToggleCompletedReadings}
		>
			{#if showCompletedReadings}
				<Pending></Pending>
			{:else}
				<CheckCircle></CheckCircle>
			{/if}
		</KJVButton>
		<KJVButton classes="" onClick={onCloseSubDetails}>
			<Close></Close>
		</KJVButton>
	</div>
{/snippet}
{#snippet body()}
	{@render subListView(selectedSub)}
{/snippet}

<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		{@render header()}
	</BufferHeader>
	<BufferBody bind:clientHeight bind:headerHeight>
		{@render body()}
	</BufferBody>
</BufferContainer>
<div class="flex w-full max-w-lg">
	<div
		id="{subListViewID}-scroll-container"
		style="max-height: {clientHeight -
			headerHeight}px; min-height: {clientHeight - headerHeight}px"
		class="flex w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
	></div>
</div>
