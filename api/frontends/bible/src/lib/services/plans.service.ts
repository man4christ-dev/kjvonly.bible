const plansWorker = new Worker(new URL('../workers/kjvplans.worker?worker', import.meta.url), {
	type: 'module'
});

export class PlansService {
	//todo unsubscribe
	subscribers: any[] = [];

	constructor() {
		plansWorker.onmessage = (e) => {
			this.subscribers.forEach((s) => {
				if (s.id === e.data.id) {
					s.fn(e.data);
				}
			});
		};
	}

	subscribe(id: any, fn: any, subID: any) {
		this.subscribers.push({ id: id, fn: fn, subID: subID });
	}

	unsubscribe(subID: any) {
		let tmpSubscribers: any = []
		this.subscribers.forEach((s) => {
			if (s.subID !== subID){
				tmpSubscribers.push()
			}
		});
		this.subscribers = tmpSubscribers
	}



	init() {
		plansWorker.postMessage({ action: 'init' });
	}

	getAllReadings() {
		plansWorker.postMessage({ action: 'getAllPlans', id: 'getAllReadings' });
	}

	putReading(data: any, subID: string) {
		plansWorker.postMessage({ action: 'putReading', id: 'putReading', data: data, subID: String });
	}

	getAllSubs() {
		plansWorker.postMessage({ action: 'getAllSubs', id: 'getAllSubs' });
	}

	getAllPlans() {
		plansWorker.postMessage({ action: 'getAllPlans', id: 'getAllPlans' });
	}
}

export let plansService = new PlansService()