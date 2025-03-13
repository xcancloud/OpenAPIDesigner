/* stylelint-disable at-rule-no-deprecated */
<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { Input, DirectoryTree } from 'ant-design-vue';

interface Props {
  activeMenuKey: string;
}

const props = withDefaults(defineProps<Props>(), {
  activeMenuKey: 'docInfo'
});

const emits = defineEmits<{(e: 'update:activeMenuKey', value: string): void}>();

const defaultMenu = computed(() => [
  {
    title: '文档信息',
    key: 'docInfo'
  },
  {
    title: '外部文档',
    key: 'outerDoc'
  },
  {
    title: '服务器',
    key: 'server'
  },
  {
    title: '安全',
    key: 'securities'
  },
  {
    title: '标签',
    key: 'tag'
  },
  {
    title: '接口',
    key: 'apis'
  },
  {
    title: '组件',
    key: 'components',
    selectable: false,
    children: [
      {
        title: '模型',
        key: 'model'
      },
      {
        title: '参数',
        key: 'parameter'
      },
      {
        title: '请求体',
        key: 'body'
      },
      {
        title: '响应',
        key: 'response'
      },
      {
        title: '头',
        key: 'header'
      },
      {
        title: '安全方案',
        key: 'security'
      },
      {
        title: '扩展',
        key: 'extension'
      }
    ]
  }
]);

const handleSelect = (selectedKeys: string[]) => {
  emits('update:activeMenuKey', selectedKeys[0]);
};

onMounted(() => {
  emits('update:activeMenuKey', 'docInfo');
})

</script>
<template>
  <div>
    <Input placeholder="搜索" />
    <DirectoryTree
      :selectedKeys="[props.activeMenuKey]"
      :treeData="defaultMenu"
      blockNode
      showIcon
      class="menu-tree mt-2 bg-transparent"
      @select="handleSelect">
      <template #icon="{key}">
        <img
          v-if="key === 'docInfo'"
          src="../Icons/docInfo.svg"
          class="w-4 h-4" />
        <img
          v-if="key === 'outerDoc'"
          src="../Icons/outDoc.svg"
          class="w-4 h-4" />
        <img
          v-if="key === 'server'"
          src="../Icons/server.svg"
          class="w-4 h-4" />
        <img
          v-if="key === 'securities'"
          src="../Icons/anquan.svg"
          class="w-4 h-4" />
        <img
          v-if="key === 'tag'"
          src="../Icons/tag.svg"
          class="w-4 h-4" />
      </template>
    </DirectoryTree>
  </div>
</template>
<style scoped>
:deep(.menu-tree) .ant-tree-node-content-wrapper{
  @apply flex items-center;
}

:deep(.menu-tree) .ant-tree-node-content-wrapper .ant-tree-iconEle {
  @apply w-4 h-4 mr-2;
};

:deep(.menu-tree.ant-tree.ant-tree-directory) .ant-tree-treenode-selected:hover::before,
:deep(.menu-tree.ant-tree.ant-tree-directory) .ant-tree-treenode-selected::before {
  background: #e5e7eb;
}

:deep(.menu-tree.ant-tree.ant-tree-directory) .ant-tree-treenode .ant-tree-node-content-wrapper.ant-tree-node-selected {
  color: #1890ff;
}
</style>

