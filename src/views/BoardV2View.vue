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

        <div class="btn-group btn-group-sm" v-if="board.columns.length > 0">
          <button class="btn btn-primary" @click="newColumn()" data-bs-toggle="modal"
                  data-bs-target="#newColumn">
            <Plus size="18" class="me-1"/>
            {{ t('board.addColumn') }}
          </button>
          <button
            v-if="board?.columns.length > 0 && board?.columns.filter(column => column.itens.length > 0).length > 0 && user.id != 'demo'"
            class="btn btn-primary"
            @click="router.push(`/board/statistics/${route.params.id}`)
          ">
            <BarChart2 size="18"/>
            {{ t('boardV2.statistics') }}
          </button>
          <button
            class="btn btn-primary ai-chat-toggle"
            @click="toggleAIChat"
            title="Chat with AI Assistant"
          >
            <MessageCircle size="18" class="me-2"/>
            {{t('board.aiAssist.title')}}
          </button>
          <button class="btn btn-primary" @click="showBoardSettings">
            <Settings size="18"/>
          </button>
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
    <div class="alert alert-warning" role="alert" v-if="user.id === 'demo'">
      <AlertTriangle size="25" class=""/>
      {{ $t('board.demo.alert') }}
    </div>
    <section class="py-5 text-center container" v-if="board.columns.length === 0 && checkPermission()">
      <div class="empty-state text-center py-5">
        <div class="empty-state-content mx-auto">
          <div class="empty-state-icon mb-4">
            <img src="@/assets/logo-kanbanflex.png" alt="logo" height="64px">
          </div>
          <h2 class="h3 mb-3">{{ $t('board.emptyState.title') }}</h2>
          <p class="text-muted mb-4">{{ $t('board.emptyState.description') }}</p>

          <button class="btn btn-primary btn-md" @click="newColumn()">
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

                      <small :class="{ 'blur-kanban-card': !checkPermission(card.user_id) && !board.visibility}"
                             v-if="boardConfig.showAuthorCard">
                        <img :src="card.avatar || userDefault" :alt="card.name" class="rounded-circle" width="25"
                             height="25">
                        {{
                          card.name
                        }}
                      </small>

                      <div v-if="card.labels && card.labels.length && boardConfig.showTags"
                           class="d-flex flex-wrap gap-1 mt-2"
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
  <div class="modal fade modal-md" id="modalCardName" tabindex="-1" aria-labelledby="exampleModalLabel"
       aria-hidden="true">
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


  <div class="modal fade modal-md" id="modalCardDescription" tabindex="-1" aria-labelledby="exampleModalLabel"
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


  <!--   Settings Modal with Tabs-->
  <!--  <div class="modal fade" id="settingsModal" tabindex="-1" aria-hidden="true" ref="settingsModal">-->
  <!--    <div class="modal-dialog modal-lg">-->
  <!--      <div class="modal-content">-->
  <!--        <div class="modal-header">-->
  <!--          <h5 class="modal-title">{{ t('board.settings') }}</h5>-->
  <!--          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>-->
  <!--        </div>-->
  <!--        <div class="modal-body p-0">-->
  <!--          &lt;!&ndash; Settings Tabs &ndash;&gt;-->
  <!--          <ul class="nav nav-tabs" role="tablist">-->
  <!--            <li class="nav-item" role="presentation">-->
  <!--              <button-->
  <!--                class="nav-link"-->
  <!--                :class="{ active: activeSettingsTab === 'general' }"-->
  <!--                @click="activeSettingsTab = 'general'"-->
  <!--                type="button"-->
  <!--              >-->
  <!--                <Settings size="16" class="me-2"/>-->
  <!--                General-->
  <!--              </button>-->
  <!--            </li>-->
  <!--            <li class="nav-item" role="presentation">-->
  <!--              <button-->
  <!--                class="nav-link"-->
  <!--                :class="{ active: activeSettingsTab === 'visibility' }"-->
  <!--                @click="activeSettingsTab = 'visibility'"-->
  <!--                type="button"-->
  <!--              >-->
  <!--                <Eye size="16" class="me-2"/>-->
  <!--                Visibility-->
  <!--              </button>-->
  <!--            </li>-->
  <!--            <li class="nav-item" role="presentation">-->
  <!--              <button-->
  <!--                class="nav-link"-->
  <!--                :class="{ active: activeSettingsTab === 'permissions' }"-->
  <!--                @click="activeSettingsTab = 'permissions'"-->
  <!--                type="button"-->
  <!--              >-->
  <!--                <Shield size="16" class="me-2"/>-->
  <!--                Permissions-->
  <!--              </button>-->
  <!--            </li>-->
  <!--          </ul>-->

  <!--          &lt;!&ndash; Tab Content &ndash;&gt;-->
  <!--          <div class="tab-content p-4">-->
  <!--            &lt;!&ndash; General Settings Tab &ndash;&gt;-->
  <!--            <div v-if="activeSettingsTab === 'general'" class="tab-pane fade show active">-->
  <!--              <h6 class="mb-3">Board Configuration</h6>-->
  <!--              <div class="mb-3">-->
  <!--                <label for="boardTitle" class="form-label">Board Title</label>-->
  <!--                <div class="d-flex align-items-center gap-2">-->
  <!--                  <input type="text" class="form-control" id="boardTitle" v-model="board.name">-->
  <!--                  <button-->
  <!--                    type="button"-->
  <!--                    class="btn btn-outline-secondary ai-help-btn"-->
  <!--                    @click="showAIHelp('board-title', boardSettings)"-->
  <!--                    :title="'AI Help for Board Title'"-->
  <!--                  >-->
  <!--                    <Sparkles size="16" class="text-warning"/>-->
  <!--                  </button>-->
  <!--                </div>-->
  <!--              </div>-->
  <!--              <div class="mb-3">-->
  <!--                <label for="boardDescription" class="form-label">Board Description</label>-->
  <!--                <div class="d-flex align-items-start gap-2">-->
  <!--                  <textarea class="form-control" id="boardDescription" v-model="board.description" rows="3"></textarea>-->
  <!--                  <button-->
  <!--                    type="button"-->
  <!--                    class="btn btn-outline-secondary ai-help-btn"-->
  <!--                    @click="showAIHelp('board-description', boardSettings)"-->
  <!--                    :title="'AI Help for Board Description'"-->
  <!--                  >-->
  <!--                    <Sparkles size="16" class="text-warning"/>-->
  <!--                  </button>-->
  <!--                </div>-->
  <!--              </div>-->
  <!--            </div>-->

  <!--            &lt;!&ndash; Visibility Settings Tab &ndash;&gt;-->
  <!--            <div v-if="activeSettingsTab === 'visibility'" class="tab-pane fade show active">-->
  <!--              <h6 class="mb-3">Board Visibility</h6>-->
  <!--              <div class="mb-4">-->
  <!--                <div class="form-check mb-3">-->
  <!--                  <input-->
  <!--                    class="form-check-input"-->
  <!--                    type="radio"-->
  <!--                    name="visibility"-->
  <!--                    id="visibilityPrivate"-->
  <!--                    value="private"-->
  <!--                    v-model="boardSettings.visibility"-->
  <!--                  >-->
  <!--                  <label class="form-check-label" for="visibilityPrivate">-->
  <!--                    <div class="d-flex align-items-center">-->
  <!--                      <Lock size="18" class="me-2 text-danger"/>-->
  <!--                      <div>-->
  <!--                        <strong>Private</strong>-->
  <!--                        <div class="text-muted small">Only board members can see and edit this board</div>-->
  <!--                      </div>-->
  <!--                    </div>-->
  <!--                  </label>-->
  <!--                </div>-->
  <!--                <div class="form-check mb-3">-->
  <!--                  <input-->
  <!--                    class="form-check-input"-->
  <!--                    type="radio"-->
  <!--                    name="visibility"-->
  <!--                    id="visibilityTeam"-->
  <!--                    value="team"-->
  <!--                    v-model="boardSettings.visibility"-->
  <!--                  >-->
  <!--                  <label class="form-check-label" for="visibilityTeam">-->
  <!--                    <div class="d-flex align-items-center">-->
  <!--                      <Users size="18" class="me-2 text-warning"/>-->
  <!--                      <div>-->
  <!--                        <strong>Team</strong>-->
  <!--                        <div class="text-muted small">All team members can see this board, only members can edit</div>-->
  <!--                      </div>-->
  <!--                    </div>-->
  <!--                  </label>-->
  <!--                </div>-->
  <!--                <div class="form-check mb-3">-->
  <!--                  <input-->
  <!--                    class="form-check-input"-->
  <!--                    type="radio"-->
  <!--                    name="visibility"-->
  <!--                    id="visibilityPublic"-->
  <!--                    value="public"-->
  <!--                    v-model="boardSettings.visibility"-->
  <!--                  >-->
  <!--                  <label class="form-check-label" for="visibilityPublic">-->
  <!--                    <div class="d-flex align-items-center">-->
  <!--                      <Globe size="18" class="me-2 text-success"/>-->
  <!--                      <div>-->
  <!--                        <strong>Public</strong>-->
  <!--                        <div class="text-muted small">Anyone with the link can view this board</div>-->
  <!--                      </div>-->
  <!--                    </div>-->
  <!--                  </label>-->
  <!--                </div>-->
  <!--              </div>-->

  <!--              <h6 class="mb-3">Additional Options</h6>-->
  <!--              <div class="form-check mb-3">-->
  <!--                <input type="checkbox" class="form-check-input" id="allowComments"-->
  <!--                       v-model="boardSettings.allowComments">-->
  <!--                <label class="form-check-label" for="allowComments">-->
  <!--                  Allow comments from viewers-->
  <!--                </label>-->
  <!--              </div>-->
  <!--              <div class="form-check mb-3">-->
  <!--                <input type="checkbox" class="form-check-input" id="allowVoting" v-model="boardSettings.allowVoting">-->
  <!--                <label class="form-check-label" for="allowVoting">-->
  <!--                  Allow voting (likes/dislikes) from viewers-->
  <!--                </label>-->
  <!--              </div>-->
  <!--              <div class="form-check">-->
  <!--                <input type="checkbox" class="form-check-input" id="showMemberList"-->
  <!--                       v-model="boardSettings.showMemberList">-->
  <!--                <label class="form-check-label" for="showMemberList">-->
  <!--                  Show member list to viewers-->
  <!--                </label>-->
  <!--              </div>-->
  <!--            </div>-->

  <!--            &lt;!&ndash; Permissions Settings Tab &ndash;&gt;-->
  <!--            <div v-if="activeSettingsTab === 'permissions'" class="tab-pane fade show active">-->
  <!--              <h6 class="mb-3">Member Permissions</h6>-->
  <!--              <div class="mb-4">-->
  <!--                <div class="form-check mb-3">-->
  <!--                  <input type="checkbox" class="form-check-input" id="membersCanAddCards"-->
  <!--                         v-model="boardSettings.membersCanAddCards">-->
  <!--                  <label class="form-check-label" for="membersCanAddCards">-->
  <!--                    Members can add cards-->
  <!--                  </label>-->
  <!--                </div>-->
  <!--                <div class="form-check mb-3">-->
  <!--                  <input type="checkbox" class="form-check-input" id="membersCanEditCards"-->
  <!--                         v-model="boardSettings.membersCanEditCards">-->
  <!--                  <label class="form-check-label" for="membersCanEditCards">-->
  <!--                    Members can edit cards-->
  <!--                  </label>-->
  <!--                </div>-->
  <!--                <div class="form-check mb-3">-->
  <!--                  <input type="checkbox" class="form-check-input" id="membersCanDeleteCards"-->
  <!--                         v-model="boardSettings.membersCanDeleteCards">-->
  <!--                  <label class="form-check-label" for="membersCanDeleteCards">-->
  <!--                    Members can delete cards-->
  <!--                  </label>-->
  <!--                </div>-->
  <!--                <div class="form-check mb-3">-->
  <!--                  <input type="checkbox" class="form-check-input" id="membersCanAddColumns"-->
  <!--                         v-model="boardSettings.membersCanAddColumns">-->
  <!--                  <label class="form-check-label" for="membersCanAddColumns">-->
  <!--                    Members can add columns-->
  <!--                  </label>-->
  <!--                </div>-->
  <!--                <div class="form-check mb-3">-->
  <!--                  <input type="checkbox" class="form-check-input" id="membersCanInvite"-->
  <!--                         v-model="boardSettings.membersCanInvite">-->
  <!--                  <label class="form-check-label" for="membersCanInvite">-->
  <!--                    Members can invite others-->
  <!--                  </label>-->
  <!--                </div>-->
  <!--              </div>-->

  <!--              <h6 class="mb-3">Board Members</h6>-->
  <!--              <div class="members-list">-->
  <!--                <div v-for="member in boardMembers" :key="member.id"-->
  <!--                     class="d-flex align-items-center justify-content-between mb-3 p-3 border rounded">-->
  <!--                  <div class="d-flex align-items-center">-->
  <!--                    <img :src="member.avatar" :alt="member.name" class="rounded-circle me-3" width="40" height="40">-->
  <!--                    <div>-->
  <!--                      <div class="fw-bold">{{ member.name }}</div>-->
  <!--                      <small class="text-muted">{{ member.email }}</small>-->
  <!--                    </div>-->
  <!--                  </div>-->
  <!--                  <div class="d-flex align-items-center gap-2">-->
  <!--                    <select class="form-select form-select-sm" v-model="member.role" style="width: 120px;">-->
  <!--                      <option value="owner">Owner</option>-->
  <!--                      <option value="admin">Admin</option>-->
  <!--                      <option value="member">Member</option>-->
  <!--                      <option value="viewer">Viewer</option>-->
  <!--                    </select>-->
  <!--                    <button v-if="member.role !== 'owner'" class="btn btn-sm btn-outline-danger">-->
  <!--                      <Trash2 size="14"/>-->
  <!--                    </button>-->
  <!--                  </div>-->
  <!--                </div>-->
  <!--                <button class="btn btn-outline-primary w-100">-->
  <!--                  <UserPlus size="16" class="me-2"/>-->
  <!--                  Invite Member-->
  <!--                </button>-->
  <!--              </div>-->
  <!--            </div>-->
  <!--          </div>-->
  <!--        </div>-->
  <!--        <div class="modal-footer">-->
  <!--          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">-->
  <!--            {{ t('board.cancel') }}-->
  <!--          </button>-->
  <!--          <button type="button" class="btn btn-primary" @click="saveSettings">-->
  <!--            {{ t('board.save') }}-->
  <!--          </button>-->
  <!--        </div>-->
  <!--      </div>-->
  <!--    </div>-->
  <!--  </div>-->


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
                <img v-if="comment.avatar" :src="comment.avatar" :alt="comment.userName" class="rounded-circle"
                     width="32" height="32">
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
              <img :src="avatar" alt="Current User" class="rounded-circle" width="32" height="32">
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


  <!-- AI Chat Offcanvas -->
  <div
    class="offcanvas offcanvas-end ai-chat-offcanvas"
    tabindex="-1"
    id="aiChatOffcanvas"
    ref="aiChatOffcanvas"
    data-bs-backdrop="false"
  >
    <div class="offcanvas-header border-bottom">
      <div class="d-flex align-items-center gap-3">
        <div class="ai-avatar-chat">
          <Sparkles size="20" class="text-primary"/>
        </div>
        <div>
          <h5 class="offcanvas-title mb-0">{{t('board.aiAssist.title')}}</h5>
          <small class="text-muted">{{t('board.aiAssist.chatInputLabel')}}</small>
        </div>
      </div>
      <button type="button" class="btn-close" @click="closeAIChat" aria-label="Close"></button>
    </div>

    <div class="offcanvas-body d-flex flex-column p-0">
      <!-- Chat Messages -->
      <div class="chat-messages flex-grow-1 p-3" ref="chatMessagesContainer">
        <!-- Welcome Message -->
        <div class="chat-message ai-message mb-3">
          <div class="d-flex align-items-start gap-3">
            <div class="ai-avatar-small">
              <Sparkles size="16" class="text-primary"/>
            </div>
            <div class="message-content">
              <div class="message-bubble ai-bubble">
                <p class="mb-2">{{ t('board.aiAssist.greeting') }}</p>
                <p class="mb-0">{{ t('board.aiAssist.helpIntro') }}</p>
                <ul class="mb-0 mt-2">
                  <li>{{ t('board.aiAssist.items.progress') }}</li>
                  <li>{{ t('board.aiAssist.items.suggestions') }}</li>
                  <li>{{ t('board.aiAssist.items.questions') }}</li>
                  <li>{{ t('board.aiAssist.items.tips') }}</li>
                </ul>

              </div>
              <small class="text-muted">{{t('board.aiAssist.justNow')}}</small>
            </div>
          </div>
        </div>

        <!-- Chat Messages List -->
        <div v-for="message in chatMessages" :key="message.id" class="chat-message mb-3"
             :class="message.type + '-message'">
          <div class="d-flex align-items-start gap-3" :class="{ 'flex-row-reverse': message.type === 'user' }">
            <div v-if="message.type === 'ai'" class="ai-avatar-small">
              <Sparkles size="16" class="text-primary"/>
            </div>
            <div v-else class="user-avatar-small">
              <img :src="avatar" alt="You" class="rounded-circle" width="32" height="32"/>
            </div>
            <div class="message-content" :class="{ 'text-end': message.type === 'user' }">
              <div class="message-bubble" :class="message.type + '-bubble'">
                {{ message.content }}
              </div>
              <small class="text-muted">{{ formatMessageTime(message.timestamp) }}</small>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="aiTyping" class="chat-message ai-message mb-3">
          <div class="d-flex align-items-start gap-3">
            <div class="ai-avatar-small">
              <Sparkles size="16" class="text-primary"/>
            </div>
            <div class="message-content">
              <div class="message-bubble ai-bubble">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions p-3 border-top bg-light">
        <h6 class="small text-muted mb-2">{{ t('board.aiAssist.quickQuestionsText') }}</h6>
        <div class="d-flex flex-wrap gap-2">
          <button
            v-for="quickAction in quickActions"
            :key="quickAction.id"
            class="btn btn-sm btn-outline-primary"
            @click="sendQuickMessage(t(`board.aiAssist.questions.${quickAction.id}.message`))"
          >
            {{ t(`board.aiAssist.questions.${quickAction.id}.label`)}}
          </button>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chat-input p-3 border-top">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            :placeholder="t('board.aiAssist.chatInputLabel')"
            v-model="newMessage"
            @keypress.enter="sendMessage"
            :disabled="aiTyping"
          />
          <button
            class="btn btn-primary"
            type="button"
            @click="sendMessage"
            :disabled="!newMessage.trim() || aiTyping"
          >
            <Send size="16"/>
          </button>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade p-3 m-2" id="aiHelpModal" tabindex="-1" aria-hidden="true" ref="aiHelpModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title d-flex align-items-center gap-2">
            <Sparkles size="20" class="text-primary"/>
            AI Assistant
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="ai-help-content">
            <div class="d-flex align-items-start gap-3 mb-4">
              <div class="ai-avatar bg-primary bg-opacity-10 rounded-circle p-2">
                <Sparkles size="20" class="text-primary"/>
              </div>
              <div class="flex-grow-1">
                <h6 class="mb-2">AI Suggestion for {{ aiHelpContext.type }}</h6>
                <div class="ai-suggestion bg-light p-3 rounded">
                  <div v-if="aiHelpLoading" class="d-flex align-items-center gap-2">
                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                    <span class="text-muted">Generating suggestion...</span>
                  </div>
                  <div v-else>
                    <p class="mb-2">{{ aiHelpSuggestion }}</p>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-primary" @click="applySuggestion">
                        Apply Suggestion
                      </button>
                      <button class="btn btn-sm btn-outline-secondary" @click="generateNewSuggestion">
                        <RefreshCw size="14" class="me-1"/>
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="ai-tips">
              <h6 class="text-muted mb-2">💡 Tips for better results:</h6>
              <ul class="list-unstyled small text-muted">
                <li class="mb-1">• Be specific about your project context</li>
                <li class="mb-1">• Include relevant keywords for your industry</li>
                <li class="mb-1">• Consider your team's workflow and goals</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup>
