<script lang="ts">
	import SubsView from './subscription/subsView.svelte';
	import NextReading from './nextReading/nextReading.svelte';
	import { PLANS_VIEWS } from './models';
	import Discover from './discover/discover.svelte';
	import { onMount } from 'svelte';
	import uuid4 from 'uuid4';

	let id = uuid4();
	let {
		paneId = $bindable<string>(),
		pane = $bindable(),
		containerHeight = $bindable(),
		containerWidth = $bindable()
	} = $props();

	let plansDisplay: string = $state('');
	let clientHeight = $state(0);

	onMount(() => {
		let plan = pane?.buffer?.bag?.plan;
		if (plan) {
			plansDisplay = plan.returnView;
		} else {
			plansDisplay = PLANS_VIEWS.SUBS_LIST;
		}
	});
</script>

<div class="kjvonly-noselect overflow-hidden">
	<div {id} style="{containerHeight} {containerWidth}">
		<div bind:clientHeight style={containerHeight} class="overflow-hidden">
			<div class="flex flex-col items-center">
				{#if plansDisplay?.startsWith('PLANS')}
					<Discover bind:plansDisplay bind:pane bind:paneId bind:clientHeight></Discover>
				{:else if plansDisplay?.startsWith('SUBS')}
					<SubsView bind:plansDisplay bind:pane bind:paneId bind:clientHeight></SubsView>
				{:else if plansDisplay?.startsWith('NEXT')}
					<NextReading bind:plansDisplay bind:pane bind:clientHeight></NextReading>
				{/if}
			</div>
		</div>
	</div>
</div>
