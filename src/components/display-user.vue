<template>
  <v-tooltip bottom>
    <template v-slot:activator="{on}">
      <v-chip v-on="on" color="accent" :small="size === 'small'" :outlined="size === 'small'" :to="`/search?text=${user.displayName}`">
        <v-avatar left v-if="size !== 'small'">
          <v-img :src="user.photoURL"/>
        </v-avatar>
        <span class="text-truncate">{{size === 'small' ? user.displayName.substr(0, 5) : user.displayName}}</span>
      </v-chip>
    </template>
    <span>{{user.email}}</span>
  </v-tooltip>
</template>
<script>
export default {
  props: ['user', 'size']
}
</script>
