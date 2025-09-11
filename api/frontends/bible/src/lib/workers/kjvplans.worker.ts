import { read } from '$app/server';
import { chapterApi } from '$lib/api/chapters.api';
import { notesApi } from '$lib/api/notes.api';
import { plansApi } from '$lib/api/plans.api';
import { readingsApi } from '$lib/api/readings.api';
import { subsApi } from '$lib/api/subs.api';
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

let plans: any = {}
let subs: any = {}
let readings: any = {}

let booknames: any = {}


function parseReadingEntries(reading: any): any[] {
	let entries = []
	let readingGroup = reading.split(';')

	for (let i = 0; i < readingGroup.length; i++) {
		let bcv = readingGroup[i].split('/')
		let bookName = booknames['booknamesById'][bcv[0]]
		let chapter = bcv[1]
		let verses = bcv[2]
		let entry = {
			bookName: bookName,
			bookID: bcv[0],
			chapter: chapter,
			verses: verses,
			chapterKey: readingGroup[i].replaceAll('/', '_')
		}
		entries.push(entry)
	}
	return entries
}

function parsePlanReadings(planReadings: any): any[] {
	let readings = []
	for (let i = 0; i < planReadings.length; i++) {
		let entries = parseReadingEntries(planReadings[i])
		readings.push(entries)
	}
	return readings
}

async function parsePlans() {
	let chachedPlans = await plansApi.gets()
	for (let i = 0; i < chachedPlans.length; i++) {
		let plan = chachedPlans[i]
		let planReadings = plan.readings
		readings = parsePlanReadings(planReadings)
		plan.readings = readings
		await plansDocument.addAsync(plan.id, plan);
		plans[plan.id] = plan
	}
}


function getNextReadingIndex(readingIndexes: number[]): number {
		readingIndexes.sort((a: number,b: number)=>  a - b )

		let nextReadingIndex = 0
		for(let j = 0; j < readingIndexes.length; j++){
			if (readingIndexes[j] != j){
				return nextReadingIndex
			} 
			nextReadingIndex = j + 1
		}

		return nextReadingIndex
}

async function addReadingsToSubs() {
	let subKeys = Object.keys(subs)
	for (let i = 0; i < subKeys.length; i++) {
		let sub = subs[subKeys[i]]
		const results = await readingsDocument.searchAsync(sub.id, {
			index: ['subID'],
		});
		let filteredReadings: any = {}
		let readingIndexes: number[] = []
		results.forEach((r) => {
			r.result.forEach((id) => {
				let index = readings[id].index
				filteredReadings[index] = readings[id];
				readingIndexes.push(index)
			});
			sub.readings = filteredReadings
		});
		let plan  = plans[sub.planID]
		sub.plan = plan
		sub.nextReadingIndex = getNextReadingIndex(readingIndexes)
		sub.percentCompleted = Math.ceil(readingIndexes.length / sub.plan.readings.length * 100)

		for (let j=0;j < sub.plan.readings.length; j++){
			let totalVerses = 0
			for (let k=0; k< sub.plan.readings[j].length; k++){
				let split = sub.plan.readings[j][k].verses.split('-')
				totalVerses += parseInt(split[1]) -  parseInt(split[0]) + 2 
			}
			sub.plan.readings[j].totalVerses = totalVerses
		}
	}
}

async function init() {
	booknames = await chapterApi.getBooknames()
	await parsePlans()

	let cachedSubs = await subsApi.gets()
	for (let i = 0; i < cachedSubs.length; i++) {
		let s = cachedSubs[i]
		await subsDocument.addAsync(s.id, s);
		subs[s.id] = s
	}

	// CORE NOTE: Reading ids are composite priamry keys subID & id
	// id is just the index in of the reading plan. FlexSearch id 
	// is <subid>/<id> for a reading
	let cachedReadings = await readingsApi.gets()
	for (let i = 0; i < cachedReadings.length; i++) {
		let r = cachedReadings[i]
		await readingsDocument.addAsync(r.id, r);
		readings[r.id] = r
	}

	await addReadingsToSubs()

	getAllPlans();
	getAllSubs()
}

function addPlan(planID: string, plan: any) {
	plans[planID] = plan;
	plansDocument.add(planID, plan);
	getAllPlans();
}

function deletePlan(planID: string) {
	delete plans[planID];
	plansDocument.remove(planID);
	getAllPlans();
}


async function addSubs(subID: string, sub: any) {
	subs[subID] = sub;
	subsDocument.add(subID, sub);
	await addReadingsToSubs()
	getAllSubs();
}

function deleteSub(subID: string) {
	delete subs[subID];
	subsDocument.remove(subID);
	getAllSubs();
}

async function putReading(data: any, subID: any) {
	await readingsDocument.addAsync(data.id, data)
	readings[data.id] = data
	subs[subID].readings[data.index] = data
	addReadingsToSubs()
}

async function addReadings(readingID: string, reading: any) {
	readings[readingID] = reading;
	readingsDocument.add(readingID, reading);
	await addReadingsToSubs()
}

async function deleteReadings(readingID: string) {
	delete subs[readingID];
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
	postMessage({ id: 'getAllPlans', plans: plans });
}


function getAllSubs() {
	postMessage({ id: 'getAllSubs', subs: subs });
}


function getAllReadings() {
	postMessage({ id: 'getAllReadings', readings: readings });
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

init();
