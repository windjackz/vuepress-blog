<template>
  <div class="is-typed">
    <slot />
    <span class="typed">{{ typeValue }}</span>
    <span :class="caret + ' ' + { typing: typeStatus }">&nbsp;</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
export default defineComponent({
  name: "VueWriter",
  props: {
    array: {
      type: Array,
      required: true,
    },
    eraseSpeed: {
      type: Number,
      default: 100,
    },
    typeSpeed: {
      type: Number,
      default: 200,
    },
    delay: {
      type: Number,
      default: 2000,
    },
    intervals: {
      type: Number,
      default: 500,
    },
    start: {
      type: Number,
      default: 0,
    },
    caret: {
      type: String,
      default: "cursor",
    },
    iterations: {
      type: Number,
      default: 0,
    },
  },
setup(props, ctx) {
    const typeValue = ref("");
    const count = ref(0);
    const typeStatus = ref(false);
    const arrayIndex = ref(0);
    const charIndex = ref(0);
    const typewriter = () => {
        let loop = 0;
        if (charIndex.value < (props.array[arrayIndex.value] as string).length) {
            if (!typeStatus.value) {
            typeStatus.value = true;
            }
            typeValue.value += (props.array[arrayIndex.value] as string).charAt(charIndex.value);
            charIndex.value += 1;
            setTimeout(typewriter, props.typeSpeed);
        } else {
            count.value += 1;
            onTyped(props.array[arrayIndex.value]);
            if (count.value === props.array.length) {
            loop += 1;
            if (loop === props.iterations) {
                return (typeStatus.value = false);
            }
            }
            typeStatus.value = false;
            setTimeout(eraser, props.delay);
        }
    };
    const eraser = () => {
        if (charIndex.value > 0) {
        if (!typeStatus.value) typeStatus.value = true;
            typeValue.value = (props.array[arrayIndex.value] as string).substring(
                0,
                charIndex.value - 1
            );
            charIndex.value -= 1;
            setTimeout(eraser, props.eraseSpeed);
        } else {
            typeStatus.value = false;
            arrayIndex.value += 1;
            if (arrayIndex.value >= props.array.length) arrayIndex.value = 0;
            setTimeout(typewriter, props.typeSpeed + props.intervals);
        }
    };
    const onTyped = (typedString) => {
        ctx.emit("typed", typedString);
    };
    watch(() => props.array, () => {
        typeValue.value = "";
        count.value = 0;
        typeStatus.value = false;
        arrayIndex.value = 0;
        charIndex.value = 0;
        setTimeout(typewriter, props.start);
    });

    onMounted(() => {
        setTimeout(typewriter, props.start);
    });

    return {
        typeValue,
        count,
        typeStatus,
        arrayIndex,
        charIndex,
    }
  },
});
</script>