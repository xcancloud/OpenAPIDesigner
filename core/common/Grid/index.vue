<script setup lang="ts">
import { computed } from 'vue';

import IconRequired from '../Icons/IconRequired/index.vue';
// import Colon from '../Colon/index.vue';

export interface Column{
  dataIndex:string; // 列数据在数据项中对应的key
  label:string; // 数据label
  text?:any; // 展示数据，内部自动组装
  width?:string; // label的宽度
  customRender?:({ text, record })=>string;// 生成复杂数据的渲染函数，参数分别为当前行的值，当前行数据，行索引
  hide?:boolean; // 是否隐藏该选项
  ellipsis?:boolean; // 超过宽度将自动省略
  colon?:boolean; // 是否显示冒号
  required?:boolean; // 是否显示必选符号
  divide?: boolean;// 一行中只有一列时，宽度是否与其他列一样平分
  offset?: boolean;// value列是否偏移，一般value的插槽为input，select组件时，高度和label不对齐，会自动偏移
  fullWidthContent?: boolean; // label 为空时content 占用一整行
}

export interface Props {
  columns: Column[][]; // 列配置项，一维或二维数组，一维数组单列，二维数组多列
  dataSource?: {[key:string]:any;}; // 数据数组
  marginBottom?: string | number; // 行内样式
  fontSize?: string;
  spacing?: number; // 列间距
  labelSpacing?: string | number; // label与value的间距
  nowrap?: boolean; // 禁止value换行
  colon?:boolean; // 所有的label是否显示冒号
  labelStyle?: Record<string, string>|string; // label的行内样式
  labelClass?: string; // label 的class
  valueStyle?: Record<string, string>|string; // value
  valueClass?: string; // value 的class
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: undefined,
  columns: undefined,
  marginBottom: undefined,
  fontSize: '12px',
  spacing: 32,
  labelSpacing: '8px',
  nowrap: false,
  colon: true,
  labelStyle: undefined, // label的行内样式
  labelClass: undefined, // label 的class
  valueStyle: undefined, // value
  valueClass: undefined // value 的class
});

const metaData = computed(():Column[][] => {
  const result = [[]];
  const dataSource = props.dataSource || {};

  const dataList = props.columns.reduce((prev, curv) => {
    prev[prev.length] = [];
    curv.every(item => {
      if (!item.hide) {
        prev[prev.length - 1].push(item);
      }

      return true;
    });

    return prev;
  }, [] as Column[][]);

  // 每列label的最大宽度
  const widthList = getMaxWidth(dataList, props.fontSize);

  const rowLen = Math.max(...dataList.map(item => item.length));
  for (let i = 0; i < rowLen; i++) {
    result[i] = [];

    for (let j = 0, colLen = dataList.length; j < colLen; j++) {
      const data = dataList[j][i];

      if (data && (!data.hide)) {
        result[i].push({
          ...data,
          // eslint-disable-next-line no-prototype-builtins
          colon: data.hasOwnProperty('colon') ? data.colon : props.colon,
          text: dataSource[data.dataIndex],
          width: (widthList[j] + 8) + 'px'
        });
      }
    }
  }

  return result;
});

const rowStyle = computed(() => {
  const style:{
    transform:string;
    fontSize?:string;
    marginBottom?:string;
  } = {
    transform: 'translateX(-8px)'
  };

  if (props.fontSize) {
    style.fontSize = props.fontSize + 'px';
  }

  if (props.marginBottom) {
    style.marginBottom = props.marginBottom + 'px';
  }

  return style;
});

const colStyleMap = computed(():{[key:string]:{[key:string]:string}} => {
  const spacing = +(props.spacing + '').replace(/px/, '');

  const colLen = metaData.value[0].length;

  return metaData.value.reduce((prev, cur, index) => {
    if (cur.length === 1) {
      if (!cur[0].divide) {
        prev[index] = { flex: '1 1 100%' };
      } else {
        prev[index] = {
          flex: `0 0 calc(100%/${colLen})`,
          paddingRight: spacing + 'px !important'
        };
      }
    } else {
      prev[index] = {
        flex: `0 0 calc(100%/${colLen})`,
        paddingRight: spacing + 'px'
      };
    }

    return prev;
  }, {});
});

const labelStyleMap = computed(():{[key:string]:{[key:string]:string}} => {
  const marginRight = props.labelSpacing;
  const labelStyle = props.labelStyle;

  return metaData.value.reduce((prev, cur) => {
    for (let i = 0, len = cur.length; i < len; i++) {
      const { dataIndex, width } = cur[i];
      prev[dataIndex] = { width };

      if (typeof marginRight === 'number') {
        prev[dataIndex].marginRight = marginRight + 'px';
      } else if (typeof marginRight === 'string') {
        prev[dataIndex].marginRight = marginRight.replace(/px/, '') + 'px';
      }

      let _labelStyle = labelStyle;
      if (typeof labelStyle === 'string') {
        _labelStyle = {};
        const styleArray = labelStyle.split(';');
        styleArray.forEach(pair => {
          if (pair.trim() !== '') {
            const [key, value] = pair.split(':');
            _labelStyle[key.trim()] = value.trim();
          }
        });
      }

      prev[dataIndex] = { ...prev[dataIndex], ...(_labelStyle as {[key:string]:string}) };
    }

    return prev;
  }, {});
});

