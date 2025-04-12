<script lang="ts" setup>
import { onMounted, ref, watch, inject, onBeforeUnmount, defineAsyncComponent, Ref } from 'vue';
import EasyMd from '@/components/easyMd/index.vue';
import { Button } from 'ant-design-vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import NoData from '@/Icons/noData.svg';

const ServerForm = defineAsyncComponent(() => import('@/server/formView/index.vue'));


type Server = {
  url: string;
  description?: string;
  variables: {
    [key: string]: {
      enum: string[];
      default: string;
      description?: string
    }
  }
}

interface Props {
  dataSource?: {
    servers: Server[],
    summary?: string;
    description?: string;
  },
  path: string
}

const summaryRef = ref();
const descRef = ref();

const servers = ref<Server[]>([]);
const serverRefs = ref<Ref[]>([]);

const props = withDefaults(defineProps<Props>(), {
  dataSource: undefined,
  path: ''
});
const dataSource = inject('dataSource', ref());

const addServer = () => {
  servers.value.push({
    url: '',
    variables: {}
  });
};

const handleDel = (idx: number) => {
  servers.value.splice(idx, 1);
};

const saveData = () => {
  const servers = serverRefs.value.map(dom => {
    return dom.getData();
  });
  const description = descRef.value.getValue() || undefined;
  const summary = summaryRef.value.getValue() || undefined;

  dataSource.value.paths[props.path] = {
    ...props.dataSource,
    servers,
    description,
    summary
  };
};

onMounted(() => {
  watch(() => props.dataSource, () => {
    servers.value = props.dataSource?.servers || []
  }, {
    immediate: true
  })
});

onBeforeUnmount(() => {
  saveData();
});

</script>
<template>
  <div class="space-y-4">
    <div>
      <div class="text-6 font-semibold">Summary</div>
      <EasyMd ref="summaryRef" :value="props.dataSource?.summary" />
    </div>
    
    <div>
      <div class="text-6 font-semibold">Description</div>
      <EasyMd ref="descRef" :value="props.dataSource?.description" />
    </div>

    <div class="space-y-3">
      <div class="flex justify-between">
        <span class="text-6 font-semibold">Servers</span> 
        <Button @click="addServer">Add +</Button>
      </div>
      <div v-for="(server, idx) in servers" class="flex space-x-2">
        <ServerForm :ref="(dom: Ref) => serverRefs[idx] = dom"  :dataSource="server" class="flex-1" />
        <Button type="link" class="mt-7 w-8" @click="handleDel(idx)">
          <DeleteOutlined />
        </Button>
      </div>
      <img v-if="!servers.length" :src="NoData" class="mx-auto" />
    </div>

    
    
  </div>
  
</template>