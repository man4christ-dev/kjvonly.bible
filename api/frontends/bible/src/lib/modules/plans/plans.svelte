<script lang="ts">
	import { paneService } from '$lib/services/pane.service.svelte';
	import { plansService } from '$lib/services/plans.service';
	import { onMount } from 'svelte';
	import uuid4 from 'uuid4';

	let { containerHeight, paneId } = $props();

	let readingSearchID = uuid4();

	let plans: any = $state({});
	let subs: any = $state({});
	let todaysReadings: any = $state([]);

	function onGetAllSubs(data: any) {
		if (data) {
			subs = data.subs;
		}
		console.log(data.subs);
		updateTodays();
	}

	function onGetAllPlans(data: any) {
		if (data) {
			plans = data.plans;
		}

		console.log(data.plans);
	}

	function updateTodays() {
		let tr = [];
		let subKeys = Object.keys(subs);
		for (let i = 0; i < subKeys.length; i++) {
			let sub = subs[subKeys[i]];
			let plan = plans[sub.planID];

			if (plan.readings.length - 1 > sub.nextReadingIndex) {
				tr.push({
					reading: plan.readings[sub.nextReadingIndex],
					planDateCreated: plan.dateCreated ? plan.dateCreated : Date.now(),
					name: plan.name,
					percentComplete: Math.ceil(sub.readingsCompleted / plan.readings.length * 100)
				});
			}
		}

		todaysReadings.length = 0;
		todaysReadings.push(...tr);
	}

	let subID = '00000000-0000-0000-0000-000000000000';

	onMount(() => {
		plansService.subscribe('getAllPlans', onGetAllPlans);
		plansService.getAllPlans();

		plansService.subscribe('getAllSubs', onGetAllSubs);
		plansService.getAllSubs();
	});

	let clientHeight = $state(0);
	let headerHeight = $state(0);
</script>

{#snippet today()}
	<div class="w-full">
		{#if todaysReadings.length > 0}
			{#each todaysReadings as t}
				<div
					class="col-2 flex w-full flex-col p-2 text-base hover:cursor-pointer hover:bg-neutral-100"
				>
					<div class="flex">
						<span class="pb-2 text-2xl">{t.name}</span>
						<span class="flex-grow"></span>
						<span class="text-support-a-500">{t.percentComplete}%</span>
						
					</div>

					<table class="table-fixed">
						<tbody>
							{#each t.reading as r}
								<tr>
									<td class="w-0 pe-3">{r.bookName}</td>
									<td>{r.chapter}:{r.verses}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/each}
		{/if}
	</div>
{/snippet}

<div bind:clientHeight style={containerHeight} class="overflow-hidden">
	<div class="flex flex-col items-center">
		<header
			bind:clientHeight={headerHeight}
			class="sticky top-0 w-full flex-col border-b-2 bg-neutral-100 text-neutral-700 md:max-w-lg"
		>
			<div class="flex w-full justify-end">
				<button
					aria-label="close"
					onclick={() => {
						paneService.onDeletePane(paneService.rootPane, paneId);
					}}
					class="h-12 w-12 px-2 pt-2 text-neutral-700"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
						<path
							class="fill-neutral-700"
							d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M17,15.59L15.59,17L12,13.41L8.41,17L7,15.59 L10.59,12L7,8.41L8.41,7L12,10.59L15.59,7L17,8.41L13.41,12L17,15.59z"
						/>
					</svg>
				</button>
			</div>
		</header>

		<div class="w-full max-w-lg">
			<div
				style="height: {clientHeight - headerHeight}px"
				class="w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
			>
				{@render today()}
			</div>
		</div>
	</div>
</div>