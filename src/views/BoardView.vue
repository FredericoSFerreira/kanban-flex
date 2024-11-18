<template>


  <div class="container-fullscreen">


    <div class="kanban-header d-flex justify-content-between align-items-center">
      <h2 class="mb-0">{{ board.name }}
        <button v-if="checkPermission()" class="btn btn-sm btn btn-light edit-column" @click="editBoardName(board.name)"><i
          class="bi bi-pencil-square"></i></button>
      </h2>
      <button v-if="board.columns.length > 0" type="button" @click="newColumn()" class="btn btn-light"
              data-bs-toggle="modal"
              data-bs-target="#newColumn"><i
        class="bi bi-plus-lg"></i> Nova Coluna
      </button>
    </div>


    <section class="py-5 text-center container empty-state" v-if="board.columns.length === 0">
      <div class="row py-lg-5">
        <div class="col-lg-6 col-md-8 mx-auto">
          <h2 class="fw-light">Começe criando as colunas do seu board</h2>
          <i class="bi bi-layout-three-columns icon-big"></i>
          <br>
          <i class="bi bi-arrow-down" style="font-size: 50px"></i>
          <br>
          <br>
          <button type="button" @click="newColumn()" class="btn btn-light btn-lg"><i class="bi bi-plus-lg"></i> Nova
            Coluna
          </button>
        </div>
      </div>
    </section>

    <div class="kanban-board" id="kanban-board">
      <!-- Coluna de exemplo -->
      <div class="kanban-column" v-for="column in board.columns">
        <div class="d-flex justify-content-between align-items-center mb-2 p-2">
          <h4 class="column-title">{{ column.name }}</h4>
          <div>
            <div class="btn-group" role="group" aria-label="actionsCollun" v-if="checkPermission()">
              <button class="btn btn-sm btn btn-light edit-column" @click="editColumn(column.id, column.name)"><i
                class="bi bi-pencil-square"></i></button>
              <button class="btn btn-sm btn btn-light remove-column" @click="removeColumn(column.id)"><i
                class="bi bi-trash-fill"></i></button>
            </div>
          </div>
        </div>
        <button class="btn btn-sm btn btn-light add-task mb-3 mx-2" @click="newCard(column.id)"><i
          class="bi bi-plus-lg"></i></button>
        <div class="kanban-card card p-2 mx-2" v-for="card in column.itens">
          <div class="d-flex justify-content-between align-items-center">
            <strong>{{ card.description }}</strong>
            <div>
              <div class="btn-group" role="group" aria-label="actions" v-if="checkPermission(card.user_id)">
                <button class="btn btn-sm btn btn-light edit-column"
                        @click="editCardDescription(column.id, card.id, card.description)"><i
                  class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm tn-sm btn btn-light remove-task" @click="removeCard(column.id, card.id)"><i
                  class="bi bi-trash-fill"></i></button>
              </div>
            </div>
          </div>
          <small>{{ card.name }}</small>
        </div>
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
          <textarea rows="5" v-model="cardName" class="form-control" id="exampleInputEmail1"
                    aria-describedby="emailHelp"></textarea>
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
          <h5 class="modal-title" id="exampleModalLabel">Identifique-se</h5>
        </div>
        <div class="modal-body">
          <label for="userName" class="form-label">Nome</label>
          <input type="text" v-model="user.name" class="form-control" id="userName" aria-describedby="userName">

          <br>

          <label for="email" class="form-label">Email</label>
          <input type="email" v-model="user.email" class="form-control" id="userName" aria-describedby="email">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" @click="saveUserName(true)">Entrar como Anônimo</button>
          <button type="button" class="btn btn-primary" @click="saveUserName(false)">Salvar</button>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="modalBoardName" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Editar nome do board</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label for="userName" class="form-label">Nome do board</label>
          <input type="text" v-model="boardName" class="form-control" id="columnName" aria-describedby="columnName">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="saveBoardName()">Salvar</button>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="modalColumnName" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalColumnNameLabel">Nova coluna</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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

  <div class="modal fade" id="modalEditColumnName" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Editar coluna</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label for="userName" class="form-label">Nome da coluna</label>
          <input type="text" v-model="columnEditName" class="form-control" id="editColumnName"
                 aria-describedby="editColumnName">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="saveEditColumn()">Salvar</button>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="modalCardDescription" tabindex="-1" aria-labelledby="exampleModalLabel"
       aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Editar card</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label for="exampleInputEmail1" class="form-label">Descrição</label>
          <textarea rows="5" v-model="cardEditDescription" class="form-control" id="exampleInputEmail1"
                    aria-describedby="emailHelp"></textarea>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="saveEditCard()">Salvar</button>
        </div>
      </div>
    </div>
  </div>

