import {defineStore} from 'pinia'

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: () => ({
    user: null as null | { id: string; name: string; email: string, avatar?: string, phone?: string, isAdmin?: boolean },
    token: null as null | string,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => !!(state.user as any)?.isAdmin,
  },
  actions: {
    login(userData: any, token: string) {
      this.user = userData
      this.token = token
    },
    updateUser(userData: any) {
      this.user = userData
    },
    logout() {
      this.user = null
      this.token = null
    },
  }
})
