<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { Modal, notification } from 'ant-design-vue';
import AddSchemaTypeModel from './addSchemaTypeModel.vue';

interface Props {
  visible: boolean;
  data: {[key: string]: any},
  parentType: 'object'|null;
  excludesAttr: string[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  data: () => ({}),
  parentType: null,
  excludesAttr: () => ([])
});

const emits = defineEmits<{(e: 'update:visible', value: boolean): void, (e: 'ok', value: {name: string, [key: string]: any}): void, (e: 'cancel'):void}>();

const addSchemaModelRef = ref();

const type = ref(); // 类型

const activeTab = ref('attr');

const validate = ref(false);

const submit = () => {
  const data = addSchemaModelRef.value.getData();
  if (props.excludesAttr.includes(data.name)) {
    notification.warning({
      description: '已存在该属性',
      message: '提示'
    });
    return;
  }
  if (data) {
    emits('ok', data);
  }
};

const cancel = () => {
  emits('update:visible', false);
  emits('cancel');
};

watch(() => props.visible, newValue => {
  if (newValue) {
    nextTick(() => {
      addSchemaModelRef.value?.resetValues();
    });
  }
});

watch([() => type.value, activeTab.value], () => {
  validate.value = false;
});
</script>
<template>
  <Modal
    title="参数"
    :visible="props.visible"
    @cancel="cancel"
    @ok="submit">
    <div style="max-height: calc(100vh - 300px); overflow-y: auto;">
      <AddSchemaTypeModel
        ref="addSchemaModelRef"
        :data="props.data"
        :parentType="props.parentType" />
    </div>
  </Modal>
</template>
