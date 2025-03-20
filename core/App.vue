
<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';
import { RadioGroup, RadioButton } from 'ant-design-vue';
import SiderMenu from './siderMenu/index.vue';
import { data } from './data.ts';

export type Props = {
  api: string
}

const dataSource = ref<{[key: string]: any}>(data);

const securitySchemes: Record<string, any> = data.components?.securitySchemes || {};

const DocInfo = defineAsyncComponent(() => import('./docInfo/index.vue'));
const ExternalDoc = defineAsyncComponent(() => import('./externalDoc/index.vue'));
const Server = defineAsyncComponent(() => import('./server/index.vue'));
const Tag = defineAsyncComponent(() => import('./tag/index.vue'));
const Extensions = defineAsyncComponent(() => import('./extensions/index.vue'));
const Security = defineAsyncComponent(() => import('./security/index.vue'));
const Comp = defineAsyncComponent(() => import('./comp/index.vue'));

const props =withDefaults(defineProps<Props>(), {
  api: ''
});

const activeMenuKey = ref();
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

</script>

<template>
  <div class="flex p-1 api-root min-w-200 overflow-auto">
    <div class="w-80 bg-gray-100 h-full overflow-y-auto p-1">
      <SiderMenu
        v-model:active-menu-key="activeMenuKey"
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
      <DocInfo v-if="activeMenuKey === 'docInfo'" :viewMode="viewMode" class="mt-4" />
      <ExternalDoc v-else-if="activeMenuKey === 'externalDoc'" :viewMode="viewMode" class="mt-4" />
      <Server v-else-if="activeMenuKey === 'server'" :viewMode="viewMode" class="mt-4" />
      <Tag v-else-if="activeMenuKey === 'tag'" :viewMode="viewMode" class="mt-4" />
      <Extensions v-else-if="activeMenuKey === 'extensions'" :viewMode="viewMode" class="mt-4" />
      <Security v-else-if="activeMenuKey === 'securities'" :viewMode="viewMode" class="mt-4" />
      <Comp v-else  class="mt-4" :dataSource="dataSource" :path="activeMenuKey" />
    </div>
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
</style>
