export const methodOpt = [ 'get', 'post', 'put', 'head', 'patch', 'delete', 'options', 'trace'];


export const getPathParameterByPath = (path: string) => {
  return path.match(/{[^{}]+}/gi)?.map((item) => {
    return { name: item.replace(/{(\S*)}/gi, '$1'), in: 'path', schema: {
      type: 'string'
    } };
  }) || [];
};
