<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Button, TabPane, Tabs, Input } from 'ant-design-vue';
import ResponseSchema from '../basic/responseSchema.vue';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css'


const easyMDE = ref();
const descRef = ref();

interface Props {
  content: {[key: string]: any};
  description?: string; 
};

const props = withDefaults(defineProps<Props>(), {
  content: () => ({}),
  description: undefined
});
const responseSchemaRef = ref();
onMounted(() => {
  easyMDE.value = new EasyMDE({
    element: descRef.value, 
    autoDownloadFontAwesome: true
  });
});

</script>
<template>
<div>
  <textarea ref="descRef"></textarea>
  <ResponseSchema
    ref="responseSchemaRef"
    :data="props" />
</div>
</template>