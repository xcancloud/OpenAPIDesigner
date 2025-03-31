<script lang="ts" setup>
import { onMounted, watch } from 'vue';

import SecuritySchema from '@/security/formView/index.vue';

interface AuthItem {
  name?: string;
  type: 'http'|'apiKey'|'oauth2'|'extends';
  flows?: Record<string, any>;
  in?: string;
  scheme?: string;
  $ref?: string;
  'x-xc-value'?: string
}

interface Props {
  data:AuthItem;
  name: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  name: ''
});

onMounted(() => {
  watch(() => props.name, () => {

  }, {
    immediate: true
  });
});
</script>
<template>
  <div class="w-200 mx-auto space-y-4">
    <div class="text-5 font-semibold">{{ props.name }}</div>
    <SecuritySchema :data="props.data" />
  </div>
</template>