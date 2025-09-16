<script lang="ts">
	import Header from '../components/header.svelte';
	import { PLANS_VIEWS } from '../models';
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
		<button
			onclick={() => onSubClicked(s)}
			class="col-2 flex w-full flex-col overflow-hidden p-2 text-base hover:cursor-pointer hover:bg-neutral-100"
			style="height: 100px"
		>
			<div class="flex w-full">
				<span class="pb-2 text-2xl">{s.plan.name}</span>
				<span class="flex-grow"></span>
				<span class="text-support-a-500">{s.percentCompleted}%</span>
			</div>

			<div class="text-md truncate ...">
				{#each s.plan.description as d}
					<span>&nbsp;</span><span>{d}</span>
				{/each}
			</div>
		</button>
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
