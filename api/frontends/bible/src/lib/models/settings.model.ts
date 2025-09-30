export interface Settings {
	fontSize: string;
	fontWeight: number;
	fontTheme: string;
	colorTheme?: string;
	isDarkTheme?: boolean;
}

export function newSettings(): Settings {
	return {
		fontSize: 'text-base',
		fontWeight: 400,
		fontTheme: 'sans',
		colorTheme: 'red',
		isDarkTheme: false
	};
}
