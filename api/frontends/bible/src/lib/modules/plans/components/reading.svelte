<script lang="ts">
	import type { PlanReading } from "../models";

    let {planReading=$bindable<PlanReading[]>()} = $props()
</script>

	<table class="table-fixed">
		<tbody>
			{#each planReading as r}
				<tr>
					<td class="pe-3 text-right text-nowrap">{r.bookName}</td>
					<td class="text-right">{r.chapter}:{r.verses}</td>
				</tr>
			{/each}
		</tbody>
	</table>
