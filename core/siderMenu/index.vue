/* stylelint-disable at-rule-no-deprecated */
<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Input, Select, Dropdown, Menu, MenuItem, Modal, notification } from 'ant-design-vue';
import Arrow from '@/components/Arrow/index.vue';

import docInfoSvg  from '../Icons/docInfo.svg';
import outDocSvg from '../Icons/outDoc.svg';
import serverSvg from '../Icons/server.svg';
import anquanSvg from '../Icons/anquan.svg';
import tagSvg from '../Icons/tag.svg';


interface Props {
  activeMenuKey: string;
  dataSource: {[key:string]: any},
  schemaType?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeMenuKey: 'docInfo',
  dataSource: () => ({}),
  schemaType: undefined
});

// const emits = defineEmits<{}>();

interface MenuItem {
  key: string;
  title: string;
  children?: MenuItem[]
}

const emits = defineEmits<{
  (e: 'update:activeMenuKey', value: string): void;
  (e: 'update:schemaType', value?: string):void;
  (e:'addComp', value: {name: string, value: any; type: string;}):void}>();
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

const apiPaths = ref({});
const selectedApi = ref();

const selectApi = (endpoint: string, method: string) => {
  selectedApi.value = `${endpoint}_${method}`;
  handleSelect(selectedApi.value);
};


const defaultMenu = computed(() => [
  {
    title: '文档信息',
    key: 'docInfo',
    icon: docInfoSvg
  },
  {
    title: '外部文档',
    key: 'externalDoc',
    icon: outDocSvg
  },
  {
    title: '服务器',
    key: 'server',
    icon: serverSvg
  },
  {
    title: '安全',
    key: 'securities',
    icon: anquanSvg
  },
  {
    title: '标签',
    key: 'tag',
    icon: tagSvg
  },
  {
    title: '接口',
    key: 'apis',
    children: [...Object.keys(apiPaths.value)]
  },
  {
    title: '组件',
    key: 'components',
    selectable: false,
    children: [ // const compType = ['schemas', 'parameters', 'responses', 'requestBodies'];
      {
        title: '模型',
        key: 'schemas',
        selectable: false,
        children: [...modelChildren.value]
      },
      {
        title: '参数',
        key: 'parameters',
        selectable: false,
        children: [...parameterChildren.value]
      },
      {
        title: '请求体',
        key: 'requestBodies',
        selectable: false,
        children: [...bodyChildren.value]
      },
      {
        title: '响应',
        key: 'responses',
        selectable: false,
        children: [...responseChildren.value]
      },
      {
        title: '头',
        key: 'header',
        selectable: false,
        children: [...headerChildren.value]
      },
      {
        title: '安全方案',
        key: 'securitySchemes',
        selectable: false,
        children: [...securityChildren.value]
      },
      {
        title: '扩展',
        key: 'extension',
        selectable: false,
        children: [...extensionChildren.value]
      }
    ]
  },
  {
    title: '扩展',
    key: 'extensions',
    children: [

    ]
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

  if (addType.value === 'header') {
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
};

const handleSelect = (selectedKeys: string) => {
  emits('update:activeMenuKey', selectedKeys);
  emits('update:schemaType', undefined);
};

const handleSelectComp = (selectedKeys: string, schemaType: string) => {
  handleSelect(selectedKeys);
  emits('update:schemaType', schemaType);
}

onMounted(() => {
  emits('update:activeMenuKey', 'docInfo');
  watch(() => props.dataSource?.paths, (newValue) => {
    apiPaths.value = newValue || {};
  }, {
    immediate: true
  });

  watch(() => props.dataSource?.components, (newValue) => {
    modelChildren.value = Object.keys(newValue.schemas || {}).map(path => {
      // const title = path.split('/').reverse()[0];
      return {
        title: path,
        key: path,
        schame: newValue.schemas[path]
      }
    });

    securityChildren.value = Object.keys(newValue.securitySchemes || {}).map(path => {
      // const title = path.split('/').reverse()[0];
      return {
        title: path,
        key: path,
        schame: newValue.schemas[path]
      }
    });

    parameterChildren.value = Object.keys(newValue.parameters || {}).map(path => {
      // const title = path.split('/').reverse()[0];
      return {
        title: path,
        key: path,
        schame: newValue.schemas[path]
      }
    });

    responseChildren.value = Object.keys(newValue.responses || {}).map(path => {
      // const title = path.split('/').reverse()[0];
      return {
        title: path,
        key: path,
        schame: newValue.schemas[path]
      }
    });

    bodyChildren.value = Object.keys(newValue.requestBodies || {}).map(path => {
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
    <Input placeholder="搜索" />
    <div v-for="menu in defaultMenu" :key="menu.key">
      <div
        class="h-8 leading-8 px-2 cursor-pointer flex items-center justify-between font-medium bg-bg-content hover:bg-gray-200"
        @click="menu.children ? toggleOpenValue(menu.key) : handleSelect(menu.key)">

        <div class="flex items-center" :class="{'text-blue-1': menu.key === props.activeMenuKey}">
          <img v-if="menu.icon" class="w-4 h-4 mr-1" :src="menu.icon" />
          <Arrow
            v-if="menu.children"
            v-model:open="compExpandMap[menu.key]" />
          <span class="truncate">{{ menu.title }}</span>
          <template v-if="['apis', 'extensions'].includes(menu.key)">{{ `(${menu.children?.length})` }}</template>
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
                <MenuItem key="add">{{ `添加${subMenu.title}` }}</MenuItem>
              </Menu>
            </template>
          </Dropdown>
          

          <div v-show="compExpandMap[subMenu.key]">
            <div
              v-for="subsubMenu in subMenu.children"
              :class="{'text-blue-1': subsubMenu.key === props.activeMenuKey && props.schemaType === subMenu.key}"
              class="h-8 pl-4 leading-8 px-2 cursor-pointer flex items-center justify-between font-medium bg-bg-content hover:bg-gray-200"
              @click="handleSelectComp(subsubMenu.key, subMenu.key)">
              {{ subsubMenu.title }}
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
          <div
            class="h-8 leading-8 pl-2 cursor-pointer bg hover:bg-bg-hover truncate select-none hover:bg-gray-200"
            @click="toggleOpenValue(path)">
            <Arrow
              v-model:open="compExpandMap[path]" />
            {{ path }}
          </div>
          <div
            v-for="api,method in apis"
            v-show="compExpandMap[path]"
            :key="method"
            :class="{'text-blue-1': `${path}_${method}` === selectedApi}"
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
      title="名称"
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
  </div>
</template>


