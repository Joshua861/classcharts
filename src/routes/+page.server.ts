import { StudentClient } from 'classcharts-api';

export const prerender = false;

let lessons;

function getTodaysDate() {
	const date = new Date();

	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();

	// This arrangement can be altered based on how we want the date's format to appear.
	const currentDate = `${day}-${month}-${year}`;

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
