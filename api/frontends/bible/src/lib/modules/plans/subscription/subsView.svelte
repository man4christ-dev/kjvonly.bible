<script lang="ts">
	import { readingsApi } from '$lib/api/completedReadings';
	import { plansPubSubService } from '$lib/services/plans/plansPubSub.service';
	import { onDestroy, onMount } from 'svelte';
	import { PLANS_VIEWS } from '../models';
	import SubsAction from './subsAction.svelte';
	import SubsDetails from './subsDetails.svelte';
	import SubsList from './subsList.svelte';
	import uuid4 from 'uuid4';
	import { subsEnricherService } from '$lib/services/plans/subsEnricher.service';
	import {
		NullSub,
		type Sub,
		type NavReadings,
		type CompletedReadings
	} from '$lib/models/plans.model';

	let {
		plansDisplay = $bindable(),
		pane = $bindable(),
		paneId = $bindable(),
		clientHeight = $bindable()
	} = $props();

	let selectedSub: Sub = $state(NullSub());
	let PLAN_SUBSCRIBER_ID: string = uuid4();
	let subsMap: Map<string, Sub> = new Map<string, Sub>();
	let subsList: Sub[] = $state([]);

	function onReturnPlanCleanup() {
		delete pane.buffer.bag.navReadings;
	}

	function navReadingsToCompletedReadings(nr: NavReadings): CompletedReadings {
		return {
			id: `${nr.subID}/${nr.subNestedReadingsIndex}`,
			index: nr.subNestedReadingsIndex,
			subID: nr.subID,
			version: 0
		};
	}

	async function recordCompletedReading(cr: CompletedReadings) {
		await readingsApi.put(cr);
		plansPubSubService.putReading(cr, cr.subID);
	}

	function updateSelectedSub(nr: NavReadings, cr: CompletedReadings) {
		let sub = subsMap.get(nr.subID);
		if (!sub) {
			return;
		}

		sub.completedReadings.set(nr.subNestedReadingsIndex, cr);
		sub.nextReadingsIndex = subsEnricherService.getNextReadingIndex(
			Object.keys(sub.completedReadings).map((v) => parseInt(v))
		);
		selectedSub = sub;
	}

	async function onReturnPlan() {
		let nr: NavReadings = pane.buffer.bag?.navReadings;
		if (nr) {
			let cr = navReadingsToCompletedReadings(nr);
			await recordCompletedReading(cr);
			updateSelectedSub(nr, cr);
			onReturnPlanCleanup();
		}
	}

	async function onGetAllSubs(data: any) {
		if (data) {
			subsMap = data.subs;
			subsList.length = 0;
			subsMap
				.values()
				.toArray()
				.sort((a: any, b: any) => a.dateCreated - b.dateCreated)
				.forEach((s: any) => subsList.push(s));

			await onReturnPlan();
		}
	}

	onDestroy(() => {
		plansPubSubService.unsubscribe(PLAN_SUBSCRIBER_ID);
	});

	onMount(() => {
		plansPubSubService.subscribe(
			'getAllSubs',
			onGetAllSubs,
			PLAN_SUBSCRIBER_ID
		);
		plansPubSubService.getAllSubs();
	});
</script>

{#if plansDisplay === PLANS_VIEWS.SUBS_LIST}
	<SubsList
		bind:paneId
		bind:clientHeight
		bind:pane
		bind:plansDisplay
		bind:selectedSub
		bind:subsList
	></SubsList>
{:else if plansDisplay === PLANS_VIEWS.SUBS_ACTIONS}
	<SubsAction bind:plansDisplay bind:pane bind:clientHeight paneId></SubsAction>
{:else if plansDisplay === PLANS_VIEWS.SUBS_DETAILS}
	<SubsDetails
		paneId
		bind:clientHeight
		bind:pane
		bind:plansDisplay
		bind:selectedSub
	></SubsDetails>
{/if}
