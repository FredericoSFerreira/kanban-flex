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

    <section class="py-5 text-center container" v-if="board.columns.length === 0 && checkPermission()">
      <div class="empty-state text-center py-5">
        <div class="empty-state-content mx-auto">
          <div class="empty-state-icon mb-4">
            <Trello size="64" class="text-primary"/>
          </div>
          <h2 class="h3 mb-3">{{ $t('board.emptyState.title') }}</h2>
          <p class="text-muted mb-4">{{ $t('board.emptyState.description') }}</p>

          <button class="btn btn-primary btn-lg" @click="newColumn()">
            <Plus size="20" class="me-2"/>
            {{ $t('board.emptyState.cta') }}
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

              <button
                class="btn btn-sm btn-outline-primary"
                @click="editColumn(column.id, column.name)"
                :title="$t('board.editCard')"
              >
                <Edit2 size="16"/>
              </button>

              <button
                class="btn btn-sm btn-outline-danger"
                @click="removeColumn(column.id)"
                :title="$t('board.deleteColumn')"
              >
                <Trash2 size="16"/>
              </button>

            </div>
          </div>
        </div>
        <button class="btn btn-sm btn btn-light-new-card add-task mb-3 mx-2" @click="newCard(column.id)">
          <Plus size="16" class="me-1"/>
          {{ $t('board.addCard') }}
        </button>

        <div v-for="card in column.itens" :key="getCardId(card)">
          <div
            v-if="card !== null"
            class="kanban-card card p-2 mx-2"
            draggable="true"
            @dragstart="startDrag($event, card.id, column.id)"
          >
            <div class="d-flex justify-content-between align-items-center"
                 :class="{ 'blur-kanban-card': !checkPermission(card.user_id) && !board.visibility }">
              <strong>{{
                  !checkPermission(card.user_id) && !board.visibility ? cardHideText.repeat(1) :
                    card.description
                }}</strong>
              <div>
                <div class="d-flex gap-2" v-if="checkPermission(card.user_id)">
                  <button
                    class="btn btn-sm btn-outline-primary p-1"
                    @click="editCardDescription(column.id, card.id, card.description)"
                    :title="$t('board.editCard')"
                  >
                    <Edit2 size="14"/>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger p-1"
                    @click="removeCard(column.id, card.id)"
                    :title="$t('board.deleteCard')"
                  >
                    <Trash2 size="14"/>
                  </button>

                </div>
              </div>
            </div>
            <small :class="{ 'blur-kanban-card': !checkPermission(card.user_id) && !board.visibility }">{{
                card.name
              }}</small>
            <div class="text-end" :class="{ 'blur-kanban-card': !checkPermission(card.user_id) && !board.visibility }">
              <div class="d-flex align-items-center mt-3 pt-2 border-top">

                <button
                  class="btn btn-sm btn-outline-success me-2 d-flex align-items-center gap-1"
                  @click="saveCardVotes(column.id, card.id, true, false)"
                  :class="{ 'active': card.up_vote }"
                >
                  <ThumbsUp size="14"/>
                  <span>{{ card.up_vote || 0 }}</span>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                  @click="saveCardVotes(column.id, card.id, false, true)"
                  :class="{ 'active': card.down_vote }"
                >
                  <ThumbsDown size="14"/>
                  <span>{{ card.down_vote || 0 }}</span>
                </button>

              </div>
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
                       :display-recent="true"/>

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
import {Modal} from 'bootstrap';
import Parse from 'parse/dist/parse.min.js';
import {uniqueId} from "@/utils/uuid";
import {validateEmail} from "@/utils/validate.js";
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import {toast} from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import {
  Trello,
  ThumbsUp,
  ThumbsDown,
  Plus,
  MessageSquare,
  Trash2,
  Edit2
} from 'lucide-vue-next';

Parse.initialize(import.meta.env.VITE_PARSE_APP_ID);
Parse.serverURL = import.meta.env.VITE_BACKEND_URL
const Boards = Parse.Object.extend("boards");
const query = new Parse.Query(Boards);

