<script lang="ts">
	import Header from '../components/header.svelte';
	import { paneService } from '$lib/services/pane.service.svelte';
	import { PLANS_VIEWS, type Sub } from '$lib/models/plans.model';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import BufferBody from '$lib/components/bufferBody.svelte';
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import Close from '$lib/components/svgs/close.svelte';
	import Menu from '$lib/components/svgs/menu.svelte';

	// =============================== BINDINGS ================================
	let {
		plansDisplay = $bindable<string>(),
		pane = $bindable(),
		paneID = $bindable(),
		clientHeight = $bindable(),
		selectedSub = $bindable<Sub>(),
		subsList = $bindable<Sub[]>()
	} = $props();

	// ================================== VARS =================================

	let headerHeight = $state(0);

	// ============================== CLICK FUNCS ==============================

	function onSubClicked(sub: any) {
		selectedSub = sub;
		plansDisplay = PLANS_VIEWS.SUBS_DETAILS;
	}

	function onClosePlansList() {
		paneService.onDeletePane(paneService.rootPane, paneID);
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
				<span class="pb-2 text-2xl">{s.name}</span>
				<span class="flex-grow"></span>
				<span class="text-support-a-500">{s.percentCompleted}%</span>
			</div>

			<div class="text-md">
				<p class="truncate text-left">{s.description}</p>
			</div>
		</button>
	{/each}
{/snippet}

{#snippet header()}
	<div class="grid w-full grid-cols-5 place-items-center">
		<snap class=""></snap>
		<span></span>
		<span>My Plans</span>

		<KJVButton
			classes=""
			onClick={() => {
				plansDisplay = PLANS_VIEWS.SUBS_ACTIONS;
			}}
		>
			<Menu></Menu>
		</KJVButton>

		<KJVButton classes="" onClick={onClosePlansList}>
			<Close></Close>
		</KJVButton>
	</div>
{/snippet}

<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		{@render header()}
	</BufferHeader>
	<BufferBody bind:clientHeight bind:headerHeight>
		{@render subsListView()}
	</BufferBody>
</BufferContainer>
