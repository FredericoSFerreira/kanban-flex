<template>
  <div class="modal fade" id="cardModal" tabindex="-1" ref="cardModal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <!-- Modal Header -->
        <div class="modal-header border-0 pb-0">
          <div class="d-flex align-items-center">
            <div>
              <h4 class="modal-title mb-0">{{ isEditing ? t('boardV2.editCard') : t('boardV2.newCard') }}</h4>
              <small class="text-muted">{{
                  isEditing ? t('boardV2.editCardDescription') : t('boardV2.newCardDescription')
                }}</small>

            </div>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body p-0">
          <div class="row g-0">
            <!-- Left Panel - Form -->
            <div class="col-lg-8 border-end">
              <div class="p-4">
                <!-- Card Title -->
                <div class="mb-4" v-if="boardConfig.showTitle">
                  <label class="form-label fw-semibold">
                    <FileText size="16" class="me-2"/>
                    {{ $t('boardV2.title') }}
                  </label>
                  <input
                    type="text"
                    class="form-control form-control-lg"
                    v-model="cardData.title"
                    :placeholder="$t('boardV2.titlePlaceholder')"
                  />
                </div>

                <!-- Card Description -->
                <div class="mb-4" v-if="boardConfig.showDescription">
                  <label class="form-label fw-semibold">
                    <AlignLeft size="16" class="me-2"/>
                    {{ $t('boardV2.description') }}
                  </label>
                  <textarea
                    class="form-control"
                    rows="7"
                    v-model="cardData.description"
                    :placeholder="$t('boardV2.descriptionPlaceholder')"
                  ></textarea>
                </div>

                <!-- Row with Priority and Due Date -->
                <!--                <div class="row g-3 mb-4">-->
                <!--                  <div class="col-md-6">-->
                <!--                    <label class="form-label fw-semibold">-->
                <!--                      <AlertCircle size="16" class="me-2"/>-->
                <!--                      {{ $t('boardV2.priority') }}-->
                <!--                    </label>-->
                <!--                    <select class="form-select" v-model="cardData.priority">-->
                <!--                      <option value="">{{ $t('boardV2.selectPriority') }}</option>-->
                <!--                      <option value="low">🟢 {{ $t('boardV2.priorityLow') }}</option>-->
                <!--                      <option value="medium">🟡 {{ $t('boardV2.priorityMedium') }}</option>-->
                <!--                      <option value="high">🔴 {{ $t('boardV2.priorityHigh') }}</option>-->
                <!--                      <option value="urgent">🚨 {{ $t('boardV2.priorityUrgent') }}</option>-->
                <!--                    </select>-->
                <!--                  </div>-->
                <!--                  <div class="col-md-6">-->
                <!--                    <label class="form-label fw-semibold">-->
                <!--                      <Calendar size="16" class="me-2"/>-->
                <!--                      {{ $t('boardV2.dueDate') }}-->
                <!--                    </label>-->
                <!--                    <input-->
                <!--                      type="date"-->
                <!--                      class="form-control"-->
                <!--                      v-model="cardData.dueDate"-->
                <!--                    />-->
                <!--                  </div>-->
                <!--                </div>-->

                <!-- Labels -->
                <div class="mb-4" v-if="boardConfig.showTags">
                  <label class="form-label fw-semibold">
                    <Tag size="16" class="me-2"/>
                    {{ $t('boardV2.labels') }}
                  </label>
                  <div class="labels-input-container">
                    <div class="selected-labels mb-2" v-if="cardData.labels.length > 0">
                      <span
                        v-for="(label, index) in cardData.labels"
                        :key="index"
                        class="badge me-2 mb-2"
                        :class="getLabelClass(label)"
                      >
                        {{ label }}
                        <button
                          type="button"
                          class="btn-close btn-close-white ms-2"
                          style="font-size: 0.6rem;"
                          @click="removeLabel(index)"
                        ></button>
                      </span>
                    </div>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        v-model="newLabel"
                        @keydown.enter.prevent="addLabel"
                        :placeholder="t('boardV2.labelsPlaceholder')"
                      />
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        @click="addLabel"
                      >
                        <Plus size="16"/>
                      </button>
                    </div>
                  </div>
                </div>

                <!--                &lt;!&ndash; Assign Members &ndash;&gt;-->
                <!--                <div class="mb-4">-->
                <!--                  <label class="form-label fw-semibold">-->
                <!--                    <Users size="16" class="me-2"/>-->
                <!--                    {{ $t('boardV2.assignedMembers') }}-->
                <!--                  </label>-->

                <!--                  &lt;!&ndash; Selected Members &ndash;&gt;-->
                <!--                  <div class="selected-members mb-3" v-if="cardData.assignedMembers.length > 0">-->
                <!--                    <div class="d-flex flex-wrap gap-2">-->
                <!--                      <div-->
                <!--                        v-for="member in cardData.assignedMembers"-->
                <!--                        :key="member.id"-->
                <!--                        class="member-chip d-flex align-items-center"-->
                <!--                      >-->
                <!--                        <img-->
                <!--                          :src="member.avatar"-->
                <!--                          :alt="member.name"-->
                <!--                          class="rounded-circle me-2"-->
                <!--                          width="24"-->
                <!--                          height="24"-->
                <!--                        />-->
                <!--                        <span class="me-2">{{ member.name }}</span>-->
                <!--                        <button-->
                <!--                          type="button"-->
                <!--                          class="btn-close"-->
                <!--                          style="font-size: 0.6rem;"-->
                <!--                          @click="removeMember(member.id)"-->
                <!--                        ></button>-->
                <!--                      </div>-->
                <!--                    </div>-->
                <!--                  </div>-->

                <!--                  &lt;!&ndash; Member Search &ndash;&gt;-->
                <!--                  <div class="member-search">-->
                <!--                    <div class="input-group">-->
                <!--                      <span class="input-group-text">-->
                <!--                        <Search size="16"/>-->
                <!--                      </span>-->
                <!--                      <input-->
                <!--                        type="text"-->
                <!--                        class="form-control"-->
                <!--                        v-model="memberSearch"-->
                <!--                        @input="searchMembers"-->
                <!--                        :placeholder="$t('boardV2.searchMembers')"-->
                <!--                      />-->
                <!--                    </div>-->

                <!--                    &lt;!&ndash; Search Results &ndash;&gt;-->
                <!--                    <div v-if="filteredMembers.length > 0 && memberSearch" class="member-results mt-2">-->
                <!--                      <div class="list-group">-->
                <!--                        <button-->
                <!--                          v-for="member in filteredMembers"-->
                <!--                          :key="member.id"-->
                <!--                          type="button"-->
                <!--                          class="list-group-item list-group-item-action d-flex align-items-center"-->
                <!--                          @click="assignMember(member)"-->
                <!--                          :disabled="isAlreadyAssigned(member.id)"-->
                <!--                        >-->
                <!--                          <img-->
                <!--                            :src="member.avatar"-->
                <!--                            :alt="member.name"-->
                <!--                            class="rounded-circle me-3"-->
                <!--                            width="32"-->
                <!--                            height="32"-->
                <!--                          />-->
                <!--                          <div class="flex-grow-1">-->
                <!--                            <div class="fw-semibold">{{ member.name }}</div>-->
                <!--                            <small class="text-muted">{{ member.email }}</small>-->
                <!--                          </div>-->
                <!--                          <div v-if="isAlreadyAssigned(member.id)" class="text-success">-->
                <!--                            <Check size="16"/>-->
                <!--                          </div>-->
                <!--                        </button>-->
                <!--                      </div>-->
                <!--                    </div>-->
                <!--                  </div>-->
                <!--                </div>-->

                <!--                 Attachments -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <Paperclip size="16" class="me-2"/>
                    {{ $t('boardV2.attachments') }}
                  </label>
                  <div
                    class="attachment-area border border-dashed rounded p-3 text-center"
                    @dragover.prevent="onDragOver"
                    @dragleave.prevent="onDragLeave"
                    @drop.prevent="onFileDrop"
                    :class="{ 'drag-over': isDragging }"
                  >
                    <input
                      type="file"
                      ref="fileInput"
                      @change="onFileSelected"
                      multiple
                      class="d-none"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xlsx"
                    />
                    <Upload size="32" class="text-muted mb-2"/>
                    <p class="text-muted mb-2">{{ $t('boardV2.dragFilesHere') }}</p>
                    <button type="button" class="btn btn-outline-primary btn-sm" @click="triggerFileInput">
                      {{ $t('boardV2.selectFiles') }}
                    </button>
                    <div v-if="uploadError" class="alert alert-danger mt-2">
                      {{ uploadError }}
                    </div>
                    <div v-if="isUploading" class="mt-3">
                      <div class="progress">
                        <div
                          class="progress-bar"
                          role="progressbar"
                          :style="{ width: `${uploadProgress}%` }"
                          :aria-valuenow="uploadProgress"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {{ uploadProgress }}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Panel - Tabs -->
            <div class="col-lg-4">
              <div class="tabs-container h-100">
                <!-- Tab Navigation -->
                <div class="tab-nav border-bottom">
                  <nav class="nav nav-tabs border-0">
                    <button
                      v-for="tab in tabs"
                      :key="tab.id"
                      class="nav-link border-0 px-3 py-3"
                      :class="{ active: activeTab === tab.id }"
                      @click="changeTab(tab.id)"
                    >
                      <component :is="tab.icon" size="16" class="me-2"/>
                      {{ tab.name }}
                      <span v-if="tab.count" class="badge bg-primary ms-2">{{ tab.count }}</span>
                    </button>
                  </nav>
                </div>

                <!-- Tab Content -->
                <div class="tab-content p-3" style="height: calc(100% - 60px); overflow-y: auto;">
                  <!-- Comments Tab -->
                  <div v-if="activeTab === 'comments'" class="tab-pane active">
                    <div class="comments-section">
                      <!-- Add Comment -->
                      <div class="add-comment mb-4">
                        <div class="d-flex align-items-start">
                          <img
                            :src="avatar"
                            alt="You"
                            class="rounded-circle me-2"
                            width="32"
                            height="32"
                          />
                          <div class="flex-grow-1">
                            <textarea
                              class="form-control"
                              rows="3"
                              v-model="newComment"
                              :placeholder="$t('boardV2.writeComment')"
                            ></textarea>
                            <div class="d-flex justify-content-end mt-2">
                              <button
                                class="btn btn-primary btn-sm"
                                @click="addComment"
                                :disabled="!newComment.trim()"
                              >
                                <Send size="14" class="me-1"/>
                                {{ $t('boardV2.addComment') }}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Comments List -->
                      <div class="comments-list">
                        <div v-if="cardData.comments && cardData.comments.length === 0"
                             class="text-center text-muted py-4">
                          <MessageSquare size="32" class="mb-2"/>
                          <p>{{ $t('boardV2.noComments') }}</p>
                        </div>
                        <div v-else>

                          <div
                            v-for="comment in cardData.comments"
                            :key="comment.id"
                            class="comment-item mb-3"
                          >
                            <div class="d-flex align-items-start">
                              <img
                                :src="comment.avatar"
                                :alt="comment.userName"
                                class="rounded-circle me-2"
                                width="32"
                                height="32"
                              />
                              <div class="flex-grow-1">
                                <div class="comment-header d-flex align-items-center mb-1">
                                  <span class="fw-semibold me-2">{{ comment.userName }}</span>
                                  <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
                                </div>
                                <div class="comment-text">{{ comment.text }}</div>
                              </div>
                              <div class="d-flex gap-2">
                                <button
                                  v-if="comment.userId === auth.user.id"
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
                    </div>
                  </div>

                  <!-- Activity Tab -->
                  <div v-if="activeTab === 'activity'" class="tab-pane active">
                    <div class="activity-section">
                      <div v-if="cardData.history.length === 0" class="text-center text-muted py-4">
                        <Activity size="32" class="mb-2"/>
                        <p>{{ $t('boardV2.noActivity') }}</p>
                      </div>
                      <div v-else class="activity-timeline">
                        <div
                          v-for="activity in cardData.history"
                          :key="activity.id"
                          class="activity-item d-flex align-items-start mb-3"
                        >
                          <div class="activity-icon me-1">
                            <div class="rounded-circle p-1">
                              <img
                                :src="activity.user.avatar"
                                :alt="activity.user.name"
                                class="rounded-circle me-2"
                                width="34"
                                height="34"
                              />
                            </div>
                          </div>
                          <div class="flex-grow-1">
                            <div class="activity-content">
                              <span class="fw-semibold">{{ activity.user.name }}</span>
                              <div v-if="activity.action == 'create_card'">
                                {{ $t('boardV2.createdCard') }}
                              </div>
                              <div v-else>
                                {{
                                  $t('boardV2.movedCard', {
                                    source: activity.data?.source.columnName,
                                    target: activity.data?.target.columnName
                                  })
                                }}
                              </div>

                            </div>
                            <small class="text-muted">{{ formatDate(activity.timestamp) }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Checklist Tab -->
                  <div v-if="activeTab === 'checklist'" class="tab-pane active">
                    <div class="checklist-section">
                      <!-- Add Checklist Item -->
                      <div class="add-checklist-item mb-4">
                        <div class="input-group">
                          <input
                            type="text"
                            class="form-control"
                            v-model="newChecklistItem"
                            @keydown.enter.prevent="addChecklistItem"
                            :placeholder="$t('boardV2.addItemPlaceholder')"
                          />
                          <button
                            class="btn btn-outline-primary"
                            type="button"
                            @click="addChecklistItem"
                            :disabled="!newChecklistItem.trim()"
                          >
                            <Plus size="16"/>
                          </button>
                        </div>
                      </div>

                      <!-- Progress Bar -->
                      <div v-if="cardData?.checklist && cardData.checklist.length > 0" class="checklist-progress mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <span class="fw-semibold">{{ $t('boardV2.progress') }}</span>
                          <span class="text-muted">{{ completedItems }}/{{ cardData.checklist.length }}</span>
                        </div>
                        <div class="progress">
                          <div
                            class="progress-bar"
                            :style="{ width: `${progressPercentage}%` }"
                          ></div>
                        </div>
                      </div>

                      <!-- Checklist Items -->
                      <div class="checklist-items">
                        <div v-if="cardData?.checklist && cardData.checklist.length === 0"
                             class="text-center text-muted py-4">
                          <CheckSquare size="32" class="mb-2"/>
                          <p>{{ $t('boardV2.noChecklistItems') }}</p>
                        </div>
                        <div v-else>
                          <div
                            v-for="(item, index) in cardData.checklist"
                            :key="item.id"
                            class="checklist-item d-flex align-items-center mb-2"
                          >
                            <div class="form-check me-2">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                v-model="item.completed"
                                :id="`check-${item.id}`"
                              />
                            </div>
                            <div class="flex-grow-1">
                              <label
                                :for="`check-${item.id}`"
                                class="form-check-label"
                                :class="{ 'text-decoration-line-through text-muted': item.completed }"
                              >
                                {{ item.text }}
                              </label>
                            </div>
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-danger"
                              @click="removeChecklistItem(index)"
                            >
                              <Trash2 size="14"/>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Attachments Tab -->
                  <div v-if="isEditing && activeTab === 'attachments'" class="tab-pane active">
                    <div class="attachments-section">
                      <!-- Add Attachment -->
                      <!--                      <div class="add-attachment mb-4">-->
                      <!--                        <div class="attachment-area border border-dashed rounded p-3 text-center"-->
                      <!--                             @dragover.prevent="onDragOver"-->
                      <!--                             @dragleave.prevent="onDragLeave"-->
                      <!--                             @drop.prevent="onFileDrop"-->
                      <!--                             :class="{ 'drag-over': isDragging }">-->
                      <!--                          <input-->
                      <!--                            type="file"-->
                      <!--                            ref="fileInput"-->
                      <!--                            @change="onFileSelected"-->
                      <!--                            multiple-->
                      <!--                            class="d-none"-->
                      <!--                            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xlsx"-->
                      <!--                          />-->
                      <!--                          <Upload size="32" class="text-muted mb-2"/>-->
                      <!--                          <p class="text-muted mb-2">{{ $t('boardV2.dragFilesHere') }}</p>-->
                      <!--                          <button type="button" class="btn btn-outline-primary btn-sm" @click="triggerFileInput">-->
                      <!--                            {{ $t('boardV2.selectFiles') }}-->
                      <!--                          </button>-->
                      <!--                        </div>-->
                      <!--                        <div v-if="uploadError" class="alert alert-danger mt-2">-->
                      <!--                          {{ uploadError }}-->
                      <!--                        </div>-->
                      <!--                        <div v-if="isUploading" class="mt-3">-->
                      <!--                          <div class="progress">-->
                      <!--                            <div-->
                      <!--                              class="progress-bar"-->
                      <!--                              role="progressbar"-->
                      <!--                              :style="{ width: `${uploadProgress}%` }"-->
                      <!--                              :aria-valuenow="uploadProgress"-->
                      <!--                              aria-valuemin="0"-->
                      <!--                              aria-valuemax="100"-->
                      <!--                            >-->
                      <!--                              {{ uploadProgress }}%-->
                      <!--                            </div>-->
                      <!--                          </div>-->
                      <!--                        </div>-->
                      <!--                      </div>-->

                      <!-- Attachments List -->
                      <div class="attachments-list">
                        <div v-if="cardData?.attachments && cardData?.attachments?.length === 0"
                             class="text-center text-muted py-4">
                          <Paperclip size="32" class="mb-2"/>
                          <p>{{ $t('boardV2.noAttachments') || 'No attachments yet' }}</p>
                        </div>
                        <div v-else>
                          <h6 class="mb-3">{{ cardData?.attachments?.length }}
                            {{
                              cardData?.attachments?.length === 1 ? $t('boardV2.attachment') : $t('boardV2.attachments')
                            }}</h6>

                          <div v-for="attachment in cardData.attachments" :key="attachment.id"
                               class="attachment-item mb-3">
                            <div class="card">
                              <div class="card-body p-3">
                                <div class="d-flex align-items-center">
                                  <div
                                    class="attachment-icon me-3 d-flex align-items-center justify-content-center bg-light rounded"
                                    style="width: 60px; height: 60px;">
                                    <FileText v-if="attachment.type === 'application/pdf'" size="24"
                                              class="text-danger"/>
                                    <FileImage v-else-if="attachment.type.includes('image')" size="24"
                                               class="text-gray-200"/>
                                    <FileText v-else-if="attachment.type.includes('word')" size="24"
                                              class="text-primary"/>
                                    <FileText v-else-if="attachment.type.includes('excel')" size="24"
                                              class="text-success"/>
                                    <File v-else size="24" class="text-secondary"/>
                                  </div>

                                  <div class="flex-grow-1">
                                    <h6 class="mb-1 text-ellipsis" :title="attachment.name">
                                      {{ attachment.name }}
                                    </h6>
                                    <div class="d-flex align-items-center text-muted small">
                                      <span class="me-2">{{ formatFileSize(attachment.size) }}</span>
                                      <span>{{ formatDate(attachment.createdAt) }}</span>
                                    </div>
                                  </div>

                                  <div class="attachment-actions">
                                    <button @click="downloadAttachment(attachment.id)"
                                            class="btn btn-sm btn-outline-primary me-1">
                                      <Download size="14"/>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-danger"
                                            @click="removeAttachment(attachment.id)">
                                      <Trash2 size="14"/>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Details Tab -->
                  <div v-if="activeTab === 'details'" class="tab-pane active">
                    <div class="details-section">
                      <div class="detail-item mb-3" v-if="cardData.createdAt">
                        <div class="detail-label">
                          <Calendar size="16" class="me-2"/>
                          {{ $t('boardV2.createdOn') }}
                        </div>
                        <div class="detail-value">{{ formatDate(cardData.createdAt) }}</div>
                      </div>

                      <div class="detail-item mb-3" v-if="cardData.updatedAt">
                        <div class="detail-label">
                          <Clock size="16" class="me-2"/>
                          {{ $t('boardV2.lastUpdate') }}
                        </div>
                        <div class="detail-value">{{ formatDate(cardData.updatedAt) }}</div>
                      </div>

                      <div class="detail-item mb-3">
                        <div class="detail-label">
                          <User size="16" class="me-2"/>
                          {{ $t('boardV2.createdBy') }}
                        </div>
                        <div class="detail-value d-flex align-items-center">
                          <img
                            :src="cardData.avatar"
                            :alt="cardData.name"
                            class="rounded-circle me-2"
                            width="24"
                            height="24"
                          />
                          {{ cardData.name }}
                        </div>
                      </div>

                      <div class="detail-item mb-3">
                        <div class="detail-label">
                          <Hash size="16" class="me-2"/>
                          {{ $t('boardV2.cardId') }}
                        </div>
                        <div class="detail-value">
                          <code>{{ cardData.id }}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer border-0 pt-0" style="z-index: 100">
          <div class="d-flex justify-content-between w-100">
            <div class="d-flex gap-2">
              <button v-if="isEditing" type="button" class="btn btn-outline-danger" @click="handleDelete">
                <Trash2 size="16" class="me-2"/>
                {{ $t('boardV2.deleteCard') }}
              </button>
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                {{ $t('boardV2.cancel') }}
              </button>
              <button type="button" class="btn btn-primary" @click="handleSave">
                <Save size="16" class="me-2"/>
                {{ isEditing ? t('boardV2.save') : t('boardV2.createCard') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted, defineProps, defineEmits, watch} from 'vue';
import {
  CreditCard, FileText, AlignLeft, AlertCircle, Calendar, Tag, Users, Search,
  Plus, Check, Paperclip, Upload, MessageSquare, Send, Activity, CheckSquare,
  Trash2, Save, Clock, User, BarChart3, Hash, ArrowRight, Edit, Move,
  File, Download, FileImage
} from 'lucide-vue-next';
import {useI18n} from 'vue-i18n';
import {useAuthStore} from "@/stores/auth";
import {getUserLoggedAvatar} from "@/utils/utils";
import {uniqueId} from "@/utils/uuid";
import {configDefault} from "@/utils/templates";
import api from '@/utils/api';
import {useRoute} from 'vue-router';
import {useSwal} from "@/utils/swal";

const $swal = useSwal();
const auth = useAuthStore();
const {t, locale} = useI18n();
const route = useRoute();

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false
  },
  cardData: {
    type: Object,
    default: () => (
      {
        id: '',
        title: '',
        description: '',
        labels: [],
        createdAt: '',
        updatedAt: '',
        comments: [],
        history: [],
        checklist: [],
        attachments: []
      })
  },
  boardConfig: {
    type: Object,
    default: () => (configDefault)
  },
  columnId: {
    type: [String, Number],
    required:
      true
  },
  initialTab: {
    type: String,
    default:
      'details' // Ou qualquer valor padrão que faça sentido
  }
});

