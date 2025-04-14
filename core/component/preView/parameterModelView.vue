<script lang="ts" setup>
import { ref, inject, computed, defineAsyncComponent, onMounted, watch } from 'vue';

const AyyrItemListView = defineAsyncComponent(() => import('@/component/basic/attrItemListView.vue'));

interface Props {
  params: {in: string; name: string; schema: {type?: string; $ref?: string; properties?: any}}[];
}

const props = withDefaults(defineProps<Props>(), {
  params: () => []
});

const dataSource = inject('dataSource', ref());
const parseSchemaObjToArr = (obj, requiredKeys: string[] = []): any[] => {
  const result: any[] = [];
  if (obj.type === 'object') {
    Object.keys(obj.properties || {}).forEach(key => {
      let attrValue = obj.properties[key];
      let children: any[] = [];
      if (attrValue.type === 'array' && (attrValue.items?.type || attrValue.items?.$ref)) {
        attrValue = parseSchemaObjToArr(attrValue, attrValue.required)[0];
        result.push({
          name: key,
          children: children.length ? children : undefined,
          required: requiredKeys.includes(key),
          properties: undefined,
          items: undefined,
          ...attrValue,
        });
        return;
      }
      if (attrValue.type === 'object' && attrValue.properties) {
        children = parseSchemaObjToArr(attrValue, attrValue.required);
      }
      result.push({
        name: key,
        ...attrValue,
        children: children.length ? children : undefined,
        required: requiredKeys.includes(key),
        properties: undefined,
        items: undefined
      });
    });
  } else if (obj.type === 'array') {
    let children: any[] = [];
    const showTypeArr: string[] = [];
    const arrayItems: any[] = [];
    function handleArrType (item) {
      showTypeArr.unshift('array');
      arrayItems.push(item);
      if (item.items?.type === 'array') {
        handleArrType(item.items);
      } else if (obj.items?.type === 'object') {
        showTypeArr.unshift('object');
        children = parseSchemaObjToArr(obj.items, obj.items?.required);
        arrayItems.push(obj.items);
      } else {
        showTypeArr.unshift(item.items?.type);
        arrayItems.push(obj.items);
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
  } else if (!!obj.$ref) {
    const modelTypeNameStrs = obj.$ref.replace('#/components/', '').split('/');
    const modelType = modelTypeNameStrs[0];
    const modelName = modelTypeNameStrs.splice(1, modelTypeNameStrs.length - 1).join('/');
    const modelObj = dataSource.value.components[modelType][modelName];
    if (modelObj.type === 'object') {
      const {properties, ...other} = modelObj;
      return [{...other, children: parseSchemaObjToArr(modelObj, modelObj.required)}];
    }
    return parseSchemaObjToArr(modelObj);
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
      if (item.schema?.type === 'object') {
        schemaList = [{...others, children: parseSchemaObjToArr(item.schema, item.schema.required)}]
      } else {
        schemaList = parseSchemaObjToArr(item.schema, item.schema.required);
      }
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