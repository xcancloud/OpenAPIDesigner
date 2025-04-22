
<script setup lang="ts">
import { defineAsyncComponent, ref, watch, provide, nextTick, inject, onMounted, computed} from 'vue';
import { RadioGroup, RadioButton, Tabs, TabPane, Upload, Button } from 'ant-design-vue';
import SiderMenu from './siderMenu/index.vue';
import { useI18n } from 'vue-i18n';
import { methodOpt } from './siderMenu/config';
import YAML from 'yaml';
import { data1 as data } from './data.ts';

let i18n = inject(Symbol.for('i18n')); // for deme use
if (!i18n) {
  i18n = {global: useI18n()}; // for developer
}
const { t } = i18n?.global || useI18n();
const getAppFunc = inject('getAppFunc', (arg: {name: string, func: Function}):void => {});
const openApiDoc = inject('openApiDoc', undefined);
const dataSource = ref<{[key: string]: any}>(data);

const DocInfo = defineAsyncComponent(() => import('./docInfo/formView/index.vue'));
const ExternalDoc = defineAsyncComponent(() => import('./externalDoc/formView/index.vue'));
const Server = defineAsyncComponent(() => import('./server/index.vue'));
const Tag = defineAsyncComponent(() => import('./tag/index.vue'));
const Extensions = defineAsyncComponent(() => import('./extensions/index.vue'));
const Security = defineAsyncComponent(() => import('./security/index.vue'));
const Comp = defineAsyncComponent(() => import('./component/index.vue'));
const ApiModel = defineAsyncComponent(() => import('./component/apisModel/index.vue'));
const PathInfo = defineAsyncComponent(() => import('./pathInfo/index.vue'));

const DocInfoPreview = defineAsyncComponent(() => import('./docInfo/preview/index.vue'));
const ExternalDocPreview = defineAsyncComponent(() => import('./externalDoc/preView/index.vue'));
const ServerPreview = defineAsyncComponent(() => import('./server/preView/index.vue'));
const SecurityPreview = defineAsyncComponent(() => import('./security/preView/index.vue'));
const ApiPreview = defineAsyncComponent(() => import('./component/preView/index.vue'));

const CodeView = defineAsyncComponent(() => import('./component/basic/code.vue'));


const handleUploadFile = (options: {file: File, type: string}) => {

  const reader = new FileReader();
  reader.onload = () => {
    try {
      activeMenuKey.value = 'info';
      viewMode.value = 'form';
      nextTick(() => {
        const fileContent = reader.result as string;
        if (options.file.name.endsWith('.json')) {
          dataSource.value = JSON.parse(fileContent);
        }
        if (options.file.name.endsWith('.yaml')) {
          dataSource.value = YAML.parse(fileContent);
        }
        const opendocKeys = ['openapi', 'info', 'jsonSchemaDialect', 'servers', 'paths', 'webhooks', 'components', 'security', 'tags', 'externalDocs'];
        Object.keys(dataSource.value).forEach(key => {
          if (key.startsWith('x-')) {
            return;
          }
          if (!opendocKeys.includes(key)) {
            delete dataSource.value[key];
          }
        })
      })

    } catch (error) {
    }
  };
  reader.readAsText(options.file);
};

const handleDownload = () => {
  const data = dataSource.value;
  if (!data) {
    return '';
  }

  let blob:any = data;
  if (!(data instanceof Blob)) {
    if (typeof blob === 'object') {
      blob = JSON.stringify(blob, null, 2);
    }

    blob = new Blob([blob], {
      type: 'application/octet-stream'
    });
  }

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'open-api-designer.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  window.URL.revokeObjectURL(url);
}



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
const selectPath = ref();
watch(() => activeMenuKey.value, (newValue) => {
  if (newValue) {
    const path_method = newValue.split('_');
    const method = path_method[path_method.length - 1];
    if (methodOpt.includes(method)) {
      const path = newValue.slice(0, newValue.length - (method.length + 1) );
      if (dataSource.value?.paths?.[path]?.[method]) {
        selectedApi.value = {...dataSource.value.paths[path][method], endpoint: path, method};
        selectApiObj.value = {[method]: {...dataSource.value.paths[path][method]}};
        apiEndpoint.value = path;
        selectPath.value = undefined;
        return;
      }
    } else if (method === '') {
      const path = newValue.slice(0, newValue.length - (method.length + 1) );
      selectPath.value = dataSource.value.paths[path];
      apiEndpoint.value = path;
      selectedApi.value = undefined;
      selectApiObj.value = undefined;
      return;
    }
  }
  selectedApi.value = undefined;
  selectApiObj.value = undefined;
  apiEndpoint.value = undefined;
  selectPath.value = undefined;
});

