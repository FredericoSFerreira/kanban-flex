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
                    :disabled="!isValidEmail"
                  >
                    {{ $t('auth.continue') }}
                  </button>
                </form>

                <div class="text-center mt-4">
                  <p class="text-muted">
                    {{ $t('auth.newUser') }}
                    <router-link to="/register" class="text-decoration-none">
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
                      :disabled="!isValidOTP"
                    >
                      {{ $t('auth.verify') }}
                    </button>
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
import {ref, computed} from 'vue';
import {useI18n} from 'vue-i18n';
import {Trello, ArrowLeft} from 'lucide-vue-next';
import api from "@/utils/api";
import {useSwal} from "@/utils/swal";


const {t} = useI18n();
const Swal = useSwal();
const step = ref(1);
const email = ref('');
const otpDigits = ref(Array(6).fill(''));
const resendTimer = ref(0);
const otpInputs = ref<HTMLInputElement[]>([]);

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

const isValidOTP = computed(() => {
  return otpDigits.value.every(digit => digit !== '');
});

const requestOTP = () => {
  if (!isValidEmail.value) return;

  api.post('/send-otp', {email: email.value})
    .then((response) => {
      console.log(response);
      step.value = 2;
      startResendTimer();
    })
    .catch((error) => {
      console.log(error)
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Ocorreu um erro ao enviar o código de autorização. Tente novamente.",
      })
    })
};

const verifyOTP = () => {
  if (!isValidOTP.value) return;
  const otp = otpDigits.value.join('');

  api.post('/check-otp', { email: email.value, code: otp })
    .then((response) => {
      if (response.data.isValid) {
        // Salvar token e redirecionar
        localStorage.setItem('token', response.data.token);
        // Aqui você pode adicionar redirecionamento após login bem-sucedido
      }
    })
    .catch((error) => {
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
</style>
