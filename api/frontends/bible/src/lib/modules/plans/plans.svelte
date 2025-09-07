<script lang="ts">
	import { paneService } from '$lib/services/pane.service.svelte';
	import { plansService } from '$lib/services/plans.service';
	import { PLANS } from '$lib/storer/bible.db';
	import { sleep } from '$lib/utils/sleep';
	import { onMount } from 'svelte';
	import uuid4 from 'uuid4';

	let { containerHeight, paneId } = $props();

	let plansMap: any = $state({});
	let planList: any = $state([]);
	let subsMap: any = $state({});
	let subsList: any = $state([]);
	let todaysReadings: any = $state([]);
	let selectedSub: any = $state(undefined);
	let showCompletedReadings: boolean = $state(false);

	let subListReadingsToShow: number = $state(20);
	let subListViewID = uuid4();

	const PLANS_VIEWS = {
		PLANS_LIST: 'PLANS_LIST',
		PLANS_ACTIONS: 'PLANS_ACTION',
		PLANS_DETAILS: 'PLANS_DETAILS',

		SUBS_LIST: 'SUBS_LIST',
		SUBS_ACTIONS: 'SUBS_ACTIONS',
		SUBS_DETAILS: 'SUBS_DETAILS'
	};

	let plansDisplay: string = $state(PLANS_VIEWS.SUBS_LIST);
	let planActionItems: any = {
		'my plans': () => {
			plansDisplay = PLANS_VIEWS.SUBS_LIST;
		},
		'next readings': () => {}
	};

	function onClosePlansList() {
		paneService.onDeletePane(paneService.rootPane, paneId);
	}

	let subsActionItems: any = {
		plans: () => {
			plansDisplay = PLANS_VIEWS.PLANS_LIST;
		},
		'next readings': () => {}
	};

	function onSubClicked(sub: any) {
		selectedSub = sub;
		plansDisplay = PLANS_VIEWS.SUBS_DETAILS;

		setTimeout(() => {
			let el = document.getElementById(`${subListViewID}-scroll-container`);
			while (!el) {
				el = document.getElementById(`${subListViewID}-scroll-container`);
				sleep(1000);
			}

			el?.addEventListener('scroll', handleScroll);
		}, 1000);
	}

	function onGetAllSubs(data: any) {
		if (data) {
			subsMap = data.subs;
			subsList.length = 0;
			Object.keys(subsMap)
				.sort((a: any, b: any) => a.dateCreated - b.dateCreated)
				.forEach((k: any) => {
					subsList.push(subsMap[k]);
				});
		}
		updateTodays();
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

	function updateTodays() {
		let tr = [];
		let subKeys = Object.keys(subsMap);
		for (let i = 0; i < subKeys.length; i++) {
			let sub = subsMap[subKeys[i]];

			if (sub.plan.readings.length - 1 > sub.nextReadingIndex) {
				tr.push({
					reading: sub.plan.readings[sub.nextReadingIndex],
					planDateCreated: sub.plan.dateCreated ? sub.plan.dateCreated : Date.now(),
					name: sub.plan.name,
					percentCompleted: sub.percentCompleted
				});
			}
		}

		todaysReadings.length = 0;
		todaysReadings.push(...tr);
	}

	function loadMoreSubReadings() {
		let toShow = subListReadingsToShow + 20;
		if (toShow > selectedSub.plan.readings.length) {
			toShow = selectedSub.plan.readings.length;
		}
		subListReadingsToShow = toShow;
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

	let subID = '00000000-0000-0000-0000-000000000000';

	onMount(() => {
		plansService.subscribe('getAllPlans', onGetAllPlans);
		plansService.getAllPlans();

		plansService.subscribe('getAllSubs', onGetAllSubs);
		plansService.getAllSubs();
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

{#snippet todayReading(t: any)}
	<div class="col-2 flex w-full flex-col p-2 text-base hover:cursor-pointer hover:bg-neutral-100">
		<div class="flex">
			<span class="pb-2 text-2xl">{t.name}</span>
			<span class="flex-grow"></span>
			<span class="text-support-a-500">{t.percentCompleted}%</span>
		</div>

		{@render reading(t.reading)}
	</div>
{/snippet}

{#snippet nextReadingListView()}
	<div class="w-full">
		{#if todaysReadings.length > 0}
			{#each todaysReadings as t}
				{@render todayReading(t)}
			{/each}
		{/if}
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
					<div
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
	menuActionView: string
)}
	<header
		bind:clientHeight={headerHeight}
		class="flex w-full max-w-lg flex-row items-center justify-between bg-neutral-100 text-neutral-700"
	>
		<span class="flex w-full"></span>

		{#if menuActionView}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<p
				onclick={() => {
					plansDisplay = menuActionView;
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
		{@render plansHeaderComponent('Discover Plans', onClosePlansList, PLANS_VIEWS.PLANS_ACTIONS)}
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
		{@render plansHeaderComponent('Discover Plans', undefined, PLANS_VIEWS.PLANS_LIST)}
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
		{@render plansHeaderComponent('My Plans', onClosePlansList, PLANS_VIEWS.SUBS_ACTIONS)}
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
		{@render plansHeaderComponent('My Plans', undefined, PLANS_VIEWS.SUBS_LIST)}
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
		{@render plansHeaderComponent('My Plans', undefined, PLANS_VIEWS.SUBS_LIST)}
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
		{#if plansDisplay.startsWith('PLANS')}
			{@render plansView()}
		{:else if plansDisplay.startsWith('SUBS')}
			{@render subsView()}
		{/if}
	</div>
</div>
