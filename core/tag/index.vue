<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch, inject } from 'vue';
import { Tabs, TabPane, Button } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import YAML from 'yaml';

const FormView = defineAsyncComponent(() => import('./formView/index.vue'));
const CodeView = defineAsyncComponent(() => import('./codeView/index.vue'));

const getAppFunc = inject('getAppFunc', ()=>{});

interface Props {
  viewMode: 'form'|'code'|'preview',
  dataSource?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'form',
  dataSource: undefined
});

type Tag = {
  name: string;
  description?: string;
  externalDocs?:{
    url?: string;
    description?: string
  }
}

const formViewRef = ref();
const codeValue = ref();

const tags = ref<Tag[]>([]);
const addTag = () => {
  tags.value.push({
    name: '',
    description: '',
  });
};

const deleteTag = (idx: number) => {
  tags.value.splice(idx, 1);
};

onMounted(() => {
  watch(() => props.viewMode, () => {
    tags.value = props.dataSource?.tags || [];
  }, {
    immediate: true
  });
});

</script>
<template>
  <Tabs :activeKey="viewMode" class="flex-1 min-h-100">
    <TabPane key="form" forceRender class="overflow-auto pr-3" >
      <div class="flex justify-end pr-8">
        <Button size="small" type="primary" @click="addTag">
          添加标签
        </Button>
      </div>
      <div
        v-for="(tag, idx) in tags" :key="idx"
        class="flex w-full mb-5"
        :class="{'border-b': idx !== tags.length - 1}">
        <FormView ref="formViewRef" class="flex-1" :dataSource="tag" />
        <Button size="small" type="link" class="mt-8 w-8" @click="deleteTag(idx)">
          <DeleteOutlined class="text-5" />
        </Button>
      </div>
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
