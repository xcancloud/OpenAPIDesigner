<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch, inject, Ref, onBeforeUnmount } from 'vue';
import { Tabs, TabPane, Button } from 'ant-design-vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import NoData from '@/Icons/noData.svg';

const FormView = defineAsyncComponent(() => import('./formView/index.vue'));

const getAppFunc = inject('getAppFunc', (param: {name: string, func: Function})=>{});

interface Props {
  viewMode: 'form'|'code'|'preview',
  dataSource: Record<string, any>;
}


const { t } = useI18n();
const props = withDefaults(defineProps<Props>(), {
  viewMode: 'form',
  dataSource: undefined
});

const dataSource = inject('dataSource', ref());

const formViewRef = ref<Ref[]>([]);

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

const saveData = () => {
  const servers = formViewRef.value.map(dom => {
    return dom.getData();
  });

  dataSource.value.servers = servers;
};

onMounted(() => {
  watch(() => props.dataSource, () => {
    servers.value = props.dataSource?.servers || [];
  }, {
    immediate: true
  })
  getAppFunc({name: 'updateData', func: saveData});
});


onBeforeUnmount(() => {
  saveData();
});

</script>
<template>
  <Tabs :activeKey="viewMode" class="flex-1 min-h-100">
      <TabPane key="form" forceRender class="overflow-auto pr-3" >
        <div class="flex justify-end pr-8">
          <Button size="small" type="primary" @click="addServer">
            {{ t('add_server') }} +
          </Button>
        </div>
        <div
          v-for="(server, idx) in servers" :key="idx"
          class="flex w-full mb-5"
          :class="{'border-b': idx !== servers.length - 1}">
          <FormView :ref="dom => formViewRef[idx] = dom" :dataSource="server" class="flex-1" />
          <Button size="small" type="link" class="mt-8 w-8" @click="handleDel(idx)">
            <DeleteOutlined class="text-5" />
          </Button>
        </div>
        <img :src="NoData" class="mx-auto" />
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
