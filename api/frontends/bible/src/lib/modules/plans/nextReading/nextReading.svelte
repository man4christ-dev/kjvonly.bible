<script lang="ts">
	import { plansPubSubService } from '$lib/services/plansPubSub.service';
	import { onDestroy, onMount } from 'svelte';
	import Reading from '../components/reading.svelte';

	import { getNextReadingIndex } from '$lib/utils/plan';
	import { readingsApi } from '$lib/api/readings.api';
	import uuid4 from 'uuid4';
	import Header from '../components/header.svelte';
	import type { Sub, NextReading, BCV, NavPlan, CompletedReading } from '../models';
	import { PLANS_VIEWS } from '../models';

	let { pane = $bindable(), plansDisplay = $bindable(), clientHeight = $bindable() } = $props();

	let NEXT_READING_ID: string = uuid4();
	let nextReadingViewID = uuid4();
	
    let headerHeight = $state(0);
    let nextReadings: NextReading[] = $state([]);
	
    let subsMap: Map<string, Sub> = new Map<string, Sub>();
	
	function onCloseNextReadings() {
		plansDisplay = PLANS_VIEWS.SUBS_LIST;
	}

	function onSelectedNextReading(idx: number, returnView: string) {
		let nextReading: NextReading = nextReadings[idx];
		let readings: BCV[] = nextReading.reading;
		let updReadings: BCV[] = readings.map((r: any) => {
			r.chapterKey = `${r.bookID}_${r.chapter}_${r.verses}`;
			return r;
		});

		let np: NavPlan = {
			reading: updReadings,
			currentReadingsIndex: 0,
			subID: nextReading.subID,
			readingIndex: nextReading.readingIndex,
			returnView: returnView
		};

		pane.buffer.bag.plan = np;

		pane.buffer.bag.chapterKey = updReadings[0].chapterKey;
		pane.updateBuffer('ChapterContainer');

	}

	function updateNextReadings() {
		let nrs: NextReading[] = [];
		let subKeys = subsMap.keys().toArray();
		for (let i = 0; i < subKeys.length; i++) {
			let sub: Sub | undefined = subsMap.get(subKeys[i]);
			if (sub && sub.nestedReadings.length - 1 > sub.nextReadingIndex) {
				let nr: NextReading = {
					reading: sub.nestedReadings[sub.nextReadingIndex].bcvs,
					totalVerses: sub.nestedReadings[sub.nextReadingIndex].totalVerses, // TODO total verses was added to Array :P
					planDateCreated: sub.dateSubscribed ? sub.dateSubscribed : Date.now(),
					name: sub.name,
					percentCompleted: sub.percentCompleted,
					readingIndex: sub.nextReadingIndex,
					totalReadings: sub.nestedReadings.length,
					subID: sub.id
				};
				nrs.push(nr);
			}
		}

		nextReadings.length = 0;
		nextReadings.push(...nrs);
	}

	async function onReturnPlan() {
		let plan: NavPlan = pane.buffer.bag?.plan;
		if (plan) {
			let readingsData: CompletedReading = {
				id: `${plan.subID}/${plan.readingIndex}`,
				index: plan.readingIndex,
				subID: plan.subID,
				version: 0
			};
			await readingsApi.put(readingsData);
			plansPubSubService.putReading(readingsData, plan.subID);

			let sub = subsMap.get(plan.subID);
			if (!sub) {
				return;
			}
			sub.completedReadings.set(plan.readingIndex, readingsData);
			sub.nextReadingIndex = getNextReadingIndex(sub.completedReadings.keys().toArray());
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
				<Reading bind:planReading={n.reading}></Reading>
			</div>

			<div class="flex w-full min-w-50 flex-col">
				<div class="flex w-full">
					<span class="flex flex-grow"></span>
					<div class="text-lg">
						{n.readingIndex + 1} of {n.totalReadings}
					</div>
				</div>
				<div class="flex w-full justify-end">
					<div class="text-base text-nowrap">
						Verses: {n.totalVerses}
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
		style="max-height: {clientHeight - headerHeight}px; min-height: {clientHeight - headerHeight}px"
		class="flex w-full max-w-lg flex-col overflow-x-hidden overflow-y-scroll bg-neutral-50"
	>
		{#if nextReadings.length > 0}
			{#each nextReadings as n, idx}
				{@render nextReading(n, idx)}
			{/each}
		{/if}
	</div>
</div>
