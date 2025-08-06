<script lang="ts">
	import { onMount } from 'svelte';
	import { API_ENDPOINTS } from '$lib/config';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Icon from '@iconify/svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { goto } from '$app/navigation';

	type Category = {
		id: number;
		name: string;
	};

	let currentCategory: Category = $state({
		id: 0,
		name: ''
	});
	let categories: Category[] = $state([]);
	const fetchCategories = async () => {
		const token = localStorage.getItem('token');
		const res = await fetch(API_ENDPOINTS.categories, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});

		const json = await res.json();
		categories = json.data.items;
	};

	async function updateCategory(id: number) {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_ENDPOINTS.categories}/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(currentCategory)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		console.log('Category updated successfully:', result);

		reset();
		window.location.reload();
	}

	async function createCategory() {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_ENDPOINTS.categories}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(currentCategory)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		console.log('Category created successfully:', result);

		reset();
		window.location.reload();
	}

	async function deleteCategory(id: number) {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_ENDPOINTS.categories}/${id}`, {
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

	function loadCategory(category: Category) {
		currentCategory = {
			id: category.id,
			name: category.name
		};
	}

	function reset() {
		currentCategory = {
			id: 0,
			name: ''
		};
	}

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

	onMount(async () => {
		fetchUser();
		fetchCategories();
	});
</script>

<h1 class="mb-4 text-2xl font-bold">Categories</h1>

{#if categories.length === 0}
	<p class="text-center text-gray-500">No categories found.</p>
{:else}
	<div>
		<div class="mb-6 flex h-full items-center justify-between gap-x-4">
			<Dialog.Root onOpenChange={() => reset()}>
				<Dialog.Trigger>
					<Button>
						<Icon icon="mingcute:add-square-fill"></Icon>
						Add Category
					</Button>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Add Category</Dialog.Title>
					</Dialog.Header>
					<div class="grid grid-cols-2 gap-4 py-4">
						<div class="col-span-2 flex flex-col gap-4">
							<Label for="category_name" class="text-right">Name</Label>
							<Input id="category_name" bind:value={currentCategory.name} class="col-span-3" />
						</div>
						<Button class="col-span-2" onclick={() => createCategory()}>Add</Button>
					</div>
				</Dialog.Content>
			</Dialog.Root>
		</div>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			{#each categories as category (category.id)}
				<div
					class="bg-primary-100 text-primary-900 border-primary-300 hover:bg-primary-200 flex flex-col items-center justify-between border p-4 text-center font-semibold transition-colors duration-200"
				>
					<h2 class="text-2xl">
						{category.name}
					</h2>
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
										<Dialog.Title>Category Info</Dialog.Title>
									</Dialog.Header>
									<div class="grid grid-cols-2 gap-4 py-4">
										<div class="col-span-2 flex flex-col gap-4">
											<Label for="category_name" class="text-right">Name</Label>
											<Input id="category_name" disabled value={category.name} class="col-span-3" />
										</div>
									</div>
								</Dialog.Content>
							</Dialog.Root>
							<Dialog.Root onOpenChange={(e) => (e ? loadCategory(category) : reset())}>
								<Dialog.Trigger>
									<Button variant="outline">
										<Icon icon="mingcute:edit-4-fill"></Icon>
									</Button>
								</Dialog.Trigger>
								<Dialog.Content>
									<Dialog.Header>
										<Dialog.Title>Update Category</Dialog.Title>
									</Dialog.Header>
									<div class="grid grid-cols-2 gap-4 py-4">
										<div class="col-span-2 flex flex-col gap-4">
											<Label for="category_name" class="text-right">Name</Label>
											<Input
												id="category_name"
												bind:value={currentCategory.name}
												class="col-span-3"
											/>
										</div>
										<Button class="col-span-2" onclick={() => updateCategory(category.id)}
											>Update</Button
										>
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
											Deleting {category.name}
										</Dialog.Title>
									</Dialog.Header>
									<Dialog.Description>This action cannot be undone!</Dialog.Description>
									<Button variant="destructive" onclick={() => deleteCategory(category.id)}>
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
