<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="{ common: { fontWeightStrong: '600' } }">
    <n-layout
      style="min-height: 90vh"
      content-style="display: flex; align-items: center; justify-content: center;"
    >
      <n-grid
        x-gap="18"
        y-gap="18"
        cols="1 l:2"
        style="width: 100%; max-width: 1400px; padding: 36px"
        responsive="screen"
      >
        <n-gi style="display: flex; flex-direction: column; justify-content: center">
          <n-h1 style="font-weight: 300; font-size: 2.5rem; margin-bottom: 24px">
            显示器如何展现颜色：RGB加色混合
          </n-h1>

          <n-space justify="space-between" align="center" style="margin-bottom: 48px">
            <n-text style="font-size: 1.5rem">自动变化</n-text>
            <n-switch v-model:value="isAuto" size="large" />
          </n-space>

          <n-space vertical size="large">
            <n-space vertical>
              <n-text strong style="font-size: 1.25rem; color: #ff0000">
                Red ~610nm (R): {{ r }}
              </n-text>
              <n-slider
                v-model:value="r"
                :min="0"
                :max="255"
                :step="1"
                :disabled="isAuto"
                :rail-style="rRail"
              />
            </n-space>

            <n-space vertical>
              <n-text strong style="font-size: 1.25rem; color: #00ff00">
                Green ~550nm (G): {{ g }}
              </n-text>
              <n-slider
                v-model:value="g"
                :min="0"
                :max="255"
                :step="1"
                :disabled="isAuto"
                :rail-style="gRail"
              />
            </n-space>

            <n-space vertical>
              <n-text strong style="font-size: 1.25rem; color: #0000ff">
                Blue ~465nm (B): {{ b }}
              </n-text>
              <n-slider
                v-model:value="b"
                :min="0"
                :max="255"
                :step="1"
                :disabled="isAuto"
                :rail-style="bRail"
              />
            </n-space>
          </n-space>

          <n-space vertical size="small" style="margin-top: 48px">
            <n-text strong style="font-size: 1.25rem">
              每个子像素的内部状态 (Sub-pixel Status)
            </n-text>

            <div class="pixel-container">
              <div class="sub-pixel" :style="rPixelStyle"></div>
              <div class="sub-pixel" :style="gPixelStyle"></div>
              <div class="sub-pixel" :style="bPixelStyle"></div>
            </div>

            <n-text depth="3" style="font-size: 0.875rem">
              * 每个子像素的亮度 (0-255) 对应上方滑块。
            </n-text>
          </n-space>
        </n-gi>

        <n-gi
          style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 400px;
          "
        >
          <div :style="colorBoxStyle"></div>

          <n-h2 style="font-weight: 300; font-size: 2rem; margin-top: 24px">
            {{ mixedColorRgb }}
          </n-h2>
          <n-code>
            <n-text style="font-size: 1.5rem; font-family: 'Courier New', monospace">
              “{{ colorName }}”
            </n-text>
          </n-code>
          <n-code>
            <n-text style="font-size: 1.75rem; font-family: 'Courier New', monospace">
              {{ mixedColorHex }}
            </n-text>
          </n-code>
          <n-code>
            <n-text style="font-size: 1.6rem; color: #ceff00">
              视锥细胞LWS响应 (~561nm长波):{{ (lmsResponse.L * 100).toFixed(1) }}
            </n-text>
            <br />
            <n-text style="font-size: 1.6rem; color: #00e200">
              视锥细胞MWS响应 (~530nm中波):{{ (lmsResponse.M * 100).toFixed(1) }}
            </n-text>
            <br />
            <n-text style="font-size: 1.6rem; color: #4800ff">
              视锥细胞SWS1响应 (~426nm短波):{{ (lmsResponse.S * 100).toFixed(1) }}
            </n-text>
          </n-code>
        </n-gi>
      </n-grid>
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import ntc from '../../ntc-chn.js' //必要时修改到自己的ntc-chn.js存放位置
import { ref, computed, watch, onMounted } from 'vue'
import {
  NConfigProvider,
  NLayout,
  NGrid,
  NGi,
  NSpace,
  NSlider,
  NSwitch,
  NH1,
  NH2,
  NText,
  NCode,
  darkTheme,
} from 'naive-ui'

// --- 1. 核心状态 ---
const r = ref(90)
const g = ref(120)
const b = ref(200)
const isAuto = ref(true)
const animationFrameId = ref(null)

// --- 2. 计算属性 (Computed) ---

// 混合后的 RGB 颜色字符串
const mixedColorRgb = computed(() => `RGB(${r.value}, ${g.value}, ${b.value})`)

// 辅助函数：将 0-255 的数字转为两位十六进制
const componentToHex = (c) => {
  const hex = Math.floor(c).toString(16) // 确保为整数
  return hex.length == 1 ? '0' + hex : hex
}

// 混合后的 HEX 颜色字符串
const mixedColorHex = computed(() => {
  return `#${componentToHex(r.value)}${componentToHex(g.value)}${componentToHex(b.value)}`.toUpperCase()
})

// 核心：创建 computed 属性来实现“响应式”
// 这个计算属性 'colorName' 依赖于 'colorHex'
const colorName = computed(() => {
  // 当 colorHex.value 发生变化时，这里的代码会自动重新执行

  const hex = mixedColorHex.value

  // (可选) 添加一些基本的验证
  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    return '非法的 Hex 格式'
  }

  // 调用 ntc.js 的 .name() 方法
  // ntc.name() 返回一个数组: [匹配的Hex, 颜色名, 是否精确匹配]
  // 我们需要的是索引为 [1] 的颜色名称
  try {
    const n_match = ntc.name(hex)
    const n_name = n_match[1] // 这就是响应式地生成的颜色名称
    return n_name
  } catch (e) {
    console.error('ntc.js a error:', e)
    return '名称计算错误'
  }
})

