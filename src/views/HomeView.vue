<template>
  <v-container fluid class="container">
    <v-card class="pa-0 ma-4" color="surface" elevation="0">
      <perfect-scrollbar
        :style="{
          height: 'calc(100vh - 101px)',
          width: `calc(100vw - ${drawer ? '370px' : '32px'})`,
        }"
      >
        <div class="card-group">
          <v-hover v-for="user in users" :key="user.id">
            <template v-slot:default="{ isHovering, props }">
              <v-card
                v-bind="props"
                color="#202124"
                :elevation="0"
                tile
                class=""
                @click.stop="toggleHandRaised(user)"
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
                    v-text="formatHandRaisedDate(user.handRaisedTime)"
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
                <v-card-actions
                  v-if="user.handRaised && (isHovering || width < 1025)"
                  class="hover-actions"
                >
                  <v-btn
                    @click.stop="handleTimerAction(user)"
                    icon="mdi-clock-outline"
                  />
                </v-card-actions>
              </v-card>
            </template>
          </v-hover>
        </div>
      </perfect-scrollbar>
    </v-card>
  </v-container>

  <audio ref="bellSound">
    <source src="../assets/bicycle-horn-7126.ogg" type="audio/ogg" />
    <source src="../assets/bicycle-horn-7126.mp3" type="audio/mpeg" />
  </audio>

  <v-app-bar color="transparent" location="bottom" class="pa-1" elevation="0">
    <v-card
      class="w-100 rounded-pill pt-0"
      elevation="0"
      style="background-color: #20212400"
    >
      <v-card-title
        class="d-flex justify-space-between align-center pt-0"
        style="color: aliceblue"
      >
        <span>{{ pageTitle }}</span>

        <div>
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
                <v-card-text class="pt-1">
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
                    variant="tonal"
                    density="comfortable"
                    @click.stop="setTimer"
                    >Atualizar</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-btn>

          <v-btn @click="selectParticipants" icon>
            <v-icon>mdi-account-group</v-icon>
          </v-btn>
        </div>
      </v-card-title>
    </v-card>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    location="right"
    permanent
    color="transparent"
    class="pb-5 pt-4 pr-4 pl-0"
    width="340"
    :border="0"
  >
    <v-card class="h-100 pa-0" color="surface">
      <v-card-title v-text="'Participantes'" />
      <v-divider></v-divider>
      <v-card-text>
        <perfect-scrollbar
          :style="{
            height: 'calc(100vh - 160px)',
          }"
        >
          <v-card
            color="surface-light"
            class="px-2 mb-4"
            v-for="user in getGlobalUsers"
            :key="`list-${user.id}`"
          >
            <v-row align="center" class="spacer" no-gutters>
              <v-col cols="2">
                <v-checkbox
                  hide-details
                  v-model="user.active"
                  @update:model-value="
                    handleUpdateParticipantsList(user.active, user)
                  "
                ></v-checkbox>
              </v-col>
              <v-col cols="2">
                <v-avatar size="36px">
                  <v-img alt="Avatar" :src="images[user.profilePicture]" />
                </v-avatar>
              </v-col>

              <v-col class="text-left" cols="6">
                <strong v-html="user.name"></strong>
              </v-col>
              <!-- <v-col cols="2" v-if="user.handRaised">
                <v-icon icon="mdi-hand-back-left" size="16" />
              </v-col> -->
            </v-row>
          </v-card>
        </perfect-scrollbar>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import images from "@/constants/images";
import { io } from "socket.io-client";
import { computed } from "vue";
import { onMounted, ref } from "vue";
import { useDisplay } from "vuetify";

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
  active: boolean;
}

const { width } = useDisplay();

const drawer = ref(false);

const users = ref<User[]>([]);
const globalUsers = ref<User[]>([]);

const bellSound = ref<HTMLAudioElement | null>(null);
const menu = ref(false);
const timerSeconds = ref<number>(60);
const globalTimerActive = ref(false);
const globalTimeRemaining = ref<number>(0);
const timerUserId = ref<number | null>(null);
const pageTitle = ref("Navit meet queue");
const socket = io("https://navit-meet-queue-a873e187c7eb.herokuapp.com");

socket.on("initialData", (data) => {
  users.value = data.users;
  globalUsers.value = data.globalUsers;
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

socket.on("updateGlobalUserList", (users) => {
  globalUsers.value = users;
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

const getGlobalUsers = computed<User[]>(() =>
  globalUsers.value.sort((a, b) => a.name.localeCompare(b.name))
);

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

function formatHandRaisedDate(timer?: string) {
  if (timer) {
    return new Date(timer).toLocaleTimeString();
  }
}

function formatTime(seconds: number | undefined): string {
  if (seconds === undefined) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function selectParticipants() {
  drawer.value = !drawer.value;
}

function setTimer() {
  menu.value = false;
}

function handleUpdateParticipantsList(state: boolean, user: User) {
  socket.emit("setActiveState", {
    userId: user.id,
    active: state,
  });
}

onMounted(() => {
  if (bellSound.value) {
    bellSound.value.load();
  }
});
</script>

<style scoped lang="scss" src="./style.scss" />
