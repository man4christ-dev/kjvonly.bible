<script lang="ts">
	import { readingsApi } from '$lib/api/readings.api';
	import { plansService } from '$lib/services/plans.service';
	import { getNextReadingIndex } from '$lib/utils/plan';
	import { sleep } from '$lib/utils/sleep';
	import { onDestroy, onMount } from 'svelte';
	import uuid4 from 'uuid4';
	import Reading from '../components/reading.svelte';
	import Header from '../components/header.svelte';
	import { paneService } from '$lib/services/pane.service.svelte';
	import ActionItemsList from '../components/actionItemsList.svelte';
	
	import type {  Sub, PlanReading, NavPlan, CompletedReading } from '../models';
    import {NullSub, PLANS_VIEWS} from '../models'


	let { plansDisplay = $bindable(), pane = $bindable(), paneId, clientHeight=$bindable() } = $props();

	function onClosePlansList() {
		paneService.onDeletePane(paneService.rootPane, paneId);
	}

	let PLAN_SUBSCRIBER_ID: string = uuid4();
	let subsMap: Map<string, Sub> = new Map<string, Sub>();
	let subsList: Sub[] = $state([]);

	let selectedSub: Sub = $state(NullSub());
	let showCompletedReadings: boolean = $state(false);



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
			returnView: returnView
		};

		pane.buffer.bag.plan = np;

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
			subsMap = new Map<string, Sub>(Object.entries(data.subs));
			subsList.length = 0;
			subsMap
				.entries()
				.map((s, _): Sub => s[1])
				.toArray()
				.sort((a: any, b: any) => a.dateCreated - b.dateCreated)
				.forEach((s: any) => subsList.push(s));

			await onReturnPlan();
		}
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

	onDestroy(() => {
		plansService.unsubscribe(PLAN_SUBSCRIBER_ID);
	});

	onMount(() => {
		plansService.subscribe('getAllSubs', onGetAllSubs, PLAN_SUBSCRIBER_ID);
		plansService.getAllSubs();

		if (!pane.buffer.bag?.plan?.route) {
			plansDisplay = PLANS_VIEWS.SUBS_LIST;
		}
	});

	let headerHeight = $state(0);
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
				{#if !sub.readings[idx] || (sub.readings[idx] && showCompletedReadings)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						onclick={() => onSelectedSubReading(idx, PLANS_VIEWS.SUBS_DETAILS)}
						class="flex w-full flex-row px-2 py-4 text-base hover:cursor-pointer hover:bg-neutral-100"
					>
						<div class="flex w-full min-w-50">
							<Reading bind:rs={sub.plan.readings[idx]}></Reading>
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

{#if plansDisplay === PLANS_VIEWS.SUBS_LIST}
	<Header
		title="My Plans"
		onClose={onClosePlansList}
		bind:plansDisplay
		menuDropdownToggleViews={[	PLANS_VIEWS.SUBS_ACTIONS,PLANS_VIEWS.SUBS_LIST]}
	></Header>
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
	<Header
		title="My Plans"
		onClose={()=>{}}
		bind:plansDisplay
		menuDropdownToggleViews={[	PLANS_VIEWS.SUBS_LIST,PLANS_VIEWS.SUBS_ACTIONS]}
	></Header>
	<div class="flex w-full max-w-lg">
		<div
			style="max-height: {clientHeight - headerHeight}px; min-height: {clientHeight -
				headerHeight}px"
			class="flex w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
		>
			<!-- {@render today()} -->
			 <ActionItemsList actionItems={subsActionItems}></ActionItemsList>
		</div>
	</div>
{:else if plansDisplay === PLANS_VIEWS.SUBS_DETAILS}
	<Header
		title="My Plans"
		onClose={onCloseSubDetails}
		bind:plansDisplay
		menuDropdownToggleViews={undefined}
	></Header>

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