const handleDelComp = (selectKey: string, schemaType: string) => {
  let compName = selectKey || activeMenuKey.value;
  let method: string;
  if (schemaType === 'paths') {
    const path = compName.split('_');
    compName = path[0];
    method = path[1];
  }
  if (selectKey === activeMenuKey.value) {
    activeMenuKey.value = 'info';
  }
  nextTick(() => {
    if (schemaType === 'paths') {
      if (method) {
        delete dataSource.value[schemaType][compName][method];
        return;
      }
      delete dataSource.value[schemaType][compName];
      return;
    }
    delete dataSource.value.components[schemaType][compName];
    
  });
};

const saveSecurity = (data: {[key: string]: any}) => {
  if (dataSource.value?.components) {
    dataSource.value.components.securitySchemes = data;
  } else {
    dataSource.value.components = {
      securitySchemes: data
    };
  }
  
};

const showPreview = computed(() => {
  return !schemaType.value && !selectPath.value && activeMenuKey.value !== 'extensions';
});

const extentionsObj = computed(() => {
  const result: Record<string, string> = {};
  Object.keys(dataSource.value).forEach(key => {
    if (key.startsWith('x-')) {
      result[key] = dataSource.value[key]
    }
  });
  return result;
});

onMounted(() => {
  getAppFunc({name: 'getDocApi', func: () => {
    return dataSource.value;
  }});

  watch(() => showPreview.value, (newValue) => {
    if (!newValue) {
      viewMode.value = 'form';
    }
  })

  watch(() => openApiDoc, (newValue) => {
    if (newValue) {
      dataSource.value = newValue;
    }
    
  }, {
    immediate: true
  })
});

provide('dataSource', dataSource);
provide('i18n', i18n);
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
      <div> <slot name="docTitle"></slot> </div>
      <div class="flex justify-between">
        <div class="flex space-x-2 items-center">
          <Upload
            :customRequest="handleUploadFile"
            accept=".json,.yaml"
            :showUploadList="false">
            <Button type="primary" size="small">上传</Button>
          </Upload>
          <Button size="small" @click="handleDownload">下载</Button>
        </div>
        <RadioGroup v-model:value="viewMode">
          <RadioButton value="form">{{t('form')}}</RadioButton>
          <RadioButton value="code">{{t('code')}}</RadioButton>
          <RadioButton v-if="showPreview" value="preview">{{t('preview')}}</RadioButton>
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
          <PathInfo :key="apiEndpoint" v-else-if="selectPath" :dataSource="selectPath" :path="apiEndpoint"  />
          <Comp v-else  class="mt-4" :dataSource="dataSource" :schemaType="schemaType" :schemaName="activeMenuKey" @del="handleDelComp" />
        </TabPane>
        <TabPane key="code">
          <CodeView v-if="!schemaType && selectApiObj" class="h-full" :selectStr="selectApiObj" :startKey="selectApiObj ? (apiEndpoint || 'paths') : undefined" :dataSource="dataSource" />
          <CodeView v-else-if="!schemaType && selectPath" class="h-full" :selectStr="{ [apiEndpoint]: selectPath}" :startKey="selectPath ? 'paths' : undefined" :dataSource="dataSource" />
          <CodeView v-else-if="activeMenuKey === 'extensions'" class="h-full" :selectStr="extentionsObj" :startKey="undefined" :dataSource="dataSource" />
          <CodeView v-else-if="!schemaType" class="h-full" :selectStr="{[activeMenuKey]: dataSource[activeMenuKey]}" :startKey="undefined" :dataSource="dataSource" />
          <CodeView v-else class="h-full" :selectStr="{[activeMenuKey]: dataSource.components?.[schemaType]?.[activeMenuKey]}" startKey="components" :dataSource="dataSource"  />
        </TabPane>
        <TabPane v-if="showPreview" key="preview" class="overflow-auto pr-3 space-y-4">
          <DocInfoPreview v-if="activeMenuKey === 'info'" />
          <ExternalDocPreview  v-else-if="activeMenuKey === 'externalDocs'" />
          <ServerPreview  v-else-if="activeMenuKey === 'servers'" />
          <SecurityPreview  v-else-if="activeMenuKey === 'security'" />
          <ApiPreview  v-if="selectedApi" :apis="selectedApi" />
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
  color: #525A65;
}

.ant-input.ant-input-borderless:hover {
 @apply bg-gray-200;
}
</style>
