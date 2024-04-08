<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { onMount } from 'svelte';
	import { persisted } from 'svelte-persisted-store';
	import { Button } from '$lib/components/ui/button/index.js';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import * as Accordion from '$lib/components/ui/accordion';

	const data = persisted('data', {
		code: '',
		DOB: '',
		cache: '',
		cacheDate: ''
	});

	let code: string, DOB: string;
	let signedIn: boolean;
	let lessons: any = [];
	let error = false;

	$: signedIn = $data.code !== '' && $data.DOB !== '' && $data.code && $data.DOB;

	onMount(() => {
		if (signedIn) {
			signIn();
		}
	});

	function getTodaysDate() {
		const date = new Date();

		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();

		// This arrangement can be altered based on how we want the date's format to appear.
		let currentDate = `${day}-${month}-${year}`;

		return currentDate;
	}

	async function signIn() {
		console.log($data.cache !== '');
		console.log($data.cacheDate);
		console.log(getTodaysDate());

		if ($data.cache !== '' && $data.cacheDate === getTodaysDate()) {
			lessons = JSON.parse($data.cache);
			return;
		}

		const formData = new URLSearchParams();

		if (signedIn) {
			formData.append('code', $data.code);
			formData.append('DOB', $data.DOB);
		} else {
			formData.append('code', code);
			formData.append('DOB', DOB);
		}

		const response = await fetch('/', {
			method: 'POST',
			body: formData,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		if (response.ok) {
			const json = await response.json();
			console.log('Lessons data: ', json);

			const jsonData = JSON.parse(json.data)
				.filter((item: any) => typeof item == 'string')
				.splice(10, 40);

			console.log(
				JSON.parse(json.data)
					.filter((item: any) => typeof item == 'string')
					.splice(10, 40)
			);

			for (let i = 0; i < jsonData.length; i += 8) {
				const lesson = {
					teacher: jsonData[i + 0],
					class: jsonData[i + 1],
					subject: jsonData[i + 2],
					timeslot: jsonData[i + 3]
				};
				lessons.push(lesson);
			}

			console.log(lessons);

			if (code !== '' && DOB !== '' && DOB && code)
				data.set({
					code: code,
					DOB: DOB,
					cache: JSON.stringify(lessons),
					cacheDate: getTodaysDate()
				});
		} else {
			console.error('Failed to fetch lessons: ', response.statusText);
			error = true;
		}
	}
</script>

<div class="fixed z-50 flex w-screen justify-end">
	<Button
		on:click={() => {
			data.set({
				...$data,
				cache: '',
				cacheDate: ''
			});
			invalidateAll();
		}}
		class="mt-auto"
		variant="link">Clear cache</Button
	>
	<Button
		on:click={() => {
			data.set({
				code: '',
				DOB: '',
				cache: '',
				cacheDate: ''
			});
			invalidateAll();
		}}
		class="mt-auto"
		variant="link">Delete all data</Button
	>
</div>

{#if signedIn}
	<div class="prose mx-auto px-5 dark:prose-invert">
		{#if lessons.length !== 0}
			<br />
			{#each lessons as lesson}
				<p class="m-0 text-xl font-bold">
					{lesson.subject}
				</p>
				{lesson.class} -
				{lesson.teacher}
				<hr class="m-3" />
			{/each}
		{:else if error}
			<div class="bsod fixed inset-0 -z-10 flex h-screen w-screen bg-[#0827F5]">
				<div class="mx-auto w-[90%] sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[50%]">
					<p class="m-0 text-[5em]">:(</p>
					<p class="text-pretty text-xl">
						Uh oh. There was an error getting lessons from Classcharts. I'm trying my best but it's
						a private API (it's not made for people outside of Classcharts to use).
					</p>
					<p class="text-xl">0% complete</p>
					<div class="flex">
						<img
							class="aspect-square w-[20%]"
							src="/frame.png"
							alt="QR code that leads to never going to give you up by rick astley."
						/>
						<div class="m-5">
							<Accordion.Root>
								<Accordion.Item value="item-1">
									<Accordion.Trigger>Data (debug)</Accordion.Trigger>
									<Accordion.Content>
										<h4>$data</h4>
										<pre>
{JSON.stringify($data)}
										</pre>
										<h4>lessons</h4>
										<pre>
{JSON.stringify(lessons)}
										</pre>
									</Accordion.Content>
								</Accordion.Item>
							</Accordion.Root>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<p>No lessons today!</p>
		{/if}
	</div>
{:else}
	<div class="prose dark:prose-invert">
		<div class="absolute flex h-screen w-screen align-middle dark:prose-invert">
			<div class="mx-auto my-auto">
				<h1 class="text-center">Login</h1>
				<Label>
					Classcharts code
					<Input type="password" name="code" id="code" bind:value={code} />
				</Label>

				<div class="h-2" />

				<Label
					>Date of birth (DD/MM/YYYY)

					<Input bind:value={DOB} />
				</Label>

				<div class="h-2" />

				<Button on:click={signIn} class="w-full">Submit</Button>
			</div>
		</div>
	</div>
{/if}
