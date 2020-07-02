<template>
  <v-tooltip bottom>
    <template v-slot:activator="{on}">
      <span v-on="on">{{displayTime}}</span>
    </template>
    <span>{{time.toLocaleString()}}</span>
  </v-tooltip>
</template>
<script>
export default {
  props: ['time'],
  computed: {
    displayTime () {
      const bt = this.$moment(this.time)
      const ct = this.$moment()
      const diff = ct.diff(bt, 'days')
      if (diff > 0) return bt.toDate().toLocaleDateString()
      return bt.fromNow()
    }
  }
}
</script>
