<template>
  <v-tooltip bottom>
    <template v-slot:activator="{on}">
      <!-- <span v-on="on">{{user.displayName}}</span> -->
      <v-chip v-on="on" color="accent">
        <v-avatar left>
          <v-img :src="user.photoURL"/>
        </v-avatar>
        {{user.displayName}}
      </v-chip>
    </template>
    <span>{{user.email}}</span>
  </v-tooltip>
</template>
<script>
export default {
  props: ['user']
}
</script>