const avatar = ref(getUserLoggedAvatar());

const emit = defineEmits(['save', 'edit', 'delete', 'deleteComment', 'saveComment']);

const handleSave = () => {
  if (props.isEditing) {
    emit('edit', {...props.cardData});
  } else {
    emit('save', {...props.cardData});
    // Reset do cardData após criar um novo card
    setTimeout(() => {
      const defaultCardData = {
        id: '',
        title: '',
        description: '',
        labels: [],
        createdAt: '',
        updatedAt: '',
        comments: [],
        history: [],
        checklist: [],
        attachments: []
      };

      Object.keys(defaultCardData).forEach(key => {
        if (props.cardData[key] !== undefined) {
          if (Array.isArray(defaultCardData[key])) {
            props.cardData[key] = [];
          } else {
            props.cardData[key] = defaultCardData[key];
          }
        }
      });
    }, 100);
  }
}

const handleDelete = () => {
  emit('delete', props.columnId, props.cardData.id);
}

const deleteComment = (commentId) => {
  emit('deleteComment', {commentId, ...props.cardData});
}
const changeTab = (tabId) => {
  activeTab.value = tabId;
};

// Reactive data
const cardModal = ref(null);
const activeTab = ref(props.initialTab);
const newLabel = ref('');
const memberSearch = ref('');
const newComment = ref('');
const newChecklistItem = ref('');

