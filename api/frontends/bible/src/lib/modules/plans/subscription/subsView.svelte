<script lang="ts">
	import { completedReadingsApi } from '$lib/api/completedReadings';
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
	import type { Pane } from '$lib/models/pane.model';
	import { completedReadingsService } from '$lib/services/plans/completedReadings.service';

	let {
		plansDisplay = $bindable(),
		pane = $bindable(),
		paneId = $bindable(),
		clientHeight = $bindable()
	} = $props();

	let selectedSub: Sub = $state(NullSub());
	let PLAN_SUBSCRIBER_ID: string = uuid4();
	let subsByID: Map<string, Sub> = new Map<string, Sub>();
	let subs: Sub[] = $state([]);

	async function onReturnPlan() {
		let nr: NavReadings = pane.buffer.bag?.navReadings;
		if (nr) {
			let cr = completedReadingsService.navReadingsToCompletedReadings(nr);
			await completedReadingsService.recordCompletedReading(cr);
			selectedSub = completedReadingsService.updateSelectedSub(
				subsByID,
				nr,
				cr
			);
			completedReadingsService.onReturnPlanCleanup(pane);
		}
	}

	async function onGetAllSubs(data: any) {
		// TODO add type
		if (data) {
			subsByID = data.subs;
			subs.length = 0;
			subsByID
				.values()
				.toArray()
				.sort((a: any, b: any) => a.dateCreated - b.dateCreated)
				.forEach((s: any) => subs.push(s));

			await onReturnPlan();
		}
	}

	onDestroy(() => {
		plansPubSubService.unsubscribe(PLAN_SUBSCRIBER_ID);
	});

	onMount(() => {
		plansPubSubService.subscribe(
			'getAllSubs', // TODO make an enum
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
		bind:subsList={subs}
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
