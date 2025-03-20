<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch, inject } from 'vue';
import { Tabs, TabPane, Button } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import YAML from 'yaml';

const FormView = defineAsyncComponent(() => import('./formView/index.vue'));
const CodeView = defineAsyncComponent(() => import('./codeView/index.vue'));

const getAppFunc = inject('getAppFunc', ()=>{});

interface Props {
  viewMode: 'form'|'code'|'preview'
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'form'
});

const formViewRef = ref();
const codeValue = ref();

const tagKeyList = ref([1]);
const addTag = () => {
  tagKeyList.value.push(Math.random());
};

const deleteTag = (idx: number) => {
  tagKeyList.value.splice(idx, 1);
};

onMounted(() => {
  watch(() => props.viewMode, () => {
    if (props.viewMode === 'code') {
      // codeValue.value = YAML.stringify(formViewRef.value.getFormData());
    }
  })
});

</script>
<template>
  <Tabs :activeKey="viewMode" class="flex-1 min-h-100">
    <TabPane key="form" forceRender class="overflow-auto pr-3" >
      <div class="flex justify-between pr-8">
        <span class="font-semibold">安全方案</span>
        <Button size="small" type="primary" @click="addTag">
          + 添加
        </Button>
      </div>
      <div
        v-for="(key, idx) in tagKeyList" :key="key"
        class="flex w-full mb-5 border-t mt-3 pt-2">
        <FormView ref="formViewRef" class="flex-1" />
        <Button size="small" type="link" class="mt-8 w-8" @click="deleteTag(idx)">
          <DeleteOutlined class="text-5" />
        </Button>
      </div>
    </TabPane>
    <TabPane key="code" class="pr-2">
      <CodeView
        :value="codeValue" />
    </TabPane>
    <TabPane key="preview" class="overflow-auto pr-3">

    </TabPane>
  </Tabs>
</template>
<style scoped>
:deep(.ant-tabs) .ant-tabs-nav {
  display: none;
}

:deep(.ant-tabs) .ant-tabs-content.ant-tabs-content-top {
  height: 100%;
}
</style>
