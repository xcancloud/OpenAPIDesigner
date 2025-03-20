
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


// const schemaObj = JSON.parse("{\"type\":\"array\",\"items\":{\"type\":\"object\",\"nullable\":false,\"deprecated\":false,\"items\":{\"type\":\"object\",\"properties\":{\"ids\":{\"type\":\"string\",\"nullable\":false,\"deprecated\":false}}}}}");
export const parseSchemaObjToArr = (obj, requiredKeys: string[] = []) => {
  const result: any[] = [];
  if (obj.type === 'object') {
    Object.keys(obj.properties || {}).forEach(key => {
      const attrValue = obj.properties[key];
      let children: any[] = [];
      if (attrValue.type === 'array' && (attrValue.items?.type || attrValue.items?.$ref)) {
        children = parseSchemaObjToArr(attrValue, attrValue.required);
      }
      if (attrValue.type === 'object' && attrValue.properties) {
        children = parseSchemaObjToArr(attrValue, attrValue.required);
      }
      result.push({
        name: key,
        ...attrValue,
        required: requiredKeys.includes(key),
        children: children.length ? children : undefined,
        properties: undefined,
        items: undefined
      });
    });
  } else if (obj.type === 'array') {
    let children: any[] = [];
    if (obj.items?.type === 'array' && (obj.items.items?.type || obj.items.items?.$ref)) {
      children = parseSchemaObjToArr(obj.items, obj.items?.required);
    }
    if (obj.items?.type === 'object' && obj.items.properties) {
      children = parseSchemaObjToArr(obj.items, obj.items?.required);
    }
    result.push({
      name: '',
      ...obj,
      ...(obj.items || {}),
      type: obj.items?.type,
      children: children.length ? children : undefined,
      properties: undefined,
      items: undefined
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


const parseArrayType = () => {
  
}

export const parseSchemaArrToObj = (arr, type) => {
  let result: {[key: string]: any} = {};
  if (arr.length === 1 && type === 'array') {
    delete arr[0].required;
    result = {
      ...arr[0]
    };

    if (arr[0].children?.length) {
      if (arr[0].type === 'array') {
        result.items = parseSchemaArrToObj(arr[0].children, arr[0].type);
      }
      if (arr[0].type === 'object') {
        result = parseSchemaArrToObj(arr[0].children, arr[0].type);
      }
    }
    result.required = [];
    delete result.children;
    delete result.name;
  } else if (arr.length === 1 && type !== 'object') {
    delete arr[0].children;
    delete arr[0].required;
    return {
      ...arr[0]
    };
  } else {
    result.type = 'object';
    result.properties = {};
    result.required = [];
    arr.forEach(attrItem => {
      if (attrItem.required === true) {
        result.required.push(attrItem.name);
      }
      delete attrItem.required;
      if (['array', 'object'].includes(attrItem.type)) {
        if (attrItem.type === 'array') {
          result.properties[attrItem.name] = {
            ...attrItem,
            items: attrItem.children?.length ? parseSchemaArrToObj(attrItem.children, attrItem.type) : undefined
          };
        } else {
          result.properties[attrItem.name] = {
            ...attrItem,
            ...(attrItem.children ? parseSchemaArrToObj(attrItem.children, attrItem.type) : {})
          };
        }
        delete result.properties[attrItem.name].children;
        delete result.properties[attrItem.name].name;
      } else {
        result.properties[attrItem.name] = {
          ...attrItem
        };
      }
    });
  }
  return result;
};

export const schemaTypeDependenceMap = {
  object: ['type', 'types', 'nullable', 'deprecated', 'minLength', 'maxLength', 'minimum', 'maximum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required'],
  array: ['examples', 'type', 'types', 'nullable', 'default', 'deprecated', 'enum', 'minLength', 'maxLength', 'minimum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required'],
  string: ['examples', 'type', 'types', 'nullable', 'default', 'deprecated', 'enum', 'minLength', 'maxLength', 'minimum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required'],
  number: ['examples', 'type', 'types', 'nullable', 'default', 'deprecated', 'enum', 'minLength', 'maxLength', 'minimum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required'],
  integer: ['examples', 'type', 'types', 'nullable', 'default', 'deprecated', 'enum', 'minLength', 'maxLength', 'minimum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required'],
  boolean: ['examples', 'type', 'types', 'nullable', 'default', 'deprecated', 'enum', 'minLength', 'maxLength', 'minimum', 'minItems', 'maxItems', 'pattern', 'description', 'format', 'required']
};
