import { StudentClient } from 'classcharts-api';

let lessons;

function getTodaysDate() {
	const date = new Date();

	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();

	// This arrangement can be altered based on how we want the date's format to appear.
	let currentDate = `${day}-${month}-${year}`;

	return currentDate;
}
async function getLessons(code: string, DOB: string) {
	const client = new StudentClient(code, DOB);
	await client.login();

	lessons = await client.getLessons({
		date: getTodaysDate()
	});

	return lessons;
}

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const code = data.get('code')?.toString();
		const DOB = data.get('DOB')?.toString();

		if (!code || !DOB) {
			throw new Error('Missing code/DOB.');
		}

		return await getLessons(code, DOB);
	}
};
