<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { Input, Tag } from 'ant-design-vue';
import { methodColor } from './PropTypes';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css'
import SecurityBasic from '../basic/securityBasic.vue';
import Extensions from '@/extensions/formView/index.vue';

const easyMDE = ref();
const descRef = ref();
const statusKey = 'x-xc-status';
interface Props {
    dataSource: {
        method: string;
        summary: string;
        operationId: string;
        [statusKey]?: string;
        description?: string;
        security?: Array<{[key: string]:string[]}>;
    },
    openapiDoc: {[key: string]: any};
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({
    method: '',
    summary: '',
    operationId: '',
    [statusKey]: ''
  }),
  openapiDoc: () => ({})
});

const securityRef = ref();

const data = ref<Props['dataSource']>({method: '', summary: '', operationId: ''});
const extensionData = ref<{name: string; value: string |null}[]>([]);
// const security = ref<{name: string, scopes: string[]}[][]>([]);

// const allSecurityOpt = computed<{label: string;value: string;scopes?: string[]}[]>(() => {
//   if (!props.openapiDoc?.components?.securitySchemes) {
//     return []
//   };
//   const securitySchemes = props.openapiDoc.components.securitySchemes;
//   return Object.keys(securitySchemes).map(name => {
//     let scopes;
//     if (securitySchemes[name].flows) {
//       scopes = [];
//       const flows = securitySchemes[name].flows;
//       Object.values(flows).forEach(val => {
//         if (val.scopes) {
//           scopes.push(...Object.keys(val.scopes));
//         }
//       })
//     }
//     return {
//       label: name,
//       value: name,
//       scopes
//     }
//   });
// });

// const getSecurityOptions = (defaultOpt: string, idx: number) => {
//   return allSecurityOpt.value.filter(item => {
//     if (item.value === defaultOpt) {
//       return true;
//     }
//     return !security.value[idx].find(subItem => subItem.name === item.value)
//   });
// };

// const hasScopes = (securityName: string) => {
//   return allSecurityOpt.value.find(item => item.label === securityName)?.scopes;
// };

onMounted(() => {
  easyMDE.value = new EasyMDE({
    element: descRef.value, 
    autoDownloadFontAwesome: true
  });
  watch(() => props.dataSource, () => {
    data.value = props.dataSource;
    data.value[statusKey] = data.value[statusKey] || 'UNKNOWN';
    extensionData.value = Object.keys(props.dataSource || {}).map(key => {
      if (key.startsWith('x-')) {
        return {name: key, value: props.dataSource?.[key] && typeof props.dataSource?.[key] === 'string'
        ? props.dataSource?.[key]
        : props.dataSource?.[key] 
        ? JSON.stringify(props.dataSource?.[key])
        : null};
      }
      return null;
    }).filter(Boolean);
    
  //   security.value = (props.dataSource?.security || []).map((securityGroup: {[key:string]: string[]}) => {
  //     return [
  //       ...(Object.keys(securityGroup).map((key) => {
  //         return {
  //           name: key,
  //           scopes: securityGroup[key]
  //         }
  //       }))
  //     ]
  //   })
  // }, {
  //   deep: true,
  //   immediate: true
  // });
  });
});

// const addSecurity = () => {
//   if (!security.value) {
//     security.value = [];
//   }
//   if (!allSecurityOpt.value.length) {
//     return;
//   }
//   security.value.push([{name:allSecurityOpt.value[0].value , scopes: []}])
// };

// const handleAddSunbSecurity = (idx: number) => {
//   const name = allSecurityOpt.value.find(item => !security.value[idx].find(security => security.name === item.value))?.value;
//   if (!name) {
//     return;
//   }
//   security.value[idx].push({
//     name: name,
//     scopes: []
//   });
// };

// const delSubSecurity = (idx: number, subIdx:number) => {
//   security.value[idx].splice(subIdx, 1);
//   if (security.value[idx].length === 0) {
//     security.value.splice(idx, 1)
//   }
// };

const getData = () => {

  const _security = securityRef.value.getData();
  const { summary, operationId, description } = data.value;
  return {
    security: _security,
    summary,
    operationId,
    description,
    [statusKey]: data.value[statusKey]
  };
};

defineExpose({
  getData
});
</script>
<template>
  <div class="px-2">
    <div class="space-y-3">
      <div class="flex items-center space-x-2">
        <Tag :color="methodColor[data.method]" class="h-8 leading-7 text-5">{{ data.method }}</Tag>
        <Input v-model:value="data.summary" :bordered="false" class="text-5" />
      </div>
      <div>
        <span class="font-medium">Operation ID</span> 
        <Input
          v-model:value="data.operationId"
          dataType="mixin-en" />
      </div>
      <div>
        <span class="text-4 font-medium"><Icon icon="icon-anquan" class="text-5" /> Description</span>
        <textarea ref="descRef"></textarea>
      </div>
    </div>

    <!-- <div class="flex items-center justify-between border-b pb-2 mt-6">
      <span class="text-4 font-medium"><Icon icon="icon-anquan" class="text-5" /> Security</span>
      <Button
        type="primary"
        size="small"
        @click="addSecurity">
        Add
      </Button>
    </div> -->
    <SecurityBasic ref="securityRef" :dataSource="props.dataSource?.security"/>

    <Extensions :dataSource="extensionData" />

    <!-- <div v-if="security" class="space-y-4 mt-2">
      <div v-for="(item ,idx) in security" :key="idx" class="space-y-2">
        <div class="flex items-center space-x-2">
          <span>security{{ idx + 1 }}</span>
          <PlusOutlined @click="handleAddSunbSecurity(idx)" />
        </div>
        <div v-for="(subItem, subIdx) in item" :key="`${idx}_${subIdx}`" class=mb-2>
          <InputGroup :compact="true">
            <Select
              v-model:value="subItem.name"
              class="w-50"
              :disabled="getSecurityOptions(subItem.name, idx).length <= 1"
              :options="getSecurityOptions(subItem.name, idx)" />
            <Select
              v-if="hasScopes(subItem.name)"
              v-model:value="subItem.scopes"
              :options="(hasScopes(subItem.name) || []).map(i => ({value: i, label: i}))"
              mode="tags"
              class="w-80" />
            <Button @click="delSubSecurity(idx, subIdx)">
              <DeleteOutlined />
            </Button>
          </InputGroup>
        </div>
      </div>
    </div> -->
    <!-- <div class="flex items-center justify-between border-b pb-2 mt-6">
      <span class="text-4 font-medium"><Icon icon="icon-anquan" class="text-5" /> Status</span>
    </div>
    <div class="mt-2 flex space-x-2">
      <Input
        readOnly
        value="x-xc-status"
        class="inline-block w-auto" />
      <Select
        v-model:value="data[statusKey]"
        :options="apiStatus" />
    </div> -->
  </div>
</template>
