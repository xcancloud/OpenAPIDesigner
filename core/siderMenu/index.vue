/* stylelint-disable at-rule-no-deprecated */
<script lang="ts" setup>
import { computed, onMounted, ref, watch, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { Input, Select, Dropdown, Menu, MenuItem, Modal, notification, Button } from 'ant-design-vue';
import Arrow from '@/common/arrow/index.vue';
import { methodOpt, getPathParameterByPath } from './config';

import docInfoSvg  from '../Icons/docInfo.svg';
import outDocSvg from '../Icons/outDoc.svg';
import serverSvg from '../Icons/server.svg';
import anquanSvg from '../Icons/anquan.svg';
import tagSvg from '../Icons/tag.svg';
import MenuDropdown from '@/common/dropdown/index.vue';


interface Props {
  activeMenuKey: string;
  dataSource: {[key:string]: any},
  schemaType?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeMenuKey: 'info',
  dataSource: () => ({}),
  schemaType: undefined
});

const { t } = useI18n();
const dataSource = inject('dataSource', ref());

interface MenuItem {
  key: string;
  title: string;
  children?: MenuItem[]
};

const emits = defineEmits<{
  (e: 'update:activeMenuKey', value: string): void;
  (e: 'update:schemaType', value?: string):void;
  (e:'addComp', value: {name: string, value: any; type: string;}):void;
  (e: 'delComp', selectKey: string, schemaType?: string|undefined):void}>();
const createNameModalVisible = ref(false);
const createName = ref();
const parameterIn = ref('query');
const handleCreatedName = () => {
  createName.value = createName.value.replace(new RegExp('[^\\da-zA-Z\\s\\/\\{\\}]', 'gi'), '');
}

// 展开收起
const compExpandMap = ref<{[key: string]: boolean}>({ paths: true });
const toggleOpenValue = (key: string) => {
  compExpandMap.value[key] = !compExpandMap.value[key];
};

const modelChildren = ref<MenuItem[]>([]); // 模型组件
const parameterChildren = ref<MenuItem[]>([]); // 参数组件
const bodyChildren = ref<MenuItem[]>([]); // 请求体组件
const responseChildren = ref<MenuItem[]>([]); // 响应体组件
const headerChildren = ref<MenuItem[]>([]); // 请求头组件
const securityChildren = ref<MenuItem[]>([]); // 安全方案组件
const extensionChildren = ref<MenuItem[]>([]); // 扩展组件

const apiPaths = ref<{[key: string]: any}>({});
const selectedApi = ref();

const selectApi = (endpoint: string, method: string) => {
  selectedApi.value = `${endpoint}_${method}`;
  handleSelect(selectedApi.value);
};

const selectPath = (endpoint: string) => {
  if (selectedApi.value === `${endpoint}_`) {
    toggleOpenValue(endpoint);
  } else {
    selectedApi.value = `${endpoint}_`;
    handleSelect(selectedApi.value);
  }
}


const defaultMenu = computed(() => [
  {
    title: t('doc_info'),
    key: 'info',
    icon: docInfoSvg
  },
  {
    title: t('external_doc'),
    key: 'externalDocs',
    icon: outDocSvg
  },
  {
    title: t('servers'),
    key: 'servers',
    icon: serverSvg
  },
  {
    title: t('security'),
    key: 'security',
    icon: anquanSvg
  },
  {
    title: t('tag'),
    key: 'tags',
    icon: tagSvg
  },
  {
    title: t('apis'),
    key: 'apis',
    children: []
  },
  {
    title: t('component'),
    key: 'components',
    selectable: false,
    children: [ // const compType = ['schemas', 'parameters', 'responses', 'requestBodies'];
      {
        title: t('model'),
        key: 'schemas',
        selectable: false,
        children: [...modelChildren.value]
      },
      {
        title: t('parameter'),
        key: 'parameters',
        selectable: false,
        children: [...parameterChildren.value]
      },
      {
        title: t('request_body'),
        key: 'requestBodies',
        selectable: false,
        children: [...bodyChildren.value]
      },
      {
        title: t('response'),
        key: 'responses',
        selectable: false,
        children: [...responseChildren.value]
      },
      {
        title: t('header'),
        key: 'headers',
        selectable: false,
        children: [...headerChildren.value]
      },
      {
        title: t('security_schema'),
        key: 'securitySchemes',
        selectable: false,
        children: [...securityChildren.value]
      }
    ]
  },
  {
    title: t('extension'),
    key: 'extensions'
  }
]);


