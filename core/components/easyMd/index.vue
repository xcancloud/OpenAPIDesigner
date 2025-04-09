<script lang="ts" setup>
import { onMounted, watch, ref } from 'vue';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css'

interface Props {
  value?: string;
  preview?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  value: '',
  preview: false, // 是否为预览模式
});

const textareaRef = ref();
const easyMDE = ref();

onMounted(() => {
  watch(() => props.value, () => {
    easyMDE.value = new EasyMDE({
      element: textareaRef.value, 
      autoDownloadFontAwesome: true,
      toolbar: !props.preview,
      status: !props.preview,
    });
    if (props.preview && !easyMDE.value.isPreviewActive()) {
      easyMDE.value.togglePreview();
    }
  }, {
    immediate: true
  });
});

defineExpose({
  getValue: () => {
    return easyMDE.value.value();
  }
});
</script>
<template>
  <textarea ref="textareaRef">{{ props.value }}</textarea>
</template>
<style scoped>
:deep(.preview-desc) > .editor-toolbar{
  @apply hidden;
}
</style>