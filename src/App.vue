<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <v-app>
    <v-main class="bg-blue-grey-lighten-4">
      <v-container class="page-wrapper">
        <router-view v-slot="{ Component }">
          <v-fade-transition appear>
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.page-wrapper {
  padding: 0px !important;
  max-width: 1500px;
}
</style>
