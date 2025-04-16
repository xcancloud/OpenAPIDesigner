<script lang="ts" setup>
import { ref, inject, computed, defineAsyncComponent, onMounted, watch } from 'vue';
import { Tag, Select, RadioGroup, RadioButton } from 'ant-design-vue';

const AyyrItemListView = defineAsyncComponent(() => import('@/component/basic/attrItemListView.vue'));

interface Props {
  body: {
    description?: string,
    content?: {[key: string]: any}
  }
}
const props = withDefaults(defineProps<Props>(), {
  body: () => ({})
});

const dataSource = inject('dataSource', ref());
const combineTypeOpt = ['oneOf', 'allOf', 'anyOf'];
const parseSchemaObjToArr = (obj: Record<string, any>, requiredKeys: string[] = []): any[] => {
  const result: any[] = [];
  if (obj.type === 'object') {  
    const child: any[] = [];;
    Object.keys(obj.properties || {}).forEach(key => {
      let attrValue = obj.properties[key];
      let children: any[] = [];
      if (attrValue.type === 'array' && (attrValue.items?.type || attrValue.items?.$ref)) {
        attrValue = parseSchemaObjToArr(attrValue)[0];
        child.push({
          properties: undefined,
          items: undefined,
          ...attrValue,
          name: key,
          required: (requiredKeys || []).includes(key),
        });
        return;
      } else if ((attrValue.type === 'object' && attrValue.properties)) {
        child.push({...parseSchemaObjToArr(attrValue, attrValue.required)[0], name: key, required: (requiredKeys || []).includes(key)})
        return;
      } else if (combineTypeOpt.some((combine) => !!attrValue[combine])) {
        child.push({
          ...attrValue,
          ...parseSchemaObjToArr(attrValue)[0],
          name: key,
          required: false
        })
        return;
      }
      child.push({
        
        ...attrValue,
        name: key,
        children: children.length ? children : undefined,
        required: (requiredKeys || []).includes(key),
        properties: undefined,
        items: undefined
      });
    });
    result.push({
      ...obj,
      required: false,
      children: child,
    });
  } else if (obj.type === 'array') {
    let children: any[] = [];
    const showTypeArr: string[] = [];
    const arrayItems: any[] = [];
    function handleArrType (item) {
      showTypeArr.unshift('array');
      arrayItems.push({...item});
      if (item.items?.type === 'array') {
        handleArrType(item.items);
      } else if (item.items?.type === 'object') {
        showTypeArr.unshift('object');
        children = parseSchemaObjToArr(item.items, item.items.required)[0].children;
        arrayItems.push(item.items);
      } else if (!item.type && combineTypeOpt.some(i => !!item[i])) {
        const type = combineTypeOpt.find(i => !!item[i]) as string;
        showTypeArr.unshift(type);
        children = (item[type] || []).map(i => parseSchemaObjToArr(i)[0]);
        arrayItems.push(item.items);
      } else {
        showTypeArr.unshift(item.items?.type);
        arrayItems.push(item.items);
      }
    };
    handleArrType(obj);
    const showType = showTypeArr.reduce((pre, cur) => {
      if (pre) {
        return `${cur}<${pre}>`;
      } else {
        return cur;
      }
    }, '');
    result.push({
      ...obj,
      ...(obj.items || {}),
      type: showTypeArr[0],
      showType: showType,
      typeList: showTypeArr,
      arrayItems: arrayItems,
      children: children.length ? children : undefined,
      properties: undefined,
      items: undefined
    });
  } else if (combineTypeOpt.some((combine) => !!obj[combine])) {
    const combineType = combineTypeOpt.find(i => !!obj[i]) as string;
    let children = (obj[combineType] || []).map(childObj => {
      return parseSchemaObjToArr(childObj)[0];
    });
    result.push({
      ...obj,
      type: combineType,
      required: false,
      children: children.length ? children : undefined
    });
  } else if (!!obj.$ref) {
    const modelTypeNameStrs = obj.$ref.replace('#/components/', '').split('/');
    const modelType = modelTypeNameStrs[0];
    const modelName = modelTypeNameStrs.splice(1, modelTypeNameStrs.length - 1).join('/');
    const modelObj = dataSource.value.components[modelType][modelName];
    return parseSchemaObjToArr(modelObj, modelObj.required);
  } else {
    return [{
      ...obj,
      required: requiredKeys.includes(obj),
      properties: undefined,
      items: undefined
    }];
  }
  return result;
}

const bodyTypes = computed<string[]>(() => {
  return Object.keys(props.body.content || {});
});
const currentBodyType = ref<string>();
const bodyContentSchemaList = ref<any[]>([]);

onMounted(() => {
  watch(() => props.body, () => {
    bodyContentSchemaList.value = [];
    currentBodyType.value = bodyTypes.value[0] || '';
  }, {
    immediate: true,
    deep: true
  })
  watch(() => currentBodyType.value, (newValue) => {
    if (newValue) {
      const schemaObj = props.body.content?.[newValue]?.schema;
      bodyContentSchemaList.value = parseSchemaObjToArr(schemaObj, schemaObj.required);
    } else {
      bodyContentSchemaList.value = [];
    }
  }, {
    immediate: true
  })
})

</script>
<template>

  <div>
    <div v-if="bodyTypes.length" class="flex justify-between">
      <span class="text-5 font-medium">Body</span>
      <Select
        v-model:value="currentBodyType"
        :bordered="false"
        :options="bodyTypes.map(i => ({value: i, label: i}))" />
    </div>

    <AyyrItemListView :dataSource="bodyContentSchemaList" :isRoot="true" />
  </div>

</template>