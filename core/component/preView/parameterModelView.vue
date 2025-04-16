<script lang="ts" setup>
import { ref, inject, defineAsyncComponent, onMounted, watch } from 'vue';

const AyyrItemListView = defineAsyncComponent(() => import('@/component/basic/attrItemListView.vue'));

interface Props {
  params: {in: string; name: string; schema: {type?: string; $ref?: string; properties?: any}}[];
}

const props = withDefaults(defineProps<Props>(), {
  params: () => []
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


const parameModelList = ref<{name: string; schemaList: {[key: string]: any}[]}[]>([]);

onMounted(() => {
  watch(() => props.params, () => {
    parameModelList.value = props.params.map(item => {
      item.schema = item.schema || {};
      const {properties, ...others} = item.schema || {};
      let schemaList: {[key: string]: any}[] = [];
      schemaList = parseSchemaObjToArr(item.schema, item.schema.required);
      return {
        name: item.name,
        schemaList
      }
    })
  }, {
    immediate: true
  })
});

</script>
<template>
<div>
  <div v-for="(param, idx) in parameModelList" :key="param.name" class="flex">
    <div class="font-medium leading-7">{{ param.name }}</div>
    <AyyrItemListView :dataSource="param.schemaList" :isRoot="true"  />
  </div>
</div>
</template>