<template>

  <div class="container-fullscreen">

    <div class="kanban-header d-flex justify-content-between align-items-center">
      <div class="d-flex flex-row">
        <h2 class="mb-0">{{ board.name }}
          <button v-if="checkPermission()" class="btn btn-sm btn btn-light edit-column"
            @click="editBoardName(board.name)"><i class="bi bi-pencil-square"></i></button>
        </h2>
      </div>


      <div class="d-flex flex-row-reverse justify-content-end">

        <div class="p-1" v-if="board.columns.length > 0 && checkPermission()">
          <button type="button" @click="newColumn()" class="btn btn-light" data-bs-toggle="modal"
            data-bs-target="#newColumn"><i class="bi bi-plus-lg"></i> Nova Coluna
          </button>
        </div>

        <div class="p-1" v-if="checkPermission()" @click="setVisibility()">
          <button type="button" class="btn btn-light">
            <i class="bi bi-eye" v-if="board.visibility"></i>
            <i class="bi bi-eye-slash" v-if="!board.visibility"></i>
          </button>

        </div>

        <div class="p-1">

          <select class="form-select" aria-label="Ordenação" v-model="orderBy" @change="orderByOnChange($event)">
            <option value="default">Ordenação padrão</option>
            <option value="up_vote">Ordenação por likes</option>
            <option value="down_vote">Ordenação por dislikes</option>
          </select>
        </div>

      </div>
    </div>

    <section class="py-5 text-center container empty-state" v-if="board.columns.length === 0 && checkPermission()">
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
      <div
        class="kanban-column"
        v-for="column in board.columns"
        :key="column.id"
        @drop="onDrop($event, column.id)"
        @dragover.prevent
        @dragenter.prevent
      >
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
        <button class="btn btn-sm btn btn-light-new-card add-task mb-3 mx-2" @click="newCard(column.id)"><i
            class="bi bi-plus-circle-dotted"></i></button>


        <!--        <div style="filter: blur(3px)" class="kanban-card card p-2 mx-2" v-for="card in column.itens" v-if="!board.visibility">-->
        <!--          <div class="d-flex justify-content-between align-items-center">-->
        <!--            <strong>{{ cardHideText.repeat(Math.floor(Math.random() * 10)) }}</strong>-->
        <!--            <div>-->
        <!--              <div class="btn-group" role="group" aria-label="actions" v-if="checkPermission(card.user_id)">-->
        <!--                <button class="btn btn-sm btn btn-light edit-column"><i-->
        <!--                  class="bi bi-pencil-square"></i></button>-->
        <!--                <button class="btn btn-sm tn-sm btn btn-light remove-task"><i-->
        <!--                  class="bi bi-trash-fill"></i></button>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--          <small>Nome oculto</small>-->
        <!--          <div class="text-end">-->
        <!--            <div class="btn-group" role="group" aria-label="actions">-->
        <!--              <button class="btn btn-sm tn-sm btn btn-light"><i-->
        <!--                class="bi bi-hand-thumbs-down"></i> {{ card.down_vote || 0 }}-->
        <!--              </button>-->
        <!--              <button class="btn btn-sm tn-sm btn btn-light">-->
        <!--                <i class="bi bi-hand-thumbs-up"></i> {{ card.up_vote || 0 }}-->
        <!--              </button>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->
          <div
            class="kanban-card card p-2 mx-2"
            v-for="card in column.itens"
            :key="card.id"
            draggable="true"
            @dragstart="startDrag($event, card.id, column.id)"
          >
            <div class="d-flex justify-content-between align-items-center"
              :class="{ 'blur-kanban-card': !checkPermission(card.user_id) && !board.visibility }">
              <strong>{{ !checkPermission(card.user_id) && !board.visibility ? cardHideText.repeat(1) :
                card.description }}</strong>
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
            <small :class="{ 'blur-kanban-card': !checkPermission(card.user_id) && !board.visibility }">{{ card.name
              }}</small>
            <div class="text-end" :class="{ 'blur-kanban-card': !checkPermission(card.user_id) && !board.visibility }">
              <div class="btn-group" role="group" aria-label="actions">
                <button class="btn btn-sm tn-sm btn btn-light"
                  @click="saveCardVotes(column.id, card.id, false, true)"><i class="bi bi-hand-thumbs-down"></i> {{
                    card.down_vote || 0 }}
                </button>
                <button class="btn btn-sm tn-sm btn btn-light" @click="saveCardVotes(column.id, card.id, true, false)">
                  <i class="bi bi-hand-thumbs-up"></i> {{ card.up_vote || 0 }}
                </button>
              </div>
            </div>
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
          <div class="row">
            <div class="col-11">
              <label for="exampleInputEmail1" class="form-label">Descrição: </label>
            </div>
            <div class="col-1">
              <i class="bi bi-emoji-smile" @click="showEmoji = true"></i>
            </div>
          </div>
          <EmojiPicker v-if="showEmoji" offset="10000" :tdext="cardName" class="form-control" :native="false"
            @select="onSelectEmoji" pickerType="" :static-texts="{ placeholder: 'Pesquisar emoji...' }"
            :hide-group-names="true" :disable-sticky-group-names="true" :disable-skin-tones="true"
            :display-recent="true" />

          <textarea v-if="!showEmoji" rows="5" v-model="cardName" class="form-control" id="exampleInputEmail1"
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
          <input type="email" v-model="user.email" class="form-control" id="userName" aria-describedby="email"
            @input="(val) => (user.email = user.email.toLowerCase())">
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
import { Modal } from 'bootstrap';
import Parse from 'parse/dist/parse.min.js';
import uniqueId from "@/utils/uuid.js";
import { validateEmail } from "@/utils/validate.js";
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

