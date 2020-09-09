import moment from 'moment'

export default (time) => {
  const bt = moment(time)
  const ct = moment()
  const r = ct.diff(bt, 'hours')
  return r < 12
}
