export interface Settings {
	fontSize: string;
	fontWeight: number;
	fontFamily: string;
	colorTheme?: string;
	isDarkTheme?: boolean;
}

export function newSettings(): Settings {
	return {
		fontSize: 'text-base',
		fontWeight: 400,
		fontFamily: 'sans',
		colorTheme: 'red',
		isDarkTheme: false
	};
}
