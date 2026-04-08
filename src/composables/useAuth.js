import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const user = ref(null)
const profile = ref(null)
const loading = ref(true)

// 初始化认证状态
export function useAuth() {
  const initialize = async () => {
    try {
      // 获取当前会话
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        user.value = session.user
        await fetchProfile()
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取用户资料
  const fetchProfile = async () => {
    if (!user.value) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (!error && data) {
      profile.value = data
    }
  }

  // 注册
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email
        }
      }
    })

    if (error) throw error
    return data
  }

  // 登录
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    if (data?.user) {
      user.value = data.user
      await fetchProfile()
    }

    return data
  }

  // 登出
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    profile.value = null
  }

  // 更新资料
  const updateProfile = async (updates) => {
    if (!user.value) return

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()

    if (error) throw error
    profile.value = data
    return data
  }

  // 监听认证状态变化
  const subscribeToAuth = (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null
      if (user.value) {
        fetchProfile()
      } else {
        profile.value = null
      }
      callback(event, session)
    })
  }

  // 计算属性
  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')
  const isAdmin = computed(() => profile.value?.is_admin || false)

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    userEmail,
    isAdmin,
    initialize,
    signUp,
    signIn,
    signOut,
    updateProfile,
    subscribeToAuth
  }
}