const valueStyleMap = computed(() => {
  const nowrap = props.nowrap;
  const valueStyle = props.valueStyle;

  return metaData.value.reduce((prev, cur) => {
    for (let i = 0, len = cur.length; i < len; i++) {
      const { dataIndex, offset, ellipsis } = cur[i];
      prev[dataIndex] = { };

      if (offset) {
        prev[dataIndex].transform = 'translateY(-6px)';
      }

      if (nowrap || ellipsis) {
        prev[dataIndex].overflow = 'hidden';
        prev[dataIndex].textOverflow = 'ellipsis';
        prev[dataIndex].whiteSpace = 'nowrap';
      } else {
        prev[dataIndex].whiteSpace = 'pre-wrap';
        prev[dataIndex].wordWrap = 'break-word';
        prev[dataIndex].wordBreak = 'break-all';
      }

      let _valueStyle = valueStyle;
      if (typeof valueStyle === 'string') {
        _valueStyle = {};
        const styleArray = valueStyle.split(';');
        styleArray.forEach(pair => {
          if (pair.trim() !== '') {
            const [key, value] = pair.split(':');
            _valueStyle[key.trim()] = value.trim();
          }
        });
      }

      prev[dataIndex] = { ...prev[dataIndex], ...(_valueStyle as {[key:string]:string}) };
    }

    return prev;
  }, {});
});

const getMaxWidth = (strs: Column[][], fontSize = '14px'): number[] => {
  const widthList: number[] = [];
  const domList: HTMLElement[] = [];
  for (let i = 0, len = strs.length; i < len; i++) {
    widthList[i] = 0;
    for (let j = 0, length = strs[i].length; j < length; j++) {
      const ghostDom = document.createElement('span');
      ghostDom.innerHTML = '<em style="margin-right:2px;font-family:SimSun,sans-serif;font-size:12px;font-style:normal;line-height:1;">*</em>' + strs[i][j].label;
      ghostDom.setAttribute('style', 'position:absolute;z-index:-999999;color:transparent;background:transparent;padding:0;' + 'font-size:' + fontSize + ';');
      document.body.appendChild(ghostDom);
      domList.push(ghostDom);
      if (widthList[i] < ghostDom.offsetWidth) {
        widthList[i] = ghostDom.offsetWidth;
      }
    }
  }

  domList.every(item => {
    document.body.removeChild(item);
    return true;
  });
  return widthList;
};

</script>

<template>
  <div class="text-3 leading-4.5">
    <template v-for="(item, _index) in metaData" :key="_index">
      <template v-for="ele in item" :key="ele.dataIndex">
        <slot :name="ele.dataIndex+'before'"></slot>
      </template>

      <div :style="rowStyle" class="flex justify-start text-theme-content mb-2 last:!mb-0">
        <div
          v-for="ele in item"
          :key="ele.dataIndex"
          :style="colStyleMap[_index]"
          class="flex justify-start items-start last:!pr-0 min-w-0">
          <div
            v-cloak
            v-if="ele.label || !ele.fullWidthContent"
            :style="labelStyleMap[ele.dataIndex]"
            :class="props.labelClass"
            class="relative flex items-center whitespace-nowrap flex-shrink-0 flex-grow-0 basis-auto min-h-7">
            <IconRequired :style="{visibility:ele.required?'visible':'hidden'}" class="text-3.5" />
            <span>{{ ele.label }}</span>
            <slot :name="ele.dataIndex+'Label'"></slot>
            <span v-if="ele.colon" class="w-1" >:</span>
          </div>

          <div
            v-cloak
            class="relative flex-shrink flex-grow basis-0 pt-1.25 min-h-7"
            :class="props.valueClass"
            :style="valueStyleMap[ele.dataIndex]">
            <slot
              :text="ele.text"
              :record="ele"
              :name="ele.dataIndex">
              {{ ele.customRender ? ele.customRender({ text: ele.text, record: ele }) : (ele.text || '--') }}
            </slot>
          </div>
        </div>
      </div>

      <template v-for="ele in item" :key="ele.dataIndex">
        <slot :name="ele.dataIndex+'after'"></slot>
      </template>
    </template>
  </div>
</template>
<style scoped>
.colon {
  font-size: 12px;
  font-style: normal;
}

.is-wrap {
  @apply whitespace-pre-wrap break-words break-all;
}

.no-wrap {
  @apply whitespace-nowrap;
}

.ellipsis {
  @apply truncate;
}

[v-cloak] {
  display: none;
}
</style>