export default {
  components: {EmojiPicker, Trello, Plus, ThumbsUp, ThumbsDown, MessageSquare, Trash2, Edit2},
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
    getCardId(card) {
      return card?.id ?? uniqueId()
    },
    getQueryBoard() {
      return new Parse.Query('boards');
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
    saveCardVotes(idColumn, idCard, upVote = false, downVote = false) {
      console.log("saving card vote to: ", idColumn, idCard)
      query.equalTo('objectId', this.$route.params.id)
      query.first().then((retorno) => {
        const columns = retorno.attributes.columns
        for (const c in columns) {
          if (columns[c].id === idColumn) {
            for (const i in columns[c].itens) {
              if (columns[c].itens[i]?.id === idCard) {

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
              if (columns[c].itens[i]?.id === this.cardSelectedId) {
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
                  if (columns[c].itens[i]?.id === cardId) {
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
      console.log(this.orderBy, this.board)
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
          this.setBoard(board)
        }, (error) => {
          console.log('Failed to create new object, with error code: ' + error.message);
          this.$router.push(`/404`)
        });
    },
    setBoard(boardAttr) {
      console.log("SET BOARD", boardAttr.attributes,);
      const visibility = boardAttr.attributes.visibility ?? true
      const columns = boardAttr.attributes.columns.map((column) => {
        return {
          ...column,
          itens: column.itens.filter((item) => item !== null)
        }
      })

      this.board = {
        ...boardAttr.attributes,
        columns,
        visibility: visibility
      }

      console.log("NOVO BOARD", this.board)

      if (this.orderBy !== 'default') {
        this.sortItemsByLike()
      }
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
        if (cardItem?.id === cardId) {
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

      this.subscriptionBoard.on('update', (board) => {
        console.log("update attr", board)
        setTimeout(() => {
          this.getBoard()
        }, 1)
      })

      this.subscriptionBoard.on('close', () => {
        console.log('board edit subscription closed');
      })
    },
    startDrag(evt, cardId, columnId) {
      evt.dataTransfer.dropEffect = 'move';
      evt.dataTransfer.effectAllowed = 'move';
      evt.dataTransfer.setData('cardDragId', cardId);
      evt.dataTransfer.setData('collumnDragId', columnId);
    },
    onDrop(evt, columnDropId) {
      const cardDragId = evt.dataTransfer.getData('cardDragId');
      const columnToRemoveId = evt.dataTransfer.getData('collumnDragId');
      evt.preventDefault();

      const queryBoard = this.getQueryBoard()
      queryBoard.equalTo('objectId', this.$route.params.id)

      queryBoard.first().then((boardDataCursor) => {
        const columns = boardDataCursor.attributes.columns;
        const [columnToRemove, columnToRemoveIndex] = this.findColumn(columns, columnToRemoveId)
        const [cardDrag, cardDragIndex] = this.findCard(columnToRemove, cardDragId)
        const [_collumnToAdd, collumnToAddIndex] = this.findColumn(columns, columnDropId)

        const addCollumnKey = `columns.${collumnToAddIndex}.itens`
        const removeCollumnKey = `columns.${columnToRemoveIndex}.itens`

        if (boardDataCursor.dirty(removeCollumnKey)) {
          return this.$swal.fire({
            icon: "warning",
            title: "Oops...",
            text: "Houve alterações no card ou na coluna destino!",
          });
        }

        boardDataCursor.addUnique(
          addCollumnKey,
          cardDrag
        );
        boardDataCursor.remove(
          removeCollumnKey,
          columns[columnToRemoveIndex].itens[cardDragIndex]
        );

        boardDataCursor.save().then((result) => {
          console.log("drag'n drop result ->", result);
        }).catch((error) => {
          console.error("Error in drag'n drop", error);
          boardDataCursor.revert();
        }).finally(() => {
          this.getBoard();
        })
      })
    },
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


.empty-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state-content {
  max-width: 600px;
}

.empty-state-icon {
  animation: float 3s ease-in-out infinite;
}

</style>
