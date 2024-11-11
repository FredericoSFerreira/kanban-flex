<template>
  <div class="container p-3">
    <div class="row">
      <div class="col-10 p-2">
        <h2>{{ board.name }}</h2>
      </div>
      <div class="col-2 text-right">
        <button type="button" @click="newColumn()" class="btn btn-light" data-bs-toggle="modal"
                data-bs-target="#newColumn"><i
          class="bi bi-plus-lg"></i> Nova Coluna
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col-4 bg-light p-3" v-for="b in board.columns">
        <div class="row">
          <div class="col-10">
            <h4>{{ b.name }}</h4>
          </div>
          <div class="col-2 text-right">
                     <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#newCard"><i
              class="bi bi-plus-lg"></i></button>
            <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#newCard"><i
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
              <p class="mb-1 text-gray-300"> {{ element.description }} - {{ element.id }}</p>
              <small>{{ element.name }}</small>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>


  <!-- Modal -->
  <div class="modal fade" id="newCard" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Novo Card</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label for="exampleInputEmail1" class="form-label">Descrição</label>
          <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
          <button type="button" class="btn btn-primary">Salvar</button>
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


  <div class="modal fade" id="modalcolumnName" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
import { useRoute } from 'vue-router'

Parse.initialize("myAppId");
Parse.serverURL = 'http://localhost:3000/parse'
const Boards = Parse.Object.extend("boards");
const board = new Boards();

export default {
  components: {
    draggable,
  },
  data() {
    return {
      columnName: "",
      board: {
        _id: "",
        name: null,
        owner: null,
        slug: "",
        columns: [
        ]
      },
      userName: null,
      modalUserName: null,
      modalcolumnName: null,
      list1: [
        {
          name: "John",
          id: 1,
          description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy"
        },
        {
          name: "Joao",
          id: 2,
          description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy"
        },
        {
          name: "Jean",
          id: 3,
          description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy"
        },
        {
          name: "Gerard",
          id: 4,
          description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy"
        }
      ],
      list2: [
        {name: "Juan", id: 5},
        {name: "Edgard", id: 6},
        {name: "Johnson", id: 7}
      ]
    };

  }
  ,
  methods: {
    saveUserName() {
      if (!this.userName) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar o seu nome!",
        });
      }
      this.modalUserName.hide()

    },
    newColumn() {
      this.modalcolumnName.show()
    },
    saveColumn() {

      board.set("name", this.columnName);
      board.save()
        .then((gameScore) => {
          // Execute any logic that should take place after the object is saved.
          alert('New object created with objectId: ' + gameScore.id);
        }, (error) => {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
          alert('Failed to create new object, with error code: ' + error.message);
        });

      this.board.columns.push({id: 6546, name: this.columnName, itens: []});
      this.columnName = ""
      this.modalcolumnName.hide()
    },
    newCard() {
      this.list1.push({name: "Frederico Ferreira", id: 100});
    },
    log(evt) {
      window.console.log(evt);
    }
  }
  ,
  mounted() {
    const route = useRoute()
    const query = new Parse.Query(Boards);
    query.get(route.params.id)
      .then((board) => {
        console.log(board.attributes, "BOARD");
        this.board = board.attributes
      }, (error) => {
           alert('Failed to create new object, with error code: ' + error.message);
      });

    this.modalUserName = new Modal(document.getElementById('modalUserName'), {backdrop: 'static', keyboard: false});
    // this.modalUserName.show()
    this.modalcolumnName = new Modal(document.getElementById('modalcolumnName'), {backdrop: 'static', keyboard: false});
  }
}
</script>
