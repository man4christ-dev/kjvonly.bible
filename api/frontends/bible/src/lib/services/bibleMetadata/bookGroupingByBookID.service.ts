import type { BookGrouping } from '$lib/models/bible.model';

export class BookGroupingsService {
	bookGroups: { [bookID: string]: BookGrouping } = {
		'1': {
			name: 'Gen',
			group: 'law',
			bgcolor: 'bg-bg-law',
			textcolor: 'text-text-law'
		},
		'2': {
			name: 'Exo',
			group: 'law',
			bgcolor: 'bg-bg-law',
			textcolor: 'text-text-law'
		},
		'3': {
			name: 'Lev',
			group: 'law',
			bgcolor: 'bg-bg-law',
			textcolor: 'text-text-law'
		},
		'4': {
			name: 'Num',
			group: 'law',
			bgcolor: 'bg-bg-law',
			textcolor: 'text-text-law'
		},
		'5': {
			name: 'Deu',
			group: 'law',
			bgcolor: 'bg-bg-law',
			textcolor: 'text-text-law'
		},
		'6': {
			name: 'Jos',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'7': {
			name: 'Jud',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'8': {
			name: 'Rut',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'9': {
			name: '1Sa',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'10': {
			name: '2Sa',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'11': {
			name: '1Ki',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'12': {
			name: '2Ki',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'13': {
			name: '1Ch',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'14': {
			name: '2Ch',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'15': {
			name: 'Ezr',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'16': {
			name: 'Neh',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'19': {
			name: 'Est',
			group: 'history',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'22': {
			name: 'Job',
			group: 'poetry',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'23': {
			name: 'Psa',
			group: 'poetry',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'24': {
			name: 'Pro',
			group: 'poetry',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'25': {
			name: 'Ecc',
			group: 'poetry',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'26': {
			name: 'Son',
			group: 'poetry',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'29': {
			name: 'Isa',
			group: 'major prophets',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'30': {
			name: 'Jer',
			group: 'major prophets',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'31': {
			name: 'Lam',
			group: 'poetry',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'33': {
			name: 'Eze',
			group: 'major prophets',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'34': {
			name: 'Dan',
			group: 'major prophets',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'35': {
			name: 'Hos',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'36': {
			name: 'Joe',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'37': {
			name: 'Amo',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'38': {
			name: 'Oba',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'39': {
			name: 'Jon',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'40': {
			name: 'Mic',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'41': {
			name: 'Nah',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'42': {
			name: 'Hab',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'43': {
			name: 'Zep',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'44': {
			name: 'Hag',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'45': {
			name: 'Zec',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'46': {
			name: 'Mal',
			group: 'minor prophets',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		},
		'47': {
			name: 'Mat',
			group: 'gospel',
			bgcolor: 'bg-bg-law',
			textcolor: 'text-text-law'
		},
		'48': {
			name: 'Mar',
			group: 'gospel',
			bgcolor: 'bg-bg-law',
			textcolor: 'text-text-law'
		},
		'49': {
			name: 'Luk',
			group: 'gospel',
			bgcolor: 'bg-bg-law',
			textcolor: 'text-text-law'
		},
		'50': {
			name: 'Joh',
			group: 'gospel',
			bgcolor: 'bg-bg-law',
			textcolor: 'text-text-law'
		},
		'51': {
			name: 'Act',
			group: 'acts',
			bgcolor: 'bg-bg-history',
			textcolor: 'text-text-history'
		},
		'52': {
			name: 'Rom',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'53': {
			name: '1Co',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'54': {
			name: '2Co',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'55': {
			name: 'Gal',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'56': {
			name: 'Eph',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'57': {
			name: 'Phi',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'58': {
			name: 'Col',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'59': {
			name: '1Th',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'60': {
			name: '2Th',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'61': {
			name: '1Ti',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'62': {
			name: '2Ti',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'63': {
			name: 'Tit',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'64': {
			name: 'Phm',
			group: 'epistles of Paul',
			bgcolor: 'bg-bg-poetry',
			textcolor: 'text-text-poetry'
		},
		'65': {
			name: 'Heb',
			group: 'letters',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'66': {
			name: 'Jam',
			group: 'letters',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'67': {
			name: '1Pe',
			group: 'letters',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'68': {
			name: '2Pe',
			group: 'letters',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'69': {
			name: '1Jo',
			group: 'letters',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'70': {
			name: '2Jo',
			group: 'letters',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'71': {
			name: '3Jo',
			group: 'letters',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'72': {
			name: 'Jude',
			group: 'letters',
			bgcolor: 'bg-bg-major-prophets',
			textcolor: 'text-text-major-prophets'
		},
		'73': {
			name: 'Rev',
			group: 'prophecy',
			bgcolor: 'bg-bg-minor-prophets',
			textcolor: 'text-text-minor-prophets'
		}
	};
}

export const bookGroupingsService = new BookGroupingsService();
