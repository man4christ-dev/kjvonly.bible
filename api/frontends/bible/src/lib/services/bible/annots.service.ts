import { annotsApi } from '$lib/api/annots.api';
import { newAnnotation, type Annotations } from '$lib/models/bible.model';

export class AnnotsService {
	async get(bibleLocationRef: string): Promise<Annotations> {
		try {
			return await annotsApi.getAnnotations(bibleLocationRef);
		} catch (err: any) {}

		return newAnnotation();
	}
}

export const annotsService = new AnnotsService();
