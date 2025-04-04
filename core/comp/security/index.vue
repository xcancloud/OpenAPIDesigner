<script lang="ts" setup>
import { onMounted, watch, ref, inject, onBeforeUnmount } from 'vue';

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

const dataSource = inject('dataSource', ref({}));
const securityRef = ref();

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  name: ''
});

onMounted(() => {
  watch(() => props.name, (_newValue, oldValue) => {
    if (oldValue) {
      const security = securityRef.value.getData()[oldValue];
      dataSource.value.components.securitySchemes[oldValue] = security;
    }
  }, {
    immediate: true
  });
});

onBeforeUnmount(() => {
  const security = securityRef.value.getData()[props.name];
  dataSource.value.components.securitySchemes[props.name] = security;
})

</script>
<template>
  <div class="w-200 mx-auto space-y-4">
    <div class="text-5 font-semibold">{{ props.name }}</div>
    <SecuritySchema ref="securityRef" :data="{securityName: props.name, ...props.data}" :showName="false" />
  </div>
</template>