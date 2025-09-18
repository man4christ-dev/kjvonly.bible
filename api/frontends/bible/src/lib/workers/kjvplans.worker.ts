import { chapterApi } from '$lib/api/chapters.api';
import { plansApi } from '$lib/api/plans.api';
import { readingsApi } from '$lib/api/readings.api';
import { subsApi } from '$lib/api/subs.api';
import { NullPlan, type CompletedReading, type Plan, type Readings, type Sub } from '$lib/modules/plans/models';
import FlexSearch, { type Id } from 'flexsearch';


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
	let readings: Readings[] = []
	for (let i = 0; i < planReadings.length; i++) {
		let entries = parseReadingEntries(planReadings[i])
		let p: Readings = {
			bcvs: entries
		}
		readings.push(p)

	}
	return readings
}

async function parsePlans() {
	let chachedPlans = await plansApi.gets()
	for (let i = 0; i < chachedPlans.length; i++) {
		let plan: Plan = chachedPlans[i]
		let planReadings = plan.readings
		plan.readings = parsePlanReadings(planReadings)
		await plansDocument.addAsync(plan.id, plan);
		plans.set(plan.id, plan)
	}
}


function getNextReadingIndex(readingIndexes: number[]): number {
	readingIndexes.sort((a: number, b: number) => a - b)

	let nextReadingIndex = 0
	for (let j = 0; j < readingIndexes.length; j++) {
		if (readingIndexes[j] != j) {
			return nextReadingIndex
		}
		nextReadingIndex = j + 1
	}

	return nextReadingIndex
}

function setNextReadingIndex(sub: Sub) {
	sub.nextReadingIndex = getNextReadingIndex(sub.completedReadings.keys().toArray())
}


async function getReadings(search: string, index: string[]): Promise<FlexSearch.SimpleDocumentSearchResultSetUnit[]>{
	return readingsDocument.searchAsync(search, {
		index: index
	});
}

async function setCompletedReadings(sub: Sub) {
	sub.completedReadings = new Map<number, CompletedReading>()
	let result = await getReadings(sub.id, ['subID'])
	result.forEach((r: FlexSearch.SimpleDocumentSearchResultSetUnit) => {
		r.result.forEach((id) => {
			sub.completedReadings.set(readings[id].index, readings[id]);
		});
	});
}

function setPlan(sub: Sub) {
	sub.plan = plans.get(sub.planID) || NullPlan()
}

function setPercentComplete(sub: Sub) {
	sub.percentCompleted = Math.ceil(sub.completedReadings.size / sub.plan.readings.length * 100)
}

function parseVerseGroup(grp: string): number[] {
	try {
		let startEndVerses = grp.split('-')
		return [parseInt(startEndVerses[0]), parseInt(startEndVerses[1])]
	} catch {
		console.log(`error parsing verse group ${grp}`)
	}
	return [0, 0]
}

function sumVerseGroup(grp: string): number {
	let [start, end] = parseVerseGroup(grp)
	const includeStartAndEndVerse = 2
	return end - start + includeStartAndEndVerse
}

function setTotalVerses(sub: Sub) {
	sub.plan.readings.forEach(r => {
		let totalVerses = r.bcvs
			.map(b => sumVerseGroup(b.verses))
			.reduce((a, b) => a + b)
		r.totalVerses = totalVerses
	})
}

async function addReadingsToSubs() {
	for (let [_, sub] of subs) {
		await setCompletedReadings(sub)
		setNextReadingIndex(sub)
		setPlan(sub)
		setPercentComplete(sub)
		setTotalVerses(sub)
	}
}

async function init() {
	booknames = await chapterApi.getBooknames()
	await parsePlans()

	let cachedSubs = await subsApi.gets()
	for (let i = 0; i < cachedSubs.length; i++) {
		let s = cachedSubs[i]
		await subsDocument.addAsync(s.id, s);
		subs.set(s.id, s)
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
	subs.get(subID)?.completedReadings.set(data.index, data)
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

let hasInitialized = false
init();
