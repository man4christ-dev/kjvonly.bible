<script lang="ts">
	import { readingsApi } from '$lib/api/readings.api';
	import { plansService } from '$lib/services/plans.service';
	import { getNextReadingIndex } from '$lib/utils/plan';
	import { onDestroy, onMount } from 'svelte';
	import type { CompletedReading, NavPlan, Sub } from '../models';
	import { NullSub, PLANS_VIEWS } from '../models';
	import SubsAction from './subsAction.svelte';
	import SubsDetails from './subsDetails.svelte';
	import SubsList from './subsList.svelte';
	import uuid4 from 'uuid4';

	let {
		plansDisplay = $bindable(),
		pane = $bindable(),
		paneId,
		clientHeight = $bindable()
	} = $props();

	let selectedSub: Sub = $state(NullSub());
	let PLAN_SUBSCRIBER_ID: string = uuid4();
	let subsMap: Map<string, Sub> = new Map<string, Sub>();
	let subsList: Sub[] = $state([]);

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
			plansService.putReading(readingsData, plan.subID);

			let sub = subsMap.get(plan.subID);
			// SHOULD ALWAYS EXIST. MAKE COMPILER HAPPY
			if (!sub) {
				return;
			}

			sub.readings[plan.readingIndex] = readingsData;
			sub.nextReadingIndex = getNextReadingIndex(Object.keys(sub.readings).map((v) => parseInt(v)));
			console.log('before');
			selectedSub = sub;
			console.log('after');
		}
	}

	async function onGetAllSubs(data: any) {
		if (data) {
			console.log(data.subs);
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

	onDestroy(() => {
		plansService.unsubscribe(PLAN_SUBSCRIBER_ID);
	});

	onMount(() => {
		plansService.subscribe('getAllSubs', onGetAllSubs, PLAN_SUBSCRIBER_ID);
		plansService.getAllSubs();
	});
</script>

{#if plansDisplay === PLANS_VIEWS.SUBS_LIST}
	<SubsList paneId bind:clientHeight bind:pane bind:plansDisplay bind:selectedSub bind:subsList
	></SubsList>
{:else if plansDisplay === PLANS_VIEWS.SUBS_ACTIONS}
	<SubsAction bind:plansDisplay bind:pane bind:clientHeight paneId></SubsAction>
{:else if plansDisplay === PLANS_VIEWS.SUBS_DETAILS}
	<SubsDetails paneId bind:clientHeight bind:pane bind:plansDisplay bind:selectedSub></SubsDetails>
{/if}
