<script lang="ts">
	import { plansApi } from '$lib/api/plans.api';
	import { readingsApi } from '$lib/api/readings.api';
	import { paneService } from '$lib/services/pane.service.svelte';
	import { plansService } from '$lib/services/plans.service';
	import { getNextReadingIndex } from '$lib/utils/plan';
	import { sleep } from '$lib/utils/sleep';
	import { onDestroy, onMount } from 'svelte';
	import uuid4 from 'uuid4';

	let { containerHeight, paneId, pane } = $props();

	let PLAN_SUBSCRIBER_ID: string = uuid4();

	const PLANS_VIEWS = {
		PLANS_LIST: 'PLANS_LIST',
		PLANS_ACTIONS: 'PLANS_ACTION',
		PLANS_DETAILS: 'PLANS_DETAILS',

		SUBS_LIST: 'SUBS_LIST',
		SUBS_ACTIONS: 'SUBS_ACTIONS',
		SUBS_DETAILS: 'SUBS_DETAILS',

		NEXT_LIST: 'NEXT_LIST'
	};

	//////////////////////////// PLANS ////////////////////////////////////////
	let plansMap: any = $state({});
	let planList: any = $state([]);

	let plansDisplay: string = $state(PLANS_VIEWS.SUBS_LIST);
	let planActionItems: any = {
		'my plans': () => {
			plansDisplay = PLANS_VIEWS.SUBS_LIST;
		},
		'next readings': () => {
			plansDisplay = PLANS_VIEWS.NEXT_LIST;
		}
	};

	function onClosePlansList() {
		paneService.onDeletePane(paneService.rootPane, paneId);
	}

	//////////////////////////// SUB UPDATES //////////////////////////////////

	/**
	 * id: "00000000-0000-0000-0000-000000000000/0"
	 * subID: "00000000-0000-0000-0000-000000000000"
	 * index: 0
	 * version: 0
	 */
	interface CompletedReading {
		id: string;
		subID: string;
		index: number;
		version: number;
	}

	interface Plan {
		id: string;
		userID: string;
		name: string;
		description: string[];
		readings: PlanReading[][];
		dateCreated: number;
		version: number;
	}

	interface Sub {
		id: string;
		planID: string;
		userID: string;
		readings: CompletedReading[];
		plan: Plan;
		nextReadingIndex: number;
		percentCompleted: number;

		dateSubscribed: Date;
		version: number;
	}

	let subsMap: Map<string, Sub> = new Map<string, Sub>();
	let subsList: Sub[] = $state([]);
	let todaysReadings: NextReading[] = $state([]);
	let selectedSub: Sub = $state(NullSub());
	let showCompletedReadings: boolean = $state(false);

	function NullSub(): Sub {
		return {
			id: '',
			planID: '',
			userID: '',
			readings: [],
			plan: {
				id: '',
				userID: '',
				name: '',
				description: [],
				readings: [],
				version: 0,
				dateCreated: 0
			},
			nextReadingIndex: 0,
			percentCompleted: 0,
			dateSubscribed: new Date(),
			version: 0
		};
	}

	let subListReadingsToShow: number = $state(0);
	let subListViewID = uuid4();

	function onSelectedSubReading(idx: number, returnView: string) {
		let readings: PlanReading[] = selectedSub.plan.readings[idx];
		let updReadings: PlanReading[] = readings.map((r: any) => {
			r.chapterKey = `${r.bookID}_${r.chapter}_${r.verses}`;
			return r as PlanReading;
		});

		let np: NavPlan = {
			readings: updReadings,
			currentReadingsIndex: 0, // What to start at
			subID: selectedSub.id,
			readingIndex: idx,
			returnView: returnView,
		} 
		
		pane.buffer.bag.plan = np

		pane.buffer.bag.chapterKey = updReadings[0].chapterKey;
		pane.updateBuffer('ChapterContainer');
	}

	function onCloseSubDetails() {
		plansDisplay = PLANS_VIEWS.SUBS_LIST;
	}

	let subsActionItems: any = {
		plans: () => {
			plansDisplay = PLANS_VIEWS.PLANS_LIST;
		},
		'next readings': () => {
			plansDisplay = PLANS_VIEWS.NEXT_LIST;
		}
	};

	function onSubClicked(sub: any) {
		selectedSub = sub;
		plansDisplay = PLANS_VIEWS.SUBS_DETAILS;
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
	}

	async function onReturnPlan() {
		if (pane.buffer.bag?.plan?.route) {
			let route = pane.buffer.bag.plan.route;

			if (
				route.returnView === PLANS_VIEWS.SUBS_DETAILS ||
				route.returnView === PLANS_VIEWS.NEXT_LIST
			) {
				let sub = subsMap.get(route.subID);
				if (!sub) {
					return;
				}

				selectedSub = sub;
				let readingIndex: number = pane.buffer.bag.plan.readingIndex;
				let readingsData: CompletedReading = {
					id: `${route.subID}/${readingIndex}`,
					index: readingIndex,
					subID: selectedSub.id,
					version: 0
				};
				await readingsApi.put(readingsData);
				plansService.putReading(readingsData, selectedSub.id);
				selectedSub.readings[readingIndex] = readingsData;

				selectedSub.nextReadingIndex = getNextReadingIndex(
					Object.keys(selectedSub.readings).map((v) => parseInt(v))
				);
				let updSub: Sub | undefined = subsMap.get(selectedSub.id);
				if (updSub) {
					updSub.nextReadingIndex = selectedSub.nextReadingIndex;
				}

				plansDisplay = route.returnView;
			}
			loadMoreSubReadings();
		}
	}

	async function onGetAllSubs(data: any) {
		if (data) {
			console.log(data);
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

	function onGetAllPlans(data: any) {
		if (data) {
			plansMap = data.plans;
			Object.keys(plansMap)
				.sort((a: any, b: any) => a.dateCreated - b.dateCreated)
				.forEach((k: any) => {
					planList.push(plansMap[k]);
				});
		}
	}

	//////////////////////////// NEXT READINGS ////////////////////////////////

	interface NavPlan {
		readings: PlanReading[];
		currentReadingsIndex: number;
		subID: string;
		readingIndex: number
		returnView: string
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

		pane.buffer.bag.plan = np

		pane.buffer.bag.chapterKey = updReadings[0].chapterKey;
		pane.updateBuffer('ChapterContainer');
	}

	/**
	 * bookName: "Genesis",
	 * bookID: 1,
	 * chapter: 1,
	 * verses: "1-31",
	 * chapterKey: "1_1_1-31"
	 */
	interface PlanReading {
		bookName: string;
		bookID: number;
		chapter: number;
		verses: string;
		chapterKey: string;
	}

	interface NextReading {
		reading: PlanReading[];
		totalVerses: number;
		planDateCreated: number;
		name: string;
		percentCompleted: number;
		readingIndex: number;
		totalReadings: number;
		subID: string;
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

	//////////////////////////// SCROLL MGNT //////////////////////////////////

	function loadMoreSubReadings() {
		let toShow = 0;
		let count = 0;

		while (toShow !== 30 && count + subListReadingsToShow < selectedSub.plan.readings.length) {
			let hasCompletedReading = selectedSub.readings[subListReadingsToShow + count];
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
		const isReachBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= threshold;

		if (isReachBottom) {
			loadMoreSubReadings();
		}
	}

	///////////////////////////// LIFECYCLES //////////////////////////////////

	onDestroy(() => {
		plansService.unsubscribe(PLAN_SUBSCRIBER_ID);
	});

	onMount(() => {
		plansService.subscribe('getAllPlans', onGetAllPlans, PLAN_SUBSCRIBER_ID);
		plansService.getAllPlans();

		plansService.subscribe('getAllSubs', onGetAllSubs, PLAN_SUBSCRIBER_ID);
		plansService.getAllSubs();

		if (!pane.buffer.bag?.plan?.route) {
			plansDisplay = PLANS_VIEWS.SUBS_LIST;
		}
	});

	let clientHeight = $state(0);
	let headerHeight = $state(0);
</script>

{#snippet reading(rs: any)}
	<table class="table-fixed">
		<tbody>
			{#each rs as r}
				<tr>
					<td class="pe-3 text-right text-nowrap">{r.bookName}</td>
					<td class="text-right">{r.chapter}:{r.verses}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/snippet}

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
				{@render reading(t.reading)}
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

{#snippet nextReadingListView()}
	{@render plansHeaderComponent('My Plans', onCloseSubDetails, undefined)}
	<div class="flex w-full max-w-lg">
		<div
			id="{subListViewID}-scroll-container"
			style="max-height: {clientHeight - headerHeight}px; min-height: {clientHeight -
				headerHeight}px"
			class="flex w-full max-w-lg flex-col overflow-x-hidden overflow-y-scroll bg-neutral-50"
		>
			{#if todaysReadings.length > 0}
				{#each todaysReadings as t, idx}
					{@render todayReading(t, idx)}
				{/each}
			{/if}
		</div>
	</div>
{/snippet}

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
				{#if !sub.readings[idx] || (sub.readings[idx] && showCompletedReadings)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						onclick={() => onSelectedSubReading(idx, PLANS_VIEWS.SUBS_DETAILS)}
						class="flex w-full flex-row px-2 py-4 text-base hover:cursor-pointer hover:bg-neutral-100"
					>
						<div class="flex w-full min-w-50">
							{@render reading(sub.plan.readings[idx])}
						</div>

						<div class="flex w-full min-w-50 flex-col">
							<div class="flex w-full">
								<span class="flex flex-grow"></span>
								<div class="text-lg {sub.readings[idx]?.index === idx ? 'text-support-a-500' : ''}">
									{idx + 1} of {sub.plan.readings.length}
								</div>
							</div>
							<div class="flex w-full justify-end">
								<div class="text-base text-nowrap">
									Verses: {sub.plan.readings[idx].totalVerses}
								</div>
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
{/snippet}

{#snippet subsListView()}
	{#each subsList as s}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			onclick={() => onSubClicked(s)}
			class="col-2 flex w-full flex-col p-2 text-base hover:cursor-pointer hover:bg-neutral-100"
		>
			<div class="flex w-full">
				<span class="pb-2 text-2xl">{s.plan.name}</span>
				<span class="flex-grow"></span>
				<span class="text-support-a-500">{s.percentCompleted}%</span>
			</div>

			<div class="text-sm">
				{#each s.plan.description as d}
					<span>
						{d}
					</span>
				{/each}
			</div>
		</div>
	{/each}
{/snippet}

{#snippet plansListView()}
	{#each planList as p}
		<div class="col-2 flex w-full flex-col p-2 text-base hover:cursor-pointer hover:bg-neutral-100">
			<div class="flex w-full">
				<span class="pb-2 text-2xl">{p.name}</span>
			</div>

			<div class="text-sm">
				{#each p.description as d}
					<span>
						{d}
					</span>
				{/each}
			</div>
		</div>
	{/each}
{/snippet}

{#snippet actionItemsListView(actionItems: any)}
	<div class="flex w-full flex-col">
		{#each Object.keys(actionItems) as a}
			<button
				onclick={(event) => actionItems[a]()}
				class="hover:bg-primary-50 flex w-full bg-neutral-50 p-4 text-start capitalize hover:cursor-pointer"
				>{a}</button
			>
		{/each}
	</div>
{/snippet}

{#snippet plansHeaderComponent(
	title: string,
	onClose: Function | undefined,
	menuDropdownToggleViews: string[] | undefined
)}
	<header
		bind:clientHeight={headerHeight}
		class="flex w-full max-w-lg flex-row items-center justify-between bg-neutral-100 text-neutral-700"
	>
		<span class="flex w-full"></span>

		{#if menuDropdownToggleViews}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<p
				onclick={() => {
					if (plansDisplay === menuDropdownToggleViews[0]) {
						plansDisplay = menuDropdownToggleViews[1];
					} else {
						plansDisplay = menuDropdownToggleViews[0];
					}
				}}
				class="flex flex-row items-center space-x-2 hover:cursor-pointer"
			>
				<span class="inline-block font-bold text-nowrap">{title}</span>
				<button aria-label="chevron down" class="h-4 w-4 hover:cursor-pointer">
					<svg
						width="100%"
						height="100%"
						viewBox="0 0 25.4 14.098638"
						version="1.1"
						xml:space="preserve"
						xmlns="http://www.w3.org/2000/svg"
						><g transform="translate(-53.644677,-127.79211)"
							><path
								class="fill-neutral-700"
								style="stroke-width:0.352778"
								d="m 59.906487,137.65245 -6.26181,-4.21622 v -2.82206 -2.82206 l 6.35,4.24282 6.35,4.24283 6.35,-4.24283 6.35,-4.24282 v 2.82222 2.82222 l -6.3429,4.23808 c -3.48859,2.33094 -6.38578,4.22817 -6.43819,4.21606 -0.0524,-0.0121 -2.91311,-1.91931 -6.3571,-4.23824 z"
								id="path179"
							/></g
						></svg
					>
				</button>
			</p>
		{:else}
			<span class="w-full"></span>
		{/if}
		{#if onClose}
			<div class="flex w-full justify-end">
				<button
					aria-label="close"
					onclick={() => {
						onClose();
					}}
					class="h-12 w-12 px-2 pt-2 text-neutral-700 hover:cursor-pointer"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
						<path
							class="fill-neutral-700"
							d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M17,15.59L15.59,17L12,13.41L8.41,17L7,15.59 L10.59,12L7,8.41L8.41,7L12,10.59L15.59,7L17,8.41L13.41,12L17,15.59z"
						/>
					</svg>
				</button>
			</div>
		{:else}
			<span class="flex h-12 w-12 w-full justify-end"></span>
		{/if}
	</header>
{/snippet}

{#snippet plansView()}
	{#if plansDisplay === PLANS_VIEWS.PLANS_LIST}
		{@render plansHeaderComponent('Discover Plans', onClosePlansList, [
			PLANS_VIEWS.PLANS_ACTIONS,
			PLANS_VIEWS.PLANS_LIST
		])}
		<div class="w-full max-w-lg">
			<div
				style="height: {clientHeight - headerHeight}px"
				class="w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
			>
				<!-- {@render today()} -->
				{@render plansListView()}
			</div>
		</div>
	{:else if plansDisplay === PLANS_VIEWS.PLANS_ACTIONS}
		{@render plansHeaderComponent('Discover Plans', undefined, [
			PLANS_VIEWS.PLANS_LIST,
			PLANS_VIEWS.PLANS_ACTIONS
		])}
		<div class="flex w-full max-w-lg">
			<div
				style="max-height: {clientHeight - headerHeight}px; min-height: {clientHeight -
					headerHeight}px"
				class="flex w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
			>
				<!-- {@render today()} -->
				{@render actionItemsListView(planActionItems)}
			</div>
		</div>
	{/if}
{/snippet}

{#snippet subsView()}
	{#if plansDisplay === PLANS_VIEWS.SUBS_LIST}
		{@render plansHeaderComponent('My Plans', onClosePlansList, [
			PLANS_VIEWS.SUBS_ACTIONS,
			PLANS_VIEWS.SUBS_LIST
		])}
		<div class="w-full max-w-lg">
			<div
				style="height: {clientHeight - headerHeight}px"
				class="w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
			>
				<!-- {@render today()} -->
				{@render subsListView()}
			</div>
		</div>
	{:else if plansDisplay === PLANS_VIEWS.SUBS_ACTIONS}
		{@render plansHeaderComponent('My Plans', undefined, [
			PLANS_VIEWS.SUBS_LIST,
			PLANS_VIEWS.SUBS_ACTIONS
		])}
		<div class="flex w-full max-w-lg">
			<div
				style="max-height: {clientHeight - headerHeight}px; min-height: {clientHeight -
					headerHeight}px"
				class="flex w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
			>
				<!-- {@render today()} -->
				{@render actionItemsListView(subsActionItems)}
			</div>
		</div>
	{:else if plansDisplay === PLANS_VIEWS.SUBS_DETAILS}
		{@render plansHeaderComponent('My Plans', onCloseSubDetails, undefined)}
		<div class="flex w-full max-w-lg">
			<div
				id="{subListViewID}-scroll-container"
				style="max-height: {clientHeight - headerHeight}px; min-height: {clientHeight -
					headerHeight}px"
				class="flex w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
			>
				<!-- {@render today()} -->
				{@render subListView(selectedSub)}
			</div>
		</div>
	{/if}
{/snippet}

<div bind:clientHeight style={containerHeight} class="overflow-hidden">
	<div class="flex flex-col items-center">
		{#if plansDisplay?.startsWith('PLANS')}
			{@render plansView()}
		{:else if plansDisplay?.startsWith('SUBS')}
			{@render subsView()}
		{:else if plansDisplay?.startsWith('NEXT')}
			{@render nextReadingListView()}
		{/if}
	</div>
</div>
