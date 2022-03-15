<template>
  <v-app class="brown darken-4" style="width: 370px">
    <v-main class="brown darken-4" style="width: 370px">
      <Simulator />
    </v-main>
  </v-app>
</template>

<script>
import Simulator from "./components/Simulator.vue";

export default {
  name: "App",

  components: {
    Simulator
  },

  data: () => ({
    //
  })
};
</script>

<style>
.theme--light.v-application {
  background: #3e2723 !important;
}
body {
  background: #3e2723 !important;
}
</style>
