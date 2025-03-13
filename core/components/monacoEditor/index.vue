<script setup lang='ts'>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch } from 'vue';

import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

const editorRef = ref();

interface Props {
  value: string|undefined,
  theme?: 'vs' | 'vs-dark',
  language?: 'json' | 'html' | 'typescript' | 'text' | 'yaml',
  notifyClear?: number,
  isFormat?: boolean, // 是否执行格式化
  isClear?: boolean, // 是否执行清空
  readOnly?: boolean, // 是否只读模式
  searchText?: string, // 检索文本
  isExcuteSearch?: boolean // 是否切换当前检索项的下标
  loading?:boolean;// 编辑器资源是否已经加载完成
}
const props = withDefaults(defineProps<Props>(), {
  theme: 'vs',
  language: 'yaml',
  isFormat: false,
  isClear: false,
  readOnly: false,
  searchText: '',
  isExcuteSearch: false,
  notifyClear: 0,
  loading: false
});

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: 'update:value', val: string):void;
  (e: 'change', val: string):void;
  (e: 'update:loading', val: boolean):void;
}>();

const state = reactive<{
  editorInstace: monaco.editor.IStandaloneCodeEditor | null,
  allMatches: Array<monaco.Range>, // 所有检索出的匹配项
  matchIndex: number // 当前所在检索项的下标
}>({
  editorInstace: null,
  allMatches: [],
  matchIndex: 0
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
self.MonacoEnvironment = {
  getWorker (_, label) {
    if (label === 'json') {
      return new JsonWorker();
    }
    if (label === 'html') {
      return new HtmlWorker();
    }
    if (label === 'javascript' || label === 'typescript') {
      return new TsWorker();
    }
    return new EditorWorker();
  }
};

const create = () => {
  state.editorInstace = monaco.editor.create(editorRef.value, {
    value: props.value,
    language: props.language,
    theme: props.theme,
    readOnly: props.readOnly, // 是否只读模式
    minimap: { // mini地图
      enabled: false // 是否显示mini地图
    },
    scrollbar: { // 滚动条
      verticalSliderSize: 7, // 纵向滑块的宽度
      horizontalSliderSize: 7, // 横向滑块的宽度
      verticalScrollbarSize: 7, // 纵向滚动条宽度
      horizontalScrollbarSize: 7, // 横向滚动条宽度
      arrowSize: 11,
      useShadows: true,
      scrollByPage: false,
      vertical: 'auto',
      horizontal: 'auto',
      verticalHasArrows: false,
      horizontalHasArrows: false
    },
    folding: true, // 是否可折叠
    automaticLayout: true, // 根据 div 调整自身大小
    contextmenu: true, // 禁用右键菜单
    renderLineHighlight: 'none', // 当前选中行样式
    cursorSmoothCaretAnimation: 'on', // 光标是否平滑移动
    trimAutoWhitespace: true, // 控制内容后面的空白行
    fontSize: 12, // 字体大小
    wordBreak: 'normal',
    wordWrap: 'on',
    smoothScrolling: false,
    mouseWheelScrollSensitivity: 1.5,
    scrollBeyondLastLine: true
  });
  state.editorInstace.onDidChangeModelContent(() => {
    // 这里必须使用 toRaw 转换成原始对象再获取值, 否则会造成页面卡死!
    const value = toRaw(state.editorInstace)?.getValue();
    emit('update:value', value || '');
    emit('change', value || '');
  });
  // 实例化完成后自动格式化
  formatDocument();
};

const clearValue = () => {
  if (state.editorInstace && props.value) {
    toRaw(state.editorInstace).setValue(props.value);
  }
};

const setValue = () => {
  if (state.editorInstace) {
    toRaw(state.editorInstace).setValue(props.value || '');
  }
};
const changeLanguage = () => {
  if (state.editorInstace) {
    const model = toRaw(state.editorInstace).getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, props.language);
    }
  }
};
const changeTheme = () => {
  monaco.editor.setTheme(props.theme);
};
const changeReadOnly = () => {
  toRaw(state.editorInstace)?.updateOptions({ readOnly: props.readOnly });
};
const formatDocument = () => {
  if (props.isFormat && state.editorInstace) {
    toRaw(state.editorInstace)?.getAction('editor.action.formatDocument')?.run();
  }
};
const findAllMatches = () => {
  state.allMatches = [];
  state.matchIndex = 0;
  if (props.searchText) {
    const data = toRaw(state.editorInstace)?.getModel()?.findMatches(props.searchText, false, false, false, null, false);
    (data || []).forEach((item, index) => {
      const { startLineNumber, endLineNumber, startColumn, endColumn } = item.range;
      const range = new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
      state.allMatches.push(range);
      if (index === 0) {
        toRaw(state.editorInstace)?.setSelection(range);
        toRaw(state.editorInstace)?.revealRangeInCenter(range);
      }
    });
  }
};
const gotoMatch = () => {
  if (props.isExcuteSearch && state.allMatches.length > 0) {
    if (state.matchIndex >= state.allMatches.length - 1) {
      state.matchIndex = 0;
    } else {
      state.matchIndex++;
    }
    const range = state.allMatches[state.matchIndex];
    toRaw(state.editorInstace)?.setSelection(range);
    toRaw(state.editorInstace)?.revealRangeInCenter(range);
  }
};
const destroy = () => {
  if (state.editorInstace) {
    // 这里必须使用 toRaw 转换成原始对象调用销毁方法, 否则会造成页面卡死
    toRaw(state.editorInstace).dispose();
    state.editorInstace = null;
  }
};

watch(() => props.notifyClear, () => {
  clearValue();
});

watch(() => props.isClear, () => {
  clearValue();
});

watch(() => props.language, () => {
  changeLanguage();
  // 切换语言数据会改变，重新设置数据
  clearValue();
});

watch(() => props.theme, () => {
  changeTheme();
});

watch(() => props.isFormat, () => {
  formatDocument();
});

watch(() => props.readOnly, () => {
  changeReadOnly();
});

watch(() => props.searchText, () => {
  findAllMatches();
});

watch(() => props.isExcuteSearch, () => {
  gotoMatch();
});

watch(() => props.value, (newValue) => {
  const refValue = toRaw(state.editorInstace)?.getValue();
  if (refValue && newValue && (newValue.replace(' ', '') === refValue.replace(' ', ''))) {
    return;
  }
  if (newValue !== refValue) {
    setValue();
  }
});

onMounted(() => {
  create();
  nextTick(() => {
    emit('update:loading', false);
  });
});

onBeforeUnmount(() => {
  destroy();
});

defineExpose({
  format: () => {
    if (state.editorInstace) {
      toRaw(state.editorInstace).getAction('editor.action.formatDocument')?.run();
    }
  }
});
</script>

<template>
  <div>
    <div ref="editorRef" class="h-full w-full"></div>
  </div>
</template>
