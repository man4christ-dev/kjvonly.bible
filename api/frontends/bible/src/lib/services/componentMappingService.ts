import { Modules as modules } from '$lib/models/modules.model';
import BibleContainer from '$lib/modules/bible/bibleContainer.svelte';
import UserGuide from '$lib/modules/guide/userGuide.svelte';
import Login from '$lib/modules/login/login.svelte';
import Modules from '$lib/modules/modules/modules.svelte';
import Notes from '$lib/modules/notes/notes.svelte';
import PlansContainer from '$lib/modules/plans/plansContainer.svelte';
import RefsContainer from '$lib/modules/refs/refsContainer.svelte';
import Settings from '$lib/modules/settings/settings.svelte';
import SettingsContainer from '$lib/modules/settings/settingsContainer.svelte';
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
				return BibleContainer;
			case modules.STRONGS:
				return RefsContainer;
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
			case modules.SETTINGS:
				return SettingsContainer;
			case modules.PLANS:
				return PlansContainer;
		}

		return BibleContainer;
	}
}

export let componentMapping = new ComponentMapping();
