import { chapterApi } from '$lib/api/chapters.api';
import { plansApi } from '$lib/api/plans.api';
import { readingsApi } from '$lib/api/readings.api';
import { subsApi } from '$lib/api/subs.api';
import { cachedPlanToPlan, NullPlan, type BCV, type CachedPlan, type CachedSub, type CompletedReading, type Plan, type Readings, type Sub } from '$lib/modules/plans/models';
import { setNextReadingIndex, setPercentComplete, setTotalVerses } from '$lib/utils/plan';
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
let readings: Map<string, CompletedReading> = new Map()

let booknames: any = {}


function decodeReadings(encodedReadings: string): BCV[] {
	return encodedReadings.split(';').map(r => {
		let bcv = r.split('/')
		return {
			bookName: booknames['booknamesById'][bcv[0]],
			bookID: parseInt(bcv[0]),
			chapter: parseInt(bcv[1]),
			verses: bcv[2],
			chapterKey: r.replaceAll('/', '_')
		}
	})
}

function parseEncodedReadings(encodedReadings: string[]): Readings[] {
	return encodedReadings.map((ers: string) => {
		return {
			bcvs: decodeReadings(ers),
			totalVerses: 0
		}
	})
}

async function addPlansToIndex(newPlans: Plan[]) {
	for (let p of newPlans) {
		await plansDocument.addAsync(p.id, p);
		plans.set(p.id, p)
	}
}

async function initializePlans() {
	let cachedPlans: CachedPlan[] = await plansApi.gets()
	let plans = cachedPlans.map((cp: CachedPlan) => {
		let plan: Plan = cachedPlanToPlan(cp)
		plan.nestedReadings = parseEncodedReadings(cp.readings)
		return plan
	})
	addPlansToIndex(plans)
}

async function getCompletedReadings(search: string, index: string[]): Promise<FlexSearch.SimpleDocumentSearchResultSetUnit[]> {
	return readingsDocument.searchAsync(search, {
		index: index
	});
}

async function setCompletedReadings(sub: Sub) {
	sub.completedReadings = new Map<number, CompletedReading>()
	let result = await getCompletedReadings(sub.id, ['subID'])
	result.forEach((r: FlexSearch.SimpleDocumentSearchResultSetUnit) => {
		r.result.forEach((id) => {
			let cr = readings.get(id.toString())
			if (cr) {
				sub.completedReadings.set(cr.index, cr);
			}
		});
	});
}

function setSubPlanData(sub: Sub) {
	let plan = plans.get(sub.planID) || NullPlan()
	sub.nestedReadings = plan.nestedReadings
	sub.description = plan.description
	sub.name = plan.name
}

async function addReadingsToSub(sub: Sub | undefined) {
	if (sub) {
		await setCompletedReadings(sub)
		setNextReadingIndex(sub)
		setSubPlanData(sub)
		setPercentComplete(sub)
		setTotalVerses(sub)
	}
}

async function addReadingsToSubs() {
	for (let [_, sub] of subs) {
		await addReadingsToSub(sub)
	}
}

async function init() {
	booknames = await chapterApi.getBooknames()
	await initializePlans()

	let cachedSubs: CachedSub[] = await subsApi.gets()
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
		readings.set(r.id,  r)
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
	readings.set(data.id, data)
	let sub = subs.get(subID)
	if (sub) {
		sub.completedReadings.set(data.index, data)
		await addReadingsToSub(sub)
	}
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
