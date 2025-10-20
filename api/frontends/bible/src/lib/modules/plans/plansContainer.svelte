<script lang="ts">
	import SubsView from './subscription/subsView.svelte';
	import NextReadings from './nextReadings/nextReadings.svelte';
	import Discover from './discover/discover.svelte';
	import { onMount } from 'svelte';
	import uuid4 from 'uuid4';
	import type { Pane } from '$lib/models/pane.model';
	import {
		NEXT_MAX_VIEW_ID,
		PLANS_MAX_VIEW_ID,
		PLANS_VIEWS,
		SUBS_MAX_VIEW_ID
	} from '$lib/models/plans.model';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';

	// =============================== BINDINGS ================================
	let {
		paneID = $bindable<string>(),
		pane = $bindable<Pane>(),
		containerHeight = 'height: 100vh;',
		containerWidth = $bindable<string>()
	} = $props();

	// ================================== VARS =================================

	let id = uuid4();
	let plansDisplay: PLANS_VIEWS = $state(PLANS_VIEWS.SUBS_LIST);
	let clientHeight = $state(0);

	// =============================== LIFECYCLE ===============================

	onMount(() => {
		let plan = pane?.buffer?.bag?.navReadings;
		if (plan) {
			plansDisplay = plan.returnView;
		} else {
			plansDisplay = PLANS_VIEWS.SUBS_LIST;
		}
	});
</script>

{#if plansDisplay < PLANS_MAX_VIEW_ID}
	<Discover bind:plansDisplay bind:pane bind:paneID bind:clientHeight
	></Discover>
{:else if plansDisplay < SUBS_MAX_VIEW_ID}
	<SubsView bind:plansDisplay bind:pane bind:paneID bind:clientHeight
	></SubsView>
{:else if plansDisplay < NEXT_MAX_VIEW_ID}
	<NextReadings bind:plansDisplay bind:pane bind:clientHeight></NextReadings>
{/if}
