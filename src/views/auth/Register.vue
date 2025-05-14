<template>
  <div class="min-vh-100 d-flex align-items-center bg-light py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <div class="text-center mb-4">
                <Trello class="text-primary" size="48"/>
                <h2 class="h3 mt-3">{{ $t('auth.createAccount') }}</h2>
                <p class="text-muted">{{ $t('auth.startJourney') }}</p>
              </div>

              <!-- Step 1: User Details -->
              <div v-if="step === 1">
                <form @submit.prevent="requestOTP">
                  <div class="form-floating mb-3">
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      v-model="name"
                      placeholder="John Doe"
                      required
                    >
                    <label for="name">{{ $t('auth.fullName') }}</label>
                  </div>

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

                  <div class="form-floating mb-3">
                    <vue-tel-input
                      v-model="phone"
                      :inputOptions="{placeholder: $t('auth.phone')}"
                      mode="auto"
                      :valid-characters-only="true"
                      :enable-area-codes="true"
                      :default-country="defaultCountry"
                      :preferred-countries="['BR', 'US']"
                      :input-classes="['form-control', 'form-control-lg']"
                      @validate="validatePhone"
                    ></vue-tel-input>

                    <div v-if="!isPhoneValid && phone" class="text-danger small mt-1">
                      {{ $t('auth.invalidPhone') }}
                    </div>
                  </div>


                  <input class="form-check-input m-1" type="checkbox" required id="lgpdConsent">
                  <label class="form-check-label mb-3" for="lgpdConsent">
                    {{ $t('myProfile.accept') }}
                    <a href="/privacy-policy" target="_blank">{{ $t('cookies.privacyPolicy') }}</a>.
                  </label>

                  <button
                    type="submit"
                    class="btn btn-primary w-100 py-2"
                    :disabled="!isValidForm"
                  >
                    {{ $t('auth.continue') }}
                  </button>
                </form>

                <div class="text-center mt-4">
                  <p class="text-muted">
                    {{ $t('auth.alreadyHaveAccount') }}
                    <router-link to="/login" class="text-decoration-none">
                      {{ $t('auth.signIn') }}
                    </router-link>
                  </p>
                </div>

                <div class="text-center mt-3" v-if="showSpinner">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
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
                    <ArrowLeft :size="16" class="me-1"/>
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
import {VueTelInput} from 'vue-tel-input';
import 'vue-tel-input/vue-tel-input.css';
import api from "@/utils/api";
import {useSwal} from "@/utils/swal";
import {useRoute, useRouter} from "vue-router";
import {jwtDecode} from "jwt-decode";
import {useAuthStore} from "@/stores/auth";
import {sleep} from "@/utils/utils";


type JwtPayload = {
  id: string
  name: string
  email: string
  exp: number
}

const router = useRouter()
const route = useRoute()
const {t, locale} = useI18n();
const auth = useAuthStore()
const step = ref(1);
const name = ref('');
const email = ref('');
const otpDigits = ref(Array(6).fill(''));
const resendTimer = ref(0);
const otpInputs = ref<HTMLInputElement[]>([]);
const phone = ref(null);
const isPhoneValid = ref(false);
const showSpinner = ref(false);
const Swal = useSwal();

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

const isValidForm = computed(() => {
  return name.value.trim().length >= 2 && isValidEmail.value && isPhoneValid.value;
});

const isValidOTP = computed(() => {
  return otpDigits.value.every(digit => digit !== '');
});

const defaultCountry = computed(() => {
  return locale.value === 'pt-BR' ? 'BR' : 'US';
});

const requestOTP = () => {
  if (!isValidForm.value) return;
  showSpinner.value = true;
  api.post('/register', {email: email.value, name: name.value, phone: phone.value})
    .then((response) => {
      console.log(response);
      step.value = 2;
      startResendTimer();
      showSpinner.value = false;
    })
    .catch((error: any) => {
      showSpinner.value = false;
      console.log(error)

      if (error.response.status === 409) {
        return Swal.fire({
          icon: "info",
          title: "Oops...",
          text: t('auth.alreadyHaveAccount'),
        }).then(() => {
          router.push('/login')
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
  console.log('Verifying OTP:', otp);
  showSpinner.value = true;
  api.post('/check-otp', {email: email.value, code: otp})
    .then(async (response) => {
      if (response.data.isValid) {
        // Salvar token e redirecionar
        const token = response.data.token;
        localStorage.setItem('token', token);
        const decoded = jwtDecode<JwtPayload>(token)
        console.log(decoded, "HERER")
        auth.login(decoded, token)
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

const validatePhone = ({valid}: { valid: boolean }) => {
  isPhoneValid.value = valid;
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


/* Vue Tel Input customization */
:deep(.vti__input) {
  background: transparent;
  border: none;
  border-radius: 0;
  font-size: 1rem;
  padding: 1rem 0.75rem;
}

:deep(.vti__dropdown) {
  background: transparent;
  border: none;
  border-radius: 0;
}

:deep(.vti__dropdown-list) {
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

</style>
