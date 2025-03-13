<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch } from 'vue';
import { Tabs, TabPane, RadioButton, RadioGroup } from 'ant-design-vue';
import YAML from 'yaml';

const FormView = defineAsyncComponent(() => import('./formView/index.vue'));
const CodeView = defineAsyncComponent(() => import('./codeView/index.vue'));

const formViewRef = ref();
const viewMode = ref('form');

const codeValue = ref();

onMounted(() => {
  watch(() => viewMode.value, () => {
    if (viewMode.value === 'code') {
      codeValue.value = YAML.stringify(formViewRef.value.getFormData());
    }
  })
})

</script>
<template>
  <div class="flex flex-col">
    <div></div>

    <div class="flex justify-end">
      <slot name="btns"></slot>
      <RadioGroup v-model:value="viewMode">
        <RadioButton value="form">表单</RadioButton>
        <RadioButton value="code">代码</RadioButton>
        <RadioButton value="preview">预览</RadioButton>
      </RadioGroup>
    </div>

    <Tabs v-model:activeKey="viewMode" class="flex-1 min-h-100 mt-4">
      <TabPane key="form" forceRender class="overflow-auto pr-3" >
        <FormView ref="formViewRef" />
      </TabPane>
      <TabPane key="code" class="pr-2">
        <CodeView
          :value="codeValue" />
      </TabPane>
      <TabPane key="preview" class="overflow-auto pr-3">

      </TabPane>
    </Tabs>
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
