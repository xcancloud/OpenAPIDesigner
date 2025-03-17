<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch } from 'vue';
import { Tabs, TabPane } from 'ant-design-vue';
import YAML from 'yaml';

const FormView = defineAsyncComponent(() => import('./formView/index.vue'));
const CodeView = defineAsyncComponent(() => import('./codeView/index.vue'));

interface Props {
  viewMode: 'form'|'code'|'preview'
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'form'
});

const formViewRef = ref();
const codeValue = ref();

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
        <FormView ref="formViewRef" />
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
