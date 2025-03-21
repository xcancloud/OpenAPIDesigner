
<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue';
import { RadioGroup, RadioButton, Tabs, TabPane } from 'ant-design-vue';
import SiderMenu from './siderMenu/index.vue';
import { data } from './data.ts';

export type Props = {
  api: string
}

const dataSource = ref<{[key: string]: any}>(data);

const securitySchemes: Record<string, any> = data.components?.securitySchemes || {};

const DocInfo = defineAsyncComponent(() => import('./docInfo/formView/index.vue'));
const ExternalDoc = defineAsyncComponent(() => import('./externalDoc/formView/index.vue'));
const Server = defineAsyncComponent(() => import('./server/formView/index.vue'));
const Tag = defineAsyncComponent(() => import('./tag/formView/index.vue'));
const Extensions = defineAsyncComponent(() => import('./extensions/formView/index.vue'));
const Security = defineAsyncComponent(() => import('./security/formView/index.vue'));
const Comp = defineAsyncComponent(() => import('./comp/index.vue'));
const ApiModel = defineAsyncComponent(() => import('./comp/apisModel/index.vue'));

const CodeView = defineAsyncComponent(() => import('./comp/basic/code.vue'));

const props =withDefaults(defineProps<Props>(), {
  api: ''
});

const activeMenuKey = ref();
const schemaType = ref();
const viewMode = ref<'form'|'code'|'preview'>('form');
const updateData = (comp: {name: string; value: any; type: string}) => {
  dataSource.value.components && dataSource.value.components[comp.type]
    ? dataSource.value.components[comp.type][comp.name] = comp.value
    : dataSource.value.components ? dataSource.value.components[comp.type] = {
      [comp.name]: comp.value
    } : dataSource.value.components = {
      [comp.type]: {
        [comp.name]: comp.value
      }
    };
};

const selectedApi = ref();
const apiEndpoint = ref();
watch(() => activeMenuKey.value, (newValue) => {
  if (newValue) {
    const path_method = newValue.split('_');
    const method = path_method[path_method.length - 1]
    if (['get', 'post', 'options', 'patch', 'head', 'delete', 'trace', 'put'].includes(method)) {
      const path = newValue.slice(0, newValue.length - (method.length + 1) );
      if (dataSource.value?.paths?.[path]?.[method]) {
        selectedApi.value = {...dataSource.value.paths[path][method], endpoint: path, method};
        apiEndpoint.value = path;
        return;
      }
    }
  }
  selectedApi.value = undefined;
  apiEndpoint.value = undefined;
});

</script>

<template>
  <div class="flex p-1 api-root min-w-200 overflow-auto">
    <div class="w-80 bg-gray-100 h-full overflow-y-auto p-1">
      <SiderMenu
        v-model:active-menu-key="activeMenuKey"
        v-model:schemaType="schemaType"
        :dataSource="dataSource"
        @addComp="updateData" />
    </div>
    <div class="flex flex-col flex-1 min-w-200 py-2 pl-2 h-full overflow-auto">
      <div></div>
      <div class="flex justify-end">
        <slot name="docInfoButton"></slot>
        <RadioGroup v-model:value="viewMode">
          <RadioButton value="form">表单</RadioButton>
          <RadioButton value="code">代码</RadioButton>
          <RadioButton value="preview">预览</RadioButton>
        </RadioGroup>
      </div>
      <Tabs v-model:activeKey="viewMode" class="flex-1 view-type-tab">
        <TabPane key="form" forceRender class="overflow-auto pr-3" >
          <DocInfo v-if="activeMenuKey === 'docInfo'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" />
          <ExternalDoc v-else-if="activeMenuKey === 'externalDoc'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" />
          <Server v-else-if="activeMenuKey === 'server'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" />
          <Tag v-else-if="activeMenuKey === 'tag'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" />
          <Extensions v-else-if="activeMenuKey === 'extensions'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" />
          <Security v-else-if="activeMenuKey === 'securities'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" />
          <ApiModel v-else-if="selectedApi" :dataSource="selectedApi" :openapiDoc="dataSource"/>
          <Comp v-else  class="mt-4" :dataSource="dataSource" :schemaType="schemaType" :schemaName="activeMenuKey" />
        </TabPane>
        <TabPane key="code">
          <CodeView class="h-full" :selectStr="selectedApi || dataSource[activeMenuKey]" :startKey="apiEndpoint" :dataSource="dataSource" />
        </TabPane>
      </Tabs>

    </div>
  </div>
</template>

<style scoped>
:deep(.ant-tabs.view-type-tab)>.ant-tabs-nav {
  display: none;
}

:deep(.ant-tabs.view-type-tab) >.ant-tabs-content-holder > .ant-tabs-content.ant-tabs-content-top {
  height: 100%;
}
</style>

<style>

.api-root{
  height: 100%;
  font-family:
    Inter,
    "Apple System",
    "SF Pro SC",
    "SF Pro Display",
    "Helvetica Neue",
    Arial,
    "PingFang SC",
    "Hiragino Sans GB",
    STHeiti,
    "Microsoft YaHei",
    "Microsoft JhengHei",
    "Source Han Sans SC",
    "Noto Sans CJK SC",
    "Source Han Sans CN",
    sans-serif;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.ant-input.ant-input-borderless:hover {
 @apply bg-gray-200;
}
</style>
