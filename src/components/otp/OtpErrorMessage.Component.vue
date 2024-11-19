<template>
  <div v-show="hasError" name="otp-error-message">
    {{ displayMessage }}
    <slot />
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "otp-error-message",

  props: {
    message: String,
    hasError: Boolean,
  },

  computed: {
    displayMessage() {
      return this.message ? this.message : "";
    },
  },
});
</script>
