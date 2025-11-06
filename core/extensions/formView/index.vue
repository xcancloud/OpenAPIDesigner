<script setup lang="ts">
import { ref, onMounted, inject, onBeforeUnmount, watch } from 'vue';
import { Input, Button, Textarea } from 'ant-design-vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
// import { useI18n } from 'vue-i18n';

// const i18n = inject('i18n');
// const { t } = i18n?.global;
// const t = inject('t');
const useLocal = inject('useLocal');
const language = inject('language', ref());
type Extension = {
  name: string;
  value?: string;
  oldName?: string;
};


interface Props {
  dataSource: Extension[]
}
// const { t } = useI18n();
const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ([])
});

const extensionList = ref<Extension[]>([]);

const selectedExtension = ref<Extension|undefined>(props.dataSource.length ? {...props.dataSource[0], oldName: props.dataSource[0].name} : undefined);

const getDefaultExtensionName = () => {
  const allDefaultNames = extensionList.value.map(i => i.name).filter(name => name.startsWith('x-extension-'));
  const nameIdxs = allDefaultNames.map(name => {
    const num = Number(name.slice(12));
    return isNaN(num) ? 0 : num;
  });
  const max = nameIdxs.length ? Math.max(...nameIdxs) : extensionList.value.length;
  return `x-extension-${max + 1}`;
};

const addExtension = () => {
  const extensionMax = getDefaultExtensionName();
  extensionList.value.push({
    name: extensionMax,
    value: undefined
  });
  if (!selectedExtension.value) {
    selectExtension(extensionList.value[0]);
  }
};

const deleteExtention = (name: string) => {
  const targetIdx = extensionList.value.findIndex(i => i.name === name);
  extensionList.value.splice(targetIdx, 1);
  if (name === selectedExtension.value?.oldName) {
    if (extensionList.value.length) {
      selectExtension(extensionList.value[0]);
    } else {
      selectedExtension.value = undefined;
    }
  }
};

const changeSelectExtension = (event: InputEvent, oldName: string) => {
  let newName = event?.target?.value || undefined;
  if (!newName) {
    deleteExtention(oldName);
    return;
  }
  if (!newName.startsWith('x-')) {
    newName = 'x-' + newName;
  }
  if (newName === oldName) {
    return;
  }
  if (extensionList.value.find(i => i.name === newName)) {
    deleteExtention(oldName);
    return;
  }
  const targetIdx = extensionList.value.findIndex(i => i.name === oldName);
  extensionList.value[targetIdx].name = newName;
  extensionList.value = extensionList.value.slice();
  selectExtension(extensionList.value[targetIdx])
};

const changeSelectExtensionValue = (event: InputEvent, name: string) => {
  const newValue = event?.target?.value || undefined;
  const targetIdx = extensionList.value.findIndex(i => i.name === name);
  extensionList.value[targetIdx].value = newValue;
};

const selectExtension = (value: Extension) => {
  selectedExtension.value = {...value, oldName: value.name};
};


const getData = () => {
  const data = extensionList.value.reduce((pre, cur) => {
    if (cur.name) {
      return {
        ...pre,
        [cur.name]: cur.value || null
      }
    }
  }, {});
  return {
    ...data
  };
};


onMounted(() => {

  watch(() => props.dataSource, () => {
    extensionList.value = JSON.parse(JSON.stringify(props.dataSource));
    if (extensionList.value.length) {
      selectExtension(extensionList.value[0]);
    }
  }, {
    immediate: true
  });


});

onBeforeUnmount(() => {

});

defineExpose({
  getFormData: getData
});

</script>

<template>
  <div>
    <div class="flex justify-between mb-2 items-center">
      <slot name="title"><span></span></slot>
      <Button size="small" type="primary" @click="addExtension">+ {{ useLocal(language)('add') }}</Button>
    </div>

    <div class="flex border">
      <div v-if="extensionList.length" class="w-50 min-h-50 border-r">
        <div
          v-for="(extension) in extensionList"
          :key="extension.name"
          :class="{'bg-blue-300': extension.name === selectedExtension?.oldName}"
          class="p-2 w-full flex items-center cursor-pointer"
          @click="selectExtension(extension)">
          <div class="truncate flex-1 min-w-0" >{{ extension.name }}</div>
          <Button size="small" type="text" @click.stop="deleteExtention(extension.name)"><DeleteOutlined /></Button>
        </div>
      </div>

      <div class="flex-1 min-w-0 p-1">
        <template v-if="!!selectedExtension">
          <Input
            v-model:value="selectedExtension.name"
            :bordered="false"
            class="font-semibold bg-gray-200"
            placeholder="x- (Required)"
            @blur="changeSelectExtension($event, selectedExtension.oldName)" />
          <Textarea
            v-model:value="selectedExtension.value"
            :bordered="false"
            type="textarea"
            class="mt-2"
            :placeholder="useLocal(language)('extension_value_placeholder')"
            @blur="changeSelectExtensionValue($event, selectedExtension.name)" />
        </template>
        <div v-else class="text-center">
          <img class="inline-block" src="../../icons/noData.svg" />
        </div>
      </div>

    </div>
  </div>
</template>