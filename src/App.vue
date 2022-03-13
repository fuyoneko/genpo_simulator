<template>
  <v-app class="brown darken-4">
    <v-main class="brown darken-4">
      <Simulator />
    </v-main>
  </v-app>
</template>

<script>
import Simulator from "./components/Simulator.vue";

export default {
  name: "App",

  components: {
    Simulator,
  },

  data: () => ({
    //
  }),
};
</script>