const addType = ref<string>();
const handleAddModel = (key: string) => {
  addType.value = key;
  createNameModalVisible.value = true;
  createName.value = undefined;
};


const addModel = () => {
  if (!createName.value) {
    return;
  }
  if (addType.value === 'schemas') {
    if (modelChildren.value.find(i => i.title === createName.value)) {
      notification.warning({
        message: t('tip'),
        description: t('name_repeat_placeholder')
      });
      return;
    }
    createNameModalVisible.value = false;
    modelChildren.value.push({
      title: createName.value,
      key: createName.value,
      // key: `#/components/${addType}/${createName.value}`,
    });
    emits('addComp', {name: createName.value, type:addType.value,  value: {
      type: 'object'
    }});
    return;
  }

  if (addType.value === 'parameters') {
    if (parameterChildren.value.find(i => i.title === createName.value)) {
      notification.warning({
        message: t('tip'),
        description: t('name_repeat_placeholder')
      });
      return;
    }
    createNameModalVisible.value = false;
    parameterChildren.value.push({
      title: createName.value,
      key: createName.value,
      // key: `#/components/${addType}/${createName.value}`,
    });
    emits('addComp', {name: createName.value, type:addType.value, value: {
      type: 'string',
      name: createName.value,
      in: parameterIn.value
    }});
    return;
  }
  if (addType.value === 'requestBodies') {
    if (bodyChildren.value.find(i => i.title === createName.value)) {
      notification.warning({
        message: t('tip'),
        description: t('name_repeat_placeholder')
      });
      return;
    }
    createNameModalVisible.value = false;
    bodyChildren.value.push({
      title: createName.value,
      key: createName.value,
      // key: `#/components/${addType}/${createName.value}`,
    });
    emits('addComp', {name: createName.value, type:addType.value, value: {
      type: 'object',
    }});
    return;
  }
  if (addType.value === 'responses') {
    if (responseChildren.value.find(i => i.title === createName.value)) {
      notification.warning({
        message: t('tip'),
        description: t('name_repeat_placeholder')
      });
      return;
    }
    createNameModalVisible.value = false;
    responseChildren.value.push({
      title: createName.value,
      key: createName.value,
      // key: `#/components/${addType}/${createName.value}`,
    });
    emits('addComp', {name: createName.value, type:addType.value, value: {
      type: 'object',
    }});
    return;
  }

  if (addType.value === 'headers') {
    if (headerChildren.value.find(i => i.title === createName.value)) {
      notification.warning({
        message: t('tip'),
        description: t('name_repeat_placeholder')
      });
      return;
    }
    createNameModalVisible.value = false;
    headerChildren.value.push({
      title: createName.value,
      key: createName.value,
      // key: `#/components/${addType}/${createName.value}`,
    });
    emits('addComp', {name: createName.value, type:addType.value, value: {
      name: createName.value,
    }});
    return;
  }

  if (addType.value === 'securitySchemes') {
    if (securityChildren.value.find(i => i.title === createName.value)) {
      notification.warning({
        message: t('tip'),
        description: t('name_repeat_placeholder')
      });
      return;
    }
    createNameModalVisible.value = false;
    securityChildren.value.push({
      title: createName.value,
      key: createName.value,
      // key: `#/components/${addType}/${createName.value}`,
    });
    emits('addComp', {name: createName.value, type:addType.value, value: {
      name: createName.value
    }});
    return;
  }

  if (addType.value === 'extension') {
    if (extensionChildren.value.find(i => i.title === createName.value)) {
      notification.warning({
        message: t('tip'),
        description: t('name_repeat_placeholder')
      });
      return;
    }
    createNameModalVisible.value = false;
    extensionChildren.value.push({
      title: createName.value,
      key: createName.value,
      // key: `#/components/${addType}/${createName.value}`,
    });
    return;
  }

  if (addType.value === 'path') {
    if (apiPaths.value[createName.value]) {
      notification.warning({
        message: t('tip'),
        description: t('path_repeat_placeholder')
      });
    }
    createNameModalVisible.value = false;
    if (createName.value && !createName.value.startsWith('/')) {
      createName.value = '/' + createName.value;
    }
    apiPaths.value[createName.value] = {};
    if (!dataSource.value.paths) {
      dataSource.value.paths = {};
    }
    dataSource.value.paths[createName.value] = {};
  }
};

