<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import MonacoEditor from '@/components/monacoEditor/index.vue';
import YAML from 'yaml';

interface Props {
    dataSource: {[key: string]: any}; // openapi json
    selectStr?: {[key: string]: any};
    startKey?: string;
}

const monacoEditorRef = ref();

const data = ref('');
const selectRange = ref({});

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({}),
  selectStr: undefined,
  startKey: undefined
});
onMounted(() => {
  watch(() => props.dataSource, newValue => {
    data.value = YAML.stringify(newValue);
  }, {
    immediate: true,
    deep: true
  });

  watch(() => props.selectStr, newValue => {
    if (monacoEditorRef.value && monacoEditorRef.value) {
      monacoEditorRef.value.removeDecoration();
    }
    if (!newValue) {
      selectRange.value = {};
      return;
    }

    debugger;
    let lineNumber = 1;
    let hasKey = false;
    const targetStr = YAML.stringify(newValue);
    const targetStrs = targetStr.split('\n');
    const targetFirstLineStr = targetStrs[0];
    const allStrs = data.value.split('\n');
    for (let i = 0; i < allStrs.length; i++) {
      if (hasKey && (((props.startKey !== undefined) && allStrs[i].trim() === targetFirstLineStr.trim()) || (!props.startKey && allStrs[i] === targetFirstLineStr))) {
        lineNumber = 1 + i;
        break;
      } else {
        if ((props.startKey !== undefined && (allStrs[i].trim() === (props.startKey.trim() + ':'))) || props.startKey === undefined) {
          hasKey = true;
        }
      }
    }
    setTimeout(() => {
      monacoEditorRef.value.decorations([lineNumber, 1, lineNumber + targetStrs.length - 2, 1]);
    }, 500);
  }, {
    immediate: true,
    deep: true
  });
});

</script>
<template>
  <div class="h-full pt-2">
    <MonacoEditor
      ref="monacoEditorRef"
      class="h-full"
      :value="data"
      :readOnly="true"
      language="yaml" />
  </div>
</template>
