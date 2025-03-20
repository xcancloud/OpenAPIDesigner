<script setup lang="ts">
export interface Props {
  open: boolean;
  type?: 'solid'|'dashed',
  style?: Record<string, string> | string | undefined;

}
const props = withDefaults(defineProps<Props>(), {
  open: false,
  type: 'solid',
  style: undefined
});

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'update:open', val: boolean),
  (e: 'change', val: boolean),
}>();
const toggle = () => {
  emit('update:open', !props.open);
  emit('change', !props.open);
};
</script>
<template>
  <svg
    :style="style"
    :class="{ 'open': props.open }"
    class="arrow-icon inline-block text-theme-sub-content cursor-pointer"
    aria-hidden="true"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    @click.stop="toggle">
    <path v-if="props.type==='solid'" d="M732.130743 534.849829L369.3568 825.05142901A29.257143 29.257143 0 0 1 321.828571 802.230857L321.828571 221.769143a29.257143 29.257143 0 0 1 47.542858-22.8352l362.759314 290.2016a29.257143 29.257143 0 0 1 0 45.699657z"></path>
    <path
      v-else
      d="M265.16853874 99.92627655a49.93219015 49.93219015 0 0 1 70.52089685-3.69498226L756.23498752 474.88373874a49.83232626 49.83232626 0 0 1 16.47762318 39.18012529 49.83232626 49.83232626 0 0 1-16.47762318 39.19676986L335.68943559 931.91307834a49.93219015 49.93219015 0 1 1-66.80927118-74.19923571l381.63173148-343.63333517-381.6483749-343.63333405a49.93219015 49.93219015 0 0 1-3.67833884-70.52089686z"
      p-id="12875"></path>
  </svg>
</template>
<style scoped>
.arrow-icon {
  flex-grow: 0;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  overflow: hidden;
  transform: rotate(0deg);
  transition: all 200ms linear;
  outline: none;
  fill: currentcolor;
  font-size: 16px;
  line-height: 16px;
}

.arrow-icon:focus {
  outline: none;
}

.open.arrow-icon {
  transform: rotate(90deg);
}
</style>
