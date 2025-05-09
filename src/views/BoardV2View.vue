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

        <div class="btn-group" v-if="board.columns.length > 0 && checkPermission()">
          <button class="btn btn-primary" @click="newColumn()" data-bs-toggle="modal"
                  data-bs-target="#newColumn">
            <Plus size="18" class="me-1"/>
            {{ t('board.addColumn') }}
          </button>
          <button class="btn btn-primary" @click="showBoardSettings">
            <Settings size="18"/>
          </button>
          <!--          <button class="btn btn-primary" @click="showingStats = !showingStats">-->
          <!--            <BarChart2 size="18"/>-->
          <!--          </button>-->
        </div>

        <div class="p-1" v-if="checkPermission() && boardConfig.showVisibility" @click="setVisibility()">
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
      <!-- Colunas com vuedraggable -->
      <draggable
        v-model="board.columns"
        group="columns"
        item-key="id"
        class="kanban-board-draggable"
        handle=".column-drag-handle"
        @end="onColumnMoved"
      >
        <template #item="{element: column}">
          <div
            class="kanban-column"
            :key="column.id"
            @drop="onDrop($event, column.id)"
            @dragover.prevent
            @dragenter.prevent
          >
            <div class="d-flex p-2 column-drag-handle">
              <GripVertical size="18" class="me-1 text-muted"/>
              <h6 class="column-title me-auto">{{ column.name }}</h6>
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
            <div class="p-2 border-bottom">
              <button class="btn btn-sm btn btn-light-new-card add-task w-100" @click="newCard(column.id)">
                <Plus size="16" class="me-1"/>
                {{ $t('board.addCard') }}
              </button>
            </div>

            <div class="p-2 flex-grow-1 kanban-cards-container">
              <draggable
                v-model="column.itens"
                group="cards"
                item-key="id"
                class="card-list"
                handle=".card-drag-handle"
                @end="onCardMoved($event, column.id)"
              >
                <template #item="{element: card}">
                  <div v-if="card !== null" class="card-drag-handle">
                    <div
                      class="kanban-card card p-2 mx-2"
                      draggable="true"
                      @dragstart="startDrag($event, card.id, column.id)"
                    >
                      <div class="d-flex justify-content-between align-items-center"
                           :class="{ 'blur-kanban-card': !checkPermission(card.user_id) && !board.visibility }">
                        <div>
                          <h6 class="card-title mb-2" v-if="boardConfig.showTitle">{{
                              !checkPermission(card.user_id) && !board.visibility ? cardHideText.repeat(1) : card.title
                            }}</h6>
                          <div class="card-text small text-muted mb-2" v-if="boardConfig.showDescription">{{
                              !checkPermission(card.user_id) && !board.visibility ? cardHideText.repeat(1) :
                                card.description
                            }}
                          </div>
                        </div>
                        <div>
                          <div class="d-flex gap-2 " v-if="checkPermission(card.user_id)">
                            <button
                              class="btn btn-sm btn-outline-primary p-1"
                              @click="editCardDescription(column.id, card.id, card.description, card.title, card.labels)"
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

                      <small :class="{ 'blur-kanban-card': !checkPermission(card.user_id) && !board.visibility}" v-if="boardConfig.showAuthorCard">
                        <User size="14" class="text-muted me-2"/>
                        {{
                          card.name
                        }}</small>

                      <div v-if="card.labels && card.labels.length && boardConfig.showTags" class="d-flex flex-wrap gap-1 mt-2"
                           :class="{ 'blur-kanban-card': !checkPermission(card.user_id) && !board.visibility }">
                      <span
                        v-for="label in card.labels"
                        :key="label"
                        class="badge"
                        :class="getLabelClass(label)"
                      >
                        {{ label }}
                      </span>
                      </div>

                      <div class="text-end"
                           :class="{ 'blur-kanban-card': !checkPermission(card.user_id) && !board.visibility }">
                        <div class="d-flex align-items-center mt-3 pt-2 border-top">

                          <button
                            v-if="boardConfig.showLike"
                            class="btn btn-sm btn-outline-success me-2 d-flex align-items-center gap-1"
                            @click="saveCardVotes(column.id, card.id, true, false)"
                            :class="{ 'active': card.up_vote }"
                          >
                            <ThumbsUp size="14"/>
                            <span>{{ card.up_vote || 0 }}</span>
                          </button>
                          <button
                            v-if="boardConfig.showLike"
                            class="btn btn-sm btn-outline-danger me-2 d-flex align-items-center gap-1"
                            @click="saveCardVotes(column.id, card.id, false, true)"
                            :class="{ 'active': card.down_vote }"
                          >
                            <ThumbsDown size="14"/>
                            <span>{{ card.down_vote || 0 }}</span>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                            @click="showComments(column.id, card.id)"
                          >
                            <MessageSquare size="14"/>
                            <span>{{ card.comments?.length || 0 }}</span>
                          </button>

                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>


  <!-- Modal -->
  <div class="modal fade" id="modalCardName" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ $t('boardV2.newCard') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3" v-if="boardConfig.showTitle">
            <label for="cardTitle" class="form-label">{{ $t('boardV2.title') }}</label>
            <input type="text" class="form-control" id="cardTitle" v-model="cardTitle">
          </div>

          <div class="mb-3" v-if="boardConfig.showDescription">
            <div class="row">
              <div class="col-11">
                <label for="exampleInputEmail1" class="form-label">{{ $t('boardV2.description') }}</label>
              </div>
              <div class="col-1">
                <i class="bi bi-emoji-smile" @click="showEmoji = !showEmoji"></i>
              </div>
            </div>
            <EmojiPicker v-if="showEmoji" offset="10000" :tdext="cardName" class="form-control" :native="false"
                         @select="onSelectEmoji" pickerType="" :static-texts="{ placeholder: 'Pesquisar emoji...' }"
                         :hide-group-names="true" :disable-sticky-group-names="true" :disable-skin-tones="true"
                         :display-recent="true"/>

            <textarea v-if="!showEmoji" rows="5" v-model="cardName" class="form-control" id="cardName"
                      aria-describedby="emailHelp"></textarea>
          </div>

          <div class="mb-3" v-if="boardConfig.showTags">
            <label for="cardLabels" class="form-label">{{ $t('boardV2.labels') }}</label>
            <input type="text" class="form-control" id="cardLabels" v-model="cardLabels"
                   :placeholder="$t('boardV2.labelsPlaceholder')">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('boardV2.close') }}</button>
          <button type="button" class="btn btn-primary" @click="saveCard()">{{ $t('boardV2.save') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modalBoardName" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ $t('boardV2.editBoardName') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label for="userName" class="form-label">{{ $t('boardV2.boardName') }}</label>
          <input type="text" v-model="boardName" class="form-control" id="columnName" aria-describedby="columnName">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="saveBoardName()">{{ $t('boardV2.save') }}</button>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="modalColumnName" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalColumnNameLabel">{{ $t('boardV2.newColumn') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label for="userName" class="form-label">{{ $t('boardV2.columnName') }}</label>
          <input type="text" v-model="columnName" class="form-control" id="columnName" aria-describedby="columnName">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="saveColumn()">{{ $t('boardV2.save') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modalEditColumnName" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ $t('boardV2.editColumn') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label for="userName" class="form-label">{{ $t('boardV2.columnName') }}</label>
          <input type="text" v-model="columnEditName" class="form-control" id="editColumnName"
                 aria-describedby="editColumnName">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="saveEditColumn()">{{ $t('boardV2.save') }}</button>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="modalCardDescription" tabindex="-1" aria-labelledby="exampleModalLabel"
       aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ $t('boardV2.editCard') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3" v-if="boardConfig.showTitle">
            <label for="cardEditTitle" class="form-label">{{ $t('boardV2.title') }}</label>
            <input type="text" class="form-control" id="cardEditTitle" v-model="cardEditTitle">
          </div>

          <div class="mb-3" v-if="boardConfig.showDescription">

            <div class="row">
              <div class="col-11">
                <label for="cardEditDescription" class="form-label">{{ $t('boardV2.description') }}</label>
              </div>
              <div class="col-1">
                <i class="bi bi-emoji-smile" @click="showEmoji = !showEmoji"></i>
              </div>
            </div>

            <EmojiPicker v-if="showEmoji" offset="10000" :tdext="cardEditDescription" class="form-control"
                         :native="false"
                         @select="onSelectEmojiEdit" pickerType="" :static-texts="{ placeholder: 'Pesquisar emoji...' }"
                         :hide-group-names="true" :disable-sticky-group-names="true" :disable-skin-tones="true"
                         :display-recent="true"/>

            <textarea v-if="!showEmoji" rows="5" v-model="cardEditDescription" class="form-control"
                      id="cardEditDescription"
                      aria-describedby="emailHelp"></textarea>

          </div>
          <div class="mb-3" v-if="boardConfig.showTags">
            <label for="cardEditLabels" class="form-label">{{ $t('boardV2.labels') }}</label>
            <input type="text" class="form-control" id="cardEditLabels" v-model="cardEditLabels"
                   :placeholder="$t('boardV2.labelsPlaceholder')">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="saveEditCard()">{{ $t('boardV2.save') }}</button>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="settingsModal" tabindex="-1" aria-hidden="true" ref="settingsModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ t('board.settings') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body mb-1">
          <div class="form-check mb-md-1">
            <input type="checkbox" class="form-check-input" id="showLike" v-model="boardConfig.showLike">
            <label class="form-check-label" for="showLike">
              {{ t('board.settingsShowLike') }}
            </label>
          </div>
          <div class="form-check mb-md-1">
            <input type="checkbox" class="form-check-input" id="showVisibility" v-model="boardConfig.showVisibility">
            <label class="form-check-label" for="showVisibility">
              {{ t('board.settingsShowVisibility') }}
            </label>
          </div>
          <div class="form-check mb-md-1">
            <input type="checkbox" class="form-check-input" id="showAuthorCard" v-model="boardConfig.showAuthorCard">
            <label class="form-check-label" for="showAuthorCard">
              {{ t('board.settingsShowAuthorCard') }}
            </label>
          </div>
          <div class="form-check mb-md-1">
            <input type="checkbox" class="form-check-input" id="showTitle" v-model="boardConfig.showTitle">
            <label class="form-check-label" for="showTitle">
              {{ t('board.settingsShowTitle') }}
            </label>
          </div>
          <div class="form-check mb-md-1">
            <input type="checkbox" class="form-check-input" id="showDescription" v-model="boardConfig.showDescription">
            <label class="form-check-label" for="showDescription">
              {{ t('board.settingsShowDescription') }}
            </label>
          </div>
          <div class="form-check mb-md-1">
            <input type="checkbox" class="form-check-input" id="showTags" v-model="boardConfig.showTags">
            <label class="form-check-label" for="showTags">
              {{ t('board.settingsShowTags') }}
            </label>
          </div>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            {{ t('board.cancel') }}
          </button>
          <button type="button" class="btn btn-primary" @click="saveSettings">
            {{ t('board.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Comments Modal -->
  <div class="modal fade" id="modalComments" tabindex="-1" aria-labelledby="commentsModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="commentsModalLabel">{{ $t('boardV2.comments') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="comments-list mb-4">
            <div v-if="!selectedCard?.comments || selectedCard.comments.length === 0"
                 class="text-center text-muted py-4">
              {{ $t('boardV2.noComments') }}
            </div>
            <div v-else v-for="comment in selectedCard.comments" :key="comment.id" class="comment mb-3">
              <div class="d-flex gap-3">
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start">
                    <h6 class="mb-1">{{ comment.userName }}</h6>
                    <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
                  </div>
                  <p class="mb-1">{{ comment.text }}</p>
                  <div class="d-flex gap-2">
                    <button
                      v-if="comment.userId === user.id"
                      class="btn btn-sm btn-link p-0 text-danger text-decoration-none"
                      @click="deleteComment(comment.id)"
                    >
                      {{ $t('boardV2.delete') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="add-comment">
            <div class="d-flex gap-3">
              <div class="flex-grow-1">
                <textarea
                  class="form-control mb-2"
                  v-model="newComment"
                  :placeholder="$t('boardV2.writeComment')"
                  rows="2"
                ></textarea>
                <button
                  class="btn btn-primary"
                  @click="addComment()"
                  :disabled="!newComment.trim()"
                >
                  {{ $t('boardV2.addComment') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup>
import {ref, reactive, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {Modal} from 'bootstrap';
import Parse from 'parse/dist/parse.min.js';
import {uniqueId} from "@/utils/uuid";
import {configDefault} from "@/utils/templates"

import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';
import {toast} from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import {useI18n} from 'vue-i18n';
import {
  Trello,
  ThumbsUp,
  ThumbsDown,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  GripVertical, BarChart2, Settings, User
} from 'lucide-vue-next';
import {useSwal} from '@/utils/swal';
import draggable from 'vuedraggable';
import {useAuthStore} from "@/stores/auth";
// Initialize Parse
Parse.initialize(import.meta.env.VITE_PARSE_APP_ID);
Parse.serverURL = import.meta.env.VITE_BACKEND_URL;
const Boards = Parse.Object.extend("boards");
const query = new Parse.Query(Boards);

// Router
const route = useRoute();
const router = useRouter();
const $swal = useSwal();
const {t} = useI18n();
const showingStats = ref(false);

// Reactive state
const orderBy = ref("default");
const cardHideText = t('boardV2.cardHideText');
const isVisible = ref(true);
const showEmoji = ref(false);
const boardName = ref("");
const columnName = ref("");
const columnEditName = ref("");
const cardEditDescription = ref("");
const cardEditTitle = ref("");
const cardEditLabels = ref("");
const cardName = ref("");
const cardTitle = ref("");
const cardLabels = ref("");
const columnSelectedId = ref("");
const cardSelectedId = ref("");
const board = reactive({
  _id: "",
  name: null,
  owner: null,
  visibility: true,
  slug: "",
  columns: [],
  _created_at: null,
});
const auth = useAuthStore();

const boardConfig = reactive(Object.assign({}, configDefault))

const user = reactive(auth.user);

// Comments state
const selectedCard = ref(null);
const selectedColumnId = ref(null);
const newComment = ref("");
const settingsModal = ref(null);

// Modal references
let modalColumnName = null;
let modalCardName = null;
let modalEditColumnName = null;
let modalBoardName = null;
let modalCardDescription = null;
let modalComments = null;
let subscriptionBoard = null;
let settingsModalInstance = null;

// Methods
const orderByOnChange = (event) => {
  console.log(event.target.value);
  getBoard();
};

const onSelectEmoji = (emoji) => {
  cardName.value += emoji.i;
  showEmoji.value = false;
};

const onSelectEmojiEdit = (emoji) => {
  cardEditDescription.value += emoji.i;
  showEmoji.value = false;
};

const editBoardName = () => {
  boardName.value = board.name;
  modalBoardName.show();
};

const editCardDescription = (columnId, cardId, description, title = '', labels = []) => {
  columnSelectedId.value = columnId;
  cardEditDescription.value = description;
  cardSelectedId.value = cardId;
  cardEditTitle.value = title || '';
  cardEditLabels.value = Array.isArray(labels) ? labels.join(', ') : '';
  modalCardDescription.show();
};

const saveBoardName = () => {
  if (!boardName.value) {
    return $swal.fire({
      icon: "error",
      title: t('boardV2.errors.oops'),
      text: t('boardV2.errors.nameRequired'),
    });
  }

  query.equalTo('objectId', route.params.id);
  query.first().then((retorno) => {
    retorno.set('name', boardName.value);
    retorno.save();
    getBoard();
    boardName.value = "";
    modalBoardName.hide();
  }).catch((error) => {
    console.error('Erro ao salvar documento: ' + error);
  });
};

const newCard = (id) => {
  columnSelectedId.value = id;
  cardName.value = "";
  cardTitle.value = "";
  cardLabels.value = "";
  modalCardName.show();
};

const newColumn = () => {
  modalColumnName.show();
};

// Settings
const showBoardSettings = () => {
  settingsModalInstance.show();
};

const saveSettings = () => {
  updateBoardProperties({
    config: {
      showLike: boardConfig.showLike,
      showVisibility: boardConfig.showVisibility,
      showAuthorCard: boardConfig.showAuthorCard,
      showTitle: boardConfig.showTitle,
      showDescription: boardConfig.showDescription,
      showTags: boardConfig.showTags,
    }
  })
  settingsModalInstance.hide();
};


const editColumn = (id, name) => {
  columnEditName.value = name;
  columnSelectedId.value = id;
  modalEditColumnName.show();
};

const saveCardVotes = (idColumn, idCard, upVote = false, downVote = false) => {
  console.log("saving card vote to: ", idColumn, idCard);

  const columns = board.columns;
  const [column, columnIndex] = findColumn(columns, idColumn);
  if (!column) return;

  const [card, cardIndex] = findCard(column, idCard);
  if (!card) return;

  if (upVote) {
    if (!card.up_vote_users) card.up_vote_users = [];

    if (card.up_vote_users.includes(user.id)) {
      const index = card.up_vote_users.indexOf(user.id);
      if (index > -1) {
        card.up_vote_users.splice(index, 1);
      }
      card.up_vote = Math.max(0, (card.up_vote || 0) - 1);
    } else {
      card.up_vote_users.push(user.id);
      card.up_vote = (card.up_vote || 0) + 1;
    }
  }

  if (downVote) {
    if (!card.down_vote_users) card.down_vote_users = [];
    if (card.down_vote_users.includes(user.id)) {
      const index = card.down_vote_users.indexOf(user.id);
      if (index > -1) {
        card.down_vote_users.splice(index, 1);
      }
      card.down_vote = Math.max(0, (card.down_vote || 0) - 1);
    } else {
      card.down_vote_users.push(user.id);
      card.down_vote = (card.down_vote || 0) + 1;
    }
  }

  const voteType = upVote ? 'up' : 'down';
  Parse.Cloud.run('updateCardVotes', {
    boardId: route.params.id,
    columnId: idColumn,
    cardId: idCard,
    userId: user.id,
    voteType: voteType
  }).then(result => {
    console.log("Vote update result:", result);
    if (!result.success) {
      getBoard();
      toast.error(result.message || t('boardV2.notifications.failedToUpdateVote'), {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }).catch(error => {
    console.error("Error updating vote:", error);
    getBoard();
    toast.error(t('boardV2.notifications.errorUpdatingVote'), {
      position: toast.POSITION.TOP_CENTER,
    });
  });
};

const saveEditCard = () => {
  if (!cardEditDescription.value) {
    return $swal.fire({
      icon: "error",
      title: t('boardV2.errors.oops'),
      text: t('boardV2.errors.descriptionRequired'),
    });
  }

  const columns = board.columns;
  const [column, columnIndex] = findColumn(columns, columnSelectedId.value);
  if (!column) return;

  const [card, cardIndex] = findCard(column, cardSelectedId.value);
  if (!card) return;

  const originalDescription = card.description;
  const originalTitle = card.title;
  const originalLabels = card.labels ? [...card.labels] : [];

  const labels = cardEditLabels.value ? cardEditLabels.value.split(',').map(label => label.trim()).filter(Boolean) : [];

  card.description = cardEditDescription.value;
  card.title = cardEditTitle.value;
  card.labels = labels;

  Parse.Cloud.run('updateCard', {
    boardId: route.params.id,
    columnId: columnSelectedId.value,
    cardId: cardSelectedId.value,
    updates: {
      description: cardEditDescription.value,
      title: cardEditTitle.value,
      labels: labels
    }
  }).then(result => {
    console.log("Card update result:", result);
    if (!result.success) {
      card.description = originalDescription;
      card.title = originalTitle;
      card.labels = originalLabels;
      toast.error(t('boardV2.notifications.failedToUpdateCard'), {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }).catch(error => {
    console.error("Error updating card:", error);
    card.description = originalDescription;
    card.title = originalTitle;
    card.labels = originalLabels;
    toast.error(t('boardV2.notifications.errorUpdatingCard'), {
      position: toast.POSITION.TOP_CENTER,
    });
  }).finally(() => {
    columnSelectedId.value = null;
    cardSelectedId.value = null;
    cardEditDescription.value = null;
    cardEditTitle.value = null;
    cardEditLabels.value = null;
    modalCardDescription.hide();
  });
};

const setVisibility = () => {
  const newVisibility = !board.visibility;
  board.visibility = newVisibility;
  isVisible.value = newVisibility;
  updateBoardProperties({visibility: newVisibility})
};

const updateBoardProperties = (updateData) => {
  Parse.Cloud.run('updateBoardProperties', {
    boardId: route.params.id,
    updates: updateData
  }).catch(error => {
    console.error("Error updating visibility:", error);
  });
}

const checkPermission = (idUser = null) => {
  if (user.id === board.owner_id) {
    return true;
  } else if (idUser && idUser === user.id) {
    return true;
  }
  return false;
};

const removeCard = (columnId, cardId) => {
  $swal.fire({
    title: t('boardV2.confirmations.removeCard'),
    icon: "question",
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: t('boardV2.confirmations.yes'),
    denyButtonText: t('boardV2.confirmations.no')
  }).then((result) => {
    if (result.isConfirmed) {
      const columns = board.columns;
      const [column, columnIndex] = findColumn(columns, columnId);
      if (!column) return;

      const [card, cardIndex] = findCard(column, cardId);
      if (!card) return;

      const originalItems = JSON.parse(JSON.stringify(column.itens));

      column.itens.splice(cardIndex, 1);

      Parse.Cloud.run('removeCard', {
        boardId: route.params.id,
        columnId: columnId,
        cardId: cardId
      }).then(result => {
        console.log("Card remove result:", result);
        if (!result.success) {
          column.itens.splice(0, column.itens.length, ...originalItems);
          toast.error(t('boardV2.notifications.failedToRemoveCard'), {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      }).catch(error => {
        console.error("Error removing card:", error);
        column.itens.splice(0, column.itens.length, ...originalItems);
        toast.error(t('boardV2.notifications.errorRemovingCard'), {
          position: toast.POSITION.TOP_CENTER,
        });
      });
    }
  });
};

const removeColumn = (id) => {
  $swal.fire({
    title: t('boardV2.confirmations.removeColumn'),
    icon: "question",
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: t('boardV2.confirmations.yes'),
    denyButtonText: t('boardV2.confirmations.no')
  }).then((result) => {
    if (result.isConfirmed) {
      const columns = board.columns;
      const [column, columnIndex] = findColumn(columns, id);
      if (!column) return;

      const originalColumns = JSON.parse(JSON.stringify(board.columns));
      board.columns.splice(columnIndex, 1);

      Parse.Cloud.run('removeColumn', {
        boardId: route.params.id,
        columnId: id
      }).then(result => {
        console.log("Column remove result:", result);
        if (!result.success) {
          board.columns.splice(0, board.columns.length, ...originalColumns);
          toast.error(t('boardV2.notifications.failedToRemoveColumn'), {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      }).catch(error => {
        console.error("Error removing column:", error);
        board.columns.splice(0, board.columns.length, ...originalColumns);
        toast.error(t('boardV2.notifications.errorRemovingColumn'), {
          position: toast.POSITION.TOP_CENTER,
        });
      }).finally(() => {
        columnEditName.value = "";
        modalEditColumnName.hide();
      });
    }
  });
};

const saveEditColumn = () => {
  if (!columnEditName.value) {
    return $swal.fire({
      icon: "error",
      title: t('boardV2.errors.oops'),
      text: t('boardV2.errors.columnNameRequired'),
    });
  }

  const columns = board.columns;
  const [column, columnIndex] = findColumn(columns, columnSelectedId.value);
  if (!column) return;

  const originalName = column.name;

  column.name = columnEditName.value;

  Parse.Cloud.run('updateColumn', {
    boardId: route.params.id,
    columnId: columnSelectedId.value,
    updates: {name: columnEditName.value}
  }).then(result => {
    console.log("Column update result:", result);
    if (!result.success) {
      column.name = originalName;
      toast.error(t('boardV2.notifications.failedToUpdateColumn'), {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }).catch(error => {
    console.error("Error updating column:", error);
    column.name = originalName;
    toast.error(t('boardV2.notifications.errorUpdatingColumn'), {
      position: toast.POSITION.TOP_CENTER,
    });
  }).finally(() => {
    columnSelectedId.value = "";
    columnEditName.value = "";
    modalEditColumnName.hide();
  });
};

const saveColumn = () => {
  if (!columnName.value) {
    return $swal.fire({
      icon: "error",
      title: t('boardV2.errors.oops'),
      text: t('boardV2.errors.columnNameRequired'),
    });
  }

  const newColumn = {
    id: uniqueId(),
    name: columnName.value,
    itens: []
  };

  board.columns.push(newColumn);

  Parse.Cloud.run('addColumn', {
    boardId: route.params.id,
    column: newColumn
  }).then(result => {
    console.log("Column add result:", result);
    if (!result.success) {
      board.columns.pop();
      toast.error(t('boardV2.notifications.failedToAddColumn'), {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }).catch(error => {
    console.error("Error adding column:", error);
    board.columns.pop();
    toast.error("Erro ao adicionar a coluna", {
      position: toast.POSITION.TOP_CENTER,
    });
  }).finally(() => {
    columnName.value = "";
    modalColumnName.hide();
  });
};

const saveCard = () => {
  if (!cardName.value) {
    return $swal.fire({
      icon: "error",
      title: t('boardV2.errors.oops'),
      text: t('boardV2.errors.descriptionRequired'),
    });
  }

  // Find the column in the current board state
  const columns = board.columns;
  const [column, columnIndex] = findColumn(columns, columnSelectedId.value);
  if (!column) return;

  // Create new card object
  const newCard = {
    id: uniqueId(),
    name: user.name,
    user_id: user.id,
    title: cardTitle.value,
    description: cardName.value,
    labels: cardLabels.value ? cardLabels.value.split(',').map(label => label.trim()).filter(Boolean) : [],
    up_vote: 0,
    down_vote: 0,
    up_vote_users: [],
    down_vote_users: [],
    comments: []
  };

  // Update local state optimistically
  if (!column.itens) column.itens = [];
  column.itens.push(newCard);

  // Call Cloud Function to add the card on the server
  Parse.Cloud.run('addCard', {
    boardId: route.params.id,
    columnId: columnSelectedId.value,
    card: newCard
  }).then(result => {
    console.log("Card add result:", result);
    if (!result.success) {
      // Revert optimistic update if server update failed
      column.itens.pop(); // Remove the last card (the one we just added)
      toast.error("Falha ao adicionar o card", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }).catch(error => {
    console.error("Error adding card:", error);
    // Revert optimistic update if server update failed
    column.itens.pop(); // Remove the last card (the one we just added)
    toast.error("Erro ao adicionar o card", {
      position: toast.POSITION.TOP_CENTER,
    });
  }).finally(() => {
    columnSelectedId.value = "";
    cardName.value = "";
    modalCardName.hide();
  });
};

const sortItemsByLike = () => {
  console.log(orderBy.value, board);
  board.columns.forEach(column => {
    if (orderBy.value === "up_vote") {
      column.itens.sort((a, b) => b.up_vote - a.up_vote);
    } else {
      column.itens.sort((a, b) => b.down_vote - a.down_vote);
    }
  });
};

const getBoard = () => {
  query.get(route.params.id)
    .then((boardData) => {
      setBoard(boardData);
    }, (error) => {
      console.log('Failed to create new object, with error code: ' + error.message);
      router.push(`/404`);
    });
};

const setBoard = (boardAttr) => {
  console.log("SET BOARD", boardAttr.attributes);
  const visibility = boardAttr.attributes.visibility ?? true;
  const columns = boardAttr.attributes.columns.map((column) => {
    return {
      ...column,
      itens: column.itens.filter((item) => item !== null)
    };
  });
  if (boardAttr.attributes?.config) Object.assign(boardConfig, boardAttr.attributes.config);
  Object.assign(board, {
    ...boardAttr.attributes,
    columns,
    visibility: visibility
  });

  console.log("NOVO BOARD", board);

  if (orderBy.value !== 'default') {
    sortItemsByLike();
  }
};

const findColumn = (columns, collumnId) => {
  for (const collumnIndex in columns) {
    if (columns[collumnIndex].id === collumnId) {
      return [columns[collumnIndex], collumnIndex];
    }
  }
  return [null, -1];
};

const findCard = (column, cardId) => {
  for (const cardIndex in column.itens) {
    const cardItem = column.itens[cardIndex];
    if (cardItem?.id === cardId) {
      return [cardItem, cardIndex];
    }
  }
  return [null, -1];
};

const realTimeBoard = async () => {
  const queryBoard = new Parse.Query('boards');
  queryBoard.equalTo('objectId', route.params.id);
  subscriptionBoard = await queryBoard.subscribe();

  subscriptionBoard.on('open', () => {
    console.log('board opened');
  });

  subscriptionBoard.on('update', (board) => {
    console.log("update attr", board);
    setTimeout(() => {
      getBoard();
    }, 1);
  });

  subscriptionBoard.on('close', () => {
    console.log('board edit subscription closed');
  });
};

const startDrag = (evt, cardId, columnId) => {
  evt.dataTransfer.dropEffect = 'move';
  evt.dataTransfer.effectAllowed = 'move';
  evt.dataTransfer.setData('cardDragId', cardId);
  evt.dataTransfer.setData('collumnDragId', columnId);
};

const onColumnMoved = (evt) => {
  console.log("Column moved", evt);

  const originalColumns = JSON.parse(JSON.stringify(board.columns));

  Parse.Cloud.run('updateColumnPosition', {
    boardId: route.params.id,
    columns: board.columns
  }).then(result => {
    console.log("Column reordering result:", result);
    if (!result.success) {
      board.columns.splice(0, board.columns.length, ...originalColumns);
      toast.error("Falha ao reordenar as colunas", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }).catch(error => {
    console.error("Error in column reordering:", error);
    board.columns.splice(0, board.columns.length, ...originalColumns);
    toast.error("Erro ao reordenar as colunas", {
      position: toast.POSITION.TOP_CENTER,
    });
  });
};

const onCardMoved = (evt, columnId) => {
  console.log("Card moved in column", columnId, evt);

  const columns = board.columns;
  const [column, columnIndex] = findColumn(columns, columnId);

  if (!column) return;

  const originalItems = JSON.parse(JSON.stringify(column.itens));

  Parse.Cloud.run('updateCardPosition', {
    boardId: route.params.id,
    columnId: columnId,
    items: column.itens
  }).then(result => {
    console.log("Card reordering result:", result);
    if (!result.success) {
      column.itens.splice(0, column.itens.length, ...originalItems);
      toast.error("Falha ao reordenar os cards", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }).catch(error => {
    console.error("Error in card reordering:", error);
    column.itens.splice(0, column.itens.length, ...originalItems);
    toast.error("Erro ao reordenar os cards", {
      position: toast.POSITION.TOP_CENTER,
    });
  });
};

const onDrop = (evt, columnDropId) => {
  const cardDragId = evt.dataTransfer.getData('cardDragId');
  const columnToRemoveId = evt.dataTransfer.getData('collumnDragId');
  evt.preventDefault();

  const columns = board.columns;
  const [sourceColumn, sourceColumnIndex] = findColumn(columns, columnToRemoveId);
  const [targetColumn, targetColumnIndex] = findColumn(columns, columnDropId);

  if (!sourceColumn || !targetColumn) return;

  const [card, cardIndex] = findCard(sourceColumn, cardDragId);
  if (!card) return;

  const sourceColumnCopy = JSON.parse(JSON.stringify(sourceColumn.itens));
  const targetColumnCopy = JSON.parse(JSON.stringify(targetColumn.itens));

  sourceColumn.itens.splice(cardIndex, 1);
  targetColumn.itens.push(card);

  Parse.Cloud.run('moveCardBetweenColumns', {
    boardId: route.params.id,
    sourceColumnId: columnToRemoveId,
    targetColumnId: columnDropId,
    cardId: cardDragId
  }).then(result => {
    console.log("Card move result:", result);
    if (!result.success) {
      sourceColumn.itens.splice(0, sourceColumn.itens.length, ...sourceColumnCopy);
      targetColumn.itens.splice(0, targetColumn.itens.length, ...targetColumnCopy);
      toast.error("Falha ao mover o card", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }).catch(error => {
    console.error("Error moving card:", error);
    sourceColumn.itens.splice(0, sourceColumn.itens.length, ...sourceColumnCopy);
    targetColumn.itens.splice(0, targetColumn.itens.length, ...targetColumnCopy);
    toast.error("Erro ao mover o card", {
      position: toast.POSITION.TOP_CENTER,
    });
  });
};

// Comments functions
const showComments = (columnId, cardId) => {
  const columns = board.columns;
  const [column, columnIndex] = findColumn(columns, columnId);
  if (!column) return;

  const [card, cardIndex] = findCard(column, cardId);
  if (!card) return;

  selectedCard.value = card;
  selectedColumnId.value = columnId;
  newComment.value = '';
  modalComments.show();
};

const addComment = () => {
  if (!newComment.value.trim()) return;

  const comment = {
    id: uniqueId(),
    userId: user.id,
    userName: user.name,
    text: newComment.value,
    createdAt: new Date().toISOString()
  };

  if (!selectedCard.value.comments) {
    selectedCard.value.comments = [];
  }

  selectedCard.value.comments.push(comment);

  Parse.Cloud.run('updateCard', {
    boardId: route.params.id,
    columnId: selectedColumnId.value,
    cardId: selectedCard.value.id,
    updates: {comments: selectedCard.value.comments}
  }).then(result => {
    console.log("Comment add result:", result);
    if (!result.success) {
      selectedCard.value.comments.pop();
      toast.error("Falha ao adicionar comentário", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }).catch(error => {
    console.error("Error adding comment:", error);
    selectedCard.value.comments.pop();
    toast.error("Erro ao adicionar comentário", {
      position: toast.POSITION.TOP_CENTER,
    });
  }).finally(() => {
    newComment.value = '';
  });
};

const deleteComment = (commentId) => {
  if (!selectedCard.value.comments) return;

  const commentIndex = selectedCard.value.comments.findIndex(c => c.id === commentId);
  if (commentIndex === -1) return;
  const originalComments = JSON.parse(JSON.stringify(selectedCard.value.comments));
  selectedCard.value.comments.splice(commentIndex, 1);

  Parse.Cloud.run('updateCard', {
    boardId: route.params.id,
    columnId: selectedColumnId.value,
    cardId: selectedCard.value.id,
    updates: {comments: selectedCard.value.comments}
  }).then(result => {
    console.log("Comment delete result:", result);
    if (!result.success) {
      // Revert optimistic update if server update failed
      selectedCard.value.comments = originalComments;
      toast.error("Falha ao remover comentário", {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      toast.success("Comentário removido com sucesso!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }).catch(error => {
    console.error("Error deleting comment:", error);
    selectedCard.value.comments = originalComments;
    toast.error("Erro ao remover comentário", {
      position: toast.POSITION.TOP_CENTER,
    });
  });
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const getLabelClass = (label) => {
  const hash = label.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash % 6);
  return `bg-${['primary', 'success', 'info', 'warning', 'danger', 'secondary'][index]}`;
};

onMounted(() => {
  getBoard();
  realTimeBoard();
  modalColumnName = new Modal(document.getElementById('modalColumnName'));
  modalCardName = new Modal(document.getElementById('modalCardName'));
  modalEditColumnName = new Modal(document.getElementById('modalEditColumnName'));
  modalBoardName = new Modal(document.getElementById('modalBoardName'));
  modalCardDescription = new Modal(document.getElementById('modalCardDescription'));
  modalComments = new Modal(document.getElementById('modalComments'));
  settingsModalInstance = new Modal(document.getElementById('settingsModal'));
});
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

.comments-list {
  max-height: 400px;
  overflow-y: auto;
}

.comment {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
  margin-bottom: 1rem;
}

.comment:hover {
  background-color: #f0f1f2;
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

/* Estilo para o container draggable */
.kanban-board-draggable {
  display: flex;
  width: 100%;
}

/* Configura colunas para preencher a tela em altura e ter rolagem interna */
.kanban-column {
  width: 300px;
  max-height: 100%;
  margin-right: 1rem;
  position: relative;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  flex: 1 0 calc(20% - 1rem);
  min-width: 300px;
  max-width: calc(33.333% - 1rem);
}

.kanban-cards-container {
  overflow-y: auto;
  max-height: calc(100vh - 250px);
}

.kanban-card {
  margin-bottom: 1rem;
  overflow-wrap: break-word;
  max-width: 95%;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.kanban-card:hover {
  background-color: #f0f1f2;
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

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.column-drag-handle, .card-drag-handle {
  cursor: move;
}

/* Custom scrollbar styles */
.kanban-column::-webkit-scrollbar,
.card-list::-webkit-scrollbar {
  width: 6px;
}

.kanban-column::-webkit-scrollbar-track,
.card-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.kanban-column::-webkit-scrollbar-thumb,
.card-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.kanban-column::-webkit-scrollbar-thumb:hover,
.card-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

</style>