// File upload related data
const fileInput = ref(null);
const selectedFiles = ref([]);
const uploadProgress = ref(0);
const uploadError = ref('');
const isUploading = ref(false);
const isDragging = ref(false);
const totalUploadSize = ref(0);
const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
const maxTotalSize = 10 * 1024 * 1024; // 10MB in bytes
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

// Mock data for team members
const teamMembers = ref([
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80'
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80'
  }
]);


// Checklist
const checklist = ref([
  {id: 1, text: 'Revisar requisitos', completed: true},
  {id: 2, text: 'Criar mockups', completed: true},
  {id: 3, text: 'Implementar funcionalidade', completed: false},
  {id: 4, text: 'Testes unitários', completed: false},
  {id: 5, text: 'Documentação', completed: false}
]);

// Tabs configuration
const tabs = computed(() => {
  const tabsAarray = [
    {
      id: 'comments',
      name: t('boardV2.comments'),
      icon: MessageSquare,
      count: props.cardData?.comments ? props.cardData.comments?.length : 0,
      visible: props.isEditing
    },
    {
      id: 'activity',
      name: t('boardV2.activity'),
      icon: Activity,
      count: props.cardData?.history ? props.cardData?.history.length : 0,
      visible: true
    },
    {
      id: 'checklist',
      name: t('boardV2.checklist'),
      icon: CheckSquare,
      count: props.cardData?.checklist ? props.cardData?.checklist.length : 0,
      visible: props.isEditing
    },
    {
      id: 'attachments',
      name: t('boardV2.attachments'),
      icon: Paperclip,
      count: props.cardData?.attachments ? props.cardData?.attachments.length : 0,
      visible: props.isEditing
    },
    {
      id: 'details',
      name: t('boardV2.details'),
      icon: FileText,
      visible: props.isEditing
    }
  ]
  return tabsAarray.filter(tab => tab.visible);
});

