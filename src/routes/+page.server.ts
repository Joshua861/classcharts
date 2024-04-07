import { StudentClient } from 'classcharts-api';

let lessons;

async function getLessons(code: string, DOB: string) {
	const client = new StudentClient(code, DOB);
	await client.login();

	lessons = await client.getLessons({
		date: '2024-04-08'
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
