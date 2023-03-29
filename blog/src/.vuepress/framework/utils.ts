export const getRequest = (): Record<string, string> => {
  const url = window.location.search; // 获取url中"?"符后的字串
  // cc.log("==url=>",decodeURI(url));
  const theRequest: Record<string, string> = {};
  if (url.indexOf('?') !== -1) {
    const str = url.substr(1);
    // cc.log(str);
    const strs = str.split('&');
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
    }
  }
  return theRequest;
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function unionSet(array: any[], key: string) {
  const hash = {};
  let result = [];
  result = array.reduce((item, next) => {
    hash[next[key]] ? '' : (hash[next[key]] = true && item.push(next));
    return item;
  }, []);
  return result;
}

// 太菜了，写法好low (
export  const sortBy = (sortKey: string, reverse = false, sortKeyPrefix?: string) => (
    a,
    b
  ) => {
    if (sortKeyPrefix) {
      if (a[sortKeyPrefix][`${sortKey}`] < b[sortKeyPrefix][`${sortKey}`]) {
        return reverse ? -1 : 1;
      }
      if (a[sortKeyPrefix][`${sortKey}`] > b[sortKeyPrefix][`${sortKey}`]) {
        return reverse ? 1 : -1;
      }
      return 0;
    }
    if (a[`${sortKey}`] < b[`${sortKey}`]) {
      return reverse ? -1 : 1;
    }
    if (a[`${sortKey}`] > b[`${sortKey}`]) {
      return reverse ? 1 : -1;
    }
    return 0;
};

export const formatDate = (timestamp, format) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const padZero = (num) => (num < 10 ? `0${num}` : num);
  const formatObj = {
    'yyyy': year,
    'MM': padZero(month),
    'dd': padZero(day),
    'HH': padZero(hour),
    'mm': padZero(minute),
    'ss': padZero(second),
  };
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, (matched) => formatObj[matched]);
}
  