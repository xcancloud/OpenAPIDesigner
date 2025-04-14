<script lang="ts" setup>
import { ref, onMounted, inject, onBeforeUnmount, watch } from 'vue';
import { Textarea, Button } from 'ant-design-vue';
import { TagsOutlined, DeleteOutlined } from '@ant-design/icons-vue';
interface Props {
  examples: (string | object)[],
  type: 'string'|'object'
}

const props = withDefaults(defineProps<Props>(), {
  examples: () => ([]),
  type: 'string'
});

const exampleList = ref<string[]>([]);
const selectedIdx = ref<number|undefined>();

const selectExample = (idx: number) => {
  selectedIdx.value = idx;
};

const deleteExample = (idx: number) => {
  if (selectedIdx.value === idx) {
    selectedIdx.value -= 1;
  };
  if (selectedIdx.value && selectedIdx.value < 0) {
    selectedIdx.value = undefined;
  }
  exampleList.value.splice(idx, 1);
  saveData.splice(idx, 1);
};

const addExample = () => {
  if (props.type === 'string') {
    exampleList.value.push('');
    saveData.push('""')
  } else {
    exampleList.value.push('{}');
    saveData.push('{}');
  }
};

let saveData: Props['examples'] = [];
const autoSave = async () => {
  try {
    const result = JSON.parse(exampleList.value[selectedIdx.value as number]);
    saveData[selectedIdx.value as number] = result;
  } catch {
    saveData[selectedIdx.value as number] = JSON.stringify(exampleList.value[selectedIdx.value as number]);
  }
};

onMounted(() => {
  watch(() => props.examples, () => {
    exampleList.value = props.examples.map(i => {
      return JSON.stringify(i);
    });
    saveData = JSON.parse(JSON.stringify(exampleList.value));
  }, {
    immediate: true
  });
});

defineExpose({
  getData: () => {
    return saveData;
  }
})

</script>

<template>
  <div class="flex border">
    <div class="w-50 min-h-50 border-r">
      <div
        class="p-2 w-full flex items-center cursor-pointer"
        @click="addExample">
        + Add Example
      </div>
      <div
        v-for="(example, idx) in exampleList"
        :key="idx"
        :class="{'bg-blue-300': idx === selectedIdx}"
        class="p-2 w-full flex items-center cursor-pointer"
        @click="selectExample(idx)">
        <div class="truncate flex-1 min-w-0" >example-{{ idx }}</div>
        <Button size="small" type="text" @click.stop="deleteExample(idx)"><DeleteOutlined /></Button>
      </div>
    </div>

    <div class="flex-1 min-w-0 p-1">
      <template v-if="selectedIdx !== undefined">
        <Textarea
          v-model:value="exampleList[selectedIdx]"
          :bordered="false"
          type="textarea"
          placeholder="输入example值，最大支持20000个字符"
          @blur="autoSave" />
      </template>
      <div v-else class="text-center">
        <img class="inline-block" src="../../Icons/noData.svg" />
      </div>
    </div>
  </div>
</template>