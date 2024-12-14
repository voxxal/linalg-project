<script lang="ts">
	import katex from "katex";
    const { math, displayMode = false }: { math: string, displayMode?: boolean} = $props();
	
	const options = {
		displayMode: displayMode,
		throwOnError: false
	}

    let katexString = $state("");

    $effect(() => {
        katexString = katex.renderToString(math, options);
    })
	
</script>



{@html katexString}
