<template>
  <div class="min-vh-100 d-flex align-items-center bg-light py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <div class="text-center mb-4">
                <Trello class="text-primary" size="48"/>
                <h2 class="h3 mt-3 mb-4">{{ $t('auth.welcomeBack') }}</h2>
              </div>

              <!-- Social Login -->
              <div class="mb-4">
                <button @click="handleGoogleLogin"
                        class="btn btn-google w-100 d-flex align-items-center justify-content-center gap-2">
                  <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20"/>
                  {{$t('auth.googleLogin')}}
                </button>
              </div>

              <div class="text-center mb-4">
                <div class="divider d-flex align-items-center gap-3">
                  <span class="divider-line"></span>
                  <span class="text-muted">{{$t('auth.or')}}</span>
                  <span class="divider-line"></span>
                </div>
              </div>

              <!-- Step 1: Email Input -->
              <div v-if="step === 1">
                <p class="text-muted text-center mb-4">
                  {{ $t('auth.enterEmail') }}
                </p>
                <form @submit.prevent="requestOTP">
                  <div class="form-floating mb-3">
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="email"
                      placeholder="name@example.com"
                      required
                    >
                    <label for="email">{{ $t('auth.email') }}</label>
                  </div>
                  <button
                    type="submit"
                    class="btn btn-primary w-100 py-2"
                    :disabled="!isValidEmail || showSpinner"
                  >
                    {{ $t('auth.continue') }}
                  </button>

                  <div class="text-center mt-3" v-if="showSpinner">
                    <div class="spinner-border" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </form>

                <div class="text-center mt-4">
                  <p class="text-muted">
                    {{ $t('auth.newUser') }}
                    <router-link :to="route.query.redirect ? `/register?redirect=${route.query.redirect}`: '/register'"
                                 class="text-decoration-none">
                      {{ $t('auth.signUp') }}
                    </router-link>
                  </p>
                </div>
              </div>

              <!-- Step 2: OTP Input -->
              <div v-if="step === 2">
                <p class="text-muted text-center mb-4">
                  {{ $t('auth.otpSent') }} {{ email }}
                </p>
                <form @submit.prevent="verifyOTP">
                  <div class="otp-input-container mb-4">
                    <input
                      v-for="(digit, index) in 6"
                      :key="index"
                      type="text"
                      :maxlength="1"
                      v-model="otpDigits[index]"
                      class="form-control otp-digit"
                      @input="handleOtpInput($event, index)"
                      @keydown.delete="handleOtpBackspace($event, index)"
                      @paste="handleOtpPaste"
                      ref="otpInputs"
                    >
                  </div>

                  <div class="d-grid gap-2">
                    <button
                      type="submit"
                      class="btn btn-primary py-2"
                      :disabled="!isValidOTP || showSpinner"
                    >
                      {{ $t('auth.verify') }}
                    </button>

                    <div class="text-center mt-3" v-if="showSpinner">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      class="btn btn-link text-decoration-none"
                      @click="resendOTP"
                      :disabled="resendTimer > 0"
                    >
                      {{ resendTimer > 0 ? `${$t('auth.resendIn')} ${resendTimer}s` : $t('auth.resendCode') }}
                    </button>
                  </div>
                </form>

                <div class="text-center mt-4">
                  <button
                    class="btn btn-link text-decoration-none p-0"
                    @click="step = 1"
                  >
                    <ArrowLeft size="16" class="me-1"/>
                    {{ $t('auth.changeEmail') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useI18n} from 'vue-i18n';
import {Trello, ArrowLeft} from 'lucide-vue-next';
import api from "@/utils/api";
import {useSwal} from "@/utils/swal";
import {useAuthStore} from '@/stores/auth'
import {jwtDecode} from 'jwt-decode';
import {useRoute, useRouter} from "vue-router";
import {sleep} from "@/utils/utils"
import {googleTokenLogin} from "vue3-google-login"


type JwtPayload = {
  id: string
  name: string
  email: string
  exp: number
}

const {t} = useI18n();
const Swal = useSwal();
const step = ref(1);
const email = ref('');
const showSpinner = ref(false);
const otpDigits = ref(Array(6).fill(''));
const resendTimer = ref(0);
const otpInputs = ref<HTMLInputElement[]>([]);
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

const isValidOTP = computed(() => {
  return otpDigits.value.every(digit => digit !== '');
});

const requestOTP = () => {
  if (!isValidEmail.value) return;
  showSpinner.value = true;
  api.post('/send-otp', {email: email.value})
    .then((response) => {
      console.log(response);
      step.value = 2;
      startResendTimer();
      showSpinner.value = false;
    })
    .catch((error: any) => {
      showSpinner.value = false;
      if (error.response.status === 404) {
        return Swal.fire({
          icon: "info",
          title: "Oops...",
          text: "Email não cadastrado. Realize o cadastro para continuar.",
        }).then(() => {
          router.push(route.query.redirect ? `/register?redirect=${route.query.redirect}` : '/register')
        })
      }
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Ocorreu um erro ao enviar o código de autorização. Tente novamente.",
      })
    })
};


