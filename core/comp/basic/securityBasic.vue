<script lang="ts" setup>
import { onMounted, ref, watch, computed, inject } from 'vue';
import { Button, Select, InputGroup, notification } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import NoData from '@/Icons/noData.svg';

interface Props {
  dataSource: {[key:string]: string[]}[];
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => []
});

const openapiDoc = inject('dataSource', ref({}));

const security = ref<{name: string, scopes: string[]}[][]>([]);
const allSecurityOpt = computed<{label: string;value: string;scopes?: string[]}[]>(() => {
  if (!openapiDoc.value?.components?.securitySchemes) {
    return []
  };
  const securitySchemes = openapiDoc.value?.components.securitySchemes;
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

onMounted(() => {
  watch(() => props.dataSource, () => {
    security.value = (props.dataSource || []).map((securityGroup: {[key:string]: string[]}) => {
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
  })
});

const addSecurity = () => {
  if (!security.value) {
    security.value = [];
  }
  if (!allSecurityOpt.value.length) {
    notification.warning({
      message: '提示',
      description: '暂无可用安全方案'
    });
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

const delSubSecurity = (idx: number, subIdx:number) => {
  security.value[idx].splice(subIdx, 1);
  if (security.value[idx].length === 0) {
    security.value.splice(idx, 1)
  }
};

const getSecurityOptions = (defaultOpt: string, idx: number) => {
  return allSecurityOpt.value.filter(item => {
    if (item.value === defaultOpt) {
      return true;
    }
    return !security.value[idx].find(subItem => subItem.name === item.value)
  });
};

const hasScopes = (securityName: string) => {
  return allSecurityOpt.value.find(item => item.label === securityName)?.scopes;
};

defineExpose({
  getData: ():{[key:string]: string[]}[]  => {
    const _security = security.value.map(item => {
      const i: {[key: string]: string[]} = {};
      item.forEach(subItem => {
        i[subItem.name] = subItem.scopes;
      })
      return i;
    });
    return _security;
  }
});
</script>
<template>
<div>
  <div class="flex items-center justify-between border-b pb-2 mt-6">
    <span class="text-4 font-medium"><Icon icon="icon-anquan" class="text-5" /> Security</span>
    <Button
      type="primary"
      size="small"
      @click="addSecurity">
      Add + 
    </Button>
  </div>

  <div v-if="security" class="space-y-4 mt-2">
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
  </div>
  <img v-if="!security.length" :src="NoData" class="mx-auto" />
</div>
</template>