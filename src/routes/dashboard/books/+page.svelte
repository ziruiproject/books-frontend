<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { onMount } from 'svelte';
	import { API_ENDPOINTS } from '$lib/config';
	import Icon from '@iconify/svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { derived } from 'svelte/store';
	import {
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		type DateValue
	} from '@internationalized/date';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { cn } from '$lib/utils';
	import { updated } from '$app/state';
	import { goto, refreshAll } from '$app/navigation';

	type BookResponse = {
		id: number;
		title: string;
		cover: string;
		description: string;
		page_count: number;
		author: {
			id: number;
			first_name: string;
			last_name: string;
		};
		categories: {
			id: number;
			name: string;
		}[];
		publisher: {
			id: number;
			name: string;
		};
		publication_date: string;
	};

	type BookRequest = {
		id: number;
		title: string;
		cover: string;
		description: string;
		page_count: number;
		author_id: number;
		categories: string[];
		publisher_id: number;
		publication_date: DateValue;
	};

	let books: BookResponse[] = $state([]);
	let loading = true;
	let error: string | null = $state(null);

	let currentPage = $state(1);
	let totalPages = $state(1);

	let search = $state('');
	let categories: { id: number; name: string }[] = $state([]);

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
	let yearAfter = $state('');
	const selectedYearAfter = $derived(
		years.find((y) => y.toString() === yearAfter) ?? years[years.length - 1]
	);
	let yearBefore = $state('');
	const selectedYearBefore = $derived(
		years.find((y) => y.toString() === yearBefore) ?? currentYear
	);

	let category = $state('all');
	let bookCategories: string[] = $state([]);

	const selectedCategory = $derived(
		categories.find((c) => c.id.toString() === category)?.name ?? 'Select category'
	);
	const selectedCategories = $derived(
		categories
			.filter((c) => bookCategories.includes(c.id.toString()))
			.map((c) => c.name)
			.join(', ') || 'Select category'
	);

	let currentUser: { id: number; name: string; email: string; role: string } | null = $state(null);

	let authors: { id: number; first_name: string; last_name: string }[] = $state([]);
	let author = $state('');
	const selectedAuthor = $derived(() => {
		const foundAuthor = authors.find((a) => a.id.toString() === author);
		return foundAuthor ? `${foundAuthor.first_name} ${foundAuthor.last_name}` : 'Select author';
	});

	let publishers: { id: number; name: string }[] = $state([]);
	let publisher = $state('');
	const selectedPublisher = $derived(
		publishers.find((p) => p.id.toString() === publisher)?.name ?? 'Select publisher'
	);

	function formatToYYYYMMDD(date: DateValue): string {
		const year = date.year;
		const month = date.month.toString().padStart(2, '0');
		const day = date.day.toString().padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	let contentRef = $state<HTMLElement | null>(null);
	let coverFile: FileList | undefined = $state(undefined);

	let updatedBook: BookRequest = $state({
		id: 0,
		title: '',
		cover: '',
		description: '',
		page_count: 0,
		author_id: 0,
		publisher_id: 0,
		categories: [],
		publication_date: parseDate('2025-01-01')
	});

	let createdBook: BookRequest = $state({
		id: 0,
		title: '',
		cover: '',
		description: '',
		page_count: 0,
		author_id: 0,
		publisher_id: 0,
		categories: [],
		publication_date: parseDate('2025-01-01')
	});

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

	const fetchAuthors = async () => {
		const token = localStorage.getItem('token');
		const res = await fetch(API_ENDPOINTS.authors + '?limit=100&order_by=first_name&sort_by=asc', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const json = await res.json();
		authors = json.data.items;
	};

	const fetchPublishers = async () => {
		const token = localStorage.getItem('token');
		const res = await fetch(API_ENDPOINTS.publisher + '?limit=100&order_by=name&sort_by=asc', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const json = await res.json();
		publishers = json.data.items;
	};

	const fetchCategories = async () => {
		const token = localStorage.getItem('token');
		const res = await fetch(API_ENDPOINTS.categories + '?limit=100&order_by=name&sort_by=asc', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const json = await res.json();
		categories = json.data.items;
	};

	const fetchBooks = async (page = 1) => {
		loading = true;
		error = null;

		try {
			const token = localStorage.getItem('token');
			let endpoint = `${API_ENDPOINTS.books}?order_by=title&sort_by=asc&limit=10&page=${page}`;
			if (category != 'all') {
				endpoint += `&categories=${category}`;
			}
			if (yearBefore != '') {
				endpoint += `&to=${yearBefore}-12-31`;
			}
			if (yearAfter != '') {
				endpoint += `&from=${yearAfter}-01-01`;
			}
			if (search != '') {
				endpoint += `&search=${search}`;
			}
			console.log(endpoint);

			const res = await fetch(endpoint, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const json = await res.json();

			if (!json.success) {
				throw new Error(json.message || 'Failed to fetch');
			}

			books = json.data.items;
			currentPage = json.data.current_page;
			totalPages = json.data.total_pages;
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	};

	async function deleteBook(id: number) {
		const token = localStorage.getItem('token');
		const response = await fetch(`${API_ENDPOINTS.books}/${id}`, {
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

	async function createBook() {
		const bookData = {
			title: createdBook.title,
			cover: createdBook.cover,
			description: createdBook.description,
			page_count: Number(createdBook.page_count),
			publication_date: formatToYYYYMMDD(createdBook.publication_date),
			author_id: Number(author),
			publisher_id: Number(publisher),
			categories: bookCategories.map((c) => Number(c))
		};
		let file_name = createdBook.cover;

		try {
			const token = localStorage.getItem('token');

			if (coverFile) {
				const formData = new FormData();
				formData.append('file', coverFile[0]);
				const upload = await fetch(`${API_ENDPOINTS.upload}`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`
					},
					body: formData
				});
				if (!upload.ok) {
					throw new Error(`HTTP error! status: ${upload.status}`);
				}
				const json = await upload.json();
				file_name = json.data.file_name;
				bookData.cover = file_name;
				console.log('Cover uploaded successfully:', json.data.file_name);
			}
			const response = await fetch(`${API_ENDPOINTS.books}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(bookData)
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			console.log('Book created successfully:', result);
		} catch (error) {
			console.error('Failed to create book:', error);
		} finally {
			reset();
			window.location.reload();
		}
	}

	async function updateBook() {
		const bookData = {
			id: Number(updatedBook.id),
			title: updatedBook.title,
			cover: updatedBook.cover,
			description: updatedBook.description,
			page_count: Number(updatedBook.page_count),
			publication_date: formatToYYYYMMDD(updatedBook.publication_date),
			author_id: Number(author),
			publisher_id: Number(publisher),
			categories: bookCategories.map((c) => Number(c))
		};
		let file_name = updatedBook.cover;
		try {
			const token = localStorage.getItem('token');
			if (coverFile) {
				const formData = new FormData();
				formData.append('file', coverFile[0]);
				const upload = await fetch(`${API_ENDPOINTS.upload}`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`
					},
					body: formData
				});
				if (!upload.ok) {
					throw new Error(`HTTP error! status: ${upload.status}`);
				}
				const json = await upload.json();
				file_name = json.data.file_name;
				bookData.cover = file_name;
				console.log('Cover uploaded successfully:', json.data.file_name);
			}
			const response = await fetch(`${API_ENDPOINTS.books}/${updatedBook.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(bookData)
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			console.log('Book updated successfully:', result);
		} catch (error) {
			console.error('Failed to update book:', error);
		} finally {
			reset();
			window.location.reload();
		}
	}

	function reset() {
		author = '';
		category = '';
		publisher = '';
		search = '';
		bookCategories = [];
		refreshAll();
	}

	function loadBookData(book: BookResponse) {
		author = book.author.id.toString();
		publisher = book.publisher.id.toString();
		bookCategories = book.categories.map((c) => c.id.toString());
		updatedBook = {
			id: book.id,
			title: book.title,
			cover: book.cover,
			description: book.description,
			page_count: book.page_count,
			publication_date: parseDate(book.publication_date),
			author_id: book.author.id,
			publisher_id: book.publisher.id,
			categories: bookCategories
		};
	}

	onMount(() => {
		fetchBooks(currentPage);
		fetchCategories();
		fetchPublishers();
		fetchAuthors();
		fetchUser();
	});

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			fetchBooks(page);
		}
	};

	$effect(() => {
		if (category || search || yearAfter || yearBefore) {
			fetchBooks();
		}
	});
</script>

<h1 class="mb-4 text-2xl font-bold">Books</h1>

{#if error}
	<p class="text-red-500">Error: {error}</p>
{:else}
	<div>
		<div class="mb-6 flex h-full items-center justify-between gap-x-4">
			<Input
				id="search"
				type="text"
				placeholder="Find your books here"
				bind:value={search}
				class="w-full border px-4 py-1.5 focus:ring-2 focus:ring-primary focus:outline-none"
				required
			/>
			<Popover.Root>
				<Popover.Trigger>
					<Button style="ghost">
						<Icon icon="mingcute:filter-fill"></Icon>
						Filter
					</Button>
				</Popover.Trigger>
				<Popover.Content>
					<div class="flex flex-col gap-y-2">
						<Label>Categories</Label>
						<Select.Root type="single" bind:value={category}>
							<Select.Trigger class="w-full">
								{selectedCategory}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="all">All</Select.Item>
								{#each categories as category}
									<Select.Item value={category.id.toString()}>{category.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<Label>Published Before</Label>
						<Select.Root type="single" bind:value={yearBefore}>
							<Select.Trigger class="w-full">
								{selectedYearBefore}
							</Select.Trigger>
							<Select.Content class="max-h-[150px] overflow-y-auto">
								{#each years as year}
									<Select.Item value={year.toString()}>{year}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<Label>Published After</Label>
						<Select.Root type="single" bind:value={yearAfter}>
							<Select.Trigger class="w-full">
								{selectedYearAfter}
							</Select.Trigger>
							<Select.Content class="max-h-[150px] overflow-y-auto">
								{#each years as year}
									<Select.Item value={year.toString()}>{year}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</Popover.Content>
			</Popover.Root>
			<Dialog.Root>
				<Dialog.Trigger>
					<Button>
						<Icon icon="mingcute:add-square-fill"></Icon>
						Add Book
					</Button>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Add Book</Dialog.Title>
					</Dialog.Header>
					<div class="grid grid-cols-2 gap-4 py-4">
						<div class="col-span-2 flex flex-col gap-4">
							<Label for="book_cover">Cover</Label>
							{#if createdBook.cover}
								<img
									src={createdBook.cover}
									alt="Current book cover"
									class="h-auto w-32 rounded-md"
								/>
							{/if}
							<Input id="book_cover" type="file" accept="image/*" bind:files={coverFile} />
						</div>
						<div class="col-span-2 flex flex-col gap-4">
							<Label for="book_title" class="text-right">Title</Label>
							<Input id="book_title" bind:value={createdBook.title} class="col-span-3" />
						</div>
						<div class="col-span-2 flex flex-col gap-4">
							<Label for="book_desc" class="text-right">Description</Label>
							<Textarea id="book_desc" bind:value={createdBook.description} class="col-span-3" />
						</div>
						<div class="flex flex-col gap-4">
							<Label for="book_page" class="text-right">Page Count</Label>
							<Input id="book_page" class="col-span-3" bind:value={createdBook.page_count} />
						</div>
						<div class="flex flex-col gap-4">
							<Label for="book_published" class="text-right">Published Date</Label>
							<Popover.Root>
								<Popover.Trigger
									class={`w-full` +
										cn(
											buttonVariants({
												variant: 'outline',
												class: 'w-full justify-start text-left font-normal'
											}),
											!createdBook.publication_date && 'text-muted-foreground'
										)}
								>
									{createdBook.publication_date
										? formatToYYYYMMDD(createdBook.publication_date)
										: 'Pick a date'}
								</Popover.Trigger>
								<Popover.Content bind:ref={contentRef} class="w-full p-0">
									<Calendar type="single" bind:value={createdBook.publication_date} />
								</Popover.Content>
							</Popover.Root>
						</div>
						<div class="flex flex-col gap-4">
							<Label for="book_author" class="text-right">Author</Label>
							<Select.Root type="single" bind:value={author}>
								<Select.Trigger class="w-full">
									{selectedAuthor()}
								</Select.Trigger>
								<Select.Content class="max-h-[200px]">
									{#each authors as author}
										<Select.Item value={author.id.toString()}>
											{`${author.first_name} ${author.last_name}`}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="flex flex-col gap-4">
							<Label for="book_publisher" class="text-right">Publisher</Label>
							<Select.Root type="single" bind:value={publisher}>
								<Select.Trigger class="w-full">
									{selectedPublisher}
								</Select.Trigger>
								<Select.Content class="max-h-[200px]">
									{#each publishers as publisher}
										<Select.Item value={publisher.id.toString()}>
											{publisher.name}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="col-span-2 flex flex-col gap-4">
							<Label for="book_categories" class="text-right">Categories</Label>
							<Select.Root type="multiple" bind:value={bookCategories}>
								<Select.Trigger class="w-full">
									{selectedCategories}
								</Select.Trigger>
								<Select.Content>
									{#each categories as category}
										<Select.Item value={category.id.toString()}>{category.name}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<Button class="col-span-2" onclick={() => createBook()}>Add</Button>
					</div>
				</Dialog.Content>
			</Dialog.Root>
		</div>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each books as book (book.id)}
				<div
					class="group overflow-hidden bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
				>
					<div class="relative overflow-hidden">
						<img
							src={book.cover}
							alt={book.cover === '' ? 'No Cover' : book.title}
							class="h-[500px] w-full transform object-cover object-center transition-transform duration-300 group-hover:scale-105"
						/>
					</div>

					<div class="flex flex-col justify-between p-5">
						<h3 class="mb-2 text-xl leading-tight font-bold text-gray-900">{book.title}</h3>

						<div class="mb-2 flex items-center text-sm text-gray-500">
							<span class="mr-1">✍️</span>
							<p class="truncate">{book.author.first_name} {book.author.last_name}</p>
						</div>
						<div class="mb-4 flex flex-wrap gap-1.5">
							{#each book.categories as cat (cat.id)}
								<span class="bg-primary px-2 py-1 text-xs font-medium text-accent">
									{cat.name}
								</span>
							{/each}
						</div>

						<p class="place-content-end text-xs text-gray-400">
							Published at {new Date(book.publication_date).toLocaleDateString('en-GB', {
								day: '2-digit',
								month: 'short',
								year: 'numeric'
							})}
						</p>
						{#if currentUser?.role === 'admin'}
							<div class="mt-4 flex gap-x-2">
								<Dialog.Root onOpenChange={(e) => (e ? loadBookData(book) : reset())}>
									<Dialog.Trigger>
										<Button variant="outline">
											<Icon icon="mingcute:eye-2-fill"></Icon>
										</Button>
									</Dialog.Trigger>
									<Dialog.Content>
										<Dialog.Header>
											<Dialog.Title>Book Info</Dialog.Title>
										</Dialog.Header>
										<div class="grid grid-cols-2 gap-4 py-4">
											<div class="col-span-2 flex flex-col gap-4">
												<Label for="book_cover">Cover</Label>
												{#if updatedBook.cover}
													<img
														src={updatedBook.cover}
														alt="Current book cover"
														class="h-auto w-32 rounded-md"
													/>
												{/if}
											</div>
											<div class="col-span-2 flex flex-col gap-4">
												<Label for="book_title" class="text-right">Title</Label>
												<Input
													id="book_title"
													disabled
													value={updatedBook.title}
													class="col-span-3"
												/>
											</div>
											<div class="col-span-2 flex flex-col gap-4">
												<Label for="book_desc" class="text-right">Description</Label>
												<Textarea
													id="book_desc"
													disabled
													value={updatedBook.description}
													class="col-span-3"
												/>
											</div>
											<div class="flex flex-col gap-4">
												<Label for="book_page" class="text-right">Page Count</Label>
												<Input
													id="book_page"
													disabled
													value={updatedBook.page_count}
													class="col-span-3"
												/>
											</div>
											<div class="flex flex-col gap-4">
												<Label for="book_published" class="text-right">Published Date</Label>
												<Popover.Root>
													<Popover.Trigger
														disabled
														class={`w-full` +
															cn(
																buttonVariants({
																	variant: 'outline',
																	class: 'w-full justify-start text-left font-normal'
																}),
																!updatedBook.publication_date && 'text-muted-foreground'
															)}
													>
														{updatedBook.publication_date
															? formatToYYYYMMDD(updatedBook.publication_date)
															: 'Pick a date'}
													</Popover.Trigger>
													<Popover.Content bind:ref={contentRef} class="w-full p-0">
														<Calendar type="single" disabled value={updatedBook.publication_date} />
													</Popover.Content>
												</Popover.Root>
											</div>
											<div class="flex flex-col gap-4">
												<Label for="book_author" class="text-right">Author</Label>
												<Select.Root
													disabled
													type="single"
													value={updatedBook.author_id.toString()}
												>
													<Select.Trigger class="w-full">
														{selectedAuthor()}
													</Select.Trigger>
													<Select.Content class="max-h-[200px]">
														{#each authors as author}
															<Select.Item value={author.id.toString()}>
																{`${author.first_name} ${author.last_name}`}
															</Select.Item>
														{/each}
													</Select.Content>
												</Select.Root>
											</div>
											<div class="flex flex-col gap-4">
												<Label for="book_publisher" class="text-right">Publisher</Label>
												<Select.Root disabled type="single" value={publisher}>
													<Select.Trigger class="w-full">
														{selectedPublisher}
													</Select.Trigger>
													<Select.Content class="max-h-[200px]">
														{#each publishers as publisher}
															<Select.Item value={publisher.id.toString()}>
																{publisher.name}
															</Select.Item>
														{/each}
													</Select.Content>
												</Select.Root>
											</div>
											<div class="col-span-2 flex flex-col gap-4">
												<Label for="book_categories" class="text-right">Categories</Label>
												<Select.Root disabled type="multiple" bind:value={bookCategories}>
													<Select.Trigger class="w-full">
														{selectedCategories}
													</Select.Trigger>
													<Select.Content>
														{#each categories as category}
															<Select.Item value={category.id.toString()}
																>{category.name}</Select.Item
															>
														{/each}
													</Select.Content>
												</Select.Root>
											</div>
										</div>
									</Dialog.Content>
								</Dialog.Root>
								<Dialog.Root onOpenChange={(e) => (e ? loadBookData(book) : reset())}>
									<Dialog.Trigger>
										<Button variant="outline">
											<Icon icon="mingcute:edit-4-fill"></Icon>
										</Button>
									</Dialog.Trigger>
									<Dialog.Content>
										<Dialog.Header>
											<Dialog.Title>Update Book</Dialog.Title>
										</Dialog.Header>
										<div class="grid grid-cols-2 gap-4 py-4">
											<div class="col-span-2 flex flex-col gap-4">
												<Label for="book_cover">Cover</Label>
												{#if updatedBook.cover}
													<img
														src={updatedBook.cover}
														alt="Current book cover"
														class="h-auto w-32 rounded-md"
													/>
												{/if}
												<Input
													id="book_cover"
													type="file"
													accept="image/*"
													bind:files={coverFile}
												/>
											</div>
											<div class="col-span-2 flex flex-col gap-4">
												<Label for="book_title" class="text-right">Title</Label>
												<Input id="book_title" bind:value={updatedBook.title} class="col-span-3" />
											</div>
											<div class="col-span-2 flex flex-col gap-4">
												<Label for="book_desc" class="text-right">Description</Label>
												<Textarea
													id="book_desc"
													bind:value={updatedBook.description}
													class="col-span-3"
												/>
											</div>
											<div class="flex flex-col gap-4">
												<Label for="book_page" class="text-right">Page Count</Label>
												<Input
													id="book_page"
													class="col-span-3"
													bind:value={updatedBook.page_count}
												/>
											</div>
											<div class="flex flex-col gap-4">
												<Label for="book_published" class="text-right">Published Date</Label>
												<Popover.Root>
													<Popover.Trigger
														class={`w-full` +
															cn(
																buttonVariants({
																	variant: 'outline',
																	class: 'w-full justify-start text-left font-normal'
																}),
																!updatedBook.publication_date && 'text-muted-foreground'
															)}
													>
														{updatedBook.publication_date
															? formatToYYYYMMDD(updatedBook.publication_date)
															: 'Pick a date'}
													</Popover.Trigger>
													<Popover.Content bind:ref={contentRef} class="w-full p-0">
														<Calendar type="single" bind:value={updatedBook.publication_date} />
													</Popover.Content>
												</Popover.Root>
											</div>
											<div class="flex flex-col gap-4">
												<Label for="book_author" class="text-right">Author</Label>
												<Select.Root type="single" bind:value={author}>
													<Select.Trigger class="w-full">
														{selectedAuthor()}
													</Select.Trigger>
													<Select.Content class="max-h-[200px]">
														{#each authors as author}
															<Select.Item value={author.id.toString()}>
																{`${author.first_name} ${author.last_name}`}
															</Select.Item>
														{/each}
													</Select.Content>
												</Select.Root>
											</div>
											<div class="flex flex-col gap-4">
												<Label for="book_publisher" class="text-right">Publisher</Label>
												<Select.Root type="single" bind:value={publisher}>
													<Select.Trigger class="w-full">
														{selectedPublisher}
													</Select.Trigger>
													<Select.Content class="max-h-[200px]">
														{#each publishers as publisher}
															<Select.Item value={publisher.id.toString()}>
																{publisher.name}
															</Select.Item>
														{/each}
													</Select.Content>
												</Select.Root>
											</div>
											<div class="col-span-2 flex flex-col gap-4">
												<Label for="book_categories" class="text-right">Categories</Label>
												<Select.Root type="multiple" bind:value={updatedBook.categories}>
													<Select.Trigger class="w-full">
														{selectedCategories}
													</Select.Trigger>
													<Select.Content>
														{#each categories as category}
															<Select.Item value={category.id.toString()}
																>{category.name}</Select.Item
															>
														{/each}
													</Select.Content>
												</Select.Root>
											</div>
											<Button class="col-span-2" onclick={() => updateBook()}>Update</Button>
										</div>
									</Dialog.Content>
								</Dialog.Root>
								<Dialog.Root onOpenChange={(e) => (e ? loadBookData(book) : reset())}>
									<Dialog.Trigger>
										<Button variant="destructive">
											<Icon icon="mingcute:delete-3-fill"></Icon>
										</Button>
									</Dialog.Trigger>
									<Dialog.Content>
										<Dialog.Header>
											<Dialog.Title>Deleting {book.title}</Dialog.Title>
										</Dialog.Header>
										<Dialog.Description>This action cannot be undone!</Dialog.Description>
										<Button variant="destructive" onclick={() => deleteBook(book.id)}>
											<Icon icon="mingcute:delete-3-fill"></Icon>
											Yes, Delete
										</Button>
									</Dialog.Content>
								</Dialog.Root>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-8 flex items-center justify-center gap-2">
			<button
				class="bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-accent disabled:bg-muted disabled:text-muted-foreground"
				onclick={() => goToPage(currentPage - 1)}
				disabled={currentPage <= 1}
			>
				Previous
			</button>

			<p class="text-sm">
				Page {currentPage} of {totalPages}
			</p>

			<button
				class="bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-accent disabled:bg-muted disabled:text-muted-foreground"
				onclick={() => goToPage(currentPage + 1)}
				disabled={currentPage >= totalPages}
			>
				Next
			</button>
		</div>
	</div>
{/if}