// Computed properties
const filteredMembers = computed(() => {
  if (!memberSearch.value) return [];
  return teamMembers.value.filter(member =>
    member.name.toLowerCase().includes(memberSearch.value.toLowerCase()) ||
    member.email.toLowerCase().includes(memberSearch.value.toLowerCase())
  );
});

const completedItems = computed(() =>
  props.cardData.checklist.filter(item => item.completed).length
);

const progressPercentage = computed(() =>
  props.cardData.checklist.length > 0 ? (completedItems.value / props.cardData.checklist.length) * 100 : 0
);

// Methods
const addLabel = () => {
  if (newLabel.value.trim() && !props.cardData.labels.includes(newLabel.value.trim())) {
    props.cardData.labels.push(newLabel.value.trim());
    newLabel.value = '';
  }
};

const removeLabel = (index) => {
  props.cardData.labels.splice(index, 1);
};

const getLabelClass = (label) => {
  const hash = label.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash % 6);
  return `bg-${['primary', 'success', 'info', 'warning', 'danger', 'secondary'][index]}`;
};

const searchMembers = () => {
  // Search is handled by computed property
};

const assignMember = (member) => {
  if (!isAlreadyAssigned(member.id)) {
    props.cardData.assignedMembers.push(member);
    memberSearch.value = '';
  }
};

