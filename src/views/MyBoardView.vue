<template>
  <div class="container py-5" v-if="showMyBoards">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h2 mb-0">{{ $t('myBoards.title') }}</h1>
      <router-link to="/board" class="btn btn-primary">
        <Plus size="18" class="me-2"/>
        {{ $t('myBoards.createBoard') }}
      </router-link>
    </div>

    <!-- Empty State -->
    <div v-if="boards.length === 0" class="text-center py-5">
      <Layout size="48" class="text-primary mb-3"/>
      <h2 class="h4 mb-3">{{ $t('myBoards.emptyState.title') }}</h2>
      <p class="text-muted mb-4">{{ $t('myBoards.emptyState.description') }}</p>
      <router-link to="/board" class="btn btn-primary">
        {{ $t('myBoards.emptyState.cta') }}
      </router-link>
    </div>

    <!-- Boards Grid -->
    <div v-else class="row g-4">
      <div v-for="board in boards" :key="board.id" class="col-md-6 col-lg-4">
        <div class="card h-100 board-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h3 class="h5 mb-0">{{ board.name }}</h3>
              <div class="dropdown">
                <button
                  class="btn btn-link p-0"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <MoreVertical size="18"/>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <router-link :to="`/board/${board.id}`" class="dropdown-item">
                      <Eye size="16" class="me-2"/>
                      {{ $t('myBoards.actions.view') }}
                    </router-link>
                  </li>
                  <li>
                    <button class="dropdown-item text-danger" @click="removeBoard(board.id)">
                      <Trash2 size="16" class="me-2"/>
                      {{ $t('myBoards.actions.delete') }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <p class="text-muted mb-3">{{ board.description || '' }}</p>

            <div class="d-flex align-items-center text-muted small">
              <Calendar size="14" class="me-2"/>
              {{ formatDate(board.createdAt) }}
              <Users size="14" class="ms-3 me-2"/>
                            {{ board.members || 10 }} {{ $t('myBoards.members') }}
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>

  <div class="content">
    <section class="container-fluid d-block">
      <div class="row justify-content-center">
        <div class="col-12 col-md-6 col-lg-4" style="min-width: 500px;">
          <div class="card bg-white mb-5 mt-5 border-0" style="box-shadow: 0 12px 15px rgba(0, 0, 0, 0.08);">

            <div class="card-body p-5 text-center" v-if="showEmail">
              <i class="bi bi-envelope" style="font-size: 50px"></i>
              <h4>Infome seu e-mail</h4>
              <p>Um código de autorização será enviado no seu e-mail</p>

              <input type="email" v-model="email" class="form-control" id="userEmail" aria-describedby="email">
              <br>
              <button class="btn btn-primary mb-3" @click="sendCode()" v-if="!showLoading">
                Enviar
              </button>

              <div class="text-center" v-if="showLoading">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

            </div>

            <div class="card-body p-5 text-center" v-if="showVerify">
              <i class="bi bi-key" style="font-size: 50px"></i>
              <h4>Verifique seu e-mail</h4>
              <p>Um código de autorização foi enviado para o seu e-mail</p>
              <p>{{ email }}</p>
              <p><a href="#" @click="changeEmail()"> Alterar email</a></p>

              <otp v-model="code" :count="6" ref="otpComponent">
                <template v-slot="{ digits, onInput, onPaste, onBlur }">
                  <div class="">
                    <otp-group class="otp-field mb-4">
                      <template v-slot="{ focusNext, focusPrev }">
                        <otp-group-input
                          v-for="(digit, index) in digits"
                          :key="index"
                          :value="digit"
                          autofocus
                          placeholder=""
                          @blur="onBlur"
                          @next="focusNext(index)"
                          @prev="focusPrev(index)"
                          @paste="onPaste(index, $event)"
                          @input="onInput(index, $event)"
                          class=""
                        />
                      </template>
                    </otp-group>
                  </div>
                </template>
              </otp>

              <button class="btn btn-primary mb-3" @click="verifyCode()">
                Verificar
              </button>

              <p class="resend text-muted mb-0">
                Não recebeu o código? <a href="">Reenviar código</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

</template>
<script>
import Parse from 'parse/dist/parse.min.js';
import {validateEmail} from "@/utils/validate.js";
import axios from 'axios';
import {removePathFromUrl} from "@/utils/utils.js";
import {Otp, OtpGroup, OtpGroupInput} from "@/components/otp";
import {Plus, Layout, MoreVertical, Eye, Trash2, Calendar, Users} from 'lucide-vue-next';

Parse.initialize(import.meta.env.VITE_PARSE_APP_ID);
Parse.serverURL = import.meta.env.VITE_BACKEND_URL
const Boards = Parse.Object.extend("boards");
const query = new Parse.Query(Boards);


const request = axios.create({
  baseURL: removePathFromUrl(import.meta.env.VITE_BACKEND_URL),
});

export default {
  components: {
    Otp,
    OtpGroup,
    OtpGroupInput,
    Plus, Layout, MoreVertical, Eye, Trash2, Calendar, Users
  },
  data() {
    return {
      showLoading: false,
      code: null,
      email: null,
      showVerify: false,
      showMyBoards: false,
      showEmail: true,
      boards: [],
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    async realTimeMyBoards() {


    },
    logout() {
      this.$router.push(`/`)
    },
    verifyCode() {
      request.post('/check-otp', {email: this.email, code: this.code})
        .then((response) => {
          console.log(response);
          this.$swal.fire({
            icon: "success",
            title: "Autenticado com sucesso!",
            showConfirmButton: true,
          }).then(() => {
            this.showMyBoards = true
            this.showVerify = false
            this.showEmail = false
            this.getBoards()
          });

        })
        .catch((error) => {
          this.showVerify = true
          this.showEmail = false
          this.showMyBoards = false
          if (error.status === 403) {
            return this.$swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Código de autorização inválido. Tente novamente",
            })
          } else {
            return this.$swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Ocorreu um erro ao validar o codigo. Tente novamente",
            })
          }

        })

    },
    removeBoard(idBoard) {

      this.$swal.fire({
        title: "Tem certeza que deseja remover este board?",
        icon: "question",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Sim",
        denyButtonText: `Não`
      }).then((result) => {
        if (result.isConfirmed) {
          query.equalTo('objectId', idBoard)
          query.first().then((retorno) => {
            retorno.destroy()
            setTimeout(() => {
              this.getBoards()
            }, 3000)
          }).catch((error) => {
            console.error('Erro ao salvar documento: ' + error)
          })
        }
      });
    },
    async getBoards() {
      try {
        const Boards = Parse.Object.extend("boards");
        const query = new Parse.Query(Boards);
        query.equalTo({'owner_email': this.email})
        query.descending('_created_at')
        const boards = await query.find();
        console.log(boards, "BOARD");
        this.boards = boards.map((b) => ({'id': b.id, ...b.attributes}));
      } catch (error) {
        console.log('Failed to create new object, with error code: ' + error.message);
      }

    },
    changeEmail() {
      this.showEmail = true
      this.showVerify = false
    },
    sendCode() {
      if (!validateEmail(this.email)) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar um email válido!",
        });
      }

      this.showLoading = true

      request.post('/send-otp', {email: this.email})
        .then((response) => {
          console.log(response);
          this.showEmail = false
          this.showVerify = true
          this.showLoading = false
        })
        .catch((error) => {
          console.log(error)
          this.showVerify = false
          this.showEmail = true
          this.showMyBoards = false
          this.showLoading = false
          return this.$swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Ocorreu um erro ao enviar o código de autorização. Tente novamente.",
          })
        })
    }
  },
  async mounted() {
    await this.realTimeMyBoards()
  }
}
</script>
<style scoped>
.content {
  margin-top: 50px; /* espaço para o menu fixo */
  margin-bottom: 50px; /* espaço para o rodapé fixo */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 180px); /* calcula a altura restante entre o menu e o rodapé */
  text-align: center;
}


.otp-field {
  flex-direction: row;
  column-gap: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.otp-field input {
  height: 45px;
  width: 42px;
  border-radius: 6px;
  outline: none;
  font-size: 1.125rem;
  text-align: center;
  border: 1px solid #ddd;
}

.otp-field input:focus {
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

.otp-field input::-webkit-inner-spin-button,
.otp-field input::-webkit-outer-spin-button {
  display: none;
}

.resend {
  font-size: 12px;
}


.otp-input {
  width: 40px;
  height: 40px;
  padding: 5px;
  margin: 0 10px;
  font-size: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  text-align: center;
}

/* Background colour of an input field with value */
.otp-input.is-complete {
  background-color: #e4e4e4;
}

.otp-input::-webkit-inner-spin-button,
.otp-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input::placeholder {
  font-size: 15px;
  text-align: center;
  font-weight: 600;
}

</style>
