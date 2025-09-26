import { completedReadingsApi } from '$lib/api/completedReadings';
import type { Pane } from '$lib/models/pane.model';
import {
	type NavReadings,
	type CompletedReadings,
	type Sub,
	NullSub
} from '$lib/models/plans.model';
import { plansPubSubService } from './plansPubSub.service';
import { subsEnricherService } from './subsEnricher.service';

export class CompletedReadingsService {
	onReturnPlanCleanup(pane: Pane) {
		delete pane.buffer.bag.navReadings;
	}

	navReadingsToCompletedReadings(nr: NavReadings): CompletedReadings {
		return {
			id: `${nr.subID}/${nr.subNestedReadingsIndex}`,
			index: nr.subNestedReadingsIndex,
			subID: nr.subID,
			version: 0
		};
	}

	async recordCompletedReading(cr: CompletedReadings) {
		await completedReadingsApi.put(cr);
		plansPubSubService.putReading(cr, cr.subID);
	}

	updateSelectedSub(
		subs: Map<string, Sub>,
		nr: NavReadings,
		cr: CompletedReadings
	): Sub {
		let sub = subs.get(nr.subID);
		if (!sub) {
			return NullSub();
		}

		sub.completedReadings.set(nr.subNestedReadingsIndex, cr);
		sub.nextReadingsIndex = subsEnricherService.getNextReadingIndex(
			Object.keys(sub.completedReadings).map((v) => parseInt(v))
		);

		return sub;
	}
}

export const completedReadingsService = new CompletedReadingsService();