const removeMember = (memberId) => {
  props.cardData.assignedMembers = props.cardData.assignedMembers.filter(
    member => member.id !== memberId
  );
};

const isAlreadyAssigned = (memberId) => {
  return props.cardData.assignedMembers.some(member => member.id === memberId);
};

const addComment = () => {
  if (newComment.value.trim()) {

    const comment = {
      id: uniqueId(),
      userId: auth.user.id,
      userName: auth.user.name,
      text: newComment.value,
      avatar: avatar.value,
      createdAt: new Date().toISOString()
    };
    props.cardData.comments.push(comment);
    newComment.value = '';
    emit('saveComment', comment, {...props.cardData});
  }
};

const addChecklistItem = () => {
  if (newChecklistItem.value.trim()) {
    props.cardData.checklist.push({
      id: uniqueId(),
      text: newChecklistItem.value.trim(),
      completed: false
    });
    newChecklistItem.value = '';
  }
};

const removeChecklistItem = (index) => {
  props.cardData.checklist.splice(index, 1);
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'create_card':
      return Plus;
    case 'move_card':
      return ArrowRight;
    default:
      return Activity;
  }
};

const formatDate = computed(() => {
  return (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) return t('date.now');
    if (diffInHours < 24) return t('date.hoursAgo', {hours: diffInHours});
    if (diffInDays === 1) return t('date.yesterday');
    if (diffInDays < 7) return t('date.daysAgo', {days: diffInDays});
    return date.toLocaleDateString(locale.value);
  };
});

