<template>
  <div class="min-vh-100 bg-light">
    <!-- Hero Section -->
    <section class="py-5 py-md-7">
      <div class="container">
        <div class="row justify-content-center text-center">
          <div class="col-lg-8">
            <h1 class="display-3 fw-bold mb-4">
              {{ $t('hero.title') }} <span class="text-primary">Open Sprint Retro</span>
            </h1>
            <p class="lead mb-5 text-muted">
              {{ $t('hero.subtitle') }}
            </p>
            <div class="d-flex justify-content-center gap-3">
              <button class="btn btn-primary btn-lg d-inline-flex align-items-center" @click="newBoard()">
                {{ $t('hero.getStarted') }}
                <ArrowRight class="ms-2" size="20"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-5 py-md-7 bg-white">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="display-5 fw-bold">{{ $t('features.title') }}</h2>
          <p class="lead text-muted">
            {{ $t('features.subtitle') }}
          </p>
        </div>

        <div class="row g-4">
          <div v-for="(feature, index) in features" :key="index" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm coming-soon-card">
              <div class="card-body p-4">
                <div class="coming-soon-badge" v-if="feature.is_coming">{{$t('features.coming')}}</div>
                <component :is="feature.icon" class="text-primary mb-3" size="40"/>
                <h3 class="h4 fw-bold">{{ $t(`features.${feature.title}.title`) }}</h3>
                <p class="text-muted">
                  {{ $t(`features.${feature.description}.description`) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-5 py-md-7 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="display-5 fw-bold">{{ $t('pricing.title') }}</h2>
          <p class="lead text-muted">
            {{ $t('pricing.subtitle') }}
          </p>
        </div>

        <div class="row g-4 justify-content-center">
          <div v-for="(plan, index) in plans" :key="index" class="col-md-6 col-lg-4">
            <div class="card h-100 border" :class="{ 'border-primary shadow': plan.popular }">
              <div v-if="plan.popular" class="card-header bg-primary text-white text-center py-2">
                Most Popular
              </div>
              <div class="card-body p-4">
                <h3 class="h4 fw-bold">{{ $t(`pricing.${plan.name}.name`) }}</h3>
                <p class="text-muted">{{ $t(`pricing.${plan.name}.description`) }}</p>
                <div class="my-4">
                  <span class="display-5 fw-bold">{{ $t(`pricing.${plan.name}.price`)}}</span>
                  <span class="text-muted">{{ $t(`pricing.${plan.name}.period`)}}</span>
                </div>
                <ul class="list-unstyled mb-4">
                  <li v-for="(feature, featureIndex) in plan.features" :key="featureIndex"
                      class="mb-2 d-flex align-items-center">
                    <component :is="plan.icon" class="text-success me-2" size="20"/>
                    <span>{{ $t(`pricing.features.${feature}`)}}</span>
                  </li>
                </ul>
                <a :href="plan.link"
                   class="btn w-100"
                   :class="plan.popular ? 'btn-primary' : 'btn-outline-primary'">
                  {{ $t(`pricing.${plan.name}.button`)}}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-5 py-md-7 bg-primary text-white">
      <div class="container text-center">
        <h2 class="display-5 fw-bold">{{ $t('cta.title') }}</h2>
        <p class="lead opacity-75 mb-5">
          {{ $t('cta.subtitle') }}
        </p>
        <button @click="newBoard()" class="btn btn-light btn-lg text-primary px-5">
          {{ $t('cta.button') }}
        </button>
      </div>
    </section>
  </div>



    <div class="modal fade" id="modalNewBoard" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Novo board</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label for="userName" class="form-label">Qual o seu nome?</label>
          <input type="text" v-model="user" class="form-control" id="columnName" aria-describedby="columnName">
          <br>
          <label for="userName" class="form-label">Qual o seu email?</label>
          <input type="email" v-model="email" class="form-control" id="columnEmail" aria-describedby="columnEmail"  @input="(val) => (email = email.toLowerCase())">
          <br>
          <label for="userName" class="form-label">Qual será o nome do board?</label>
          <input type="text" v-model="boardName" class="form-control" id="columnBoardName"
                 aria-describedby="columnBoardName">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="saveBoard()">Salvar</button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import {Modal} from 'bootstrap';
import Parse from 'parse/dist/parse.min.js';
import uniqueId from "@/utils/uuid.js";
import {validateEmail} from "@/utils/validate.js";
import {
  CheckSquare,
  Users,
  BarChart3,
  ThumbsUp,
  Shield,
  Trello,
  ArrowRight
} from 'lucide-vue-next';

Parse.initialize(import.meta.env.VITE_PARSE_APP_ID);
Parse.serverURL = import.meta.env.VITE_BACKEND_URL
const Boards = Parse.Object.extend("boards");
const board = new Boards();

const OTP = Parse.Object.extend("otp");
const otp = new OTP();
const otpQuery = new Parse.Query(OTP);

export default {
  components: {ArrowRight},
  data() {
    return {
      features: [
        {
          icon: CheckSquare,
          title: 'taskManagement',
          description: 'taskManagement'
        },
        {
          icon: Users,
          title: 'teamCollaboration',
          description: 'teamCollaboration'
        },
        {
          icon: Trello,
          title: 'customization',
          description: 'customization'
        },
        {
          icon: ThumbsUp,
          title: 'voting',
          description: 'voting'
        },
        {
          icon: Shield,
          title: 'anonymous',
          description: 'anonymous'
        },
        {
          icon: BarChart3,
          title: 'analytics',
          description: 'analytics',
          is_coming: true
        },

      ],
      plans: [
        {
          name: 'free',
          features: [
            'unlimited',
            'unlimitedMembers',
          ],
          icon: CheckSquare,
          link: '#',
          popular: false
        },
      ],
      modalNewBoard: null,
      user: null,
      owner_id: uniqueId(),
      email: null,
      boardName: null
    }
  },
  methods: {
    newBoard() {
      this.modalNewBoard.show()
    },
    async saveBoard() {
      if (!this.user) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar o seu nome!",
        });
      }

      if (!this.email) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar um email válido!",
        });
      }

      if (!validateEmail(this.email)) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar um email válido!",
        });
      }

      if (!this.boardName) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar o nome do board!",
        });
      }

      board.save({
        name: this.boardName,
        owner: this.user,
        visibility: true,
        owner_id: this.owner_id,
        owner_email: this.email,
        slug: this.boardName.replace(" ", "-").toLowerCase(),
        columns: []
      })
        .then(async (boardDatabase) => {
          otpQuery.equalTo("email", this.email);
          const otpResult = await otpQuery.first();
          console.log(otpResult);
          if (!otpResult) {
            otp.save({
              name: this.user,
              email: this.email,
              code: null
            })
          }
          localStorage.setItem("user", JSON.stringify({'name': this.user, 'id': this.owner_id, 'email': this.email}))
          this.modalNewBoard.hide()
          this.$swal.fire({
            icon: "success",
            title: "Board criado com sucesso!",
            showConfirmButton: true,
          }).then(() => {
            this.$router.push(`/board/${boardDatabase.id}`)
          });

        }, (error) => {
          console.log('Failed to create new object, with error code: ' + error.message)
          return this.$swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Ocorreu um erro ao criar o board!",
          })
        })
    }
  },
  mounted() {
    this.modalNewBoard = new Modal(document.getElementById('modalNewBoard'))
  }
}
</script>
<style scoped>
.coming-soon-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #e0e0e0 !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.coming-soon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.coming-soon-badge {
  position: absolute;
  top: 12px;
  right: -35px;
  background: linear-gradient(45deg, #2563eb, #3b82f6);
  color: white;
  padding: 6px 40px;
  font-size: 0.75rem;
  font-weight: 600;
  transform: rotate(45deg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

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

.icon-logo {
  font-size: 80px;
  color: #007bff; /* cor do ícone */
}

.btn-primary {
  background-color: #007bff; /* cor do botão */
  border-color: #007bff; /* borda do botão */
}

.btn-primary:hover {
  background-color: #0056b3; /* cor do botão ao passar o mouse */
  border-color: #004085; /* borda ao passar o mouse */
}

:deep(.dark-mode) {
  .coming-soon-card {
    border-color: #2d2d2d !important;
  }
}
</style>
