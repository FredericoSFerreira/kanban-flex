<template>
  <input
    v-model="digit"
    type="text"
    :maxlength="1"
  />
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "otp-group-input",

  props: {
    value: String,
  },

  data() {
    return {
      digit: "",
    };
  },

  watch: {
    value() {
      this.setIntialValue();
    },

    digit(newValue, oldValue) {
      if (newValue !== oldValue) {
        if (newValue === "") {
          this.emitPrev();
        } else {
          this.emitNext();
        }
      }
    },
  },

  methods: {
    emitPrev() {
      this.$emit("prev");
    },
    emitNext() {
      this.$emit("next");
    },

    setIntialValue() {
      switch (typeof this.value) {
        case "string":
          this.digit = this.value;
          break;
        case "number":
          this.digit = this.value?.toString();
          break;

        default:
          this.digit = this.value?.data ? this.value?.data : "";
          break;
      }
    },
  },
});
</script>
