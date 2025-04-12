<script lang="ts" setup>
import { onMounted, watch, ref, inject, onBeforeUnmount } from 'vue';
import SecuritySchema from '@/security/formView/index.vue';

const getAppFunc = inject('getAppFunc', (param: {name: string, func: Function})=>{});

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

const dataSource = inject('dataSource', ref());
const securityRef = ref();

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  name: ''
});

const saveData = (name: string) => {
  const security = securityRef.value.getData()[name];
  if (!dataSource.value?.components) {
    dataSource.value.components = {};
  }
  if (!dataSource.value.components?.securitySchemes) {
    dataSource.value.components.securitySchemes = {};
  }
  dataSource.value.components.securitySchemes[name] = security;
}

onMounted(() => {
  watch(() => props.name, (_newValue, oldValue) => {
    if (oldValue) {
      saveData(oldValue)
    }
  }, {
    immediate: true
  });
  getAppFunc({name: 'updateData', func: saveData});
});
onBeforeUnmount(() => {
  saveData(props.name);
});

</script>
<template>
  <div class="w-200 mx-auto space-y-4">
    <div class="text-5 font-semibold">{{ props.name }}</div>
    <SecuritySchema ref="securityRef" :data="{securityName: props.name, ...props.data}" :showName="false" />
  </div>
</template>