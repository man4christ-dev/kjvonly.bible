import { type Settings, newSettings } from '../models/settings.model';

class SettingsService {
	// TODO make this an enum
	VALID_COLOR_THEMES = ['red', 'light-blue', 'purple', 'cyan', 'pink'];

	setTheme(theme: string) {
		if (!this.VALID_COLOR_THEMES.includes(theme)) {
			theme = this.VALID_COLOR_THEMES[0];
		}

		let cs = this.getSettings();
		if (!cs) {
			return;
		}

		let html = document.getElementById('kjvonly-html');
		if (cs.isDarkTheme) {
			html?.setAttribute('data-theme', `color-theme-dark-${theme}`);
		} else {
			html?.setAttribute('data-theme', `color-theme-${theme}`);
		}

		html?.setAttribute('font-theme', cs.fontTheme);

		html?.setAttribute('style', `font-size: ${cs.fontSize}px;`);

		// TODO intentionally left this here for now
		// will delete if not needed.

		// let classes = [];
		// let currentClasses: string[] = [];
		// html?.classList.forEach((c) => {
		// 	currentClasses.push(c);
		// });

		// if (html) {
		// 	currentClasses.forEach((c: string) => {
		// 		html?.classList.remove(c);
		// 	});

		// 	classes.forEach((c) => {
		// 		html?.classList.add(c);
		// 	});
		//}
	}

	getSettings(): Settings {
		let cs = localStorage.getItem('settings');
		if (cs != null) {
			let settings: Settings | null = JSON.parse(cs);
			if (settings) {
				return settings;
			}
		}
		return newSettings();
	}
}

export let settingsService = new SettingsService();
