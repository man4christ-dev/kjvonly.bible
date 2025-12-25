import { type Settings, newSettings } from '../models/settings.model';

/**
 * Settings apply users settings to DOM. On update the settings module will
 * call this service to update the DOM with desired settings e.g. color, font
 */
class SettingsService {
  subscribers: any[] = [];
  constructor() {
  }


  subscribe(id: any, fn: any) {
    this.subscribers.push({ id: id, fn: fn });
  }

  unsubscribe(subID: any) {
    let tmpSubscribers: any = [];
    this.subscribers.forEach((s) => {
      if (s.subID !== subID) {
        tmpSubscribers.push();
      }
    });
    this.subscribers = tmpSubscribers;
  }


  applySettings() {
    let cs = this.getSettings();
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

    this.subscribers.forEach((s) => {
      s.fn(cs);
    });

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
