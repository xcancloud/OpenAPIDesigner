<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, inject, onBeforeUnmount, Ref } from 'vue';
import { Button } from 'ant-design-vue';
import { DeleteOutlined } from '@ant-design/icons-vue'
// import { useI18n } from 'vue-i18n';
import NoData from '@/icons/noData.svg';


const FormView = defineAsyncComponent(() => import('./formView/index.vue'));
const SecurityBasic = defineAsyncComponent(() => import('../component/basic/securityBasic.vue'));

const getAppFunc = inject('getAppFunc', (param: {name: string, func: Function})=>{});
const dataSource = inject('dataSource', ref());

interface Props {
  viewMode: 'form'|'code'|'preview';
  dataSource: Record<string, any>;
}

// const { t } = useI18n();
const i18n = inject('i18n');
const { t } = i18n?.global;
const securityRef = ref();
const props = withDefaults(defineProps<Props>(), {
  viewMode: 'form'
});

const emits = defineEmits<{(e: 'save', value: {[key: string]: any})}>();
const formViewRef = ref<Ref[]>([]);


const securityList = ref<{[key: string]: any}[]>([]);
const addTag = () => {
  securityList.value.push({
    scheme: 'basic',
    type: 'http'
  });
};

const deleteTag = (idx: number) => {
  const name = securityList.value[idx].securityName;
  securityList.value.splice(idx, 1);
  if (props.dataSource?.security) {
    props.dataSource?.security.forEach(item => {
      delete item[name];
    });
  }
};

const securitySource = ref();

const saveData = () => {
  const securitySchemas = formViewRef.value.map(formView => formView ? formView.getData() : null).filter(Boolean).reduce((pre, cur) => {
    return {
      ...pre,
      ...cur
    }
  }, {});
  emits('save', securitySchemas);
  const security = securityRef.value.getData();
  dataSource.value.security = security;
}

onMounted(() => {
  securitySource.value = props.dataSource.components?.securitySchemes;
  securityList.value = Object.keys(props.dataSource.components?.securitySchemes || {}).map(key => {
    return {
      securityName: key,
      ...props.dataSource.components?.securitySchemes?.[key]
    }
  })
  getAppFunc({name: 'updateData', func: saveData});
});



onBeforeUnmount(() => {
  saveData();
});

</script>
<template>
  <div class="min-h-100">
    <div class="flex justify-between pr-8">
      <span class="font-semibold">{{t('security_schema')}}</span>
      <Button size="small" type="primary" @click="addTag">
        + {{ t('add') }}
      </Button>
    </div>
    <div
      v-for="(security, idx) in securityList" :key="idx"
      class="flex w-full mb-5 border-t mt-3 pt-2">
      <FormView :ref="(dom:Ref) => formViewRef[idx] = dom" class="flex-1" :data="security" />
      <Button size="small" type="link" class="mt-8 w-8" @click="deleteTag(idx)">
        <DeleteOutlined class="text-5" />
      </Button>
    </div>
    <img v-if="!securityList.length" :src="NoData" class="mx-auto" />
    <SecurityBasic ref="securityRef" :dataSource="props.dataSource?.security" />
  </div>
</template>
<style scoped>
:deep(.ant-tabs) .ant-tabs-nav {
  display: none;
}

:deep(.ant-tabs) .ant-tabs-content.ant-tabs-content-top {
  height: 100%;
}
</style>
../component/basic/securityBasic.vue