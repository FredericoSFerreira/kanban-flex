import {useAuthStore} from '@/stores/auth'
import Parse from 'parse/dist/parse.min.js';

export const useCloudFunctions = () => {
  const authStore = useAuthStore()
  const token = authStore.token

  const callFunction = async (functionName: string, params = {}, options: any = {}) => {
    try {
      if (!authStore.isAuthenticated) {
        throw new Error('Authentication required')
      }

      if (token) {
        options.context = {
          ...options,
          'Authorization': `Bearer ${token}`,
        }
      }
      return  await Parse.Cloud.run(functionName, params, options)
    } catch (error: any) {
      if (error.code === 401) {
        authStore.logout()
        throw new Error('Session expired. Please login again.')
      }

      throw error
    }
  }

  const callPublicFunction = async (functionName: string, params = {}, options = {}) => {
    return await Parse.Cloud.run(functionName, params, options)
  }

  return {
    callFunction,
    callPublicFunction
  }
}
