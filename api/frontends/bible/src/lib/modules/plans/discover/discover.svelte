<script lang="ts">
	// ================================ IMPORTS ================================
	// SVELTE
	// COMPONENTS
	// MODELS
	// SERVICES
	// =============================== BINDINGS ================================
	// ================================== VARS =================================
	// =============================== LIFECYCLE ===============================
	// ================================ FUNCS ==================================
	// ============================== CLICK FUNCS ==============================
	import { plansPubSubService } from '$lib/services/plans/plansPubSub.service';
	import { onDestroy, onMount } from 'svelte';
	import uuid4 from 'uuid4';
	import {
		PLAN_PUBSUB_SUBSCRIPTIONS,
		PLANS_VIEWS,
		type Plan
	} from '$lib/models/plans.model';
	import DiscoverList from './discoverList.svelte';

	// =============================== BINDINGS ================================
	let {
		plansDisplay = $bindable(),
		clientHeight = $bindable(),
		paneID = $bindable(),
		pane = $bindable()
	} = $props();

	// ================================== VARS =================================
	let SUBSCRIBER_ID: string = uuid4();
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
			PLAN_PUBSUB_SUBSCRIPTIONS.GET_ALL_PLANS,
			onGetAllPlans,
			SUBSCRIBER_ID
		);
		plansPubSubService.getAllPlans();
	});

	onDestroy(() => {
		plansPubSubService.unsubscribe(SUBSCRIBER_ID);
	});

	// ============================== CLICK FUNCS ==============================

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

{#if plansDisplay === PLANS_VIEWS.PLANS_LIST}
	<DiscoverList bind:planList bind:plansDisplay {paneID}></DiscoverList>
{:else if plansDisplay === PLANS_VIEWS.PLANS_ACTIONS}{/if}
