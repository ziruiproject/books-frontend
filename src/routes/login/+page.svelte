<script lang="ts">
	import { goto } from '$app/navigation';
	import { API_ENDPOINTS } from '$lib/config';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';
	let emailError = '';
	let passwordError = '';

	async function handleLogin() {
		error = '';
		emailError = '';
		passwordError = '';

		// Validasi sederhana
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		let valid = true;

		if (!emailRegex.test(email)) {
			emailError = 'Email tidak valid';
			valid = false;
		}
		if (password.length < 6) {
			passwordError = 'Password minimal 6 karakter';
			valid = false;
		}

		if (!valid) return;

		loading = true;
		try {
			const res = await fetch(API_ENDPOINTS.login, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data?.message || 'Login gagal');
			}

			const data = await res.json();
			localStorage.setItem('token', data.data.token);
			goto('/dashboard/books');
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="font-outfit flex min-h-screen items-center justify-center bg-gray-100">
	<form on:submit|preventDefault={handleLogin} class="w-full max-w-md bg-white p-10 shadow-md">
		<h1 class="mb-6 text-4xl font-bold text-primary">Login</h1>

		{#if error}
			<p class="mb-4 text-sm text-red-500">{error}</p>
		{/if}

		<!-- Email -->
		<div class="mb-4">
			<label class="mb-1 block font-medium text-gray-600" for="email">Email</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				class="w-full border px-4 py-1.5 focus:ring-2 focus:ring-primary focus:outline-none"
				required
			/>
			{#if emailError}
				<p class="mt-1 text-sm text-red-500">{emailError}</p>
			{/if}
		</div>

		<!-- Password -->
		<div class="mb-6">
			<label class="mb-1 block font-medium text-gray-600" for="password">Password</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				class="w-full border px-4 py-1.5 focus:ring-2 focus:ring-primary focus:outline-none"
				required
			/>
			{#if passwordError}
				<p class="mt-1 text-sm text-red-500">{passwordError}</p>
			{/if}
		</div>

		<!-- Submit Button -->
		<button
			type="submit"
			class="w-full bg-primary px-4 py-2 font-semibold text-white hover:bg-accent disabled:opacity-60"
			disabled={loading}
		>
			{loading ? 'Logging in...' : 'Login'}
		</button>
	</form>
</div>
