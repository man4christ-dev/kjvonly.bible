import { Modules as modules } from '$lib/models/modules.model';
import ChapterContainer from '$lib/modules/chapter/chapterContainer.svelte';
import UserGuide from '$lib/modules/guide/userGuide.svelte';
import Login from '$lib/modules/login/login.svelte';
import Modules from '$lib/modules/modules/modules.svelte';
import Notes from '$lib/modules/notes/notes.svelte';
import PlansContainer from '$lib/modules/plans/plansContainer.svelte';
import StrongsVersesRefs from '$lib/modules/refs/strongs-verses-refs/strongsVersesRefs.svelte';
import Search from '../modules/search/search.svelte';

/**
 * Component Mapping is responsible for converting the
 * string value of the component class.
 *
 */
export class ComponentMapping {
	/**
	 *
	 * @param module string of class to be returned
	 * @returns component class
	 */
	getComponent(module: modules): any {
		switch (module) {
			case modules.BIBLE:
				return ChapterContainer;
			case modules.STRONGS:
				return StrongsVersesRefs;
			case modules.SEARCH:
				return Search;
			case modules.MODULES:
				return Modules;
			case modules.NOTES:
				return Notes;
			case modules.USER_GUIDE:
				return UserGuide;
			case modules.LOGIN:
				return Login;
			case modules.PLANS:
				return PlansContainer;
		}

		return ChapterContainer;
	}
}

export let componentMapping = new ComponentMapping();
