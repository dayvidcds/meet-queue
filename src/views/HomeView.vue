<template>
  <v-container fluid class="container">
    <div class="card-group">
      <v-hover v-for="user in sortedUsers" :key="user.id">
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
              :src="user.profilePicture"
              class="card-image"
              gradient="to top, rgba(0,0,0,.1), rgba(0,0,0,.3)"
              cover
            >
              <v-card-title class="font-weight-bold mb-0" v-text="user.name" />
              <v-card-subtitle
                v-if="user.handRaised"
                class="hand-time"
                v-text="user.handRaisedTime"
              />
              <v-icon v-if="user.handRaised" class="hand-icon">mdi-hand-back-left</v-icon>
              <div v-if="user.timerActive" class="timer">{{ formatTime(user.timeRemaining) }}</div>
            </v-img>
            <v-card-actions v-if="isHovering" class="hover-actions">
              <!-- Actions you want to show on hover -->
              <v-btn
                @click.stop="user.timeRemaining ? stopTimer(user) : startTimer(user)"
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface User {
  id: number
  name: string
  profilePicture: string
  handRaised: boolean
  handRaisedTime?: string
  timerActive?: boolean
  timeRemaining?: number
  timerIntervalId?: any
}

const users = ref<User[]>([
  {
    id: 1,
    name: 'Cleber',
    profilePicture: 'https://i.pravatar.cc/200?img=1',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 2,
    name: 'Will',
    profilePicture: 'https://i.pravatar.cc/200?img=2',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 3,
    name: 'Denini',
    profilePicture: 'https://i.pravatar.cc/200?img=3',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 4,
    name: 'Dayvid',
    profilePicture: 'https://i.pravatar.cc/200?img=4',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 5,
    name: 'Wedson',
    profilePicture: 'https://i.pravatar.cc/200?img=5',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 6,
    name: 'Cássio',
    profilePicture: 'https://i.pravatar.cc/200?img=6',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 7,
    name: 'Thamires',
    profilePicture: 'https://i.pravatar.cc/200?img=7',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 8,
    name: 'Zé',
    profilePicture: 'https://i.pravatar.cc/200?img=8',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 9,
    name: 'Edu',
    profilePicture: 'https://i.pravatar.cc/200?img=9',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 10,
    name: 'Geo',
    profilePicture: 'https://i.pravatar.cc/200?img=10',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 11,
    name: 'Jorge',
    profilePicture: 'https://i.pravatar.cc/200?img=11',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 12,
    name: 'Nara',
    profilePicture: 'https://i.pravatar.cc/200?img=12',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  },
  {
    id: 13,
    name: 'Elivelton',
    profilePicture: 'https://i.pravatar.cc/200?img=13',
    handRaised: false,
    timeRemaining: 0,
    timerActive: false
  }
])

const bellSound = ref<HTMLAudioElement | null>(null)

function toggleHandRaised(user: User) {
  if (user.handRaised) {
    stopTimer(user)
  }
  user.handRaised = !user.handRaised
  user.handRaisedTime = user.handRaised ? new Date().toLocaleTimeString() : undefined
}

function startTimer(user: User) {
  if (user.timerActive) return
  user.timerActive = true
  user.timeRemaining = 60

  user.timerIntervalId = setInterval(() => {
    if (user.timeRemaining && user.timeRemaining > 0) {
      user.timeRemaining--
    } else {
      clearInterval(user.timerIntervalId)
      user.timerActive = false
      user.handRaised = false
      playBellSound()
    }
  }, 1000)
}

function stopTimer(user: User) {
  if (user.timerIntervalId) {
    clearInterval(user.timerIntervalId)
  }
  user.timerActive = false
  user.timeRemaining = 0
}

function formatTime(seconds: number | undefined): string {
  if (seconds === undefined) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function playBellSound() {
  if (bellSound.value) {
    bellSound.value.play().catch((error) => {
      console.error('Erro ao reproduzir o som:', error)
    })
  }
}

const sortedUsers = computed(() =>
  users.value.sort((a, b) => (a.handRaised === b.handRaised ? 0 : a.handRaised ? -1 : 1))
)
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.card-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  width: 100%;
}

@media (min-width: 768px) {
  .card-group {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

.card-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  position: relative;
}

.hand-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 48px;
  opacity: 0.8;
}

.hand-time {
  margin-top: -0.6rem;
}

.timer {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 20px;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px;
  border-radius: 3px;
}

.hover-actions {
  display: flex;
  justify-content: end;
  padding: 8px;
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transition: opacity 0.3s ease;
  background-color: transparent;
}
</style>
