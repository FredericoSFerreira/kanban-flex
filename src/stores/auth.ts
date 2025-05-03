// stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | { id: number; name: string; role: string },
    token: null as null | string
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    login(userData: any, token: string) {
      this.user = userData
      this.token = token
    },
    logout() {
      this.user = null
      this.token = null
    },
  }
})