Parse.initialize(import.meta.env.VITE_PARSE_APP_ID);
Parse.serverURL = import.meta.env.VITE_BACKEND_URL
const Boards = Parse.Object.extend("boards");
const query = new Parse.Query(Boards);

export default {
  components: { EmojiPicker },
  data() {
    return {
      orderBy: "default",
      cardHideText: "Calma ai curioso o conteúdo do card está oculto. E lembre-se de que a curiosidade matou o gato.",
      isVisible: true,
      showEmoji: false,
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
        visibility: true,
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
    orderByOnChange(event) {
      console.log(event.target.value)
      this.getBoard()
    },
    onSelectEmoji(emoji) {
      this.cardName += emoji.i
      this.showEmoji = false
    },
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
      localStorage.setItem("user", JSON.stringify({ 'name': this.user.name, 'id': id, 'email': this.user.email }))
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
    saveCardVotes(idColumn, idCard, upVote = false, downVote = false) {
      query.equalTo('objectId', this.$route.params.id)
      query.first().then((retorno) => {
        const columns = retorno.attributes.columns
        for (const c in columns) {
          if (columns[c].id === idColumn) {
            for (const i in columns[c].itens) {
              if (columns[c].itens[i].id === idCard) {

                retorno.addUnique(`columns.${c}.itens.${i}.up_vote_users`, this.user.id)
                if (upVote) {
                  if (columns[c].itens[i].up_vote_users?.includes(this.user.id)) {
                    toast.error("Você já deu like neste card !", {
                      position: toast.POSITION.TOP_CENTER,
                    });
                    break
                  }
                  retorno.addUnique(`columns.${c}.itens.${i}.up_vote_users`, this.user.id)
                  retorno.increment(`columns.${c}.itens.${i}.up_vote`)
                }
                if (downVote) {
                  if (columns[c].itens[i].down_vote_users?.includes(this.user.id)) {
                    toast.error("Você já deu dislike neste card !", {
                      position: toast.POSITION.TOP_CENTER,
                    });
                    break
                  }
                  retorno.addUnique(`columns.${c}.itens.${i}.down_vote_users`, this.user.id)
                  retorno.increment(`columns.${c}.itens.${i}.down_vote`)
                }
                retorno.save()
                this.getBoard()
                break;
              }
            }
          }
        }
      })
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
    setVisibility() {
      this.isVisible = !this.isVisible

      query.equalTo('objectId', this.$route.params.id)
      query.first().then((retorno) => {
        retorno.set('visibility', this.isVisible)
        retorno.save()
        this.getBoard()
        this.boardName = ""
        this.modalBoardName.hide()
      }).catch((error) => {
        console.error('Erro ao salvar documento: ' + error)
      })
    },
    checkPermission(idUser = null) {
      if (this.user.id === this.board.owner_id) {
        return true
      } else if (idUser && idUser === this.user.id) {
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
              description: this.cardName,
              up_vote: 0,
              down_vote: 0
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
    sortItemsByLike() {
      console.log(this.orderBy)
      this.board.columns.forEach(column => {
        if (this.orderBy === "up_vote") {
          column.itens.sort((a, b) => b.up_vote - a.up_vote);
        } else {
          column.itens.sort((a, b) => b.down_vote - a.down_vote);
        }
      });
    },
    getBoard() {
      query.get(this.$route.params.id)
        .then((board) => {
          console.log(board.attributes, "BOARD");
          const visibility = board.attributes.visibility ?? true
          this.board = { ...board.attributes, visibility: visibility }
          if (this.orderBy !== 'default') {
            this.sortItemsByLike()
          }
        }, (error) => {
          console.log('Failed to create new object, with error code: ' + error.message);
          this.$router.push(`/404`)
        });
    },
    findColumn(columns, collumnId) {
      for (const collumnIndex in columns) {
        if (columns[collumnIndex].id === collumnId) {
          return [columns[collumnIndex], collumnIndex]
        }
      }

      return [null, -1]
    }
    ,
    findCard(column, cardId) {
      for (const cardIndex in column.itens) {
        const cardItem = column.itens[cardIndex]
        if (cardItem.id === cardId) {
          return [cardItem, cardIndex]
        }
      }

      return [null, -1]
    },
    async realTimeBoard() {
      const queryBoard = new Parse.Query('boards');
      queryBoard.equalTo('objectId', this.$route.params.id)
      this.subscriptionBoard = await queryBoard.subscribe()

      this.subscriptionBoard.on('open', () => {
        console.log('board opened')
      })

      this.subscriptionBoard.on('update', (_object) => {
        setTimeout(() => {
          this.getBoard()
        }, 1)
      })

      this.subscriptionBoard.on('close', () => {
        console.log('board edit subscription closed');
      })
    },
    startDrag(evt, cardId, columnId) {
      evt.dataTransfer.dropEffect = 'move'
      evt.dataTransfer.effectAllowed = 'move'
      evt.dataTransfer.setData('cardDragId', cardId)
      evt.dataTransfer.setData('collumnDragId', columnId)
    },
    onDrop(evt, columnDropId) {
      const cardDragId = evt.dataTransfer.getData('cardDragId')
      const columnDragId = evt.dataTransfer.getData('collumnDragId')

      query.equalTo('objectId', this.$route.params.id)

      query.first().then((boardDataCursor) => {
        const columns = boardDataCursor.attributes.columns;
        const [columnDrag, columnDragIndex] = this.findColumn(columns, columnDragId)
        const [cardDrag, cardDragIndex] = this.findCard(columnDrag, cardDragId)
        const [_collumnDrop, collumnDropIndex] = this.findColumn(columns, columnDropId)

        if (!collumnDropIndex || !cardDragIndex) {
          return this.$swal.fire({
            icon: "warning",
            title: "Oops...",
            text: "Houve alterações no card ou na coluna destino!",
          });
        }

        boardDataCursor.add(
          `columns.${collumnDropIndex}.itens`,
          { ...cardDrag }
        )
        boardDataCursor.remove(
          `columns.${columnDragIndex}.itens`,
          columns[columnDragIndex].itens[cardDragIndex]
        )
        boardDataCursor.save()

        this.getBoard()
        evt.dataTransfer.clearData()
      })
    },
  },
  mounted() {
    this.getBoard();
    this.realTimeBoard();
    this.modalUserName = new Modal(document.getElementById('modalUserName'), { backdrop: 'static', keyboard: false });
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
body,
html {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}


.blur-kanban-card {
  filter: blur(3px);
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


.btn-light-new-card {
  background-color: #d3d4d5;
  /* cor do botão */
  border-color: #d3d4d5;
  /* borda do botão */
}

.btn-light-new-card:hover {
  background-color: #babbbc;
  /* cor do botão ao passar o mouse */
  border-color: #babbbc;
  /* borda ao passar o mouse */
}

</style>
