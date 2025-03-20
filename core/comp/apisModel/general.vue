<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { Button, Input, Select } from 'ant-design-vue';
import { apiStatus } from './PropTypes'

const statusKey = 'x-xc-status';
interface Props {
    dataSource: {
        method: string;
        summary: string;
        operationId: string;
        'x-xc-status': string;
        security?: Array<string, string[]>
    }
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({
    method: '',
    summary: '',
    operationId: '',
    'x-xc-status': ''
  })
});

const data = ref({});
const security = ref<{key: string, value: string[]}[]>([]);

onMounted(() => {
  watch(() => props.dataSource, () => {
    data.value = props.dataSource;
    (props.security || []).forEach(item => {
      Object.keys(item).forEach(key => {
        security.value.push({ key, value: item[key] || [] });
      });
    });
  }, {
    deep: true,
    immediate: true
  });
});

const addSecurity = () => {
  if (!security.value) {
    security.value = [{ value: '', key: '' }];
  } else {
    security.value.push({ value: '', key: '' });
  }
};

const delSecurity = (idx) => {
  security.value.splice(idx, 1);
};

const getData = () => {
  const _security = security.value.map(item => {
    return { [item.key]: item.value };
  });
  const { summary, operationId, description } = data.value;
  return {
    security: _security,
    summary,
    operationId,
    description,
    [statusKey]: data.value[statusKey]
  };
};

defineExpose({
  getData
});
</script>
<template>
  <div class="px-2">
    <div class="space-y-3">
      <div class="flex items-center space-x-2">
        <!-- <HttpMethodTag :value="data.method" /> -->

        <Input v-model:value="data.summary" />
      </div>
      <div>
        Operation ID
        <Input
          v-model:value="data.operationId"
          dataType="mixin-en"
          includes=".-_" />
      </div>
      <div>
        Description
        <Input v-model:value="data.description" type="textarea" />
      </div>
    </div>
    <div class="flex items-center justify-between border-b pb-2 mt-6">
      <span class="text-4 font-medium"><Icon icon="icon-anquan" class="text-5" /> Security</span>
      <Button
        type="primary"
        size="small"
        @click="addSecurity">
        Add
      </Button>
    </div>
    <div v-if="security" class="space-y-2 mt-2">
      <div v-for="(item,idx) in security" :key="idx" class="flex">
        <Input v-model:value="item.key" />
        <Input
          v-model:value="item.value"
          mode="tags" />
        <Button
          size="samll"
          class="border-none"
          @click="delSecurity(idx)">
          <Icon icon="icon-qingchu" />
        </Button>
      </div>
    </div>
    <div class="flex items-center justify-between border-b pb-2 mt-6">
      <span class="text-4 font-medium"><Icon icon="icon-anquan" class="text-5" /> Status</span>
    </div>
    <div class="mt-2">
      <Input
        readOnly
        value="x-xc-status"
        class="flex-1" />
      <Select
        v-model:value="data[statusKey]"
        class="flex-1"
        :options="apiStatus" />
    </div>
  </div>
</template>
