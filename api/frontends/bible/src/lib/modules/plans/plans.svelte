<script lang="ts">
	import { paneService } from '$lib/services/pane.service.svelte';
	import { plansService } from '$lib/services/plans.service';
	import { PLANS } from '$lib/storer/bible.db';
	import { onMount } from 'svelte';

	let { containerHeight, paneId } = $props();

	let plansMap: any = $state({});
	let planList: any = $state([]);
	let subsMap: any = $state({});
	let subsList: any = $state([]);
	let todaysReadings: any = $state([]);


	const PLANS_VIEWS = {
		PLANS_LIST: 'PLANS_LIST',
		PLANS_ACTIONS: 'PLANS_ACTION',
		PLANS_DETAILS: 'PLANS_DETAILS',

		SUBS_LIST: "SUBS_LIST",
		SUBS_ACTIONS: "SUBS_ACTIONS",
		SUBS_DETAILS: "SUBS_DETAILS"
	};

	let plansDisplay: string = $state(PLANS_VIEWS.PLANS_LIST);
	let planActionItems: any = {
		subscription: () => {},
		'next readings': () => {}
	};

	function onClosePanesList() {
		paneService.onDeletePane(paneService.rootPane, paneId);
	}

	function onClosePlansActionList() {
		plansDisplay = PLANS_VIEWS.PLANS_LIST;
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
		console.log(data.subs);
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

		console.log(data.plans);
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
					<td class="w-0 pe-3">{r.bookName}</td>
					<td>{r.chapter}:{r.verses}</td>
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
	<div class="flex">
		<span class="pb-2 text-2xl">{sub.name}</span>
	</div>

	<div class="col-2 flex w-full flex-col p-2 text-base">
		{#each sub.readings as r}
			{@render reading(r)}
		{/each}
	</div>
{/snippet}

{#snippet subsListView()}
	{#each subsList as s}
		<div class="col-2 flex w-full flex-col p-2 text-base hover:cursor-pointer hover:bg-neutral-100">
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

{#snippet plansActionItemsList()}
	<div
		style="height: {containerHeight - headerHeight}px"
		class="flex w-full flex-col overflow-y-scroll border"
	>
		{#each Object.keys(planActionItems) as a}
			<div class="w-full">
				<button
					onclick={(event) => planActionItems[a]()}
					class="hover:bg-primary-50 w-full bg-neutral-50 p-4 text-start capitalize hover:cursor-pointer"
					>{a}</button
				>
			</div>
		{/each}
	</div>
{/snippet}

{#snippet plansHeaderComponent(title: string, onClose: Function | undefined, menuActionView: string)}
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
					plansDisplay = menuActionView
				}}
				class="flex flex-row items-center space-x-2 hover:cursor-pointer"
			>
				<span class="inline-block font-bold">{title}</span>
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
			<span class="w-full flex justify-end h-12 w-12"></span>
		{/if}
	</header>
{/snippet}

{#snippet plansView()}
	{#if plansDisplay === PLANS_VIEWS.PLANS_LIST}
		{@render plansHeaderComponent('Plans', onClosePanesList, PLANS_VIEWS.PLANS_ACTIONS)}
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
		{@render plansHeaderComponent('Actions', undefined, PLANS_VIEWS.PLANS_LIST)}
		<div class="flex w-full max-w-lg">
			<div
				style="max-height: {clientHeight - headerHeight}px; min-height: {clientHeight -
					headerHeight}px"
				class="flex w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
			>
				<!-- {@render today()} -->
				{@render plansActionItemsList()}
			</div>
		</div>
	{/if}
{/snippet}

<div bind:clientHeight style={containerHeight} class="overflow-hidden">
	<div class="flex flex-col items-center">
		{@render plansView()}
	</div>
</div>
