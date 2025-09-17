import { read } from '$app/server';
import { chapterApi } from '$lib/api/chapters.api';
import { notesApi } from '$lib/api/notes.api';
import { plansApi } from '$lib/api/plans.api';
import { readingsApi } from '$lib/api/readings.api';
import { subsApi } from '$lib/api/subs.api';
import type { CompletedReading, Plan, PlanReading, Sub } from '$lib/modules/plans/models';
import { bibleDB, PLANS, SEARCH } from '$lib/storer/bible.db';
import { extractBookChapter } from '$lib/utils/chapter';
import { sleep } from '$lib/utils/sleep';
import FlexSearch, { type Id } from 'flexsearch';


async function waitForSearchIndex(): Promise<boolean> {
	while (1) {
		let searchIndex = await bibleDB.getValue(SEARCH, 'v1');
		if (searchIndex) {
			return true;
		}
		await sleep(1000);
	}
	return false;
}

let plansDocument = new FlexSearch.Document({
	document: {
		id: 'id',
		index: []
	}
});

let subsDocument = new FlexSearch.Document({
	document: {
		id: 'id',
		index: []
	}
});

let readingsDocument = new FlexSearch.Document({
	document: {
		id: 'id',
		index: ['subID']
	}
});

let plans: Map<string, Plan> = new Map()
let subs: Map<string, Sub> = new Map()
let readings: any = {}

let booknames: any = {}


/**
 * Snag the book and return a list of {@link PlanReading}
 * @param anthology semi-colin delimited string of bcvs (book, chapter, verses)
 * @returns 
 */
function parseAnthology(anthology: any): any[] {
	let parsedBcvs: PlanReading[] = []
	let bcvs = anthology.split(';')

	for (let i = 0; i < bcvs.length; i++) {
		let bcv = bcvs[i].split('/')
		let bookName = booknames['booknamesById'][bcv[0]]
		let chapter = bcv[1]
		let verses = bcv[2]
		let parsedBcv: PlanReading = {
			bookName: bookName,
			bookID: bcv[0],
			chapter: chapter,
			verses: verses,
			chapterKey: bcvs[i].replaceAll('/', '_')
		}
		parsedBcvs.push(parsedBcv)
	}
	return parsedBcvs
}

/**
 * 
 * @param anthologies
 * @returns 
 */
function parseAnthologies(anthologies: any): any[] {
	let parsedAnthologies = []
	for (let i = 0; i < anthologies.length; i++) {
		let anthology = parseAnthology(anthologies[i])
		parsedAnthologies.push(anthology)
	}
	return parsedAnthologies
}


/**
 * Retrieves the the cached plans and and parses the anthologies. 
 */
async function parsePlanAnthologies() {
	let cachedPlans: any[] = await plansApi.gets()
	for (let i = 0; i < cachedPlans.length; i++) {
		let plan = cachedPlans[i]
		let anthologies = plan.readings
		plan.readings = parseAnthologies(anthologies)
		await plansDocument.addAsync(plan.id, plan);
		plans.set(plan.id, plan)
	}
}

/**
 * Helper function to get next anthology index in a subscription.
 * 
 * @param completedAnthologies the completed anthologies in a subscription
 * @returns next anthology index in subscription that is incomplete
 */
function getNextAnthologyIndex(completedAnthologies: number[]): number {
	completedAnthologies.sort((a: number, b: number) => a - b)

	let nextAnthologyIndex = 0
	for (let i = 0; i < completedAnthologies.length; i++) {
		if (completedAnthologies[i] != i) {
			return nextAnthologyIndex
		}
		nextAnthologyIndex = i + 1
	}

	return nextAnthologyIndex
}

async function addReadingsToSubs() {
	let subKeys = subs.keys().toArray()
	for (let i = 0; i < subKeys.length; i++) {
		let sub = subs.get(subKeys[i])
		if (!sub){
			return
		}
		const results = await readingsDocument.searchAsync(sub.id, {
			index: ['subID'],
		});
		let completedReadings: Map<number, CompletedReading> = new Map()
		let readingIndexes: number[] = []
		sub.readings = new Map()
		results.forEach((r) => {
			r.result.forEach((id) => {
				let index = readings[id].index
				completedReadings.set(index, readings[id]);
				readingIndexes.push(index)
			});
			// TODO sub readings is tracked readings.
			sub.readings = completedReadings
		});
		sub.nextReadingIndex = getNextAnthologyIndex(readingIndexes)
		
		let plan = plans.get(sub.planID)
		if (!plan){
			continue
		}
		sub.plan = plan
		sub.percentCompleted = Math.ceil(readingIndexes.length / sub.plan.readings.length * 100)

		for (let j = 0; j < sub.plan.readings.length; j++) {
			let totalVerses = 0
			for (let k = 0; k < sub.plan.readings[j].length; k++) {
				let split = sub.plan.readings[j][k].verses.split('-')
				totalVerses += parseInt(split[1]) - parseInt(split[0]) + 2
			}
			sub.plan.readings[j].totalVerses = totalVerses
		}
	}
}

