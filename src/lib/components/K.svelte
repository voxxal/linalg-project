<script lang="ts">
	import katex from 'katex';
	const {
		math,
		displayMode = false,
		...rest
	}: { math: string; displayMode?: boolean; class?: string } = $props();

	const options = {
		displayMode: displayMode,
		throwOnError: false
	};

	let katexString = $state('');

	$effect(() => {
		katexString = katex.renderToString(math, options);
	});
</script>

<span class={rest.class}>
	{@html katexString}
</span>