const onModalHide = () => {
  console.log('Modal hidden');
  // Resetar o estado do modal
  resetModalState();

  // Limpar o cardData se não estiver em modo de edição
  if (!props.isEditing) {
    // Criar um objeto com valores padrão para o cardData
    const defaultCardData = {
      id: '',
      title: '',
      description: '',
      labels: [],
      createdAt: '',
      updatedAt: '',
      comments: [],
      history: [],
      checklist: [],
      attachments: []
    };

    // Atualizar os valores do cardData para os valores padrão
    Object.keys(defaultCardData).forEach(key => {
      if (props.cardData[key] !== undefined) {
        if (Array.isArray(defaultCardData[key])) {
          props.cardData[key] = [];
        } else {
          props.cardData[key] = defaultCardData[key];
        }
      }
    });
  }
};

const onModalShow = () => {
  console.log('Modal show');
  activeTab.value = props.initialTab;
  setTimeout(fetchAttachments, 1000);
}

const fetchAttachments = async () => {
  try {
    if (!props.isEditing || !props.cardData?.id) return;
    const {data} = await api.get(`/attachments/item/${props.cardData.id}`);
    if (data?.success && Array.isArray(data.attachments)) {
      props.cardData.attachments = data.attachments;
    }
  } catch (e) {
    console.error('Error fetching attachments:', e);
  }
};