import {ref, reactive, onMounted, nextTick} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {Modal, Offcanvas} from 'bootstrap';
import Parse from 'parse/dist/parse.min.js';
import {uniqueId} from "@/utils/uuid";
import {configDefault} from "@/utils/templates"
import userDefault from '@/assets/user-default.png';

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
  GripVertical,
  BarChart2,
  Settings,
  AlertTriangle,
  MessageCircle,
  Send,
  Sparkles
} from 'lucide-vue-next';
import {useSwal} from '@/utils/swal';
import draggable from 'vuedraggable';
import {useAuthStore} from "@/stores/auth";
import {getFirstAndLastName} from '@/utils/utils'
import {useCloudFunctions} from '@/composables/useCloudFunctions';
import api from "@/utils/api";
// Initialize Parse
Parse.initialize(import.meta.env.VITE_PARSE_APP_ID);
Parse.serverURL = import.meta.env.VITE_BACKEND_URL;

// Router
const route = useRoute();
const router = useRouter();
const $swal = useSwal();
const {t} = useI18n();

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
const {callFunction} = useCloudFunctions();

const boardConfig = reactive(Object.assign({}, configDefault))

const user = reactive(auth.user || {id: "demo", name: "Frederico Ferreira", email: "demo@email.com",});

const avatar = ref(user?.avatar ? user?.avatar : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${getFirstAndLastName(user)}`);

const activeSettingsTab = ref('general');
let aiHelpModalInstance = null;
let aiChatOffcanvasInstance = null;
const aiHelpModal = ref(null);
const aiChatOffcanvas = ref(null);
const chatMessagesContainer = ref(null);

const quickActions = [
  {id: 'boardProgress'},
  {id: 'bottlenecks'},
  {id: 'suggestions'},
  {id: 'teamPerformance'},
  {id: 'boardSummary'}
];

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

  callFunction('updateBoardName', {
    boardId: route.params.id,
    name: boardName.value
  }).then(result => {
    if (result.success) {
      getBoard();
      boardName.value = "";
      modalBoardName.hide();
    } else {
      console.error('Erro ao salvar nome do quadro:', result);
      $swal.fire({
        icon: "error",
        title: t('boardV2.errors.oops'),
        text: t('boardV2.errors.saveFailed'),
      });
    }
  }).catch((error) => {
    console.error('Erro ao salvar documento: ' + error);
    $swal.fire({
      icon: "error",
      title: t('boardV2.errors.oops'),
      text: t('boardV2.errors.saveFailed'),
    });
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
  callFunction('updateCardVotes', {
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
  if (!cardEditDescription.value && boardConfig.showDescription) {
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

  callFunction('updateCard', {
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
  callFunction('updateBoardProperties', {
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

      callFunction('removeCard', {
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

      callFunction('removeColumn', {
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

  callFunction('updateColumn', {
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

  callFunction('addColumn', {
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
  if (!cardName.value && boardConfig.showDescription) {
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
    avatar: avatar.value,
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
  callFunction('addCard', {
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
  callFunction('getBoardById', {
    id: route.params.id
  })
    .then((boardData) => {
      if (boardData) {
        setBoard(boardData);
      } else {
        console.log('Board not found');
        router.push(`/404`);
      }
    })
    .catch((error) => {
      console.log('Failed to get board, with error code: ' + error.message);
      router.push(`/404`);
    });
};

const setBoard = (boardAttr) => {
  // Handle both Parse Object (from realtime) and plain object (from Cloud Function)
  const attributes = boardAttr.attributes || boardAttr;
  console.log("SET BOARD", attributes);

  const visibility = attributes.visibility ?? true;
  const columns = attributes.columns.map((column) => {
    return {
      ...column,
      itens: column.itens.filter((item) => item !== null)
    };
  });

  if (attributes?.config) Object.assign(boardConfig, attributes.config);

  Object.assign(board, {
    ...attributes,
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

  callFunction('updateColumnPosition', {
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

  callFunction('updateCardPosition', {
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

  callFunction('moveCardBetweenColumns', {
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
    avatar: avatar.value,
    createdAt: new Date().toISOString()
  };

  if (!selectedCard.value.comments) {
    selectedCard.value.comments = [];
  }

  selectedCard.value.comments.push(comment);

  callFunction('updateCard', {
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

  callFunction('updateCard', {
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


// AI Help state
const aiHelpLoading = ref(false);
const aiHelpSuggestion = ref('');
const aiHelpContext = ref({type: '', target: null});

// AI Chat state
const aiChatOpen = ref(false);
const chatMessages = ref([]);
const newMessage = ref('');
const aiTyping = ref(false);

// AI Chat functions
const toggleAIChat = () => {
  if (aiChatOpen.value) {
    closeAIChat();
  } else {
    openAIChat();
  }
};

const openAIChat = () => {
  aiChatOpen.value = true;
  aiChatOffcanvasInstance.show();
};

const closeAIChat = () => {
  aiChatOpen.value = false;
  aiChatOffcanvasInstance.hide();
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || aiTyping.value) return;

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: newMessage.value,
    timestamp: new Date()
  };

  chatMessages.value.push(userMessage);
  newMessage.value = '';

  await nextTick(() => {
    scrollChatToBottom();
  });

  aiTyping.value = true;
  const aiResponse = await generateAIResponse(userMessage.content);

  await new Promise(r => setTimeout(r, 200));

  let displayedText = '';
  const id = Date.now() + 1;

  chatMessages.value.push({
    id,
    type: 'ai',
    content: displayedText,
    timestamp: new Date()
  });

  aiTyping.value = false;

  for (let i = 0; i < aiResponse.length; i++) {
    await new Promise(r => setTimeout(r, 30));
    displayedText += aiResponse[i];
    const msgIndex = chatMessages.value.findIndex(m => m.id === id);
    if (msgIndex !== -1) {
      chatMessages.value[msgIndex].content = displayedText;
    }
  }

  await nextTick(() => {
    scrollChatToBottom();
  });
};

const sendQuickMessage = async (message) => {
  newMessage.value = message;
  await sendMessage();
};


const generateAIResponse = async (userMessage) => {
  return api.post(`boards/${route.params.id}/questions`, {question: userMessage}).then((response) => {
    const {data} = response
    return data.reply
  }).catch(error => {
    console.log(error)
  })
}

const scrollChatToBottom = () => {
  if (chatMessagesContainer.value) {
    chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight;
    console.log(chatMessagesContainer.value.scrollTop)
  }
};

const formatMessageTime = (timestamp) => {
  return timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
};

// AI Help functions
const showAIHelp = (type, target) => {
  aiHelpContext.value = {type, target};
  aiHelpLoading.value = true;
  aiHelpModalInstance.show();

  // Simulate AI generation
  setTimeout(() => {
    generateAISuggestion(type, target);
  }, 1500);
};

const generateAISuggestion = (type, target) => {
  const suggestions = {
    boardTitle: [
      'Project Alpha - Development Sprint',
      'Marketing Campaign Q2 2024',
      'Product Launch Roadmap',
      'Team Collaboration Hub'
    ],
    columnTitle: [
      'Backlog Items',
      'In Progress',
      'Under Review',
      'Ready for Testing',
      'Completed Tasks'
    ],
    cardTitle: [
      'Implement user authentication system',
      'Design landing page mockups',
      'Set up CI/CD pipeline',
      'Conduct user research interviews',
      'Optimize database queries'
    ],
    cardTitleModal: [
      'Create responsive navigation component',
      'Integrate payment gateway',
      'Write unit tests for API endpoints',
      'Design mobile app wireframes'
    ],
    cardDescription: [
      'This task involves creating a comprehensive user authentication system with login, registration, and password reset functionality. Include social login options and two-factor authentication for enhanced security.',
      'Design and develop responsive mockups for the main landing page, focusing on user experience and conversion optimization. Include A/B testing variations.',
      'Set up automated CI/CD pipeline using GitHub Actions to streamline deployment process and ensure code quality through automated testing.'
    ],
    cardDescriptionModal: [
      'Develop a fully responsive navigation component that works seamlessly across all device sizes. Include dropdown menus, mobile hamburger menu, and accessibility features.',
      'Integrate a secure payment gateway solution supporting multiple payment methods including credit cards, PayPal, and digital wallets. Ensure PCI compliance.'
    ]
  };

  const randomSuggestion = suggestions[type][Math.floor(Math.random() * suggestions[type].length)];
  aiHelpSuggestion.value = randomSuggestion;
  aiHelpLoading.value = false;
};

const generateNewSuggestion = () => {
  aiHelpLoading.value = true;
  setTimeout(() => {
    generateAISuggestion(aiHelpContext.value.type, aiHelpContext.value.target);
  }, 1000);
};

const applySuggestion = () => {
  const {type, target} = aiHelpContext.value;

  switch (type) {
    case 'boardTitle':
      console.log('Applying board title:', aiHelpSuggestion.value);
      break;
    case 'columnTitle':
      if (target) {
        target.title = aiHelpSuggestion.value;
      }
      break;
    case 'cardTitle':
      if (target) {
        target.title = aiHelpSuggestion.value;
      }
      break;
    case 'cardTitleModal':
      cardForm.title = aiHelpSuggestion.value;
      break;
    case 'cardDescription':
      if (target) {
        target.description = aiHelpSuggestion.value;
      }
      break;
    case 'cardDescriptionModal':
      cardForm.description = aiHelpSuggestion.value;
      break;
  }

  aiHelpModalInstance.hide();
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
  aiHelpModalInstance = new Modal(aiHelpModal.value);
  aiChatOffcanvasInstance = new Offcanvas(aiChatOffcanvas.value);
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

/* Chat Messages */
.chat-messages {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  scroll-behavior: smooth;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  max-width: 280px;
  word-wrap: break-word;
}

.ai-bubble {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.user-bubble {
  background: linear-gradient(45deg, var(--bs-primary), #3b82f6);
  color: white;
}

.ai-message .message-content {
  margin-right: 2rem;
}

.user-message .message-content {
  margin-left: 2rem;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--bs-primary);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Quick Actions */
.quick-actions {
  background-color: #f8f9fa;
}

/* Chat Input */
.chat-input {
  background-color: white;
}

/* AI Help Button Styles */
.ai-help-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
  border: 1px solid var(--bs-primary);
  background: linear-gradient(45deg, var(--bs-primary), #3b82f6);
  color: white;
  position: relative;
  overflow: hidden;
}

.ai-help-btn:hover {
  opacity: 1;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(var(--bs-primary-rgb), 0.3);
}

.ai-help-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.ai-help-btn:hover:before {
  left: 100%;
}

/* AI Modal Styles */
.ai-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-suggestion {
  border-left: 4px solid var(--bs-primary);
  position: relative;
}

.ai-tips {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e9ecef;
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

</style>
