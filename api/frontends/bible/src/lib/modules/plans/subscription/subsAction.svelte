<script lang="ts">
	import BufferBody from '$lib/components/bufferBody.svelte';
	import BufferContainer from '$lib/components/bufferContainer.svelte';
	import BufferHeader from '$lib/components/bufferHeader.svelte';
	import KJVButton from '$lib/components/buttons/KJVButton.svelte';
	import ArrowBack from '$lib/components/svgs/arrowBack.svelte';
	import { type Pane } from '$lib/models/pane.model';
	import { PLANS_VIEWS } from '$lib/models/plans.model';
	import ActionItemsList from '../components/actionItemsList.svelte';
	import Header from '../components/header.svelte';

	// =============================== BINDINGS ================================

	let {
		plansDisplay = $bindable<string>(),
		pane = $bindable<Pane>(),
		paneID = $bindable<string>(),
		clientHeight = $bindable<string>()
	} = $props();

	// ================================== VARS =================================

	let headerHeight = $state(0);

	let subsActionItems: any = {
		plans: () => {
			plansDisplay = PLANS_VIEWS.PLANS_LIST;
		},
		'next readings': () => {
			plansDisplay = PLANS_VIEWS.NEXT_LIST;
		}
	};
</script>

{#snippet header()}
	<div class="grid w-full grid-cols-5 place-items-center">
		<span class="flex w-full">
			<KJVButton
				classes=""
				onClick={() => {
					plansDisplay = PLANS_VIEWS.SUBS_LIST;
				}}
			>
				<ArrowBack></ArrowBack>
			</KJVButton>
			<span class="flex-1"></span>
		</span>
	</div>
{/snippet}
{#snippet body()}
	<ActionItemsList actionItems={subsActionItems}></ActionItemsList>
{/snippet}

<BufferContainer bind:clientHeight>
	<BufferHeader bind:headerHeight>
		{@render header()}
	</BufferHeader>
	<BufferBody bind:clientHeight bind:headerHeight>
		{@render body()}
	</BufferBody>
</BufferContainer>