// File handling methods
const triggerFileInput = () => {
  fileInput.value.click();
};

const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onFileDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  handleFiles(files);
};

const onFileSelected = (event) => {
  const files = event.target.files;
  handleFiles(files);
  // Reset the input so the same file can be selected again
  event.target.value = '';
};

const handleFiles = (files) => {
  uploadError.value = '';

  // Convert FileList to Array
  const fileArray = Array.from(files);

  // Validate files
  const validFiles = [];
  let totalSize = 0;

  for (const file of fileArray) {
    const validationResult = validateFile(file);
    if (validationResult.valid) {
      validFiles.push(file);
      totalSize += file.size;
    } else {
      uploadError.value = validationResult.error;
      return;
    }
  }

  // Check total size
  const currentAttachmentsSize = props.cardData?.attachments?.reduce((sum, attachment) => sum + (attachment.size || 0), 0);
  if (currentAttachmentsSize + totalSize > maxTotalSize) {
    uploadError.value = `Total upload size exceeds the limit of ${maxTotalSize / (1024 * 1024)}MB`;
    return;
  }

  // Add files to selectedFiles
  selectedFiles.value = [...selectedFiles.value, ...validFiles];

  // Real upload to API
  uploadFiles(validFiles);
};

const validateFile = (file) => {
  // Check file size
  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: `File ${file.name} exceeds the maximum size of ${maxFileSize / (1024 * 1024)}MB`
    };
  }

  // Check file type
  const isImage = allowedImageTypes.includes(file.type);
  const isDocument = allowedDocumentTypes.includes(file.type);

  if (!isImage && !isDocument) {
    return {
      valid: false,
      error: `File type not supported. Allowed types: JPEG, JPG, PNG, WEBP, PDF, DOC, DOCX, XLSX`
    };
  }

  return {valid: true};
};

const uploadFiles = async (files) => {
  try {
    if (!props.isEditing || !props.cardData?.id) {
      uploadError.value = t ? t('boardV2.errors.uploadOnlyInEdit') || 'Uploads are only available when editing an existing card' : 'Uploads are only available when editing an existing card';
      return;
    }

    isUploading.value = true;
    uploadProgress.value = 0;

    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('boardId', (route.params?.id || '').toString());
      formData.append('itemId', props.cardData.id);

      const {data} = await api.post('/attachments/upload', formData, {
        headers: {'Content-Type': 'multipart/form-data'},
        onUploadProgress: (evt) => {
          if (evt.total) {
            const perFile = evt.loaded / evt.total;
            uploadProgress.value = Math.min(100, Math.round(((i + perFile) / totalFiles) * 100));
          }
        }
      });

      if (data?.success && data?.attachment) {
        // Push server-provided attachment object
        props.cardData.attachments.push(data.attachment);
      } else {
        throw new Error(data?.message || 'Upload failed');
      }
    }

    // Ensure progress ends at 100
    uploadProgress.value = 100;
    // Switch to attachments tab
    if (activeTab.value !== 'attachments') {
      activeTab.value = 'attachments';
    }
  } catch (e) {
    console.error('Upload error:', e);
    uploadError.value = e?.response?.data?.message || e?.message || 'Error uploading file';
  } finally {
    isUploading.value = false;
  }
};


const downloadAttachment = async (attachmentId) => {
  try {
    const {data} = await api.get(`/attachments/${attachmentId}/download`);

    const filename = data.url.split('/').pop().split('?')[0];
    const a = document.createElement('a');
    a.href = data.url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } catch (e) {
    console.error('Error download attachment:', e);
    uploadError.value = e?.response?.data?.message || e?.message || 'Error download attachment';
  }
};

const removeAttachment = async (attachmentId) => {
  $swal.fire({
    title: t('boardV2.confirmations.removeAttachment'),
    icon: "question",
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: t('boardV2.confirmations.yes'),
    denyButtonText: t('boardV2.confirmations.no')
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`/attachments/${attachmentId}`);
        const index = props.cardData.attachments.findIndex(attachment => attachment.id === attachmentId);
        if (index !== -1) {
          // If the attachment has a temporary URL, revoke it to free up memory
          if (typeof props.cardData.attachments[index].url === 'string' && props.cardData.attachments[index].url.startsWith('blob:')) {
            URL.revokeObjectURL(props.cardData.attachments[index].url);
          }
          props.cardData.attachments.splice(index, 1);
        }
      } catch (e) {
        console.error('Error deleting attachment:', e);
        uploadError.value = e?.response?.data?.message || e?.message || 'Error deleting attachment';
      }
    }
  });
};


