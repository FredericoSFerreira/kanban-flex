<script>
export default {
  data() {
    return {
    }
  },
  methods: {
    newBoard() {
      console.log("New Board")
    }
  },
  mounted() {
  }
}
</script>

<template>
  <main>
  
    <section class="py-5 text-center container">
      <div class="row py-lg-5">
        <div class="col-lg-6 col-md-8 mx-auto">
          <h1 class="fw-light">Gerencie as retrospectivas de suas sprints</h1>
          <p class="lead text-muted">Colabore com sua equipe remota e melhore o que é feito utilizando uma ferramenta simples e intuitiva.</p>
          <p>
            <a href="#" class="btn btn-primary my-2 btn-lg" @click="newBoard()">Criar novo Board</a>
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
