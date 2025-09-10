import {
READINGS,
UNSYNCED_READINGS
} from '$lib/storer/bible.db';
import { bibleStorer } from '$lib/storer/bible.storer';
import { offlineApi } from './offline.api';

const PATH = '/readings'
export class ReadignsApi {
	
	async put(data: any): Promise<any> {
		return await offlineApi.put(data, PATH, UNSYNCED_READINGS, READINGS);
	}

	async gets(): Promise<any> {
		let data: any = undefined;
		try {
			let unsyncedSubscription = await bibleStorer.getAllValue(UNSYNCED_READINGS);
			let syncedSubscriptions = await bibleStorer.getAllValue(READINGS);

			let concatSubscription: any = new Map()
			syncedSubscriptions.forEach((p: any) => {
				concatSubscription.set(p.id, p)
			})

			unsyncedSubscription.forEach((p: any) => {
				concatSubscription.set(p.id, p)
			})

			data = Array.from(concatSubscription.values());

		} catch (error) {
			console.log(`error getting all readigns from indexedDB: ${error}`);
		}
		return data;
	}

	async delete(id: string): Promise<any> {
		await offlineApi.delete(id, PATH, UNSYNCED_READINGS, READINGS);
	}
}

export let readingsApi = new ReadignsApi();
