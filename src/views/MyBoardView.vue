<template>
  <div class="container py-5" style="padding-bottom: 10rem !important;">
    <div class="d-flex justify-content-between align-items-center mb-4" v-if="boards.length > 0">
      <h1 class="h2 mb-0">{{ $t('myBoards.title') }}</h1>
      <button class="btn btn-primary" @click="openCreateBoardModal()">
        {{ $t('myBoards.createBoard') }}
      </button>
    </div>

    <div class="text-center py-5" v-if="showSpinner">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="boards.length === 0 && !showSpinner" class="text-center py-5">
      <Layout :size=70 class="text-primary mb-3"/>
      <h2 class="h3 mb-4">{{ $t('myBoards.emptyState.title') }}</h2>
      <p class="text-muted mb-5">{{ $t('myBoards.emptyState.description') }}</p>
      <button class="btn btn-primary" @click="openCreateBoardModal()">
        {{ $t('myBoards.emptyState.cta') }}
      </button>
    </div>

    <!-- Boards Grid -->
    <div v-else class="row g-4 py-5">
      <div v-for="board in boards" :key="board.id" class="col-md-6 col-lg-4">
        <div class="card h-100 board-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h3 class="h5 mb-0">{{ board.name }}</h3>
              <div class="dropdown">
                <button
                  class="btn btn-link p-0"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <MoreVertical :size="18"/>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <router-link :to="`/board/${board.id}`" class="dropdown-item">
                      <Eye :size="16" class="me-2"/>
                      {{ $t('myBoards.actions.view') }}
                    </router-link>
                  </li>
                  <li v-if="board.totalColumns > 0 && board.totalItems > 0">
                    <router-link :to="`/board/statistics/${board.id}`" class="dropdown-item">
                      <BarChart :size="16" class="me-2"/>
                      {{ $t('myBoards.actions.statistics') }}
                    </router-link>
                  </li>
                  <li>
                    <button class="dropdown-item text-danger" @click="removeBoard(board.id)">
                      <Trash2 :size="16" class="me-2"/>
                      {{ $t('myBoards.actions.delete') }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="d-flex align-items-center text-muted small">
              <Calendar :size="14" class="me-2"/>
              {{ formatDate(board.created_at) }}
              <Users :size="14" class="ms-3 me-2"/>
              {{ board.totalUsers || 0 }} {{ $t('myBoards.members') }}
            </div>
          </div>
        </div>
      </div>
    </div>


    <h1 class="h2 mb-0" v-if="boardsParticipating.length > 0">{{ $t('myBoards.titleParticipate') }}</h1>

    <div class="row g-4 py-5">
      <div v-for="board in boardsParticipating" :key="board.id" class="col-md-6 col-lg-4">
        <div class="card h-100 board-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h3 class="h5 mb-0">{{ board.name }}</h3>
              <div class="dropdown">
                <button
                  class="btn btn-link p-0"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <MoreVertical :size="18"/>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <router-link :to="`/board/${board.id}`" class="dropdown-item">
                      <Eye :size="16" class="me-2"/>
                      {{ $t('myBoards.actions.view') }}
                    </router-link>
                  </li>
                  <li v-if="board.totalColumns > 0 && board.totalItems > 0">
                    <router-link :to="`/board/statistics/${board.id}`" class="dropdown-item">
                      <BarChart :size="16" class="me-2"/>
                      {{ $t('myBoards.actions.statistics') }}
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>

            <div class="d-flex align-items-center text-muted small">
              <Calendar :size="14" class="me-2"/>
              {{ formatDate(board.created_at) }}
              <Users :size="14" class="ms-3 me-2"/>
              {{ board.totalUsers || 0 }} {{ $t('myBoards.members') }}
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>

  <CreateBoardModal ref="createBoardModalComponent"></CreateBoardModal>

</template>
<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {Layout, MoreVertical, Eye, Trash2, Calendar, Users, BarChart} from 'lucide-vue-next';
import api from "@/utils/api";
import {useSwal} from "@/utils/swal";
import CreateBoardModal from "@/components/CreateBoardModal.vue";
import { useCloudFunctions } from '@/composables/useCloudFunctions'
const { callFunction } = useCloudFunctions()

const Swal = useSwal();

const boards = ref([]);
const boardsParticipating = ref([]);
const showSpinner = ref(false);

const createBoardModalComponent = ref(null);

const openCreateBoardModal = () => {
  createBoardModalComponent.value?.showTemplateModal()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const removeBoard = async (idBoard: string) => {
  Swal.fire({
    title: "Tem certeza que deseja remover este board?",
    icon: "question",
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: "Sim",
    denyButtonText: `Não`
  }).then(async (result) => {
    if (result.isConfirmed) {
      await callFunction('removeBoard', {
        boardId: idBoard
      }).then((result: any) => {
        if (result.success) {
          setTimeout(() => {
            getBoards();
          }, 1000);
        } else {
          console.error('Erro ao remover board:', result);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Ocorreu um erro ao remover o board. Tente novamente.",
          });
        }
      }).catch((error: any) => {
        console.error('Erro ao remover board: ' + error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Ocorreu um erro ao remover o board. Tente novamente.",
        });
      });
    }
  });
};

const getBoards = async () => {
  try {
    showSpinner.value = true;
    api.get('/my-boards')
      .then((response) => {
        console.log(response);
        boards.value = response.data.map((b: any) => ({'id': b.objectId, ...b}));
        showSpinner.value = false;
      })
      .catch((error) => {
        showSpinner.value = false;
        console.log(error);
        return Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Ocorreu um erro ao enviar o código de autorização. Tente novamente.",
        });
      });
  } catch (error: unknown | any) {
    console.log('Failed to create new object, with error code: ' + error.message);
  }
};


const getBoardsParticipating = async () => {
  try {
    // showSpinner.value = true;
    api.get('/boards/participating')
      .then((response) => {
        console.log(response);
        boardsParticipating.value = response.data.map((b: any) => ({'id': b.objectId, ...b}));
        // showSpinner.value = false;
      })
      .catch((error) => {
        // showSpinner.value = false;
        console.log(error);
      });
  } catch (error: unknown | any) {
    console.log('Failed to create new object, with error code: ' + error.message);
  }
};

// Lifecycle hook
onMounted(async () => {
  // await getBoards();
  // await getBoardsParticipating()
  await Promise.all([getBoards(), getBoardsParticipating()])
});
</script>
<style scoped>
</style>
