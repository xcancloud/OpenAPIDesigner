<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { Button } from 'ant-design-vue';

import ParameterBasic from '../basic/parameterBasic.vue';
import NoDataSvg from '@/Icons/noData.svg';

interface Props {
    dataSource: {[key: string]: any}[]
}
const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ([])
});

const parameters = ref<{parameterObj: any; parameterPriorities: any}[]>([]);

const header = ref<{parameterObj: any; parameterPriorities: any}[]>([]);

const cookie = ref<{parameterObj: any; parameterPriorities: any}[]>([]);


onMounted(() => {
  watch(() => props.dataSource, (newValue) => {
    parameters.value = newValue.filter(i => i.in === 'query').map(i => {
      return {
        parameterObj: {
          ...i
        },
        parameterPriorities: {
          ...(i?.schema || {}),
          type: i?.schema?.type || 'string'
        }
      }
    });
    header.value = newValue.filter(i => i.in === 'header').map(i => {
      return {
        parameterObj: {
          ...i
        },
        parameterPriorities: {
          ...(i?.schema || {}),
          type: i?.schema?.type || 'string'
        }
      }
    });;
    cookie.value = newValue.filter(i => i.in === 'cookie').map(i => {
      return {
        parameterObj: {
          ...i
        },
        parameterPriorities: {
          ...(i?.schema || {}),
          type: i?.schema?.type || 'string'
        }
      }
    });;
  }, {
    immediate: true,
    deep: true
  });
});

const addQuery = () => {
  parameters.value.push({
    in: 'query',
    name: '',
    schema: {
      type: 'string'
    }
  });
};

const addHeader = () => {
  header.value.push({
    in: 'header',
    name: '',
    schema: {
      type: 'string'
    }
  });
};

const addCookie = () => {
  cookie.value.push({
    in: 'cookie',
    name: '',
    schema: {
      type: 'string'
    }
  });
};

const getData = () => {
  return [...parameters.value, ...header.value, ...cookie.value].map(i => {
    return {
      ...(i.parameterObj),
      schema: {
        ...i.parameterPriorities
      }
    }
  }).concat(props.dataSource.filter(i => i.in === 'path'));
};

defineExpose({
  getData
});

</script>
<template>
  <div class="space-y-6">

    <div>
      <div class="font-medium text-4 border-b pb-1 mb-2 flex items-center justify-between">
        <span class="text-5">Parameters</span>
        <Button type="primary" size="small" @click="addQuery">Add + </Button>
      </div>
      <div class="space-y-2">
        <ParameterBasic v-for="(query, idx) in parameters" :key="idx" v-bind="query" />
        <img v-if="!parameters.length" :src="NoDataSvg" class="mx-auto w-40" />
      </div>
      
    </div>

    <div>
      <div class="font-medium text-4 border-b pb-1 mb-2 flex items-center justify-between">
        <span class="text-5">Header</span>
        <Button type="primary" size="small" @click="addHeader">Add + </Button>
      </div>

      <div class="space-y-2">
        <ParameterBasic v-for="(query, idx) in header" :key="idx" v-bind="query" />
        <img v-if="!header.length" :src="NoDataSvg" class="mx-auto w-40"  />
      </div>
      
    </div>

    <div>
      <div class="font-medium text-4 border-b pb-1 mb-2 flex items-center justify-between">
        <span class="text-5">Cookie</span>
        <Button type="primary" size="small" @click="addCookie">Add + </Button>
      </div>

      <div class="space-y-2">
        <ParameterBasic v-for="(query, idx) in cookie" :key="idx" v-bind="query" />
        <img v-if="!cookie.length" :src="NoDataSvg" class="mx-auto w-40" />
      </div>
      
    </div>

  </div>
</template>