const handleApis = (path: string, action: {key: string}) => {
  if (action.key === 'add') {
    handleAddApisMethod(path)
  }
  if (action.key === 'delete') {
    handleDeleteApis(path, '');
  }
}

const handleApisMethod = (path: string, method: string, action: {key: string}) => {
  if (action.key === 'delete') {
    handleDeleteApis(path, method);
  }
}

const addApiMethod = ref();
const creatMethodVisible = ref(false);
const methodOptions = ref<{value: string; label: string}[]>([]);
const addMethdPath = ref();
const handleAddApisMethod = (path: string) => {
  addMethdPath.value = path || '';
  const api = apiPaths.value[path] || {};
  const hasMethods = Object.keys(api);
  methodOptions.value = methodOpt.filter(m => !hasMethods.includes(m)).map(i => ({value: i, label: i}));
  if (!methodOptions.value.length) {
    notification.warning({
      message: t('tip'),
      description: t('method_repeat_placeholder')
    });
    return;
  }
  addApiMethod.value = methodOptions.value[0].value;
  creatMethodVisible.value = true;
  createName.value = undefined;
}

const handleDeleteApis = (path: string, method: string) => {
  emits('delComp', `${path}_${method}`, 'paths');
}



const addMethod = () => {
  if (!createName.value) {
    return;
  }
  apiPaths.value[addMethdPath.value][addApiMethod.value] = {
    summary: createName.value,
    parameters: getPathParameterByPath(addMethdPath.value)
  };
  dataSource.value.paths[addMethdPath.value][addApiMethod.value] = {
    summary: createName.value,
    parameters: getPathParameterByPath(addMethdPath.value)
  };
  creatMethodVisible.value = false;
};

const handleSelect = (selectedKeys: string) => {
  emits('update:activeMenuKey', selectedKeys);
  emits('update:schemaType', undefined);
};

const handleSelectComp = (selectedKeys: string, schemaType: string) => {
  handleSelect(selectedKeys);
  emits('update:schemaType', schemaType);
};

const handleDelComp = (selectedKeys: string, schemaType: string) => {
  emits('delComp', selectedKeys, schemaType);
};

