<template>
  <!-- Navbar Fixa no Topo -->
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid px-3">
      <a class="navbar-brand" href="/">
        <i class="bi bi-layout-three-columns"></i>
        <strong> Open Sprint Retro</strong></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
              aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link active" href="/">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/my-boards">Meus Boards</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" target="_blank" href="https://stats.uptimerobot.com/aeBUanxj9O">Status</a>
          </li>
<!--          <li class="nav-item dropdown">-->
<!--            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown"-->
<!--               aria-expanded="false">-->
<!--              <i class="fas fa-user"></i> Frederico Ferreira-->
<!--            </a>-->
<!--            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">-->
<!--              <li><a class="dropdown-item" href="#">Sair</a></li>-->
<!--            </ul>-->
<!--          </li>-->
        </ul>
      </div>
    </div>
  </nav>
  <RouterView/>

  <!-- Rodapé Fixo -->
  <footer class="text-center py-3 fixed-bottom">
    <p class="mb-0">© 2024 Open Sprint Retro. Licensed under MIT License. Create by <a
      href="https://github.com/FredericoSFerreira/Open-Sprint-Retro" class=""><i class="bi bi-github"></i> Frederico Ferreira </a></p>
  </footer>

</template>


<style>
/* Estilo claro padrão */
body {
  //background-color: #f8f9fa; /* fundo claro */
  color: #212529; /* texto escuro */
}

.navbar {
  background-color: #212529; /* fundo branco para a navbar */
  border-bottom: 1px solid #dee2e6; /* linha de separação da navbar */
}

.navbar-brand, .nav-link {
  color: #ffffff !important; /* texto escuro para o menu */
}

.navbar-nav .nav-link:hover {
  color: #0056b3 !important; /* cor do texto ao passar o mouse */
}

.icon {
  font-size: 60px;
  color: #007bff; /* cor do ícone */
}

.btn-primary {
  background-color: #007bff; /* cor do botão */
  border-color: #007bff; /* borda do botão */
}

.btn-primary:hover {
  background-color: #0056b3; /* cor do botão ao passar o mouse */
  border-color: #004085; /* borda ao passar o mouse */
}

footer {
  background-color: #ffffff; /* fundo branco para o rodapé */
  border-top: 1px solid #dee2e6; /* linha de separação do rodapé */
  color: #212529; /* texto escuro no rodapé */
}


</style>
<script setup>
</script>
