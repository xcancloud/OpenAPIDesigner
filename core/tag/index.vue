<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch, inject, Ref, onBeforeUnmount } from 'vue';
import { Tabs, TabPane, Button } from 'ant-design-vue';
import { DeleteOutlined } from '@ant-design/icons-vue'
// import { useI18n } from 'vue-i18n'; 

const FormView = defineAsyncComponent(() => import('./formView/index.vue'));
const CodeView = defineAsyncComponent(() => import('./codeView/index.vue'));

const getAppFunc = inject('getAppFunc', (param: {name: string, func: Function})=>{});
const dataSource = inject('dataSource', ref());

interface Props {
  viewMode: 'form'|'code'|'preview',
  dataSource?: Record<string, any>;
}

// const { t } = useI18n();
// const i18n = inject('i18n');
// const { t } = i18n?.global;
// const t = inject('t');
const useLocal = inject('useLocal');
const language = inject('language', ref());
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


const formViewRef = ref<Ref[]>([]);
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

const saveData = () => {
  const tags = formViewRef.value.map(form => {
    return form ? form.getData() : null;
  }).filter(Boolean);
  dataSource.value.tags = tags;
};

onMounted(() => {

  tags.value = props.dataSource?.tags || [];
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
        <Button size="small" type="primary" @click="addTag">
          {{ useLocal(language)('add_tag') }} +
        </Button>
      </div>
      <div
        v-for="(tag, idx) in tags" :key="idx"
        class="flex w-full mb-5"
        :class="{'border-b': idx !== tags.length - 1}">
        <FormView :ref="dom => formViewRef[idx] = dom" class="flex-1" :dataSource="tag" />
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
.ant-tabs .ant-tabs-nav {
  display: none;
}

.ant-tabs .ant-tabs-content.ant-tabs-content-top {
  height: 100%;
}
</style>
