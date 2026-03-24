<script>
    export let data;
</script>

<div class="min-h-screen bg-slate-50 p-8 font-montserrat">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-black text-slate-800 mb-2">Admin Dashboard</h1>
        <p class="text-slate-500">Welcome back, {data.user.name}. You have god-mode.</p>
        
        <div class="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <p class="text-slate-600">The admin panel is completely locked down. Next, we will add the data tables here.</p>
        </div>
    </div>
</div>