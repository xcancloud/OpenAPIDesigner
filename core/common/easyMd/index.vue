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

const value = ref();

onMounted(() => {
  watch(() => props.value, () => {
    value.value = props.value;
    easyMDE.value = new EasyMDE({
      initialValue: value.value,
      element: textareaRef.value, 
      autoDownloadFontAwesome: true,
      toolbar: props.preview ? false : undefined,
      spellChecker: false,
      status: props.preview ? false : ['autosave', 'lines', 'words', 'cursor'],
      minHeight: props.preview ? 'auto' : undefined
    });
    
    if (props.preview && !easyMDE.value.isPreviewActive()) {
      easyMDE.value.togglePreview();
    }
  }, {
    immediate: true
  });

  watch(() => props.preview, (newValue) => {
    if (props.preview && !easyMDE.value.isPreviewActive()) {
      easyMDE.value.togglePreview();
    }

    if (!props.preview && easyMDE.value.isPreviewActive()) {
      easyMDE.value.togglePreview();
    }
  });
});

defineExpose({
  getValue: () => {
    return easyMDE.value.value();
  }
});
</script>
<template>
  <div :class="{'preview-wrapper': !!props.preview }">
    <textarea ref="textareaRef"></textarea>
  </div>
</template>
<style>
.preview-wrapper > .EasyMDEContainer > .editor-toolbar[role="toolbar"]{
  display: none;;
};
</style>