<script lang="ts" setup>
import { inject, onMounted, ref, watch } from 'vue';
import { Button, TabPane, Tabs, Dropdown, Input, Select } from 'ant-design-vue';
import { CONTENT_TYPE } from '../basic/utils';
import BodyContentTypeTab from '../basic/bodyContentTypeTab.vue';

interface Props {
    dataSource: {
        content?: {[key: string]: any},
        description?: string;
        $ref?: string;
    }
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({})
});

const requestBodiesDataRef = ref([]);

const contentTypes = ref<string[]>([]);

const data = ref({});
const serviceId = inject('serviceId', ref());
const compParams = { types: ['requestBodies'] };
const refComp = ref();


const changeRef = (value, option) => {
  if (value) {
    data.value = JSON.parse(option.model);
  } else {
    data.value = {};
  }
  contentTypes.value = Object.keys(data.value.content || {});
};

onMounted(() => {
  watch(() => props.dataSource, () => {
    data.value = props.dataSource;
    contentTypes.value = Object.keys(data.value.content || {});
  }, {
    immediate: true
  });
});

const disabledBodyModelType = (type) => {
  return ['application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/json',
    'application/xml'].includes(type);
};

const addContentType = (item) => {
  contentTypes.value.push(item.key);
  if (data.value?.content) {
    if (!data.value.content[item.key]) {
      data.value.content[item.key] = {
        schema: {
          type: disabledBodyModelType(item.key) ? 'object' : 'string'
        }
      };
    }
  } else {
    data.value.content = {
      [item.key]: {
        schema: {
          type: disabledBodyModelType(item.key) ? 'object' : 'string'
        }
      }
    };
  }
  // selectRequestContentType.value = undefined;
};

const editTab = (key:string) => {
  contentTypes.value = contentTypes.value.filter(i => i !== key);
};

const getData = () => {
  if (refComp.value) {
    return {
      $ref: refComp.value
    };
  }
  const resps = requestBodiesDataRef.value.map((i) => {
    const data = i?.getData();
    if (data) {
      Object.assign(data.value?.content || {}, data);
    }
    return data;
  });
  if (resps.some(i => i === false)) {
    return false;
  }
  Object.keys(data.value?.content || {}).forEach(key => {
    if (!contentTypes.value.includes(key)) {
      delete data.value.content?.[key];
    }
  });
  const comp = {
    ...data.value,
    description: data.value.description
  };
  return comp;
};

defineExpose({
  getData
});
</script>
<template>
  <div>
    <div class="font-medium text-4 border-b pb-1 mb-2 flex items-center">
      <span>推送通知Icon</span>
      <!-- <Icon icon="icon-tuisongtongzhi" class="text-5 mr-2" /> -->
      RequestBody Description
      <div class="flex-1 text-right">
        <!-- <Select
          v-model:value="refComp"
          class="w-40 text-left"
          placeholder="选择使用body模型"
          :action="`${ALTESTER}/services/${serviceId}/comp/type?ignoreModel=false`"
          :params="compParams"
          :allowClear="true"
          :fieldNames="{value: 'ref', label: 'key'}"
          @change="changeRef" /> -->
      </div>
    </div>
    <Input
      v-model:value="data.ddescription"
      type="textarea"
      :maxlength="1000" />
  </div>
  <div class="mt-4">
    <div class="font-medium text-4 border-b pb-1 mb-2 flex items-center"><Icon icon="icon-tuisongtongzhi" class="text-5 mr-2" /> Body</div>
    <Tabs
      type="editable-card"
      hideAdd
      size="small"
      class="mt-2"
      @edit="editTab">
      <template #rightExtra>
        <div class="flex items-center">
          <!-- <Select
                v-model:value="selectRequestContentType"
                placeholder="Add"
                :allowClear="true"
                :options="CONTENT_TYPE.map(i => ({value: i, label: i, disabled: contentTypes.includes(i)}))"
                class="w-80" /> -->
          <Dropdown
            :disabledKeys="contentTypes"
            :menuItems="CONTENT_TYPE.map(i => ({key: i, name: i, disabled: contentTypes.includes(i)}))"
            @click="addContentType">
            <Button
              size="small"
              type="primary">
              <Icon
                icon="icon-jia"
                class="text-3.5" />
            </Button>
          </Dropdown>
        </div>
      </template>
      <TabPane
        v-for="(contentType, idx) in contentTypes"
        :key="contentType"
        :tab="contentType"
        :closable="true">
        <BodyContentTypeTab
          :ref="dom => requestBodiesDataRef[idx] = dom"
          :contentType="contentType"
          :viewType="!!refComp"
          :data="data?.content?.[contentType] || {}" />
      </TabPane>
    </Tabs>
  </div>
</template>
