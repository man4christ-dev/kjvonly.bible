<script lang="ts">
	import { paneService } from '$lib/services/pane.service.svelte';
	import { plansPubSubService } from '$lib/services/plans/plansPubSub.service';
	import { onDestroy, onMount } from 'svelte';
	import uuid4 from 'uuid4';
	import Header from '../components/header.svelte';
	import ActionItemsList from '../components/actionItemsList.svelte';
	import { PLANS_VIEWS } from '../models';
	import type { Plan } from '$lib/models/plans.model';

	// =============================== BINDINGS ================================
	let {
		plansDisplay = $bindable(),
		clientHeight = $bindable(),
		paneId = $bindable(),
		pane = $bindable()
	} = $props();

	// ================================== VARS =================================
	let PLAN_SUBSCRIBER_ID: string = uuid4();
	let plansMap: Map<string, Plan> = $state(new Map());
	let planList: Plan[] = $state([]);
	let headerHeight = $state(0);
	let planActionItems: any = {
		'my plans': () => {
			plansDisplay = PLANS_VIEWS.SUBS_LIST;
		},
		'next readings': () => {
			plansDisplay = PLANS_VIEWS.NEXT_LIST;
		}
	};

	// =============================== LIFECYCLE ===============================

	onMount(() => {
		plansPubSubService.subscribe(
			'getAllPlans',
			onGetAllPlans,
			PLAN_SUBSCRIBER_ID
		);
		plansPubSubService.getAllPlans();
	});

	onDestroy(() => {
		plansPubSubService.unsubscribe(PLAN_SUBSCRIBER_ID);
	});

	// ============================== CLICK FUNCS ==============================

	function onClosePlansList() {
		paneService.onDeletePane(paneService.rootPane, paneId);
	}

	function onGetAllPlans(data: any) {
		if (data) {
			plansMap = data.plans;
			planList = plansMap
				.values()
				.toArray()
				.sort((a: Plan, b: Plan) => a.dateCreated - b.dateCreated);
		}
	}
</script>

{#snippet plansListView()}
	{#each planList as p}
		<button
			class="col-2 flex w-full flex-col p-2 text-base hover:cursor-pointer hover:bg-neutral-100"
			style="height: 100px"
		>
			<div class="flex w-full">
				<span class="pb-2 text-2xl">{p.name}</span>
			</div>

			<div class="truncate text-sm">
				{#each p.description as d}
					<span>
						{d}
					</span>
				{/each}
			</div>
		</button>
	{/each}
{/snippet}

{#if plansDisplay === PLANS_VIEWS.PLANS_LIST}
	<Header
		bind:headerHeight
		title="Discover Plans"
		onClose={onClosePlansList}
		bind:plansDisplay
		menuDropdownToggleViews={[
			PLANS_VIEWS.PLANS_ACTIONS,
			PLANS_VIEWS.PLANS_LIST
		]}
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
		bind:headerHeight
		title="Discover Plans"
		onClose={() => {}}
		bind:plansDisplay
		menuDropdownToggleViews={[
			PLANS_VIEWS.PLANS_LIST,
			PLANS_VIEWS.PLANS_ACTIONS
		]}
	></Header>
	<div class="flex w-full max-w-lg">
		<div
			style="max-height: {clientHeight -
				headerHeight}px; min-height: {clientHeight - headerHeight}px"
			class="flex w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
		>
			<!-- {@render today()} -->

			<ActionItemsList actionItems={planActionItems}></ActionItemsList>
		</div>
	</div>
{/if}
