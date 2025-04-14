<script lang="ts" setup>
import { onMounted, ref, watch, Ref } from 'vue';
import { Button, TabPane, Tabs, Input } from 'ant-design-vue';
// import ResponseSchema from '../basic/responseSchema.vue';
import {httpStatus} from './PropTypes';
import Dropdown from '@/common/dropdown/index.vue';
import responseTabPane from './responseTabPane.vue';

interface Props {
    dataSource: {[key: string]: {[key: string]: any}};
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({})
});

const responseSchemaRef = ref<Ref[]>([]);



const data = ref({});
const respStatus = ref<string[]>([]);
const addStatus = (item) => {
  respStatus.value.push(item.key);
  data.value[item.key] = {
    content: {},
    description: item.name
  };
};

const editTab = (key:string) => {
  respStatus.value = respStatus.value.filter(i => i !== key);
};

onMounted(() => {
  watch(() => props.dataSource, newValue => {
    data.value = JSON.parse(JSON.stringify(newValue));
    respStatus.value = Object.keys(data.value);
  }, {
    immediate: true,
    deep: true
  });
});

const getData = () => {
  const result = {};
  let hadErr = false;
  respStatus.value.forEach((status, idx) => {
    if (responseSchemaRef.value[idx]) {
      const reponse = responseSchemaRef.value[idx].getData();
      if (reponse === false) {
        hadErr = true;
      } else {
        result[status] = {
          ...reponse,
          description: data.value[status].description
        };
      }
    } else {
      result[status] = data.value[status];
    }
  });
  if (hadErr) {
    return false;
  }

  return result;
};

defineExpose({
  getData
});

</script>
<template>
  <div>
    <Tabs
      type="editable-card"
      hideAdd
      size="small"
      @edit="editTab">
      <template #rightExtra>
        <Dropdown
          :menuStyle="{maxHeight: '500px', overflowY: 'auto'}"
          placement="leftTop"
          :disabledKeys="respStatus"
          :menuItems="httpStatus.map(i => ({ key: i.value, name: `${i.value} ${i.message}` }))"
          @click="addStatus">
          <Button
            size="small"
            type="primary">
            +
          </Button>
        </Dropdown>
      </template>
      <TabPane
        v-for="(status, idx) in respStatus"
        :key="status"
        :tab="status"
        :closable="true">
        <responseTabPane v-bind="data[status]" :ref="(dom:Ref) => responseSchemaRef[idx] = dom" />
        <!-- <Input
          v-model:value="data[status].description"
          type="textarea" /> -->
        <!-- <ResponseSchema
          :ref="dom => responseSchemaRef[idx] = dom"
          :data="data[status]" /> -->
      </TabPane>
    </Tabs>
  </div>
</template>
