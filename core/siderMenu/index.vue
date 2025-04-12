/* stylelint-disable at-rule-no-deprecated */
<script lang="ts" setup>
import { computed, onMounted, ref, watch, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { Input, Select, Dropdown, Menu, MenuItem, Modal, notification, Button } from 'ant-design-vue';
import Arrow from '@/components/Arrow/index.vue';
import { methodOpt } from './config';

import docInfoSvg  from '../Icons/docInfo.svg';
import outDocSvg from '../Icons/outDoc.svg';
import serverSvg from '../Icons/server.svg';
import anquanSvg from '../Icons/anquan.svg';
import tagSvg from '../Icons/tag.svg';
import MenuDropdown from '@/components/Dropdown/index.vue';


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
  (e: 'delComp'):void}>();
const createNameModalVisible = ref(false);
const createName = ref();
const parameterIn = ref('query');

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
    children: [ ...Object.keys(apiPaths.value)]
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
        message: '提示',
        description: '名称重复，请修改后重新输入'
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
        message: '提示',
        description: '名称重复，请修改后重新输入'
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
        message: '提示',
        description: '名称重复，请修改后重新输入'
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
        message: '提示',
        description: '名称重复，请修改后重新输入'
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
        message: '提示',
        description: '名称重复，请修改后重新输入'
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
        message: '提示',
        description: '名称重复，请修改后重新输入'
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
        message: '提示',
        description: '名称重复，请修改后重新输入'
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
        message: '提示',
        description: '路径重复，请修改后重新输入'
      });
    }
    createNameModalVisible.value = false;
    apiPaths.value[createName.value] = {};
    if (!dataSource.value.paths) {
      dataSource.value.paths = {};
    }
    dataSource.value.paths[createName.value] = {};
  }
};

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
      message: '提示',
      description: 'Method 已存在，无需添加'
    });
    return;
  }
  addApiMethod.value = methodOptions.value[0].value;
  creatMethodVisible.value = true;
  createName.value = undefined;
}

const addMethod = () => {
  if (!createName.value) {
    return;
  }
  apiPaths.value[addMethdPath.value][addApiMethod.value] = {
    summary: createName.value
  };
  dataSource.value.paths[addMethdPath.value][addApiMethod.value] = {
    summary: createName.value
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

const handleDelComp = () => {
  emits('delComp');
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
    immediate: true
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
    <Input :placeholder="t('搜索')" />
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
            <template v-if="['apis'].includes(menu.key)">{{ `(${menu.children?.length})` }}</template>
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
                :menuItems="[{key: 'del', name: '删除'}]"
                @click="handleDelComp(subMenu.key, subsubMenu.key)">
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
          v-for="apis, path in apiPaths"
          v-show="compExpandMap[menu.key]"
          class="pl-4"
          :key="path">
          <Dropdown trigger="contextmenu">
            <div
              class="h-8 leading-8 pl-2 cursor-pointer bg hover:bg-bg-hover truncate select-none hover:bg-gray-200"
              :class="{'text-blue-1': `${path}_` === props.activeMenuKey}"
              @click="selectPath(path)">
              <Arrow
                v-model:open="compExpandMap[path]" />
              {{ path }}
            </div>
            <template #overlay>
              <Menu @click="handleAddApisMethod(path)">
                <MenuItem key="add">{{ `${t('add')} Method` }}</MenuItem>
              </Menu>
            </template>
          </Dropdown>
          <div
            v-for="api,method in apis"
            v-show="compExpandMap[path]"
            :key="method"
            :class="{'text-blue-1': `${path}_${method}` === props.activeMenuKey}"
            class="h-7 leading-7 pl-6 pr-1 cursor-pointer hover:bg-bg-hover flex justify-between items-center hover:bg-gray-200"
            @click="selectApi(path, method, api)">
            <span class="flex-1 truncate min-w-0"> <Icon icon="icon-apimoren" class="text-4 mr-1" />{{ api.summary }}</span>
            <span :class="methodColorConfig[method]">{{ method.toUpperCase() }}</span>
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
        placeholder="输入名称"  />
    </Modal>

    <Modal
      v-model:visible="creatMethodVisible"
      :width="400"
      title="方法"
      @ok="addMethod">
      <Select
        v-model:value="addApiMethod"
        class="w-30 mb-2"
        :options="methodOptions" />
      <Input
        v-model:value="createName"
        :maxlength="80"
        placeholder="输入摘要"  />
    </Modal>
  </div>
</template>


