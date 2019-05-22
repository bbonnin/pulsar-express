import moment from 'moment'

export function cellFormatFloat(row, column, cellValue, index) {
  return parseFloat(cellValue).toFixed(2)
}

export function cellFormatDateSince(row, column, cellValue, index) {
  return moment(cellValue).fromNow()
}