import moment from 'moment'

export default (time, unit, value) => {
  const bt = moment(time)
  const ct = moment()
  const r = ct.diff(bt, unit)
  return r < value
}
