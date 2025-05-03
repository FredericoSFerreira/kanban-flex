import Swal from 'sweetalert2';

// Função principal para uso com Composition API
export function useSwal() {
  return Swal;
}

// Exportação direta para uso em arquivos não-Vue
export const swal = Swal;
