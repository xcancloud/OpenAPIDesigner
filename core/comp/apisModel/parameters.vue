<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

interface Props {
    dataSource: {[key: string]: any}[]
}
const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ([])
});

const parameters = ref<{[key: string]: any}>([]);

const header = ref<{[key: string]: any}>([]);

const cookie = ref<{[key: string]: any}>([]);

const contentType = ref();

onMounted(() => {
  watch(() => props.dataSource, (newValue) => {
    parameters.value = newValue.filter(i => i.in === 'query' || i.in === 'path');
    header.value = newValue.filter(i => i.in === 'header');
    cookie.value = newValue.filter(i => i.in === 'cookie');
    const contentTyIdx = header.value.findIndex(i => i.name === 'Content-Type');
    if (contentTyIdx > -1) {
      contentType.value = header.value[contentTyIdx]['x-xc-value'];
      header.value.splice(contentTyIdx, 1);
    }
  }, {
    immediate: true,
    deep: true
  });
});

const changeParamters = (data) => {
  parameters.value = data;
};

const changeHeader = (data) => {
  header.value = data;
};

const changeCookie = (data) => {
  cookie.value = data;
};

const getData = () => {
  const contentTypeParams = [];
  if (contentType.value) {
    contentTypeParams.push({ name: 'Content-Type', in: 'header', 'x-xc-value': contentType.value, schema: { type: 'string' } });
  }
  return {
    parameters: [
      ...parameters.value,
      ...header.value,
      ...cookie.value,
      ...contentTypeParams
    ]
  };
};

defineExpose({
  getData
});

</script>
<template>
  <div class="space-y-4">
    <div>
      <div class="font-medium text-4 border-b pb-1 mb-2"><Icon icon="icon-dangqianweizhi" class="text-5" /> Parameters</div>
      <!-- <ApiParameter
        :value="parameters"
        @change="changeParamters" /> -->
    </div>
    <div>
      <div class="font-medium text-4 border-b pb-1 mb-2"><Icon icon="icon-dangqianweizhi" class="text-5" /> Header</div>
      <!-- <ApiHeader
        :value="header"
        :contentType="contentType"
        @change="changeHeader" /> -->
    </div>
    <div>
      <div class="font-medium text-4 border-b pb-1 mb-2"><Icon icon="icon-dangqianweizhi" class="text-5" /> Cookie</div>
      <!-- <ApiCookie
        :value="cookie"
        @change="changeCookie" /> -->
    </div>
  </div>
</template>
