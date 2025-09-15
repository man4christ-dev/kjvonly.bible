<script lang="ts">
	import ActionItemsList from '../components/actionItemsList.svelte';
	import Header from '../components/header.svelte';
	import { PLANS_VIEWS } from '../models';

	let {
		plansDisplay = $bindable(),
		pane = $bindable(),
		paneId,
		clientHeight = $bindable()
	} = $props();

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

<Header
	bind:headerHeight
	title="My Plans"
	onClose={undefined}
	bind:plansDisplay
	menuDropdownToggleViews={[PLANS_VIEWS.SUBS_LIST, PLANS_VIEWS.SUBS_ACTIONS]}
></Header>
<div class="flex w-full max-w-lg">
	<div
		style="max-height: {clientHeight - headerHeight}px; min-height: {clientHeight - headerHeight}px"
		class="flex w-full max-w-lg overflow-x-hidden overflow-y-scroll bg-neutral-50"
	>
		<ActionItemsList actionItems={subsActionItems}></ActionItemsList>
	</div>
</div>
