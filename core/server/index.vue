<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch, inject } from 'vue';
import { Tabs, TabPane, Button } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
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

const serverKeyList = ref([1]);
const addServer = () => {
  serverKeyList.value.push(Math.random());
};

onMounted(() => {
  watch(() => props.viewMode, () => {
    if (props.viewMode === 'code') {
      codeValue.value = YAML.stringify(formViewRef.value.getFormData());
    }
  })
})

</script>
<template>
  <Tabs :activeKey="viewMode" class="flex-1 min-h-100">
      <TabPane key="form" forceRender class="overflow-auto pr-3" >
        <div class="flex justify-end pr-8">
          <Button size="small" type="primary" @click="addServer">
            添加服务器
          </Button>
        </div>
        <div
          v-for="(key, idx) in serverKeyList" :key="key"
          class="flex w-full mb-5"
          :class="{'border-b': idx !== serverKeyList.length - 1}">
          <FormView ref="formViewRef" class="flex-1" />
          <Button size="small" type="link" class="mt-8 w-8">
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
