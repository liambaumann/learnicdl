<script>
    import {page} from '$app/state';
</script>

<style>
    /* This forces this specific component to keep its Tailwind classes 
       even if the rest of the app's CSS is unmounted by Vite */
    @tailwind utilities;
</style>


<div class=" ">
    <h1 class="text-center text-red-600 text-[10rem]">
        {#if page.status === 404}
            404
        {:else}
            Ups! Da ist etwas schiefgelaufen
        {/if}
    </h1>
</div>