onMounted(() => {
  emits('update:activeMenuKey', 'info');
  watch(() => props.dataSource?.paths, (newValue) => {
    const pathItem = JSON.parse(JSON.stringify(newValue || {}));
    Object.keys(pathItem).forEach(key => {
      Object.keys(pathItem[key]).forEach(method => {
        if (!methodOpt.includes(method)) {
          delete pathItem[key][method];
        }
      });
    });
    apiPaths.value = pathItem;
  }, {
    immediate: true,
    deep: true
  });

  watch(() => props.dataSource?.components, (newValue) => {
    modelChildren.value = Object.keys(newValue?.schemas || {}).map(path => {
      // const title = path.split('/').reverse()[0];
      return {
        title: path,
        key: path,
        schame: newValue.schemas[path]
      }
    });

    securityChildren.value = Object.keys(newValue?.securitySchemes || {}).map(path => {
      // const title = path.split('/').reverse()[0];
      return {
        title: path,
        key: path,
        schame: newValue.schemas[path]
      }
    });

    parameterChildren.value = Object.keys(newValue?.parameters || {}).map(path => {
      // const title = path.split('/').reverse()[0];
      return {
        title: path,
        key: path,
        schame: newValue.schemas[path]
      }
    });

    responseChildren.value = Object.keys(newValue?.responses || {}).map(path => {
      // const title = path.split('/').reverse()[0];
      return {
        title: path,
        key: path,
        schame: newValue.schemas[path]
      }
    });

    bodyChildren.value = Object.keys(newValue?.requestBodies || {}).map(path => {
      return {
        title: path,
        key: path,
        schame: newValue.schemas[path]
      }
    });
  }, {
    immediate: true,
    deep: true
  });
});

const methodColorConfig:Record<string, string> = {
  get: 'text-http-get',
  post: 'text-http-post',
  put: 'text-http-put',
  head: 'text-http-head',
  delete: 'text-http-delete',
  patch: 'text-http-patch',
  options: 'text-http-options',
  trace: 'text-http-trace',
};

