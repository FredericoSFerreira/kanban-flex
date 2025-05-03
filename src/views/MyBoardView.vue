<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h2 mb-0">{{ $t('myBoards.title') }}</h1>
      <router-link to="/board" class="btn btn-primary">
        <Plus size="18" class="me-2"/>
        {{ $t('myBoards.createBoard') }}
      </router-link>
    </div>

    <!-- Empty State -->
    <div v-if="boards.length === 0" class="text-center py-5 mb-5">
      <Layout size="48" class="text-primary mb-3"/>
      <h2 class="h4 mb-4">{{ $t('myBoards.emptyState.title') }}</h2>
      <p class="text-muted mb-5">{{ $t('myBoards.emptyState.description') }}</p>
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

</template>
<script>
import Parse from 'parse/dist/parse.min.js';
import {Otp, OtpGroup, OtpGroupInput} from "@/components/otp";
import {Plus, Layout, MoreVertical, Eye, Trash2, Calendar, Users} from 'lucide-vue-next';

Parse.initialize(import.meta.env.VITE_PARSE_APP_ID);
Parse.serverURL = import.meta.env.VITE_BACKEND_URL
const Boards = Parse.Object.extend("boards");
const query = new Parse.Query(Boards);

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
      boards: [],
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    async realTimeMyBoards() {},
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

      const sessionToken = Parse.User.current() ? Parse.User.current().getSessionToken() : null;
      const appId = import.meta.env.VITE_PARSE_APP_ID;
      const serverURL = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(`${serverURL}/classes/boards?where=${encodeURIComponent(JSON.stringify({"owner_email": this.email}))}&order=-createdAt`, {
        method: 'GET',
        headers: {
          'X-Parse-Application-Id': appId,
          'X-Parse-Session-Token': sessionToken,
          // Header personalizado de exemplo:
          'Meu-Cabecalho': 'valor-do-header'
        }
      });


        this.boards = boards.map((b) => ({'id': b.id, ...b.attributes}));
      } catch (error) {
        console.log('Failed to create new object, with error code: ' + error.message);
      }
    },
  },
  async mounted() {
    await this.getBoards()
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
