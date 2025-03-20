<script lang="ts" setup>
import { onMounted, watch, ref } from 'vue';
import { defineAsyncComponent } from 'vue';

interface Props {
  dataSource: Record<string, any>;
  path: string;
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({}),
  path: ''
})

const Model = defineAsyncComponent(() => import('./model/index.vue'));
const Parameter = defineAsyncComponent(() => import('./parameter/index.vue'));
const RequestBodies = defineAsyncComponent(() => import('./requestBody/index.vue'));
const Response = defineAsyncComponent(() => import('./response/index.vue'));

const schemaType = ref();
const schemaName = ref();

onMounted(() => {
  watch(() => props.path, (newValue) => {
    if (newValue) {
      const shemaPaths = newValue.split('/').reverse();
      schemaType.value = shemaPaths[1];
      schemaName.value = shemaPaths[0];
    } else {
      schemaType.value = undefined;
    }
  }, {
    immediate: true
  });
});

</script>
<template>
<Model v-if="schemaType === 'schemas'" :name="schemaName" :data="props.dataSource.components[schemaType][props.path]" />
<Parameter v-if="schemaType === 'parameters'" :name="schemaName" :data="props.dataSource.components[schemaType][props.path]" />
<RequestBodies v-if="schemaType === 'requestBodies'" :name="schemaName" :data="props.dataSource.components[schemaType][props.path]" />
<Response v-if="schemaType === 'responses'" :name="schemaName" :data="props.dataSource.components[schemaType][props.path]" />
</template>