</template>
<script>
import {Modal} from 'bootstrap';
import Parse from 'parse/dist/parse.min.js';
import {useRoute} from 'vue-router'
import uniqueId from "@/utils/uuid.js";
import {validateEmail} from "@/utils/validate.js";

Parse.initialize(import.meta.env.VITE_PARSE_APP_ID);
Parse.serverURL = import.meta.env.VITE_BACKEND_URL
const Boards = Parse.Object.extend("boards");
const board = new Boards();
const query = new Parse.Query(Boards);

export default {
  components: {},
  data() {
    return {
      boardName: "",
      columnName: "",
      columnEditName: "",
      cardEditDescription: "",
      cardName: "",
      columnSelectedId: "",
      cardSelectedId: "",
      board: {
        _id: "",
        name: null,
        owner: null,
        slug: "",
        columns: [],
        _created_at: null,
      },
      user: {
        name: null,
        id: null,
        email: null
      },
      modalUserName: null,
      modalColumnName: null,
      modalCardName: null,
      modalEditColumnName: null,
      modalBoardName: null,
      modalCardDescription: null,
    };
  },
  methods: {
    editBoardName() {
      this.boardName = this.board.name
      this.modalBoardName.show()
    },
    editCardDescription(columnId, cardId, description) {
      this.columnSelectedId = columnId
      this.cardEditDescription = description
      this.cardSelectedId = cardId
      this.modalCardDescription.show()
    },
    saveBoardName() {
      if (!this.boardName) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar o seu nome!",
        });
      }

      query.equalTo('objectId', this.$route.params.id)
      query.first().then((retorno) => {
        retorno.set('name', this.boardName)
        retorno.save()
        this.getBoard()
        this.boardName = ""
        this.modalBoardName.hide()
      }).catch((error) => {
        console.error('Erro ao salvar documento: ' + error)
      })

    },
    saveUserName(anonymous = false) {

      if (anonymous) {
        this.user.name = 'Anônimo'
        this.user.email = 'anonymous@anonymous.com'
      }

      if (!this.user.name) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar o seu nome!",
        });
      }


      if (!this.user.email) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar um email válido!",
        });
      }


      if (!validateEmail(this.user.email)) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar um email válido!",
        });
      }

      const id = uniqueId()
      this.user.id = id
      localStorage.setItem("user", JSON.stringify({'name': this.user.name, 'id': id, 'email': this.user.email}))
      this.modalUserName.hide()
    },
    newCard(id) {
      this.columnSelectedId = id
      this.modalCardName.show()
    },
    newColumn() {
      this.modalColumnName.show()
    },
    editColumn(id, name) {
      this.columnEditName = name
      this.columnSelectedId = id
      this.modalEditColumnName.show()
    },
    saveEditCard() {
      if (!this.cardEditDescription) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar a descrição do card!",
        });
      }

      query.equalTo('objectId', this.$route.params.id)
      query.first().then((retorno) => {
        const columns = retorno.attributes.columns
        for (const c in columns) {
          if (columns[c].id === this.columnSelectedId) {
            for (const i in columns[c].itens) {
              if (columns[c].itens[i].id === this.cardSelectedId) {
                retorno.set(`columns.${c}.itens.${i}.description`, this.cardEditDescription);
                retorno.save()
                this.columnSelectedId = null
                this.cardSelectedId = null
                this.cardEditDescription = null
                this.modalCardDescription.hide()
                this.getBoard()
                break;
              }
            }
          }
        }
      })
    },
    checkPermission(idUser = null) {
      if (this.user.id === this.board.owner_id) {
        console.log('AQUI')
        return true
      } else if (idUser && idUser === this.user.id) {
        console.log('AQUI 22')
        return true
      }
      return false
    },
    removeCard(columnId, cardId) {
      this.$swal.fire({
        title: "Tem certeza que deseja remover este card?",
        icon: "question",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Sim",
        denyButtonText: `Não`
      }).then((result) => {
        if (result.isConfirmed) {
          query.equalTo('objectId', this.$route.params.id)
          query.first().then((retorno) => {
            const columns = retorno.attributes.columns
            for (const c in columns) {
              if (columns[c].id === columnId) {
                for (const i in columns[c].itens) {
                  if (columns[c].itens[i].id === cardId) {
                    retorno.remove(`columns.${c}.itens`, columns[c].itens[i]);
                    retorno.save()
                    this.getBoard()
                    break;
                  }
                }
              }
            }
          }).catch((error) => {
            console.error('Erro ao salvar documento: ' + error)
          })
        }
      });

    }
    ,
    removeColumn(id) {
      this.$swal.fire({
        title: "Tem certeza que deseja remover esta coluna?",
        icon: "question",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Sim",
        denyButtonText: `Não`
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          query.equalTo('objectId', this.$route.params.id)
          query.first().then((retorno) => {
            const columns = retorno.attributes.columns
            for (const c in columns) {
              if (columns[c].id === id) {
                retorno.remove('columns', columns[c]);
                retorno.save()
                this.getBoard()
                break;
              }
            }
            this.columnEditName = ""
            this.modalEditColumnName.hide()
          }).catch((error) => {
            console.error('Erro ao salvar documento: ' + error)
          })
        }
      });

    }
    ,
    saveEditColumn() {
      if (!this.columnEditName) {
        return this.$swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Você precisa informar o nome da coluna!",
        });
      }

      query.equalTo('objectId', this.$route.params.id)
      query.first().then((retorno) => {
        const columns = retorno.attributes.columns
        for (const c in columns) {
          if (columns[c].id === this.columnSelectedId) {
            retorno.set(`columns.${c}.name`, this.columnEditName);
            retorno.save()
            this.columnSelectedId = ""
            break;
          }
        }
        this.getBoard()
        this.columnEditName = ""
        this.modalEditColumnName.hide()
      }).catch((error) => {
        console.error('Erro ao salvar documento: ' + error)
      })
    }
    ,
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
    }
    ,
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
        const columns = retorno.attributes.columns
        for (const c in columns) {
          if (columns[c].id === this.columnSelectedId) {
            retorno.add(`columns.${c}.itens`, {
              id: uniqueId(),
              name: this.user.name,
              user_id: this.user.id,
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


    }
    ,
    log(evt) {
      window.console.log(evt);
    }
    ,
    getBoard() {
      const route = useRoute()
      query.get(this.$route.params.id)
        .then((board) => {
          console.log(board.attributes, "BOARD");
          this.board = board.attributes
        }, (error) => {
          console.log('Failed to create new object, with error code: ' + error.message);
          this.$router.push(`/404`)
        });
    }
    ,
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
    }
    ,
  },
  mounted() {
    this.getBoard();
    this.realTimeBoard();
    this.modalUserName = new Modal(document.getElementById('modalUserName'), {backdrop: 'static', keyboard: false});
    const user = JSON.parse(localStorage.getItem("user"));
    const userLocal = user ? user : null;
    if (!userLocal) {
      this.modalUserName.show()
    } else {
      this.user = userLocal
    }
    this.modalColumnName = new Modal(document.getElementById('modalColumnName'));
    this.modalCardName = new Modal(document.getElementById('modalCardName'));
    this.modalEditColumnName = new Modal(document.getElementById('modalEditColumnName'));
    this.modalBoardName = new Modal(document.getElementById('modalBoardName'));
    this.modalCardDescription = new Modal(document.getElementById('modalCardDescription'));
  }
}
</script>
<style scoped>
/* Ocupação total da tela */
body, html {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.icon-big {
  font-size: 180px;
}

.container-fullscreen {
  display: flex;
  flex-direction: column;
  height: 88vh;
}

.kanban-header {
  padding: 1rem;
  background-color: #f8f9fa;
}

/* Kanban board com rolagem horizontal */
.kanban-board {
  display: flex;
  overflow-x: auto;
  padding: 1rem;
  flex-grow: 1;
  background-color: #e9ecef;
}

/* Configura colunas para preencher a tela em altura e ter rolagem interna */
.kanban-column {
  min-width: 32.4%;
  max-height: 100%;
  margin-right: 1rem;
  position: relative;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.kanban-card {
  margin-bottom: 1rem;
  overflow-wrap: break-word;
  max-width: 95%;
}

/* Quebra de linha para o nome do usuário e o título da tarefa */
.kanban-card small,
.kanban-card strong {
  display: block;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
}
</style>
