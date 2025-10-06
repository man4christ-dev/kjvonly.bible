import { annotsApi } from '$lib/api/annots.api';
import {
	jsonToAnnots,
	newAnnotation,
	type Annotations
} from '$lib/models/bible.model';

export class AnnotsService {
	async get(bibleLocationRef: string): Promise<Annotations> {
		try {
			let jsonData = await annotsApi.getAnnotations(bibleLocationRef);
			jsonToAnnots(jsonData);
		} catch (err: any) {}

		return newAnnotation();
	}
}

export const annotsService = new AnnotsService();
