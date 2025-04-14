<script setup lang="ts">
import { computed, ref, inject } from 'vue';
import { Dropdown, Menu, MenuItem, SubMenu } from 'ant-design-vue';


export type MenuItemProps = {
  key: string;// 唯一标识
  name: string;// 菜单名称
  hide?: boolean; // 隐藏该选项
  disabled?: boolean; // 禁用该选项
  permission?: string;// 菜单的权限
  noAuth?: boolean;// 不需要授权
  children?: MenuItemProps[];// 子菜单菜单，目前只支持一级子菜单
}

export interface Props {
  value?: string[];
  menuItems: MenuItemProps[];
  adminFlag?: boolean;// 是否开启管理员权限
  disabledKeys?: string[];// 业务控制是否禁用
  destroyPopupOnHide?: boolean;// 关闭后是否销毁 Dropdown
  trigger?: Array<'click' | 'hover' | 'contextmenu'>;// 触发下拉的行为
  menuStyle: {[key: string]: string}; // 菜单根元素样式
}

const props = withDefaults(defineProps<Props>(), {
  menuItems: () => [],
  disabledKeys: () => [],
  destroyPopupOnHide: true,
  trigger: () => ['hover'],
  menuStyle: () => ({})
});

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'click', data: MenuItemProps): void;
  (e: 'visibleChange', visible: boolean): void;
}>();

const isAdmin = inject('isAdmin', ref(false));

const loading = ref(false);
const loaded = ref(false);// 已经加载过权限集合，dropdown下来列表打开时不用再次加载权限集合
const visibleFlag = ref(false);// dropdown是否展开
const noAuthFlag = ref(false);// 是否不需要权限控制
const ownedPermissions = ref<string[]>([]);// 拥有的权限
let controller: AbortController;// 用于终止请求的实例

const visibleChange = (visible: boolean) => {
  visibleFlag.value = visible;
  emit('visibleChange', visible);

  if (!visible || loaded.value || loading.value) {
    return;
  }
};

const click = ({ key }) => {
  emit('click', dataMap.value[key]);
};


const dropdownMenuItems = computed(() => {
  return props.menuItems?.filter(item => !item.hide) || [];
});

const dataMap = computed<{ [key: string]: MenuItemProps }>(() => {
  return dropdownMenuItems.value?.reduce((prev, cur) => {
    prev[cur.key] = cur;
    if (cur.children?.length) {
      cur.children.every(item => {
        prev[item.key] = item;
        return true;
      });
    }
    return prev;
  }, {}) || {};
});


// const authDisabledSet = computed<Set<string>>(() => {
//   const set = new Set<string>();
//   const _noAuthFlag = noAuthFlag.value;
//   const menuItems = dropdownMenuItems.value;
//   for (let i = 0, len = menuItems.length; i < len; i++) {
//     const menu = menuItems[i];
//     if (_noAuthFlag) {
//       if (menu.disabled) {
//         set.add(menu.key);
//       }

//       const children = menu.children;
//       if (children?.length) {
//         for (let j = 0, _len = children.length; j < _len; j++) {
//           const _menu = children[j];
//           if (_menu.disabled) {
//             set.add(_menu.key);
//           }
//         }
//       }
//     } else {
//       if (menu.disabled || (!menu.noAuth && !ownedPermissions.value.includes(menu.permission))) {
//         set.add(menu.key);
//       }

//       const children = menu.children;
//       if (children?.length) {
//         for (let j = 0, _len = children.length; j < _len; j++) {
//           const _menu = children[j];
//           if (_menu.disabled || (!_menu.noAuth && !ownedPermissions.value.includes(_menu.permission))) {
//             set.add(_menu.key);
//           }
//         }
//       }
//     }
//   }

//   return set;
// });

const businessDisabledSet = computed<Set<string>>(() => {
  if (!props.disabledKeys?.length) {
    return new Set();
  }

  return props.disabledKeys.reduce((prev, cur) => {
    prev.add(cur);
    return prev;
  }, new Set<string>());
});

const childHasIconSet = computed<Set<string>>(() => {
  const set = new Set<string>();
  const menuItems = dropdownMenuItems.value;
  for (let i = 0, len = menuItems.length; i < len; i++) {
    const menu = menuItems[i];
  }

  return set;
});
</script>
<template>
  <Dropdown
    :trigger="props.trigger"
    :destroyPopupOnHide="props.destroyPopupOnHide"
    @visibleChange="visibleChange">
    <template #overlay>
      <Menu
        :selectedKeys="props.value"
        mode="vertical"
        :style="props.menuStyle"
        @click="click">
        <template v-for="item in dropdownMenuItems" :key="item.key">
          <template v-if="!!item.children?.length">
            <SubMenu :key="item.key" :disabled="businessDisabledSet.has(item.key)">
              <template #title>
                <span class="inline-block leading-4 transform-gpu translate-y-0.25">
                  {{ item.name }}
                </span>
              </template>
              <MenuItem
                v-for="child in item.children"
                :key="child.key"
                :disabled="businessDisabledSet.has(item.key)">
                <span class="inline-block leading-4 transform-gpu translate-y-0.25">
                  {{ child.name }}
                </span>
              </MenuItem>
            </SubMenu>
          </template>
          <template v-else>
            <MenuItem :key="item.key" :disabled="businessDisabledSet.has(item.key)">
              <span class="inline-block leading-4 transform-gpu translate-y-0.25">
                {{ item.name }}
              </span>
            </MenuItem>
          </template>
        </template>
      </Menu>
    </template>
    <template #default>
      <slot name="default"></slot>
    </template>
  </Dropdown>
</template>
