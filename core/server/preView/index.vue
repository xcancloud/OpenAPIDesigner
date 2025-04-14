<script lang="ts" setup>
import { ref, inject, computed } from 'vue';
import Arrow from '@/common/arrow/index.vue';

const dataSource = inject('dataSource', ref());

type Server = {
  url: string;
  description?: string;
  variables?: {
    [key: string]: {
      enum: string[];
      default: string;
      description?: string
    }
  }
};

const servers = computed<Server[]>(() => {
  return dataSource.value?.servers || [];
});

</script>
<template>
<div>
  <div class="leading-8 px-2 bg-gray-400">API Base URL</div>
  <div class="p-2 leading-7 bg-gray-300 space-y-2">
    <div v-for="(server, idx) in servers" :key="idx">
      <div class="leading-7 px-2 flex items-center bg-gray-400 space-x-1">
        <Arrow v-model:open="server.open" :class="{'invisible': !server.variables}" />
        <div>
          Server {{ idx + 1 }} : {{ server.url }}
        </div>
      </div>
      <div v-show="server.variables && server.open" class="pl-7 space-y-2">
        <div v-for="(variable, name) in server.variables">
          <div class="font-semibold">{{ name }}</div>
          <div>Allowed values: {{ variable.enum.join(', ') }}</div>
          <div>Default: {{ variable.default }}</div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>