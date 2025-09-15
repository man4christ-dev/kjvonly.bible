<script lang="ts">
	import { readingsApi } from '$lib/api/readings.api';
	import { plansService } from '$lib/services/plans.service';
	import { getNextReadingIndex } from '$lib/utils/plan';
	import { sleep } from '$lib/utils/sleep';
	import { onDestroy, onMount } from 'svelte';
	import Header from '../components/header.svelte';
	import { type NavPlan, type CompletedReading, type Sub, NullSub, PLANS_VIEWS } from '../models';
	import uuid4 from 'uuid4';
	import { paneService } from '$lib/services/pane.service.svelte';

	let {
		plansDisplay = $bindable(),
		pane = $bindable(),
		paneId,
		clientHeight = $bindable(),
		selectedSub = $bindable(),
		subsList = $bindable()
	} = $props();

	let headerHeight = $state(0);

	function onSubClicked(sub: any) {
		selectedSub = sub;
		plansDisplay = PLANS_VIEWS.SUBS_DETAILS;
	}

	function onClosePlansList() {
		paneService.onDeletePane(paneService.rootPane, paneId);
	}
</script>

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

<Header
	bind:headerHeight
	title="My Plans"
	onClose={onClosePlansList}
	bind:plansDisplay
	menuDropdownToggleViews={[PLANS_VIEWS.SUBS_ACTIONS, PLANS_VIEWS.SUBS_LIST]}
></Header>

<div class="w-full max-w-lg">
	<div
		style="height: {clientHeight - headerHeight}px"
		class="w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
	>
		{@render subsListView()}
	</div>
</div>
