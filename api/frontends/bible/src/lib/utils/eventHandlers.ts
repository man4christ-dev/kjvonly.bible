import { sleep } from './sleep';

export async function attachEvents(
	id: string,
	event: string,
	fn: EventListenerOrEventListenerObject
) {
	setTimeout(async () => {
		let el = document.getElementById(id);
		let retriesMax = 10;
		let count = 0;
		while (!el && count != retriesMax) {
			el = document.getElementById(id);
			await sleep(1000);
			count++;
		}

		if (count === 10) {
			return;
		}

		el?.addEventListener(event, fn);
	}, 250);
}
