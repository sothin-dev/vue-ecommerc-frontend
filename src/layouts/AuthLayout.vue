<script setup>
defineProps({ title: String })
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 via-white to-gray-50">
    <main class="flex flex-1 items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <RouterLink to="/" class="mb-8 flex items-center justify-center gap-2">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-lg font-bold text-white">N</span>
          <span class="text-xl font-bold tracking-tight text-gray-900">NovaShop</span>
        </RouterLink>
        <RouterView />
      </div>
    </main>
  </div>
</template>
