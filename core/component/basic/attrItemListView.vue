<template>
  <div>
    <li
      v-for="(attr, idx) in dataSource"
      :key="idx"
      class="list-none"
      :class="{'attr-item-wrap': idx + 1 < dataSource.length && !$props.withoutBorder, 'pt-4 ml-3 pl-3 ': !$props.isRoot}">
      <div
        class="relative leading-7 flex items-center justify-between "
        :class="{'attr-item-last': !$props.isRoot && idx + 1 === dataSource.length && !$props.withoutBorder, 'attr-item': !$props.isRoot && !$props.withoutBorder}">
        <div class="pl-1">
          <Arrow
            v-if="attr.children?.length"
            v-model:open="attr.open" />
          <span>{{ attr.name }}<IconRequired v-if="attr.required" /></span>
          <span class="ml-2 hover:underline cursor-pointer" :class="[typeColor[attr.type]]">{{ attr.showType || attr.type }}</span>
          <span v-if="attr.type === 'object'"> {{ ` {${attr.children?.length || 0}\}` }} </span>
          <span v-if="attr.format">{{ `<${attr.format}>` }}</span>
          <span v-if="attr.$ref" class="text-status-warn hover:underline cursor-pointer">$ref</span>
        </div>
      
      </div>
      <AttrItemListView
        v-if="attr.children"
        v-show="attr.open"
        :dataSource="attr.children"
        :parentType="attr.type"
        @add="addChild"
        @del="delSelf"
        @edit="editSelf" />
    </li>
  </div>
</template>
<script>
import { defineComponent, ref, inject, computed } from 'vue';
import IconRequired from '@/common/Icons/IconRequired/index.vue';
import Arrow from '@/common/Arrow/index.vue';
import { Button, Popover } from 'ant-design-vue';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  name: 'AttrItemListView',
  components: { Arrow, Popover, Button, IconRequired, EditOutlined, PlusOutlined, DeleteOutlined },
  props: {
    dataSource: {
      type: Array,
      default: () => ([])
    },
    parentType: {
      type: String,
      default: null
    },
    isRoot: {
      type: Boolean,
      default: false
    },
    withoutBorder: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      typeColor: {
        string: 'text-status-success',
        number: 'text-status-pink',
        integer: 'text-status-blue-light',
        object: 'text-status-orange',
        array: 'text-status-purple',
        boolean: 'text-status-error1'
      },
    };
  }
});
</script>
<style scoped>

.attr-item-wrap {
  border-left: 1px solid #07F
}

.attr-item-last::before {
  content: '';
  display: inline-block;
  position: absolute;
  top: -17px;
  left: -12px;
  height: 32px;
  border-left: 1px solid #07F;
}

.attr-item::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 50%;
  left: -12px;
  width: 12px;
  border-top: 1px solid #07F;
}
</style>
