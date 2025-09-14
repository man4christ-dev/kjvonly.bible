<script lang="ts">
	import { plansApi } from '$lib/api/plans.api';
	import { readingsApi } from '$lib/api/readings.api';
	import { paneService } from '$lib/services/pane.service.svelte';
	import { plansService } from '$lib/services/plans.service';
	import { getNextReadingIndex } from '$lib/utils/plan';
	import { sleep } from '$lib/utils/sleep';
	import { onDestroy, onMount } from 'svelte';
	import uuid4 from 'uuid4';
	import SubsView from './subscription/subsView.svelte';
	import Header from './components/header.svelte';
	import NextReading from './nextReading/nextReading.svelte';
	import ActionItemsList from './components/actionItemsList.svelte';
	import { PLANS_VIEWS } from './models';

	let { containerHeight, paneId, pane } = $props();

	let PLAN_SUBSCRIBER_ID: string = uuid4();

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

	///////////////////////////// LIFECYCLES //////////////////////////////////

	onDestroy(() => {
		plansService.unsubscribe(PLAN_SUBSCRIBER_ID);
	});

	onMount(() => {
		plansService.subscribe('getAllPlans', onGetAllPlans, PLAN_SUBSCRIBER_ID);
		plansService.getAllPlans();


		if (!pane.buffer.bag?.plan?.route) {
			plansDisplay = PLANS_VIEWS.SUBS_LIST;
		}
	});

	let clientHeight = $state(0);
	let headerHeight = $state(0);
</script>

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

{#snippet plansView()}
	{#if plansDisplay === PLANS_VIEWS.PLANS_LIST}
		<Header
			title="Discover Plans"
			onClose={onClosePlansList}
			bind:plansDisplay
			menuDropdownToggleViews={[PLANS_VIEWS.PLANS_ACTIONS, PLANS_VIEWS.PLANS_LIST]}
		></Header>

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
		<Header
			title="Discover Plans"
			onClose={() => {}}
			bind:plansDisplay
			menuDropdownToggleViews={[PLANS_VIEWS.PLANS_LIST, PLANS_VIEWS.PLANS_ACTIONS]}
		></Header>
		<div class="flex w-full max-w-lg">
			<div
				style="max-height: {clientHeight - headerHeight}px; min-height: {clientHeight -
					headerHeight}px"
				class="flex w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
			>
				<!-- {@render today()} -->

				<ActionItemsList actionItems={planActionItems}></ActionItemsList>
			</div>
		</div>
	{/if}
{/snippet}

<div bind:clientHeight style={containerHeight} class="overflow-hidden">
	<div class="flex flex-col items-center">
		{#if plansDisplay?.startsWith('PLANS')}
			{@render plansView()}
		{:else if plansDisplay?.startsWith('SUBS')}
			<SubsView bind:plansDisplay bind:pane paneId bind:clientHeight></SubsView>
		{:else if plansDisplay?.startsWith('NEXT')}
			<NextReading bind:plansDisplay bind:pane  bind:clientHeight></NextReading>
		{/if}
	</div>
</div>
