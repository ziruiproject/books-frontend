<script lang="ts">
	import { onMount } from 'svelte';
	import { API_ENDPOINTS } from '$lib/config';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Icon from '@iconify/svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { goto } from '$app/navigation';

	type Author = {
		id: number;
		first_name: string;
		last_name: string;
	};

	let currentUser: { id: number; name: string; email: string; role: string } | null = $state(null);
	const fetchUser = async () => {
		const token = localStorage.getItem('token');
		if (token == null) {
			goto('/login');
		}

		const res = await fetch(API_ENDPOINTS.currentUser, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const json = await res.json();
		currentUser = json.data;
	};

	let currentAuthor: Author = $state({
		id: 0,
		first_name: '',
		last_name: ''
	});
	let authors: Author[] = $state([]);
	const fetchAuthors = async () => {
		const token = localStorage.getItem('token');
		const res = await fetch(`${API_ENDPOINTS.authors}?limit=100`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const json = await res.json();
		authors = json.data.items;
	};

	async function updateAuthor(id: number) {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_ENDPOINTS.authors}/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(currentAuthor)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		console.log('Author updated successfully:', result);

		reset();
		window.location.reload();
	}

	async function createAuthor() {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_ENDPOINTS.authors}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(currentAuthor)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		console.log('Author created successfully:', result);

		reset();
		window.location.reload();
	}

	async function deleteAuthor(id: number) {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_ENDPOINTS.authors}/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		reset();
		window.location.reload();
	}

	function loadAuthor(author: Author) {
		currentAuthor = {
			id: author.id,
			first_name: author.first_name,
			last_name: author.last_name
		};
	}

	function reset() {
		currentAuthor = {
			id: 0,
			first_name: '',
			last_name: ''
		};
	}

	onMount(async () => {
		fetchUser();
		fetchAuthors();
	});
</script>

<h1 class="mb-4 text-2xl font-bold">Authors</h1>

{#if authors.length === 0}
	<p class="text-center text-gray-500">No authors found.</p>
{:else}
	<div>
		<div class="mb-6 flex h-full items-center justify-between gap-x-4">
			<Dialog.Root onOpenChange={() => reset()}>
				<Dialog.Trigger>
					<Button>
						<Icon icon="mingcute:add-square-fill"></Icon>
						Add Author
					</Button>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Add Author</Dialog.Title>
					</Dialog.Header>
					<div class="grid grid-cols-2 gap-4 py-4">
						<div class="col-span-2 flex flex-col gap-4">
							<Label for="author_first" class="text-right">First Name</Label>
							<Input id="author_first" bind:value={currentAuthor.first_name} class="col-span-3" />
						</div>
						<div class="col-span-2 flex flex-col gap-4">
							<Label for="author_last" class="text-right">Last Name</Label>
							<Input id="author_last" bind:value={currentAuthor.last_name} class="col-span-3" />
						</div>
						<Button class="col-span-2" onclick={() => createAuthor()}>Add</Button>
					</div>
				</Dialog.Content>
			</Dialog.Root>
		</div>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each authors as author (author.id)}
				<div
					class="group overflow-hidden bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
				>
					<div class="relative overflow-hidden">
						<img
							src={'https://ui-avatars.com/api/?name=' +
								author.first_name +
								'+' +
								author.last_name +
								'&background=e0f2fe'}
							alt={'Photo of ' + author.first_name}
							class="h-48 w-full object-cover object-center"
						/>
					</div>

					<div class="p-4">
						<h3 class="text-lg font-bold text-gray-900">
							{author.first_name}
							{author.last_name}
						</h3>
					</div>
					{#if currentUser?.role === 'admin'}
						<div class="flex gap-x-2 p-4">
							<Dialog.Root>
								<Dialog.Trigger>
									<Button variant="outline">
										<Icon icon="mingcute:eye-2-fill"></Icon>
									</Button>
								</Dialog.Trigger>
								<Dialog.Content>
									<Dialog.Header>
										<Dialog.Title>Author Info</Dialog.Title>
									</Dialog.Header>
									<div class="grid grid-cols-2 gap-4 py-4">
										<div class="col-span-2 flex flex-col gap-4">
											<Label for="author_first" class="text-right">First Name</Label>
											<Input
												id="author_first"
												disabled
												value={author.first_name}
												class="col-span-3"
											/>
										</div>
										<div class="col-span-2 flex flex-col gap-4">
											<Label for="author_last" class="text-right">Last Name</Label>
											<Input
												id="author_last"
												disabled
												value={author.last_name}
												class="col-span-3"
											/>
										</div>
									</div>
								</Dialog.Content>
							</Dialog.Root>
							<Dialog.Root onOpenChange={(e) => (e ? loadAuthor(author) : reset())}>
								<Dialog.Trigger>
									<Button variant="outline">
										<Icon icon="mingcute:edit-4-fill"></Icon>
									</Button>
								</Dialog.Trigger>
								<Dialog.Content>
									<Dialog.Header>
										<Dialog.Title>Update Author</Dialog.Title>
									</Dialog.Header>
									<div class="grid grid-cols-2 gap-4 py-4">
										<div class="col-span-2 flex flex-col gap-4">
											<Label for="author_first" class="text-right">First Name</Label>
											<Input
												id="author_first"
												bind:value={currentAuthor.first_name}
												class="col-span-3"
											/>
										</div>
										<div class="col-span-2 flex flex-col gap-4">
											<Label for="author_last" class="text-right">Last Name</Label>
											<Input
												id="author_last"
												bind:value={currentAuthor.last_name}
												class="col-span-3"
											/>
										</div>
										<Button class="col-span-2" onclick={() => updateAuthor(author.id)}>
											Update
										</Button>
									</div>
								</Dialog.Content>
							</Dialog.Root>
							<Dialog.Root>
								<Dialog.Trigger>
									<Button variant="destructive">
										<Icon icon="mingcute:delete-3-fill"></Icon>
									</Button>
								</Dialog.Trigger>
								<Dialog.Content>
									<Dialog.Header>
										<Dialog.Title>
											Deleting {`${author.first_name} ${author.last_name}`}
										</Dialog.Title>
									</Dialog.Header>
									<Dialog.Description>This action cannot be undone!</Dialog.Description>
									<Button variant="destructive" onclick={() => deleteAuthor(author.id)}>
										<Icon icon="mingcute:delete-3-fill"></Icon>
										Yes, Delete
									</Button>
								</Dialog.Content>
							</Dialog.Root>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}
