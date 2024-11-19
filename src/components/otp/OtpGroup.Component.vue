<template>
  <div name="otp-group" ref="otpGroup">
    <slot :focus-next="focusNext" :focus-prev="focusPrev" />
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "otp-group",

  methods: {
    focusNext(index) {
      if (this.$refs.otpGroup?.children[index + 1]) {
        this.$refs.otpGroup.children[index + 1]?.focus();
      }
    },

    focusPrev(index) {
      if (index > 0) {
        this.$refs.otpGroup.children[index - 1]?.focus();
      }
    },
  },
});
</script>
