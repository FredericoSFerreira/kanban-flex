<template>
  <div name="otp">
    <slot
      :digits="digits"
      :is-valid="isValid"
      :on-blur="onBlur"
      :on-input="onInput"
      :on-paste="onPaste"
    />
    <slot name="error" :message="errorMessage" :hasError="error" />
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "otp-component",

  props: {
    modelValue: String,
    count: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      error: false,
      errorMessage: "",
      digits: Array(this.count).fill(""), // Initialize an array for digits
    };
  },

  computed: {
    isValid() {
      return this.digits.length === this.count;
    },
  },

  mounted() {
    if (this.modelValue) this.digits = this.modelValue?.split("");
  },

  methods: {
    onInput(index, digit) {
      switch (typeof digit) {
        case "string":
          this.digits[index] = digit;
          break;
        case "number":
          this.digits[index] = digit?.toString();
          break;
        default:
          this.digits[index] = digit?.data ? digit?.data : "";
          break;
      }

      this.$emit("update:modelValue", this.digits?.join(""));
    },

    onPaste(index, event) {
      event.preventDefault();
      const clipboardData = event?.clipboardData || window?.clipboardData;
      if (clipboardData) {
        const pastedText = clipboardData.getData("text").trim();

        const parsedPastedText = pastedText.replace(/\D/g, "");

        let newDigits = Array(this.count).fill("");

        if (this.digits.length <= parsedPastedText?.length) {
          this.errro = true;
          this.errorMessage = "Invalid characters in the pasted OTP.";
        }

        for (let i = 0; i < parsedPastedText.length; i++) {
          if (index + i < newDigits.length) {
            newDigits[index + i] = parsedPastedText[i];
          }
        }
        this.digits = newDigits;
        this.$emit("update:modelValue", this.digits?.join(""));
      } else {
        this.error = true;
        this.errorMessage = "Invalid characters in the pasted OTP.";
      }
    },

    onBlur() {
      this.checkDigits();
    },

    clearDigits() {
      this.error = false;
      this.digits.fill("");
      this.errorMessage = "";
    },

    checkDigits() {
      // Add your validation logic here
      if (!this.isValid) {
        this.errorMessage = "Please enter a valid OTP";
        this.error = true;
      } else {
        this.errorMessage = "";
        this.error = false;
      }
    },
  },
});
</script>