// 展示色块的动态样式
const colorBoxStyle = computed(() => ({
  width: '90%',
  paddingBottom: '70%',
  maxWidth: '500px',
  maxHeight: '500px',
  backgroundColor: mixedColorRgb.value,
  borderRadius: '24px',
  boxShadow: `0 0 60px -10px ${mixedColorRgb.value}`,
  transition: 'background-color 0.15s linear, box-shadow 0.15s linear',
}))

// --- 3. 样式定义 ---

// 定义三个滑块轨道的专属颜色
const rRail = { backgroundColor: 'rgba(232, 76, 76, 0.25)' }
const gRail = { backgroundColor: 'rgba(77, 232, 76, 0.25)' }
const bRail = { backgroundColor: 'rgba(76, 76, 232, 0.25)' }

// ==========================
// 新增：子像素的动态样式
// ==========================
const rPixelStyle = computed(() => ({
  backgroundColor: `rgb(${r.value}, 0, 0)`,
}))
const gPixelStyle = computed(() => ({
  backgroundColor: `rgb(0, ${g.value}, 0)`,
}))
const bPixelStyle = computed(() => ({
  backgroundColor: `rgb(0, 0, ${b.value})`,
}))
// ==========================
// 新增结束
// ==========================

// --- 4. 自动演示逻辑 ---

let startTime = 0
const rSpeed = 0.00037
const gSpeed = 0.00031
const bSpeed = 0.00041

let rPhase = 0
let gPhase = 0
let bPhase = 0

function animate() {
  if (!isAuto.value) return

  const timestamp = Date.now() - startTime

  r.value = Math.floor(127.5 + 127.5 * Math.sin(timestamp * rSpeed + rPhase))
  g.value = Math.floor(127.5 + 127.5 * Math.sin(timestamp * gSpeed + gPhase))
  b.value = Math.floor(127.5 + 127.5 * Math.sin(timestamp * bSpeed + bPhase))

  animationFrameId.value = requestAnimationFrame(animate)
}

watch(isAuto, (newValue) => {
  if (newValue) {
    startTime = Date.now()

    // Math.random() * (Math.PI * 2) 可以确保 sin 函数从一个周期的任意点开始
    rPhase = Math.random() * Math.PI * 2
    gPhase = Math.random() * Math.PI * 2
    bPhase = Math.random() * Math.PI * 2

    animate()
  } else {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  }
})

// --- 5. 页面加载时自动启动 ---
onMounted(() => {
  // 检查开关是否默认开启
  if (isAuto.value) {
    // --- 启动动画 (这段逻辑与 watch 中的启动逻辑完全一致) ---
    startTime = Date.now() // 重置起始时间

    // 生成随机相位
    rPhase = Math.random() * Math.PI * 2
    gPhase = Math.random() * Math.PI * 2
    bPhase = Math.random() * Math.PI * 2

    animate() // 开始循环
  }
})

function sRgbToLms(r, g, b) {
  // 步骤 1: 规范化 sRGB 值 (0-255) 到 (0.0 - 1.0)
  const r_s = r / 255.0
  const g_s = g / 255.0
  const b_s = b / 255.0

  // 步骤 2: 线性化 (Gamma 解码)
  // 这是精确的 sRGB 线性化公式
  const srgbToLinear = (c_srgb) => {
    if (c_srgb <= 0.04045) {
      return c_srgb / 12.92
    } else {
      return Math.pow((c_srgb + 0.055) / 1.055, 2.4)
    }
  }

  const r_lin = srgbToLinear(r_s)
  const g_lin = srgbToLinear(g_s)
  const b_lin = srgbToLinear(b_s)

  // 步骤 3: 线性 sRGB 转换为 CIE XYZ (sRGB D65 矩阵)
  const x = r_lin * 0.4124564 + g_lin * 0.3575761 + b_lin * 0.1804375
  const y = r_lin * 0.2126729 + g_lin * 0.7151522 + b_lin * 0.072175
  const z = r_lin * 0.0193339 + g_lin * 0.119192 + b_lin * 0.9503041

  // 步骤 4: CIE XYZ 转换为 LMS (CAT02 矩阵)
  const l = x * 0.7328 + y * 0.4296 - z * 0.1624
  const m = x * -0.7036 + y * 1.6975 + z * 0.0061
  const s = x * 0.003 + y * 0.0136 + z * 0.9834

  return {
    L: l,
    M: m,
    S: s,
  }
}

const lmsResponse = computed(() => {
  // 在 computed 内部，我们使用 .value 来访问 ref 的当前值
  return sRgbToLms(r.value, g.value, b.value)
})
</script>

<style>
body,
html {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #101014;
  color: #fff;
}

/* ========================== */
/* 新增：模拟像素的 CSS 样式 */
/* ========================== */
.pixel-container {
  display: flex;
  flex-direction: row; /* 水平并列 */
  width: 100%;
  max-width: 240px; /* 限制最大宽度，保持简洁 */
  aspect-ratio: 1 / 1; /* 保持为正方形 */
  background-color: #000; /* 像素的黑色背景 */
  border-radius: 12px; /* 现代感圆角 */
  overflow: hidden; /* 裁剪内部子像素的边角 */
  border: 1px solid #2a2a2e; /* 柔和的边框 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin-top: 12px;
}

.sub-pixel {
  flex: 1; /* 三个色块平分宽度 */
  height: 100%;

  /* 关键：同样添加过渡效果，使其变化与滑块和主色块保持同步平滑。
    注意这里只过渡 background-color
  */
  transition: background-color 0.15s linear;
}
/* ========================== */
/* 新增结束 */
/* ========================== */
</style>
