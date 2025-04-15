
export const CONTENT_TYPE = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'application/octet-stream',
  'application/json',
  'text/html',
  'application/xml',
  'application/javascript',
  'text/plain',
  '*/*'
];


const combineTypeOpt = ['oneOf', 'allOf', 'anyOf'];
// const schemaObj = JSON.parse("{\"type\":\"array\",\"items\":{\"type\":\"object\",\"nullable\":false,\"deprecated\":false,\"items\":{\"type\":\"object\",\"properties\":{\"ids\":{\"type\":\"string\",\"nullable\":false,\"deprecated\":false}}}}}");
export const parseSchemaObjToArr = (obj, requiredKeys: string[] = []) => {
  const result: any[] = [];
  if (obj.type === 'object') {
    
    const child: any[] = [];;
    Object.keys(obj.properties || {}).forEach(key => {
      let attrValue = obj.properties[key];
      let children: any[] = [];
      if (attrValue.type === 'array' && (attrValue.items?.type || attrValue.items?.$ref)) {
        attrValue = parseSchemaObjToArr(attrValue, attrValue.required)[0];
        child.push({
          name: key,
          required: requiredKeys.includes(key),
          properties: undefined,
          items: undefined,
          ...attrValue,
        });
        return;
      } else if ((attrValue.type === 'object' && attrValue.properties)) {
        child.push(parseSchemaObjToArr(attrValue, attrValue.required)[0])
        return;
      } else if (combineTypeOpt.some((combine) => !!attrValue[combine])) {
        child.push({
          name: key,
          ...attrValue,
          ...parseSchemaObjToArr(attrValue, attrValue.required)[0]
        })
        return;
      }
      child.push({
        name: key,
        ...attrValue,
        children: children.length ? children : undefined,
        required: requiredKeys.includes(key),
        properties: undefined,
        items: undefined
      });
    });
    result.push({
      ...obj,
      children: child
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
        children = parseSchemaObjToArr(obj.items, obj.items?.required)[0].children;
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
  } else if (combineTypeOpt.some((combine) => !!obj[combine])) {
    const combineType = combineTypeOpt.find(i => !!obj[i]) as string;
    let children = (obj[combineType] || []).map(childObj => {
      return parseSchemaObjToArr(childObj)[0];
    });
    result.push({
      ...obj,
      type: combineType,
      children: children.length ? children : undefined
    });
  } else {
    return [{
      ...obj,
      required: requiredKeys.includes(obj),
      properties: undefined,
      items: undefined
    }];
  }
  return result;
};

export const parseSchemaArrToObj = (arr) => {
  let result: {[key: string]: any} = {};
  if (arr[0].showType && arr[0].showType.startsWith('array')) {
    const arrayItem = (arr[0]?.arrayItems || []).reverse();
    result = arrayItem.reduce((pre, cur) => {
      if (pre === null) {
        return parseSchemaArrToObj([{...cur, children: [...(arr[0]?.children || [])]}]);
      } else {
        return {
          ...cur,
          items: pre
        }
      }
    }, null)
    return result;
  } else if (arr[0].type === 'object') {
    result = {
      ...arr[0],
      properties: {}
    }
    delete result.children;
    result.required = [];
    (arr[0].children || []).forEach(attrItem => {
      if (attrItem.required === true) {
        result.required.push(attrItem.name);
      }
      delete attrItem.required;
      if (['object'].includes(attrItem.type) || attrItem.showType?.startsWith('array')) {
        result.properties[attrItem.name] = parseSchemaArrToObj([attrItem]);
        delete result.properties[attrItem.name].children;
        delete result.properties[attrItem.name].name;
      } else if (combineTypeOpt.some((combine) => attrItem.type === combine)) {
        result.properties[attrItem.name] = parseSchemaArrToObj([attrItem]);
        delete result.properties[attrItem.name].children;
        delete result.properties[attrItem.name].name;
        delete result.properties[attrItem.name].children;
        delete result.properties[attrItem.name].type;
      } else {
        result.properties[attrItem.name] = {
          ...attrItem
        };
      }
    });
    return result;
  } else if (combineTypeOpt.some((combine) => arr[0].type === combine))  {
    const type = arr[0].type;
    result = {
      ...arr[0],
      [type]: (arr[0].children || []).map(i => parseSchemaArrToObj([i]))
    }
    return result;
  } else {
    result = {...arr[0]};
    return result;
  }
};

export const schemaTypeDependenceMap = {
  object: ['type', 'types', 'nullable', 'deprecated', 'minLength', 'maxLength', 'minimum', 'maximum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required'],
  array: ['examples', 'type', 'types', 'nullable', 'default', 'deprecated', 'enum', 'minLength', 'maxLength', 'minimum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required'],
  string: ['examples', 'type', 'types', 'nullable', 'default', 'deprecated', 'enum', 'minLength', 'maxLength', 'minimum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required'],
  number: ['examples', 'type', 'types', 'nullable', 'default', 'deprecated', 'enum', 'minLength', 'maxLength', 'minimum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required'],
  integer: ['examples', 'type', 'types', 'nullable', 'default', 'deprecated', 'enum', 'minLength', 'maxLength', 'minimum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required'],
  boolean: ['examples', 'type', 'types', 'nullable', 'default', 'deprecated', 'enum', 'minLength', 'maxLength', 'minimum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required']
};

export  const stringFormatOpt = ['date-time', 'date', 'time', 'duration', 'emial', 'idn-email', 'idn-hostname', 'ipv4', 'ipv6', 'uri', 'uri-reference', 'iri', 'iri-reference', 'uuid', 'uuid-template', 'json-pointer', 'relative-json-pointer', 'binary'].map(i => ({label: i, value: i}));



