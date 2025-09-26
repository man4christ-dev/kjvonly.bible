<script lang="ts">
	import { completedReadingsApi } from '$lib/api/completedReadings';
	import { plansPubSubService } from '$lib/services/plans/plansPubSub.service';
	import { onDestroy, onMount } from 'svelte';
	import { PLANS_VIEWS } from '../models';
	import SubsAction from './subsAction.svelte';
	import SubsDetails from './subsDetails.svelte';
	import SubsList from './subsList.svelte';
	import uuid4 from 'uuid4';
	import { NullSub, type Sub, type NavReadings } from '$lib/models/plans.model';
	import type { Pane } from '$lib/models/pane.model';
	import { completedReadingsService } from '$lib/services/plans/completedReadings.service';

	// =============================== BINDINGS ================================

	let {
		plansDisplay = $bindable<string>(),
		pane = $bindable<Pane>(),
		paneId = $bindable<string>(),
		clientHeight = $bindable<string>()
	} = $props();

	// ================================== VARS =================================

	let selectedSub: Sub = $state(NullSub());
	let SUBSCRIBER_ID: string = uuid4();
	let subsByID: Map<string, Sub> = new Map<string, Sub>();
	let subs: Sub[] = $state([]);

	// =============================== LIFECYCLE ===============================

	onMount(() => {
		plansPubSubService.subscribe(
			'getAllSubs', // TODO make an enum
			onGetAllSubs,
			SUBSCRIBER_ID
		);
		plansPubSubService.getAllSubs();
	});

	onDestroy(() => {
		plansPubSubService.unsubscribe(SUBSCRIBER_ID);
	});

	// ================================ FUNCS ==================================

	/**
	 * Subscription func for getAllSubs. Anytime a sum is changed and published
	 * this function will be called with the updated Subs data
	 *
	 * @param data
	 */
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

			await processNavReadings();
		}
	}

	/**
	 * Necessary steps after a user completes a {@link Readings}.
	 */
	async function processNavReadings() {
		let nr: NavReadings = pane.buffer.bag?.navReadings;
		if (nr) {
			let cr = completedReadingsService.navReadingsToCompletedReadings(nr);
			await completedReadingsService.save(cr);
			selectedSub = completedReadingsService.updateSubMetadata(
				subsByID,
				nr,
				cr
			);
			completedReadingsService.cleanup(pane);
			completedReadingsService.notifyWorker(cr);
		}
	}
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
