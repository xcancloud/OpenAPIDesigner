
<script setup lang="ts">
import { defineAsyncComponent, ref, watch, provide, nextTick, inject, onMounted } from 'vue';
import { RadioGroup, RadioButton, Tabs, TabPane } from 'ant-design-vue';
import SiderMenu from './siderMenu/index.vue';
import { data1 as data } from './data.ts';

export type Props = {
  api: string
}

const getAppFunc = inject('getAppFunc', (arg: {name: string, func: Function}):void => {});
const dataSource = ref<{[key: string]: any}>(data);

const DocInfo = defineAsyncComponent(() => import('./docInfo/formView/index.vue'));
const ExternalDoc = defineAsyncComponent(() => import('./externalDoc/formView/index.vue'));
const Server = defineAsyncComponent(() => import('./server/index.vue'));
const Tag = defineAsyncComponent(() => import('./tag/index.vue'));
const Extensions = defineAsyncComponent(() => import('./extensions/index.vue'));
const Security = defineAsyncComponent(() => import('./security/index.vue'));
const Comp = defineAsyncComponent(() => import('./comp/index.vue'));
const ApiModel = defineAsyncComponent(() => import('./comp/apisModel/index.vue'));

const DocInfoPreview = defineAsyncComponent(() => import('./docInfo/preview/index.vue'));
const ExternalDocPreview = defineAsyncComponent(() => import('./externalDoc/preView/index.vue'));
const ServerPreview = defineAsyncComponent(() => import('./server/preView/index.vue'));
const SecurityPreview = defineAsyncComponent(() => import('./security/preView/index.vue'));

const CodeView = defineAsyncComponent(() => import('./comp/basic/code.vue'));

const props = withDefaults(defineProps<Props>(), {
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
const selectApiObj = ref();
const apiEndpoint = ref();
watch(() => activeMenuKey.value, (newValue) => {
  if (newValue) {
    const path_method = newValue.split('_');
    const method = path_method[path_method.length - 1]
    if (['get', 'post', 'options', 'patch', 'head', 'delete', 'trace', 'put'].includes(method)) {
      const path = newValue.slice(0, newValue.length - (method.length + 1) );
      if (dataSource.value?.paths?.[path]?.[method]) {
        selectedApi.value = {...dataSource.value.paths[path][method], endpoint: path, method};
        selectApiObj.value = {[method]: {...dataSource.value.paths[path][method]}};
        apiEndpoint.value = path;
        return;
      }
    }
  }
  selectedApi.value = undefined;
  selectApiObj.value = undefined;
  apiEndpoint.value = undefined;
});

const handleDelComp = () => {
  
  const schema = schemaType.value;
  const compName = activeMenuKey.value;
  activeMenuKey.value = 'info';
  nextTick(() => {
    delete dataSource.value.components[schema][compName];
  });
};

const saveSecurity = (data) => {
  dataSource.value.components.securitySchemes = data;
};

onMounted(() => {
  getAppFunc({name: 'getDocApi', func: () => {
    return dataSource.value;
  }});
});

provide('dataSource', dataSource);
</script>

<template>
  <div class="flex p-1 api-root min-w-200 overflow-auto">
    <div class="w-80 bg-gray-100 h-full overflow-y-auto p-1">
      <SiderMenu
        v-model:active-menu-key="activeMenuKey"
        v-model:schemaType="schemaType"
        :dataSource="dataSource"
        @addComp="updateData"
        @delComp="handleDelComp" />
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
      <Tabs v-model:activeKey="viewMode" destroyInactiveTabPane class="flex-1 view-type-tab">
        <TabPane key="form" class="overflow-auto pr-3" >
          <DocInfo v-if="activeMenuKey === 'info'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" />
          <ExternalDoc v-else-if="activeMenuKey === 'externalDocs'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" />
          <Server v-else-if="activeMenuKey === 'servers'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" />
          <Tag v-else-if="activeMenuKey === 'tags'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" />
          <Extensions v-else-if="activeMenuKey === 'extensions'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" />
          <Security v-else-if="activeMenuKey === 'security'" :dataSource="dataSource" :viewMode="viewMode" class="mt-4" @save="saveSecurity" />
          <ApiModel v-else-if="selectedApi" :dataSource="selectedApi" :openapiDoc="dataSource"/>
          <Comp v-else  class="mt-4" :dataSource="dataSource" :schemaType="schemaType" :schemaName="activeMenuKey" @del="handleDelComp" />
        </TabPane>
        <TabPane key="code">
          <CodeView v-if="!schemaType" class="h-full" :selectStr="selectApiObj || {[activeMenuKey]: dataSource[activeMenuKey]}" :startKey="selectApiObj ? (apiEndpoint || 'paths') : undefined" :dataSource="dataSource" />
          <CodeView v-else class="h-full" :selectStr="{[activeMenuKey]: dataSource.components?.[schemaType]?.[activeMenuKey]}" startKey="components" :dataSource="dataSource"  />
        </TabPane>
        <TabPane key="preview" class="overflow-auto pr-3 space-y-4">
          <DocInfoPreview />
          <ExternalDocPreview />
          <ServerPreview />
          <SecurityPreview />
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
