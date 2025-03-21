<script lang="ts" setup>
import { onMounted, ref, watch, computed } from 'vue';
import { Button, Input, Select, Tag } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { apiStatus, methodColor } from './PropTypes'

const statusKey = 'x-xc-status';
interface Props {
    dataSource: {
        method: string;
        summary: string;
        operationId: string;
        'x-xc-status': string;
        security?: Array<string, string[]>
    },
    openapiDoc: {[key: string]: any};
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({
    method: '',
    summary: '',
    operationId: '',
    'x-xc-status': ''
  }),
  openapiDoc: () => ({})
});

const data = ref({});
const security = ref<{name: string, scopes: string[]}[][]>([]);

const allSecurityOpt = computed<{label: string;value: string;scopes?: string[]}[]>(() => {
  if (!props.openapiDoc?.components?.securitySchemes) {
    return []
  };
  const securitySchemes = props.openapiDoc.components.securitySchemes;
  return Object.keys(securitySchemes).map(name => {
    let scopes;
    if (securitySchemes[name].flows) {
      scopes = [];
      const flows = securitySchemes[name].flows;
      Object.values(flows).forEach(val => {
        if (val.scopes) {
          scopes.push(...Object.keys(val.scopes));
        }
      })
    }
    return {
      label: name,
      value: name,
      scopes
    }
  });
});

const getSecurityOptions = (defaultOpt: string, idx: number) => {
  return allSecurityOpt.value.filter(item => {
    if (item.value === defaultOpt) {
      return true;
    }
    return !security.value[idx].find(subItem => subItem.name === item.value)
  });
};

onMounted(() => {
  watch(() => props.dataSource, () => {
    data.value = props.dataSource;
    // (props.security || []).forEach(item => {
    //   Object.keys(item).forEach(key => {
    //     security.value.push({ key, value: item[key] || [] });
    //   });
    // });
    security.value = (props.openapiDoc.security || []).map(securityGroup => {
      return [
        ...(Object.keys(securityGroup).map((key) => {
          return {
            name: key,
            scopes: securityGroup[key]
          }
        }))
      ]
    })
  }, {
    deep: true,
    immediate: true
  });
});

const addSecurity = () => {
  if (!security.value) {
    security.value = [];
  }
  if (!allSecurityOpt.value.length) {
    return;
  }
  security.value.push([{name:allSecurityOpt.value[0].value , scopes: []}])
};

const handleAddSunbSecurity = (idx: number) => {
  const name = allSecurityOpt.value.find(item => !security.value[idx].find(security => security.name === item.value))?.value;
  if (!name) {
    return;
  }
  security.value[idx].push({
    name: name,
    scopes: []
  });
};

// const delSecurity = (idx) => {
//   security.value.splice(idx, 1);
// };

const getData = () => {
  // const _security = security.value.map(item => {
  //   return { [item.key]: item.value };
  // });
  const { summary, operationId, description } = data.value;
  return {
    // security: _security,
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
          dataType="mixin-en"
          includes=".-_" />
      </div>
      <div>
        <!-- Description -->
        <!-- <Input v-model:value="data.description" type="textarea" /> -->
      </div>
    </div>
    <div class="flex items-center justify-between border-b pb-2 mt-6">
      <span class="text-4 font-medium"><Icon icon="icon-anquan" class="text-5" /> Security</span>
      <Button
        type="primary"
        size="small"
        @click="addSecurity">
        Add
      </Button>
    </div>

    <div v-if="security" class="space-y-2 mt-2">
      <div v-for="(item ,idx) in security" :key="idx">
        <div>
          <span>Security{{ idx + 1 }}</span>
          <PlusOutlined @click="handleAddSunbSecurity(idx)" />
        </div>
        <div v-for="(subItem, subIdx) in item" :key="`${idx}_${subIdx}`">
          <!-- {{ getSecurityOptions(subItem.name, idx) }} -->
          <Select
            v-model:value="subItem.name"
            class="w-50"
            :disabled="getSecurityOptions(subItem.name, idx).length <= 1"
            :options="getSecurityOptions(subItem.name, idx)" />
          <Button>
            <DeleteOutlined />
          </Button>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-between border-b pb-2 mt-6">
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
    </div>
  </div>
</template>