const verifyOTP = async () => {
  if (!isValidOTP.value) return;
  const otp = otpDigits.value.join('');
  showSpinner.value = true;
  api.post('/check-otp', {email: email.value, code: otp})
    .then(async (response) => {
      if (response.data.isValid) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        const decoded = jwtDecode<JwtPayload>(token)
        auth.login(decoded, token)
        // Remove in future due deprecated used only by board v1
        localStorage.setItem("user", JSON.stringify({
          'name': auth.user?.name,
          'id': auth.user?.id,
          'email': auth.user?.email
        }))
        await sleep()
        showSpinner.value = false;
        const redirectPath = route.query.redirect
        if (typeof redirectPath === 'string' && redirectPath !== '/login') {
          router.push(redirectPath)
        } else {
          router.push('/my-boards')
        }
      }
    })
    .catch((error) => {
      showSpinner.value = false;
      console.log(error);
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Código inválido ou expirado. Tente novamente.",
      });
    });
};

const resendOTP = () => {
  if (resendTimer.value > 0) return;
  otpDigits.value = Array(6).fill('');
  requestOTP()
  startResendTimer();
};

const startResendTimer = () => {
  resendTimer.value = 30;
  const timer = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--;
    } else {
      clearInterval(timer);
    }
  }, 1000);
};

const handleOtpInput = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // Ensure only numbers
  if (!/^\d*$/.test(value)) {
    input.value = '';
    return;
  }

  // Move to next input
  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus();
  }
};

const handleOtpBackspace = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
};

const handleOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text');
  if (!pastedData) return;

  const numbers = pastedData.replace(/\D/g, '').slice(0, 6);
  numbers.split('').forEach((num, index) => {
    if (index < 6) {
      otpDigits.value[index] = num;
    }
  });
};


function handleGoogleLogin() {
  showSpinner.value = true;
  googleTokenLogin().then((response) => {
    const {access_token} = response
    api.post('/auth/google', {token: access_token})
      .then((response) => {
        const token = response.data.token;
        localStorage.setItem('token', token);
        const decoded = jwtDecode<JwtPayload>(token)
        auth.login(decoded, token)
        // Remove in future due deprecated used only by board v1
        localStorage.setItem("user", JSON.stringify({
          'name': auth.user?.name,
          'id': auth.user?.id,
          'email': auth.user?.email
        }))
        showSpinner.value = false;
        const redirectPath = route.query.redirect
        if (typeof redirectPath === 'string' && redirectPath !== '/login') {
          router.push(redirectPath)
        } else {
          router.push('/my-boards')
        }
      })
      .catch((error: any) => {
        console.log(error)
      })
  })
}


</script>

<style scoped>
.otp-input-container {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.otp-digit {
  width: 3rem;
  height: 3rem;
  text-align: center;
  font-size: 1.25rem;
  padding: 0;
}

@media (max-width: 576px) {
  .otp-digit {
    width: 2.5rem;
    height: 2.5rem;
  }
}

.divider {
  margin: 1.5rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #dee2e6;
}

.btn-google {
  background-color: #fff;
  border: 1px solid #dadce0;
  color: #3c4043;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-google:hover {
  background-color: #f8f9fa;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
}

</style>
