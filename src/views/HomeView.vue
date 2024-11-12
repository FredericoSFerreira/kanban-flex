<template>
  <main>

    <section class="py-5 text-center container">
      <div class="row py-lg-5">
        <div class="col-lg-6 col-md-8 mx-auto">
          <h1 class="fw-light">Gerencie as retrospectivas de suas sprints</h1>
          <p class="lead text-muted">Colabore com sua equipe remota e melhore o que é feito utilizando uma ferramenta
            simples e intuitiva.</p>
          <p>
            <button type="button" class="btn btn-primary" @click="newBoard()">Criar novo Board</button>
          </p>
        </div>
      </div>
    </section>
  </main>


  <div class="modal fade" id="modalNewBoard" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Novo board</h5>
        </div>
        <div class="modal-body">
          <label for="userName" class="form-label">Qual o seu nome?</label>
          <input type="text" v-model="user" class="form-control" id="columnName" aria-describedby="columnName">
          <br>
          <label for="userName" class="form-label">Qual será o nome do board?</label>
          <input type="text" v-model="boardName" class="form-control" id="columnName" aria-describedby="columnName">

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

Parse.initialize("myAppId");
Parse.serverURL = 'http://localhost:3000/parse'
const Boards = Parse.Object.extend("boards");
const board = new Boards();
export default {
  data() {
    return {
      modalNewBoard: null,
      user: null,
      boardName: null
    }
  },
  methods: {
    newBoard() {
      this.modalNewBoard.show()
    },
    saveBoard() {
      if (!this.user) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar o seu nome!",
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
        slug: "",
        columns: []
      })
        .then((boardDatabase) => {
          this.modalNewBoard.hide()
          localStorage.setItem("user", JSON.stringify({'user': this.user}))
          this.$router.push(`/board/${boardDatabase.id}`)
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
