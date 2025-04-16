<script lang="ts" setup>
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

const emits = defineEmits<{(e:'del'):void}>();

const Model = defineAsyncComponent(() => import('./model/index.vue'));
const Parameter = defineAsyncComponent(() => import('./parameter/index.vue'));
const RequestBodies = defineAsyncComponent(() => import('./requestBody/index.vue'));
const Response = defineAsyncComponent(() => import('./response/index.vue'));
const Header = defineAsyncComponent(() => import('./header/index.vue'));
const Security = defineAsyncComponent(() => import('./security/index.vue'));


</script>
<template>
<Model v-if="schemaType === 'schemas'" :name="schemaName" :data="props.dataSource.components[schemaType][props.schemaName]" @del="emits('del')" />
<Parameter v-if="schemaType === 'parameters'" :name="schemaName" :data="props.dataSource.components[schemaType][props.schemaName]" @del="emits('del')" />
<RequestBodies v-if="schemaType === 'requestBodies'" :name="schemaName" :data="props.dataSource.components[schemaType][props.schemaName]" @del="emits('del')" />
<Response v-if="schemaType === 'responses'" :name="schemaName" :data="props.dataSource.components[schemaType][props.schemaName]" @del="emits('del')" />
<Header v-if="schemaType === 'headers'" :name="schemaName" :data="props.dataSource.components[schemaType][props.schemaName]" @del="emits('del')" />
<Security v-if="schemaType === 'securitySchemes'" :name="schemaName" :data="props.dataSource.components[schemaType][props.schemaName]" @del="emits('del')" />
</template>