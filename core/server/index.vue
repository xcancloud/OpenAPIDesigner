<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch, inject } from 'vue';
import { Tabs, TabPane, Button } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import YAML from 'yaml';

const FormView = defineAsyncComponent(() => import('./formView/index.vue'));
const CodeView = defineAsyncComponent(() => import('./codeView/index.vue'));

const getAppFunc = inject('getAppFunc', ()=>{});

interface Props {
  viewMode: 'form'|'code'|'preview',
  dataSource: Record<string, any>;
}



const props = withDefaults(defineProps<Props>(), {
  viewMode: 'form',
  dataSource: undefined
});

const formViewRef = ref();
const codeValue = ref();

const servers= ref<{
    url: string;
    description?: string;
    variables: {
      [key: string]: {
        enum: string[];
        default: string;
        description?: string
      }
    }
  }[]>([]);
const addServer = () => {
  servers.value.push({
    url: '',
    description: undefined,
    variables: {}
  });
};

const handleDel = (idx: number) => {
  servers.value.splice(idx, 1);
};

onMounted(() => {
  watch(() => props.dataSource, () => {

    servers.value = props.dataSource?.servers || [];
    // if (props.viewMode === 'code') {
    // codeValue.value = YAML.stringify(formViewRef.value.getFormData());
    // }

  })
})

</script>
<template>
  <Tabs :activeKey="viewMode" class="flex-1 min-h-100">
      <TabPane key="form" forceRender class="overflow-auto pr-3" >
        <div class="flex justify-end pr-8">
          <Button size="small" type="primary" @click="addServer">
            添加服务器
          </Button>
        </div>
        <div
          v-for="(server, idx) in servers" :key="idx"
          class="flex w-full mb-5"
          :class="{'border-b': idx !== servers.length - 1}">
          <FormView ref="formViewRef" :dataSource="server" class="flex-1" />
          <Button size="small" type="link" class="mt-8 w-8" @click="handleDel(idx)">
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
