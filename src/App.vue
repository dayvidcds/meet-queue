<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <v-app>
    <v-main class="bg">
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

<style>
.page-wrapper {
  padding: 0px !important;
}
.bg {
  background-color: #1f1f1f;
}

* {
  overflow: hidden !important;
}
</style>
