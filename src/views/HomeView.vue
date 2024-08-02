<template>
  <v-container fluid class="container">
    <div class="card-group">
      <v-hover v-for="user in users" :key="user.id">
        <template v-slot:default="{ isHovering, props }">
          <v-card
            v-bind="props"
            color="primary"
            :elevation="0"
            tile
            @click.stop="toggleHandRaised(user)"
            class="card"
          >
            <v-img
              :src="images[user.profilePicture]"
              class="card-image"
              gradient="to top, rgba(0,0,0,.1), rgba(0,0,0,.3)"
              cover
            >
              <v-card-title
                class="font-weight-medium mb-0"
                v-text="user.name"
              />
              <v-card-subtitle
                v-if="user.handRaised"
                class="hand-time"
                v-text="user.handRaisedTime"
              />
              <v-icon v-if="user.handRaised" class="hand-icon"
                >mdi-hand-back-left</v-icon
              >
              <div
                v-if="globalTimerActive && timerUserId === user.id"
                class="timer"
              >
                {{ formatTime(globalTimeRemaining) }}
              </div>
            </v-img>
            <v-card-actions v-if="isHovering || mobile" class="hover-actions">
              <v-btn
                @click.stop="handleTimerAction(user)"
                icon="mdi-clock-outline"
              />
            </v-card-actions>
          </v-card>
        </template>
      </v-hover>
    </div>

    <audio ref="bellSound">
      <source src="../assets/bicycle-horn-7126.ogg" type="audio/ogg" />
      <source src="../assets/bicycle-horn-7126.mp3" type="audio/mpeg" />
    </audio>
  </v-container>
  <v-app-bar color="blue-grey-lighten-4" location="bottom">
    <v-app-bar-title>Navit meet queue</v-app-bar-title>
    <v-spacer></v-spacer>

    <v-btn icon>
      <v-icon>mdi-timer</v-icon>
      <v-menu
        v-model="menu"
        activator="parent"
        :close-on-content-click="false"
        offset-y
        offset="8"
        width="260"
      >
        <v-card>
          <v-card-title>Temporizador</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="timerSeconds"
              label="Segundos"
              type="number"
              min="1"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="text"
              density="comfortable"
              @click.stop="setTimer"
              >Atualizar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-btn>

    <v-btn @click="selectParticipants" icon class="mr-4">
      <v-icon>mdi-account-group</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { io } from "socket.io-client";
import { useDisplay } from "vuetify";
import images from "@/constants/images";

type ImageAssets = {
  cleber: string;
  will: string;
  denini: string;
  dayvid: string;
  cassio: string;
  wedson: string;
  elivelton: string;
  thami: string;
  ze: string;
  jorge: string;
  nara: string;
  abel: string;
  edu: string;
  geo: string;
};

interface User {
  id: number;
  name: string;
  profilePicture: keyof ImageAssets;
  handRaised: boolean;
  handRaisedTime?: string;
}

const { mobile } = useDisplay();

const users = ref<User[]>([]);
const bellSound = ref<HTMLAudioElement | null>(null);
const menu = ref(false);
const timerSeconds = ref<number>(60);
const globalTimerActive = ref(false);
const globalTimeRemaining = ref<number>(0);
const timerUserId = ref<number | null>(null);
const socket = io('https://navit-meet-queue-a873e187c7eb.herokuapp.com');

socket.on("initialData", (data) => {
  users.value = data.users;
  globalTimerActive.value = data.globalTimer.active;
  globalTimeRemaining.value = data.globalTimer.timeRemaining;
  timerUserId.value = data.globalTimer.userId;
});

socket.on("updateUsers", (updatedUsers) => {
  users.value = updatedUsers;
});

socket.on("updateGlobalTimer", (timerData) => {
  globalTimerActive.value = timerData.active;
  globalTimeRemaining.value = timerData.timeRemaining;
  timerUserId.value = timerData.userId;
});

socket.on("playBellSound", () => {
  if (bellSound.value) {
    bellSound.value.play().catch((error) => {
      console.error("Erro ao reproduzir o som:", error);
    });
  }
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

function toggleHandRaised(user: User) {
  socket.emit("toggleHandRaised", user.id);
}

function handleTimerAction(user: User) {
  if (globalTimerActive.value && timerUserId.value === user.id) {
    socket.emit("stopGlobalTimer");
  } else {
    socket.emit("startGlobalTimer", {
      userId: user.id,
      timerSeconds: timerSeconds.value,
    });
  }
}

function formatTime(seconds: number | undefined): string {
  if (seconds === undefined) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function selectParticipants() {
  console.log("Selecionar Participantes");
}

function setTimer() {
  menu.value = false;
}

onMounted(() => {
  if (bellSound.value) {
    bellSound.value.load();
  }
});
</script>

<style scoped lang="scss" src="./style.scss" />