async function init() {
	booknames = await chapterApi.getBooknames()
	await parsePlanAnthologies()

	let cachedSubs: Sub[] = await subsApi.gets()
	for (let i = 0; i < cachedSubs.length; i++) {
		let s = cachedSubs[i]
		await subsDocument.addAsync(s.id, s);
		subs.set(s.id, s)
	}

	// CORE NOTE: Reading ids are composite priamry keys subID & id
	// id is just the index in of the reading plan. FlexSearch id 
	// is <subid>/<id> for a reading
	let cachedReadings: CompletedReading[] = await readingsApi.gets()
	for (let i = 0; i < cachedReadings.length; i++) {
		let r = cachedReadings[i]
		await readingsDocument.addAsync(r.id, r);
		readings[r.id] = r
	}

	await addReadingsToSubs()

	hasInitialized = true
	getAllPlans();
	getAllSubs()
}

function addPlan(planID: string, plan: any) {
	plans.set(planID, plan);
	plansDocument.add(planID, plan);
	getAllPlans();
}

function deletePlan(planID: string) {
	plans.delete(planID);
	plansDocument.remove(planID);
	getAllPlans();
}

async function addSubs(subID: string, sub: any) {
	subs.set(subID, sub);
	subsDocument.add(subID, sub);
	await addReadingsToSubs()
	getAllSubs();
}

function deleteSub(subID: string) {
	subs.delete(subID);
	subsDocument.remove(subID);
	getAllSubs();
}

async function putReading(data: any, subID: any) {
	await readingsDocument.addAsync(data.id, data)
	readings[data.id] = data
	subs.get(subID)?.readings.set(data.index, data)
	addReadingsToSubs()
}

async function addReadings(readingID: string, reading: any) {
	readings[readingID] = reading;
	readingsDocument.add(readingID, reading);
	await addReadingsToSubs()
}

async function deleteReadings(readingID: string) {
	subs.delete(readingID);
	readingsDocument.remove(readingID);
	await addReadingsToSubs()
}


async function search(id: string, searchTerm: string, indexes: string[], flexDocument: any, map: any) {
	const results = await flexDocument.searchAsync(searchTerm, {
		index: indexes
	});

	let filtered: any = {};
	results.forEach((r: any) => {
		r.result.forEach((id: any) => {
			filtered[id] = map[id];
		});
	});

	if (Object.keys(filtered).length > 0) {
		postMessage({ id: id, results: filtered });
	}
}

function getAllPlans() {
	if (hasInitialized) {
		postMessage({ id: 'getAllPlans', plans: plans });
	}
}


function getAllSubs() {
	if (hasInitialized) {
		postMessage({ id: 'getAllSubs', subs: subs });
	}
}


function getAllReadings() {
	if (hasInitialized) {
		postMessage({ id: 'getAllReadings', readings: readings });
	}
}

onmessage = async (e) => {
	switch (e.data.action) {
		case 'init':
			await init();
			break;
		case 'addPlan':
			addPlan(e.data.planID, e.data.plan);
			break;
		case 'deletePlan':
			deletePlan(e.data.planID);
			break;
		case 'searchPlans':
			await search(e.data.id, e.data.text, e.data.indexes, plansDocument, plans);
			break;
		case 'searchSubs':
			await search(e.data.id, e.data.text, e.data.indexes, subsDocument, subs);
			break;
		case 'searchReadings':
			await search(e.data.id, e.data.text, e.data.indexes, readingsDocument, readings);
			break;
		case 'getAllPlans':
			getAllPlans();
			break;
		case 'getAllSubs':
			getAllSubs();
			break;
		case 'putReading':
			putReading(e.data.data, e.data.subID);
			break;
	}
};

/**
 * hasInitialized is checked before returning any uninitialzed data
 * to users onmessage. A subscriber could request data before
 * initialization is complte.
 */
let hasInitialized = false
init();
