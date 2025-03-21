<script lang="ts" setup>
import { onMounted, watch, ref } from 'vue';
import { defineAsyncComponent } from 'vue';

interface Props {
  dataSource: Record<string, any>;
    schemaName: string;
  schemaType: string;
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({}),
  schemaName: '',
  schemaType: ''
});

const Model = defineAsyncComponent(() => import('./model/index.vue'));
const Parameter = defineAsyncComponent(() => import('./parameter/index.vue'));
const RequestBodies = defineAsyncComponent(() => import('./requestBody/index.vue'));
const Response = defineAsyncComponent(() => import('./response/index.vue'));


</script>
<template>
<Model v-if="schemaType === 'schemas'" :name="schemaName" :data="props.dataSource.components[schemaType][props.schemaName]" />
<Parameter v-if="schemaType === 'parameters'" :name="schemaName" :data="props.dataSource.components[schemaType][props.schemaName]" />
<RequestBodies v-if="schemaType === 'requestBodies'" :name="schemaName" :data="props.dataSource.components[schemaType][props.schemaName]" />
<Response v-if="schemaType === 'responses'" :name="schemaName" :data="props.dataSource.components[schemaType][props.schemaName]" />
</template>