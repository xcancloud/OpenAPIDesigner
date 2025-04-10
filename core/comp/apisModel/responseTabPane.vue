<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import ResponseSchema from '../basic/responseSchema.vue';

const descRef = ref();
const EasyMd = defineAsyncComponent(() => import('@/components/easyMd/index.vue'));

interface Props {
  content: {[key: string]: any};
  description?: string; 
};

const props = withDefaults(defineProps<Props>(), {
  content: () => ({}),
  description: undefined
});

const responseSchemaRef = ref();

</script>
<template>
<div>
  <EasyMd ref="descRef" :value="props.description" />
  <ResponseSchema
    ref="responseSchemaRef"
    :data="props" />
</div>
</template>