<script lang="ts">
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';

	const menuItems = [
		{ id: 'books', label: 'Books', icon: 'mingcute:book-2-fill', path: '/dashboard/books' },
		{ id: 'authors', label: 'Authors', icon: 'mingcute:user-5-fill', path: '/dashboard/authors' },
		{
			id: 'categories',
			label: 'Categories',
			icon: 'mingcute:classify-fill',
			path: '/dashboard/categories'
		}
	];

	const currentPath = derived(page, ($page) => $page.url.pathname);
</script>

<div class="font-outfit flex min-h-screen">
	<!-- Sidebar -->
	<aside class="sidebar hidden w-64 border-r bg-white p-6 shadow-md md:block">
		<h1 class="mb-8 text-2xl font-bold text-primary">Dashboard</h1>
		<nav class="flex flex-col gap-4">
			{#each menuItems as item}
				<a
					href={item.path}
					class="flex items-center gap-3 rounded px-4 py-2
                        {$currentPath.startsWith(item.path)
						? 'bg-primary font-semibold text-white'
						: 'text-gray-700 hover:bg-gray-100'}"
				>
					<Icon icon={item.icon} class="text-xl" />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
	</aside>

	<!-- Main content -->
	<main class="flex-1 bg-gray-50 p-6">
		<slot />
	</main>
</div>

<style>
	.sidebar::-webkit-scrollbar {
		width: 6px;
	}
	.sidebar::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 10px;
	}
</style>
