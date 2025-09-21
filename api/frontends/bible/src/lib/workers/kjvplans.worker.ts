import { readingsApi } from '$lib/api/readings.api';
import { subsApi } from '$lib/api/subs.api';
import {  NullPlan, type CachedSub, type CompletedReading, type Plan, type Sub } from '$lib/modules/plans/models';
import { plansDecodeService } from '$lib/services/plansDecode.service';
import FlexSearch from 'flexsearch';

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

let completedReadingsDocument = new FlexSearch.Document({
	document: {
		id: 'id',
		index: ['subID']
	}
});

let plans: Map<string, Plan> = new Map()
let subs: Map<string, Sub> = new Map()
let completedReadings: Map<string, CompletedReading> = new Map()

//=================== PLANS =======================

async function initializePlans(newPlans: Plan[]) {
	for (let p of newPlans) {
		await plansDocument.addAsync(p.id, p);
		plans.set(p.id, p)
	}
}
//=================== SUB =======================

async function getCompletedReadings(search: string, index: string[]): Promise<FlexSearch.SimpleDocumentSearchResultSetUnit[]> {
	return completedReadingsDocument.searchAsync(search, {
		index: index
	});
}

async function setCompletedReadings(sub: Sub) {
	sub.completedReadings = new Map<number, CompletedReading>()
	let result = await getCompletedReadings(sub.id, ['subID'])
	result.forEach((r) => {
		r.result.forEach((id) => {
			let cr = completedReadings.get(id.toString())
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
		setSubPlanData(sub)
		plansDecodeService.setNextReadingIndex(sub)
		plansDecodeService.setPercentComplete(sub)
		plansDecodeService.setTotalVerses(sub)
	}
}

async function addReadingsToSubs() {
	for (let [_, sub] of subs) {
		await addReadingsToSub(sub)
	}
}

async function initializeSubs() {
	let cachedSubs: CachedSub[] = await subsApi.gets()
	for (let i = 0; i < cachedSubs.length; i++) {
		let s = cachedSubs[i]
		await subsDocument.addAsync(s.id, s);
		subs.set(s.id, s)
	}
}

// CORE NOTE: Reading ids are composite primary keys subID & id
// id is just the index in of the reading plan. FlexSearch id 
// is <subid>/<id> for a reading
async function initializeCompletedReadings() {
	let cachedReadings = await readingsApi.gets()
	for (let i = 0; i < cachedReadings.length; i++) {
		let r = cachedReadings[i]
		await completedReadingsDocument.addAsync(r.id, r);
		completedReadings.set(r.id, r)
	}
}

async function init() {
	let plans = await plansDecodeService.decodePlans()
	await initializePlans(plans)
	await initializeSubs()
	await initializeCompletedReadings()
	await addReadingsToSubs()

	hasInitialized = true
	publishPlans();
	publishSubs()
}

// ======================== PUB SUB ==========================

function addPlan(planID: string, plan: any) {
	plans.set(planID, plan);
	plansDocument.add(planID, plan);
	publishPlans();
}

function deletePlan(planID: string) {
	plans.delete(planID);
	plansDocument.remove(planID);
	publishPlans();
}

async function addSubs(subID: string, sub: any) {
	subs.set(subID, sub);
	subsDocument.add(subID, sub);
	await addReadingsToSubs()
	publishSubs();
}

function deleteSub(subID: string) {
	subs.delete(subID);
	subsDocument.remove(subID);
	publishSubs();
}

async function putReading(data: any, subID: any) {
	await completedReadingsDocument.addAsync(data.id, data)
	completedReadings.set(data.id, data)
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

function publishPlans() {
	if (hasInitialized) {
		postMessage({ id: 'getAllPlans', plans: plans });
	}
}


function publishSubs() {
	if (hasInitialized) {
		postMessage({ id: 'getAllSubs', subs: subs });
	}
}


function getAllReadings() {
	if (hasInitialized) {
		postMessage({ id: 'getAllReadings', readings: completedReadings });
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
			await search(e.data.id, e.data.text, e.data.indexes, completedReadingsDocument, completedReadings);
			break;
		case 'getAllPlans':
			publishPlans();
			break;
		case 'getAllSubs':
			publishSubs();
			break;
		case 'putReading':
			putReading(e.data.data, e.data.subID);
			break;
	}
};

let hasInitialized = false
init();
