import { type Settings, newSettings } from '../models/settings.model';

/**
 * Settings apply users settings to DOM. On update the settings module will
 * call this service to update the DOM with desired settings e.g. color, font
 */
class SettingsService {
	applySettings() {
		let cs = this.getSettings();
		if (!cs) {
			return;
		}

		let html = document.getElementById('kjvonly-html');
		if (cs.isDarkTheme) {
			html?.setAttribute('data-theme', `color-theme-dark-${cs.colorTheme}`);
		} else {
			html?.setAttribute('data-theme', `color-theme-${cs.colorTheme}`);
		}

		html?.setAttribute('font-family', cs.fontFamily);

		html?.setAttribute(
			'style',
			`font-size: ${cs.fontSize}px; font-weight: ${cs.fontWeight};`
		);
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
