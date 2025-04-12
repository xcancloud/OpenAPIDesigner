<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch, inject, onBeforeUnmount, Ref } from 'vue';
import { Button } from 'ant-design-vue';
import { DeleteOutlined } from '@ant-design/icons-vue'

const FormView = defineAsyncComponent(() => import('./formView/index.vue'));
const SecurityBasic = defineAsyncComponent(() => import('../comp/basic/securityBasic.vue'));

const getAppFunc = inject('getAppFunc', ()=>{});

interface Props {
  viewMode: 'form'|'code'|'preview';
  dataSource: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'form'
});

const emits = defineEmits<{(e: 'save', value: {[key: string]: any})}>();

const formViewRef = ref<Ref[]>([]);


const securityList = ref<{[key: string]: any}[]>([]);
const addTag = () => {
  securityList.value.push({
    scheme: 'basic',
    type: 'http'
  });
};

const deleteTag = (idx: number) => {
  securityList.value.splice(idx, 1);
};

const securitySource = ref();

onMounted(() => {
  watch(() => props.dataSource, () => {
    securitySource.value = props.dataSource.components?.securitySchemes;
    securityList.value = Object.keys(props.dataSource.components?.securitySchemes || {}).map(key => {
      return {
        securityName: key,
        ...props.dataSource.components?.securitySchemes?.[key]
      }
    })
  }, {
    immediate: true
  })
});

onBeforeUnmount(() => {
  const security = formViewRef.value.map(formView => formView.getData()).reduce((pre, cur) => {
    return {
      ...pre,
      ...cur
    }
  }, {});
  emits('save', security);
});

</script>
<template>
  <div class="min-h-100">
    <div class="flex justify-between pr-8">
      <span class="font-semibold">安全方案</span>
      <Button size="small" type="primary" @click="addTag">
        + 添加
      </Button>
    </div>
    <div
      v-for="(security, idx) in securityList" :key="idx"
      class="flex w-full mb-5 border-t mt-3 pt-2">
      <FormView :ref="dom => formViewRef[idx] = dom" class="flex-1" :data="security" />
      <Button size="small" type="link" class="mt-8 w-8" @click="deleteTag(idx)">
        <DeleteOutlined class="text-5" />
      </Button>
    </div>
    <SecurityBasic :dataSource="props.dataSource?.security" />
  </div>
</template>
<style scoped>
:deep(.ant-tabs) .ant-tabs-nav {
  display: none;
}

:deep(.ant-tabs) .ant-tabs-content.ant-tabs-content-top {
  height: 100%;
}
</style>
