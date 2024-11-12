<template>
  <div class="container-fullscreen p-5">
    Criado por: {{ board.owner }}

    <div class="row">
      <div class="col-10 p-2">
        <h2>{{ board.name }}</h2>
      </div>
      <div class="col-2  text-right p-2">
        <button type="button" @click="newColumn()" class="btn btn-light" data-bs-toggle="modal"
                data-bs-target="#newColumn"><i
          class="bi bi-plus-lg"></i> Nova Coluna
        </button>
      </div>
    </div>
    <div class="row flex-nowrap overflow-auto">
      <div class="col-4 bg-light p-3" v-for="b in board.columns">
        <div class="row">
          <div class="col-10">
            <h4>{{ b.name }}</h4>
          </div>
          <div class="col-2">
            <button type="button" class="btn btn-light" @click="newCard(b.id)"><i
              class="bi bi-plus-lg"></i></button>
          </div>
        </div>
        <draggable
          class="list-group"
          :list="b.itens"
          group="people"
          @change="log"
          itemKey="name"
        >
          <template #item="{ element, index }">
            <div class="list-group-item list-group-item-action flex-column align-items-start">
              <p class="mb-1 text-gray-400"> {{ element.description }} - {{ element.id }}</p>
              <small>{{ element.name }}</small>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>


  <!-- Modal -->
  <div class="modal fade" id="modalCardName" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Novo Card</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label for="exampleInputEmail1" class="form-label">Descrição</label>
          <input type="text" v-model="cardName" class="form-control" id="exampleInputEmail1"
                 aria-describedby="emailHelp">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
          <button type="button" class="btn btn-primary" @click="saveCard()">Salvar</button>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="modalUserName" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Qual o seu nome?</h5>
        </div>
        <div class="modal-body">
          <label for="userName" class="form-label">Nome</label>
          <input type="text" v-model="userName" class="form-control" id="userName" aria-describedby="userName">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="saveUserName()">Salvar</button>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="modalColumnName" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Nova coluna</h5>
        </div>
        <div class="modal-body">
          <label for="userName" class="form-label">Nome da coluna</label>
          <input type="text" v-model="columnName" class="form-control" id="columnName" aria-describedby="columnName">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="saveColumn()">Salvar</button>
        </div>
      </div>
    </div>
  </div>

</template>
<script>
import draggable from "vuedraggable";
import {Modal} from 'bootstrap';
import Parse from 'parse/dist/parse.min.js';
import {useRoute} from 'vue-router'
import uniqueId from "@/utils/uuid.js";

Parse.initialize("myAppId");
Parse.serverURL = 'http://localhost:3000/parse'
const Boards = Parse.Object.extend("boards");
const board = new Boards();
const query = new Parse.Query(Boards);

export default {
  components: {
    draggable,
  },
  data() {
    return {
      columnName: "",
      cardName: "",
      columnSelectedId: "",
      board: {
        _id: "",
        name: null,
        owner: null,
        slug: "",
        columns: [],
        _created_at: null,
      },
      userName: null,
      modalUserName: null,
      modalColumnName: null,
      modalCardName: null,
      list1: [
        {
          name: "John",
          id: 1,
          description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy"
        },
      ]
    };
  },
  methods: {
    saveUserName() {
      if (!this.userName) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar o seu nome!",
        });
      }
      localStorage.setItem("user", JSON.stringify({'user': this.userName}))
      this.modalUserName.hide()

    },
    newCard(id) {
      this.columnSelectedId = id
      this.modalCardName.show()
    },
    newColumn() {
      this.modalColumnName.show()
    },
    saveColumn() {
      if (!this.columnName) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar o nome da coluna!",
        });
      }
      query.equalTo('objectId', this.$route.params.id)
      query.first().then((retorno) => {
        retorno.add("columns", {
          id: uniqueId(),
          name: this.columnName,
          itens: []
        });
        retorno.save()
        this.getBoard()
        this.columnName = ""
        this.modalColumnName.hide()
      }).catch((error) => {
        console.error('Erro ao salvar documento: ' + error)
      })
    },
    saveCard() {
      if (!this.cardName) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar a descrição do card!",
        });
      }

      query.equalTo('objectId', this.$route.params.id)
      query.first().then((retorno) => {
        console.log(retorno, "QQQQQQQ")
        const columns = retorno.attributes.columns
        for (const c in columns) {
          if (columns[c].id === this.columnSelectedId) {
            retorno.add(`columns.${c}.itens`, {
              id: uniqueId(),
              name: this.userName,
              description: this.cardName
            });
            retorno.save()
            this.columnSelectedId = ""
            break;
          }
        }
        this.getBoard()
        this.cardName = ""
        this.modalCardName.hide()
      }).catch((error) => {
        console.error('Erro ao salvar documento: ' + error)
      })


    },
    log(evt) {
      window.console.log(evt);
    },
    getBoard() {
      const route = useRoute()
      query.get(this.$route.params.id)
        .then((board) => {
          console.log(board.attributes, "BOARD");
          this.board = board.attributes
        }, (error) => {
          alert('Failed to create new object, with error code: ' + error.message);
        });
    },
    async realTimeBoard() {
      const queryBoard = new Parse.Query('boards');
      this.subscriptionBoard = await queryBoard.subscribe()

      this.subscriptionBoard.on('open', () => {
        console.log('board opened')
      })

      this.subscriptionBoard.on('update', (object) => {
        setTimeout(() => {
          this.getBoard()
        }, 3000)
      })

      this.subscriptionBoard.on('close', () => {
        console.log('board edit subscription closed');
      })
    },
  },
  mounted() {
    this.getBoard();
    this.realTimeBoard();
    this.modalUserName = new Modal(document.getElementById('modalUserName'), {backdrop: 'static', keyboard: false});
    const user = JSON.parse(localStorage.getItem("user"));
    this.userName = user ? user.user : null;
    if (!this.userName) {
      this.modalUserName.show()
    }
    this.modalColumnName = new Modal(document.getElementById('modalColumnName'), {backdrop: 'static', keyboard: false});
    this.modalCardName = new Modal(document.getElementById('modalCardName'));
  }
}
</script>
