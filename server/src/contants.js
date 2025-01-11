import path from 'path';
import { fileURLToPath } from 'url';

export const filename = fileURLToPath(import.meta.url);

// __dirname not working with ES modules
export const dirname = path.dirname(filename);

export const API_URL = 'https://api.apilayer.com/currency_data';

export const API_KEY = 'GgTYKJeF0V55n5Ve2JtWDM7OjeblUA6X';
