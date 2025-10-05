import { sleep } from './sleep';

async function findElement(id: string): Promise<HTMLElement | null> {
	let el = document.getElementById(id);
	let retriesMax = 10;
	let count = 0;
	while (!el && count != retriesMax) {
		el = document.getElementById(id);
		await sleep(1000);
		count++;
	}

	if (count === 10) {
		return null;
	}

	return el;
}

export function attachEvents(
	id: string,
	event: string,
	fn: EventListenerOrEventListenerObject
) {
	setTimeout(async () => {
		let el = await findElement(id);
		el?.addEventListener(event, fn);
	}, 250);
}

export type ScrollToViewFunction = (el: HTMLElement) => void;

export function scrollTo(id: string, fn: Function) {
	setTimeout(async () => {
		let el = await findElement(id);
		if (!el) {
			return;
		}
		el?.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
			inline: 'nearest'
		});

		fn(el);
	}, 50);
}