</script>
<template>
  <div>
    <Input :placeholder="t('search')" />
    <div v-for="menu in defaultMenu" :key="menu.key">
      <Dropdown v-if="menu.key === 'apis'" trigger="contextmenu">
        <div
          class="h-8 leading-8 px-2 cursor-pointer flex items-center justify-between font-medium bg-bg-content hover:bg-gray-200"
          @click="menu.children ? toggleOpenValue(menu.key) : handleSelect(menu.key)">

          <div class="flex items-center" :class="{'text-blue-1': menu.key === props.activeMenuKey}">
            <img v-if="menu.icon" class="w-4 h-4 mr-1" :src="menu.icon" />
            <Arrow
              v-if="menu.children"
              v-model:open="compExpandMap[menu.key]" />
            <span class="truncate">{{ menu.title }}</span>
            <template v-if="['apis'].includes(menu.key)">{{ `(${Object.keys(apiPaths || {})?.length})` }}</template>
          </div>
        </div>
        <template #overlay>
          <Menu @click="handleAddModel('path')">
            <MenuItem key="add">{{ `${t('add')} Path` }}</MenuItem>
          </Menu>
        </template>
      </Dropdown>

      <div v-else
          class="h-8 leading-8 px-2 cursor-pointer flex items-center justify-between font-medium bg-bg-content hover:bg-gray-200"
          @click="menu.children ? toggleOpenValue(menu.key) : handleSelect(menu.key)">

          <div class="flex items-center" :class="{'text-blue-1': menu.key === props.activeMenuKey}">
            <img v-if="menu.icon" class="w-4 h-4 mr-1" :src="menu.icon" />
            <Arrow
              v-if="menu.children"
              v-model:open="compExpandMap[menu.key]" />
            <span class="truncate">{{ menu.title }}</span>
            <template v-if="['apis'].includes(menu.key)">{{ `(${menu.children?.length})` }}</template>
          </div>
        </div>
      

      <template v-if="menu.key === 'components' && compExpandMap[menu.key]">
        <div
          v-for="subMenu in menu.children"
          class="pl-4 leading-8 px-2 cursor-pointer font-medium bg-bg-content select-none">

          <Dropdown trigger="contextmenu">
            <div
              class="flex items-center hover:bg-gray-200" :class="{'text-blue-1': subMenu.key === props.activeMenuKey }"
              @click="subMenu.children ? toggleOpenValue(subMenu.key) : handleSelect(subMenu.key)">
              <Arrow
                v-if="subMenu.children"
                v-model:open="compExpandMap[subMenu.key]" />
              <span class="truncate">{{ subMenu.title }}</span>
              {{ `(${subMenu.children?.length})` }}
            </div>
            <template #overlay>
              <Menu @click="handleAddModel(subMenu.key)">
                <MenuItem key="add">{{ `${t('add')}${subMenu.title}` }}</MenuItem>
              </Menu>
            </template>
          </Dropdown>
          

          <div v-show="compExpandMap[subMenu.key]">
            <div
              v-for="subsubMenu in subMenu.children"
              :class="{'text-blue-1': subsubMenu.key === props.activeMenuKey && props.schemaType === subMenu.key}"
              class="h-8 pl-4 leading-8 px-2 cursor-pointer flex items-center justify-between font-medium bg-bg-content hover:bg-gray-200"
              @click="handleSelectComp(subsubMenu.key, subMenu.key)">
              <div class="truncate">
                {{ subsubMenu.title }}
              </div>
              <MenuDropdown
                trigger="click"
                :menuItems="[{key: 'del', name: t('delete')}]"
                @click="handleDelComp(subsubMenu.key, subMenu.key)">
                <Button type="text" size="small">
                  ...
                </Button>
              </MenuDropdown>
            </div>
          </div>
        </div>
      </template>

      <template v-if="menu.key === 'apis'">
        <div
          v-for="(apis, path) in apiPaths"
          v-show="compExpandMap[menu.key]"
          class="pl-4"
          :key="path">
          <Dropdown trigger="contextmenu">
            <div
              class="h-8 leading-8 pl-2 cursor-pointer bg hover:bg-bg-hover truncate select-none hover:bg-gray-200"
              :class="{'text-blue-1': `${path}_` === props.activeMenuKey}"
              @click="selectPath(path as string)">
              <Arrow
                v-model:open="compExpandMap[path]" />
              {{ path }}
            </div>
            <template #overlay>
              <Menu @click="handleApis(path as string, $event)">
                <MenuItem key="add">{{ `${t('add')} Method` }}</MenuItem>
                <MenuItem key="delete">{{ `${t('delete')} ` }}</MenuItem>
              </Menu>
            </template>
          </Dropdown>
          <div
            v-for="api,method in apis"
            v-show="compExpandMap[path]"
            :key="method"
            :class="{'text-blue-1': `${path}_${method}` === props.activeMenuKey}"
            class="h-7 leading-7 pl-6 pr-1 cursor-pointer hover:bg-bg-hover  hover:bg-gray-200"
            @click="selectApi(path as string, method as string)">
            <Dropdown trigger="contextmenu">
              <div class="flex justify-between items-center">
                <span class="flex-1 truncate min-w-0">{{ api.summary }}</span>
                <span :class="methodColorConfig[method]">{{ method.toUpperCase() }}</span>
              </div>
              <template #overlay>
              <Menu @click="handleApisMethod(path as string, method,  $event)">
                <MenuItem key="delete">{{ `${t('delete')} ` }}</MenuItem>
              </Menu>
            </template>
            </Dropdown>
          </div>
        </div>
      </template>

    </div>

    <Modal
      v-model:visible="createNameModalVisible"
      :width="400"
      :title="t('name')"
      @ok="addModel">
      <Select
        v-show="addType === 'parameters'"
        v-model:value="parameterIn"
        class="w-30 mb-2"
        :options="['query', 'header', 'cookie', 'path'].map(i => ({value: i, label: i}))" />
      <Input
        v-model:value="createName"
        :maxlength="80"
        :placeholder="t('name_placeholder')"
        @change="handleCreatedName"  />
    </Modal>

    <Modal
      v-model:visible="creatMethodVisible"
      :width="400"
      title="Method"
      @ok="addMethod">
      <Select
        v-model:value="addApiMethod"
        class="w-30 mb-2"
        :options="methodOptions" />
      <Input
        v-model:value="createName"
        :maxlength="80"
        :placeholder="t('summary_placeholder')" />
    </Modal>
  </div>
</template>


