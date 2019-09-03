import moment from 'moment'

export function cellFormatFloat(row, column, cellValue, index) {
  return parseFloat(cellValue).toFixed(2)
}

export function cellFormatBytesToBestUnit(row, column, cellValue, index) {
  const bytes = cellValue
  const decimals = 2
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function cellFormatDateSince(row, column, cellValue, index) {
  return moment(cellValue).fromNow()
}

export function cellFormatBoolean(row, column, cellValue, index) {
  return '' + cellValue
}

export function getSimpleTopicName(topicName) {
  if (topicName) {
    let idx = topicName.indexOf('persistent://')
    idx = idx == -1 ? 0 : idx + 13
    return topicName.substring(idx)
  }

  return ''
}

export function cellFormatSimpleTopicName(row, column, cellValue, index) {
  return getSimpleTopicName(cellValue)
}

export function shortClassName(className) {
  const items = className.split('.')

  if (items.length > 1) {
    return items.slice(0, items.length - 1).map(n => n.charAt(0)).join('.') + '.' + items[items.length - 1]
  }

  return className
}