<script lang="ts">
	import { plansService } from '$lib/services/plans.service';
	import { onDestroy, onMount } from 'svelte';
	import Reading from '../components/reading.svelte';

	import { getNextReadingIndex } from '$lib/utils/plan';
	import { readingsApi } from '$lib/api/readings.api';
	import uuid4 from 'uuid4';
	import Header from '../components/header.svelte';
	import type { Sub, NextReading, PlanReading, NavPlan, CompletedReading } from '../models';
	import { PLANS_VIEWS } from '../models';

	let { pane = $bindable(), plansDisplay = $bindable(), clientHeight = $bindable() } = $props();

	let PLAN_SUBSCRIBER_ID: string = uuid4();
	let subsMap: Map<string, Sub> = new Map<string, Sub>();
	let subsList: Sub[] = $state([]);
	let subListViewID = uuid4();
	let todaysReadings: NextReading[] = $state([]);

	function onCloseSubDetails() {
		plansDisplay = PLANS_VIEWS.SUBS_LIST;
	}

	function onSelectedNextReading(idx: number, returnView: string) {
		let nextReading: NextReading = todaysReadings[idx];
		let readings: PlanReading[] = nextReading.reading;
		let updReadings: PlanReading[] = readings.map((r: any) => {
			r.chapterKey = `${r.bookID}_${r.chapter}_${r.verses}`;
			return r;
		});

		let np: NavPlan = {
			readings: updReadings,
			currentReadingsIndex: 0,
			subID: nextReading.subID,
			readingIndex: nextReading.readingIndex,
			returnView: returnView
		};

		pane.buffer.bag.plan = np;

		pane.buffer.bag.chapterKey = updReadings[0].chapterKey;
		pane.updateBuffer('ChapterContainer');
	}

	function updateTodays() {
		let tr: NextReading[] = [];
		let subKeys = subsMap.keys().toArray();
		for (let i = 0; i < subKeys.length; i++) {
			let sub = subsMap.get(subKeys[i]);
			if (sub && sub.plan.readings.length - 1 > sub.nextReadingIndex) {
				let nr: NextReading = {
					reading: sub.plan.readings[sub.nextReadingIndex],
					totalVerses: sub.plan.readings[sub.nextReadingIndex].totalVerses, // TODO total verses was added to Array :P
					planDateCreated: sub.plan.dateCreated ? sub.plan.dateCreated : Date.now(),
					name: sub.plan.name,
					percentCompleted: sub.percentCompleted,
					readingIndex: sub.nextReadingIndex,
					totalReadings: sub.plan.readings.length,
					subID: sub.id
				};
				tr.push(nr);
			}
		}

		todaysReadings.length = 0;
		todaysReadings.push(...tr);
	}

	async function onReturnPlan() {
		if (pane.buffer.bag?.plan?.route) {
			let route = pane.buffer.bag.plan.route;
			if (route.returnView === PLANS_VIEWS.NEXT_LIST) {
				let sub = subsMap.get(route.subID);
				if (!sub) {
					return;
				}

				let readingIndex: number = pane.buffer.bag.plan.readingIndex;
				let readingsData: CompletedReading = {
					id: `${route.subID}/${readingIndex}`,
					index: readingIndex,
					subID: route.subID,
					version: 0
				};
				await readingsApi.put(readingsData);
				plansService.putReading(readingsData, sub.id);

				sub.readings[readingIndex] = readingsData;
				sub.nextReadingIndex = getNextReadingIndex(
					Object.keys(sub.readings).map((v) => parseInt(v))
				);
				plansDisplay = route.returnView;
			}
		}
	}

	async function onGetAllSubs(data: any) {
		if (data) {
			subsMap = new Map<string, Sub>(Object.entries(data.subs));
			subsList.length = 0;
			subsMap
				.entries()
				.map((s, _): Sub => s[1])
				.toArray()
				.sort((a: any, b: any) => a.dateCreated - b.dateCreated)
				.forEach((s: any) => subsList.push(s));

			await onReturnPlan();
			await updateTodays();
		}
	}

	onDestroy(() => {
		plansService.unsubscribe(PLAN_SUBSCRIBER_ID);
	});

	onMount(() => {
		plansService.subscribe('getAllSubs', onGetAllSubs, PLAN_SUBSCRIBER_ID);
		plansService.getAllSubs();
	});

	let headerHeight = $state(0);
</script>

{#snippet todayReading(t: any, idx: any)}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		onclick={() => onSelectedNextReading(idx, PLANS_VIEWS.NEXT_LIST)}
		class=" flex w-full flex-col px-2 py-4 text-base hover:cursor-pointer hover:bg-neutral-100"
	>
		<div class="flex">
			<span class="pb-2 text-2xl">{t.name}</span>
			<span class="flex-grow"></span>
			<span class="text-support-a-500">{t.percentCompleted}%</span>
		</div>
		<div class="flex flex-row">
			<div class="min-w-50">
				<Reading bind:rs={t.reading}></Reading>
			</div>

			<div class="flex w-full min-w-50 flex-col">
				<div class="flex w-full">
					<span class="flex flex-grow"></span>
					<div class="text-lg">
						{t.readingIndex + 1} of {t.totalReadings}
					</div>
				</div>
				<div class="flex w-full justify-end">
					<div class="text-base text-nowrap">
						Verses: {t.totalVerses}
					</div>
				</div>
			</div>
		</div>
	</div>
{/snippet}

<Header
	title="My Plans"
	onClose={onCloseSubDetails}
	bind:plansDisplay
	menuDropdownToggleViews={undefined}
></Header>
<div class="flex w-full max-w-lg">
	<div
		id="{subListViewID}-scroll-container"
		style="max-height: {clientHeight - headerHeight}px; min-height: {clientHeight - headerHeight}px"
		class="flex w-full max-w-lg flex-col overflow-x-hidden overflow-y-scroll bg-neutral-50"
	>
		{#if todaysReadings.length > 0}
			{#each todaysReadings as t, idx}
				{@render todayReading(t, idx)}
			{/each}
		{/if}
	</div>
</div>
