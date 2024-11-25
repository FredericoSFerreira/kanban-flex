<template>


  <!-- Conteúdo Principal -->
  <div class="content">
    <!-- Ícone acima do título -->
    <!--    <i class="bi bi-view-stacked icon-logo"></i>-->
    <!--    <i class="bi bi-layout-three-columns icon-logo"></i>-->
    <h1>Gerencie as retrospectivas de suas sprints</h1>
    <p class="mt-3 mb-4">Maximize o potencial da sua equipe com retrospectivas de sprints eficientes utilizando uma
      ferramenta simples e
      intuitiva.</p>
    <a href="#" class="btn btn-primary btn-lg" @click="newBoard()">Criar novo board</a>
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

Parse.initialize(import.meta.env.VITE_PARSE_APP_ID);
Parse.serverURL = import.meta.env.VITE_BACKEND_URL
const Boards = Parse.Object.extend("boards");
const board = new Boards();

const OTP = Parse.Object.extend("otp");
const otp = new OTP();
const otpQuery = new Parse.Query(OTP);

export default {
  data() {
    return {
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
</style>
