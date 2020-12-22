const getResponseDataArray = data => {
  if (Array.isArray(data)) {
    return data;
  } else if (data && data._jv && data._jv.json) {
    return data._jv.json.data || [];
  }
  return undefined;
};

export default getResponseDataArray;
