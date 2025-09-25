<script lang="ts">
	import { plansPubSubService } from '$lib/services/plans/plansPubSub.service';
	import { onDestroy, onMount } from 'svelte';
	import ReadingsComponent from '../components/readings.svelte';
	import { readingsApi } from '$lib/api/readings.api';
	import uuid4 from 'uuid4';
	import Header from '../components/header.svelte';
	import type {
		Sub,
		NextReadings,
		CompletedReadings,
		Readings,
		NavReadings
	} from '../../../models/plans.model';
	import { PLANS_VIEWS } from '../models';
	import { subsEnricherService } from '$lib/services/plans/subsEnricher.service';

	let {
		pane = $bindable(),
		plansDisplay = $bindable(),
		clientHeight = $bindable()
	} = $props();

	let NEXT_READING_ID: string = uuid4();
	let nextReadingViewID = uuid4();

	let headerHeight = $state(0);
	let nextReadings: NextReadings[] = $state([]);

	let subsMap: Map<string, Sub> = new Map<string, Sub>();

	function onCloseNextReadings() {
		plansDisplay = PLANS_VIEWS.SUBS_LIST;
	}

	function onSelectedNextReading(idx: number, returnView: string) {
		let nrs: NextReadings = nextReadings[idx];
		let readings: Readings = nrs.readings;
		readings.bcvs = readings.bcvs.map((r: any) => {
			r.chapterKey = `${r.bookID}_${r.chapter}_${r.verses}`;
			return r;
		});

		let nr: NavReadings = {
			subID: nrs.subID,
			subNestedReadingsIndex: nrs.subReadingsIndex,
			readings: readings,
			currentNavReadingsIndex: 0,
			returnView: returnView
		};

		pane.buffer.bag.navReadings = nr;

		pane.buffer.bag.chapterKey = readings.bcvs[0].chapterKey;
		pane.updateBuffer('ChapterContainer'); // TODO Make this a variable
	}

	function updateNextReadings() {
		let nrs: NextReadings[] = subsMap
			.entries()
			.filter(([_, s]) => s.nestedReadings.length - 1 > s.nextReadingsIndex)
			.map(([_, s]) => {
				return {
					readings: s.nestedReadings[s.nextReadingsIndex],
					dateSubscribed: s.dateSubscribed ? s.dateSubscribed : Date.now(),
					name: s.name,
					percentCompleted: s.percentCompleted,
					subReadingsIndex: s.nextReadingsIndex,
					totalReadings: s.nestedReadings.length,
					subID: s.id
				};
			});

		nextReadings.length = 0;
		nextReadings.push(...nrs);
	}

	async function onReturnPlan() {
		let nr: NavReadings = pane.buffer.bag?.navReadings;
		if (nr) {
			let cr: CompletedReadings = {
				id: `${nr.subID}/${nr.subNestedReadingsIndex}`,
				index: nr.subNestedReadingsIndex,
				subID: nr.subID,
				version: 0
			};
			await readingsApi.put(cr); // TODO completedReadingsApi
			plansPubSubService.putReading(cr, nr.subID); // TODO completedReadings

			let sub = subsMap.get(nr.subID);
			if (!sub) {
				return;
			}
			sub.completedReadings.set(nr.subNestedReadingsIndex, cr);
			sub.nextReadingsIndex = subsEnricherService.getNextReadingIndex(
				sub.completedReadings.keys().toArray()
			);
		}
	}

	async function onGetAllSubs(data: any) {
		if (data) {
			subsMap = data.subs;

			await onReturnPlan();
			await updateNextReadings();
		}
	}

	onDestroy(() => {
		plansPubSubService.unsubscribe(NEXT_READING_ID);
	});

	onMount(() => {
		plansPubSubService.subscribe('getAllSubs', onGetAllSubs, NEXT_READING_ID);
		plansPubSubService.getAllSubs();
	});
</script>

{#snippet nextReading(n: any, idx: any)}
	<button
		onclick={() => onSelectedNextReading(idx, PLANS_VIEWS.NEXT_LIST)}
		class=" flex w-full flex-col px-2 py-4 text-base hover:cursor-pointer hover:bg-neutral-100"
	>
		<div class="flex">
			<span class="pb-2 text-2xl">{n.name}</span>
			<span class="flex-grow"></span>
			<span class="text-support-a-500">{n.percentCompleted}%</span>
		</div>
		<div class="flex flex-row">
			<div class="min-w-50">
				<ReadingsComponent bind:readings={n.readings.bcvs}></ReadingsComponent>
			</div>

			<div class="flex w-full min-w-50 flex-col">
				<div class="flex w-full">
					<span class="flex flex-grow"></span>
					<div class="text-lg">
						{n.subReadingsIndex + 1} of {n.totalReadings}
					</div>
				</div>
				<div class="flex w-full justify-end">
					<div class="text-base text-nowrap">
						Verses: {n.readings.totalVerses}
					</div>
				</div>
			</div>
		</div>
	</button>
{/snippet}

<Header
	bind:headerHeight
	title="Next Readings"
	onClose={onCloseNextReadings}
	bind:plansDisplay
	menuDropdownToggleViews={undefined}
></Header>
<div class="flex w-full max-w-lg">
	<div
		id="{nextReadingViewID}-scroll-container"
		style="max-height: {clientHeight -
			headerHeight}px; min-height: {clientHeight - headerHeight}px"
		class="flex w-full max-w-lg flex-col overflow-x-hidden overflow-y-scroll bg-neutral-50"
	>
		{#if nextReadings.length > 0}
			{#each nextReadings as n, idx}
				{@render nextReading(n, idx)}
			{/each}
		{/if}
	</div>
</div>