const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const resetModalState = () => {
  newLabel.value = '';
  memberSearch.value = '';
  newComment.value = '';
  newChecklistItem.value = '';
  uploadError.value = '';
  uploadProgress.value = 0;
  isUploading.value = false;
  isDragging.value = false;
  selectedFiles.value = [];
};

onMounted(() => {

  if (cardModal.value) {
    cardModal.value.addEventListener('hide.bs.modal', onModalHide);
    cardModal.value.addEventListener('show.bs.modal', onModalShow);
  }

  // Inicializar activeTab com o valor de initialTab
  activeTab.value = props.initialTab;
});

// Observar mudanças em initialTab para manter activeTab sincronizado
watch(() => props.initialTab, (newInitialTab) => {
  // Atualizar activeTab quando initialTab mudar (exceto durante edição pelo usuário)
  activeTab.value = newInitialTab;
});

onUnmounted(() => {
  if (cardModal.value) {
    cardModal.value.removeEventListener('hide.bs.modal', onModalHide);
    cardModal.value.removeEventListener('show.bs.modal', onModalShow);
  }
});
</script>

<style scoped>

.comments-list, .activity-section, .checklist-items {
  max-height: 400px;
  overflow-y: auto;
}


.attachments-list {
  max-height: 500px;
  overflow-y: auto;
}

.modal-dialog {
  max-width: 1200px;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(45deg, var(--bs-primary), var(--bs-info));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.labels-input-container .selected-labels {
  min-height: 32px;
}

.member-chip {
  background: var(--bs-light);
  border: 1px solid var(--bs-border-color);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.875rem;
}

.member-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
}

.attachment-area {
  transition: all 0.2s ease;
  cursor: pointer;
}

.attachment-area:hover {
  border-color: var(--bs-primary);
  background-color: var(--bs-primary-bg-subtle);
}

.tabs-container {
  background: var(--bs-light);
}

.tab-nav {
  background: white;
}

.nav-tabs .nav-link {
  color: var(--bs-secondary);
  font-weight: 500;
  border-radius: 0;
  border-bottom: 3px solid transparent;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  background: var(--bs-light);
}

.nav-tabs .nav-link.active {
  color: var(--bs-primary);
  background: white;
  border-color: transparent transparent var(--bs-primary);
}

.comment-item {
  padding: 12px;
  background: var(--bs-light);
  border-radius: 8px;
  border-left: 3px solid var(--bs-primary);
}

.activity-timeline {
  position: relative;
}

.activity-item {
  position: relative;
}

.activity-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 40px;
  bottom: -12px;
  width: 2px;
  background: var(--bs-border-color);
}

.checklist-item {
  padding: 8px 12px;
  background: var(--bs-light);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.checklist-item:hover {
  background: var(--bs-primary-bg-subtle);
}

.checklist-progress .progress {
  height: 8px;
}

.detail-item {
  padding: 12px;
  background: var(--bs-light);
  border-radius: 8px;
}

.detail-label {
  font-weight: 600;
  color: var(--bs-secondary);
  font-size: 0.875rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.detail-value {
  color: var(--bs-body-color);
}

/* Dark mode compatibility */
:deep(.dark-mode) {
  .modal-content {
    background-color: #1e1e1e;
    color: #ffffff;
  }

  .modal-header {
    border-bottom-color: #2d2d2d;
  }

  .modal-footer {
    border-top-color: #2d2d2d;
  }

  .form-control,
  .form-select {
    background-color: #2d2d2d;
    border-color: #404040;
    color: #ffffff;
  }

  .form-control:focus,
  .form-select:focus {
    background-color: #363636;
    border-color: #4a4a4a;
    color: #ffffff;
  }

  .tabs-container {
    background-color: #2d2d2d;
  }

  .tab-nav {
    background-color: #1e1e1e;
  }

  .nav-tabs .nav-link.active {
    background-color: #1e1e1e;
    color: var(--bs-primary);
  }

  .member-chip {
    background-color: #2d2d2d;
    border-color: #404040;
  }

  .member-results {
    border-color: #404040;
  }

  .list-group-item {
    background-color: #2d2d2d;
    border-color: #404040;
    color: #ffffff;
  }

  .list-group-item:hover {
    background-color: #363636;
  }

  .attachment-area {
    border-color: #404040;
  }

  .attachment-area:hover {
    border-color: var(--bs-primary);
    background-color: rgba(var(--bs-primary-rgb), 0.1);
  }
}

/* Custom scrollbar */
.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

:deep(.dark-mode) .tab-content::-webkit-scrollbar-track {
  background: #2d2d2d;
}

:deep(.dark-mode) .tab-content::-webkit-scrollbar-thumb {
  background: #4a4a4a;
}

:deep(.dark-mode) .tab-content::-webkit-scrollbar-thumb:hover {
  background: #5a5a5a;
}

.text-ellipsis {
  display: inline-block;     /* ou block/flex item */
  max-width: 200px;          /* defina um limite fixo ou relativo */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;    /* opcional, deixa alinhado */
}
</style>
