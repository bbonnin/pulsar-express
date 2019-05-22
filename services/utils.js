import moment from 'moment'

export function cellFormatFloat(row, column, cellValue, index) {
  return parseFloat(cellValue).toFixed(2)
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
