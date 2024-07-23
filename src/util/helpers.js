/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-sequences */
/* eslint-disable no-return-assign */
import moment from 'moment/min/moment-with-locales';

export const flattenObject = (obj, out = {}) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      out = flattenObject(obj[key], out);
    } else {
      out[key] = obj[key];
    }
  });
  return out;
};

export const pushToArray = (arr, obj, key) => {
  const index = arr.findIndex((e) => e[key] === obj[key]);
  if (index === -1) {
    arr.push(obj);
  } else {
    arr[index] = obj;
  }
};

// Get objects from an array based on another array of key/value while preserving order
export const getObjectsFromList = (searchableList, matchList, matchKey) => {
  const results = searchableList.filter((obj) => matchList.includes(obj[matchKey]));
  return results.sort((a, b) => matchList.indexOf(a[matchKey]) - matchList.indexOf(b[matchKey]));
};

// Get objects from array given matching key/value while preserving order
export const getObjectsFromListbyKey = (searchableList, searchKey, searchValue) => {
  const results = searchableList.filter((obj) => obj[searchKey] === searchValue);
  return results;
};

// Prototype function to get object value from JSON path
// eslint-disable-next-line func-names
Object.byString = function (o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, ''); // strip a leading dot
  const a = s.split('.');
  for (let i = 0, n = a.length; i < n; ++i) {
    const k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
};

// Convert list of objects to singular object traversed by "id"
// eslint-disable-next-line max-len
export const convertListToMapById = (list) => list.reduce((obj, item) => ((obj[item.id] = item), obj), {});

// Generate initials from full name
export const getInitials = (fullName) => {
  const allNames = fullName.trim().split(' ');
  const initials = allNames.reduce((acc, curr, index) => {
    if (index === 0 || index === allNames.length - 1) {
      acc = `${acc}${curr.charAt(0).toUpperCase()}`;
    }
    return acc;
  }, '');
  return initials;
};

// Compare created at date objects
export const compareCreatedAt = (a, b) => moment(a.created_at).diff(moment(b.created_at));

// Get subdomain from user reference url
export const getSubdomainFromUserUrl = (htmlUrl) => htmlUrl.split('.')[0].split('https://')[1];

// Generate random integer between numbers
export const generateRandomInteger = (min = 0, max = 100) => Math.floor(min + Math.random() * (max - min + 1));

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with
 * (e.g. "bold 14px verdana")
 *
 * @see https://stackoverflow.com/a/21015393
 */
export const getTextWidth = (text, font) => {
  // re-use canvas object for better performance
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
};

// Split an array into chunks of given size
export const chunkArray = (array, size) => {
  const chunkedArr = [];
  let index = 0;
  while (index < array.length) {
    chunkedArr.push(array.slice(index, size + index));
    index += size;
  }
  return chunkedArr;
};

export const anythingToString = (value) => {
  // Check for null and undefined
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  // Handle different types
  switch (typeof value) {
    case 'boolean':
    case 'number':
    case 'bigint':
    case 'symbol':
    case 'string':
      return value.toString();

    case 'function':
      return value.toString(); // Functions are turned into their source code

    case 'object':
      try {
        return JSON.stringify(value); // Convert objects and arrays to JSON
      } catch (error) {
        return value.toString(); // Fallback for circular references or non-serializable objects
      }

    default:
      return String(value); // Fallback for any other type
  }
};
