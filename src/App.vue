<template>
  <div class="app-container">
    <div class="controls">
      <select v-model="selectedShape" class="control-item">
        <option value="rectangle">Rectangle</option>
        <option value="circle">Circle</option>
        <option value="polygon">Polygon</option>
        <option value="arrow">Arrow</option>
        <option value="freedraw">Free Draw</option>
      </select>

      <input
        type="color"
        v-model="strokeColor"
        class="control-item"
        title="Stroke Color"
      >

      <input
        type="number"
        v-model="strokeWidth"
        min="1"
        max="20"
        class="control-item"
        title="Stroke Width"
      >
    </div>
    <div id="container" ref="container"></div>
  </div>
</template>

<script setup>

import { ref, onMounted, watch } from 'vue'
import Konva from 'konva'

const container = ref(null)
const selectedShape = ref('rectangle')
const strokeColor = ref('#000000')
const strokeWidth = ref(2)

let stage = null
let layer = null
let isDrawing = false
let currentShape = null
let startPos = null
let tr = null

// 初始化舞台,变形,图层
const init = ()=>{
  stage = new Konva.Stage({
    container: container.value,
    width: window.innerWidth,
    height: window.innerHeight - 50, // Account for controls height
  })

  layer = new Konva.Layer()
  stage.add(layer)

  // Create transformer
  // 创建变换器
  tr = new Konva.Transformer({
    nodes: [],
    rotateEnabled: false,
    keepRatio: false,
    shouldOverdrawWholeArea: true,
    boundBoxFunc: (oldBox, newBox) => {
      if (newBox.width < 4 || newBox.height < 4) {
        return oldBox
      }
      return newBox
    },
  })

  tr.on('transformend', () => {
    const shape = tr.nodes()[0]
    if (shape) {
      shape.strokeScaleEnabled(false)
      shape.strokeWidth(strokeWidth.value)
    }
  })

  layer.add(tr)

  // Set up event listeners
  stage.on('mousedown touchstart', handleMouseDown)
  stage.on('mousemove touchmove', handleMouseMove)
  stage.on('mouseup touchend', handleMouseUp)
  stage.on('click tap', (e) => {
    if (e.target === stage) {
      tr.nodes([])
      layer.draw()
    }
  })
}

// 初始化Konva舞台和图层
onMounted(() => {
  init()
})

// 创建矩形
const createRectangle = (x, y) => {
  return new Konva.Rect({
    x,
    y,
    width: 1,
    height: 1,
    stroke: strokeColor.value,
    strokeWidth: strokeWidth.value,
    strokeScaleEnabled: false,
    draggable: true,
  })
}


// 创建圆
const createCircle = (x, y) => {
  return new Konva.Circle({
    x,
    y,
    radius: 1,
    stroke: strokeColor.value,
    strokeWidth: strokeWidth.value,
    strokeScaleEnabled: false,
    draggable: true,
  })
}


// 创建箭头
const createArrow = (x, y) => {
  return new Konva.Arrow({
    points: [x, y, x, y],
    stroke: strokeColor.value,
    strokeWidth: strokeWidth.value,
    pointerLength: 10,
    pointerWidth: 10,
    fill: strokeColor.value,
    draggable: true,
  })
}


// 创建并记录多边形
let polygonPoints = []
const createPolygon = (x, y) => {
  return new Konva.Line({
    points: [x, y],
    stroke: strokeColor.value,
    strokeWidth: strokeWidth.value,
    closed: true,
    draggable: true,
  })
}

// 鼠标按下时的逻辑
const handleMouseDown = (e) => {
  if (e.target !== stage) return

  isDrawing = true
  const pos = stage.getPointerPosition()
  startPos = pos

  switch (selectedShape.value) {
    case 'rectangle':
      currentShape = createRectangle(pos.x, pos.y)
      break
    case 'circle':
      currentShape = createCircle(pos.x, pos.y)
      break
    case 'arrow':
      currentShape = createArrow(pos.x, pos.y)
      break
    case 'polygon':
      if (!currentShape) {
        polygonPoints = [pos.x, pos.y]
        currentShape = createPolygon(pos.x, pos.y)
      } else {
        polygonPoints.push(pos.x, pos.y)
        currentShape.points(polygonPoints)
      }
      break
    case 'freedraw':
      currentShape = new Konva.Line({
        points: [pos.x, pos.y],
        stroke: strokeColor.value,
        strokeWidth: strokeWidth.value,
        draggable: true,
      })
      break
  }

  if (currentShape) {
    currentShape.on('click tap', function() {
      tr.nodes([this])
      layer.draw()
    })
    layer.add(currentShape)
    layer.draw()
  }
}

const handleMouseMove = () => {
  if (!isDrawing || !currentShape) return

  const pos = stage.getPointerPosition()

  switch (selectedShape.value) {
    case 'rectangle': {
      let width = pos.x - startPos.x
      let height = pos.y - startPos.y

      if (width < 0) {
        currentShape.x(pos.x)
        width = Math.abs(width)
      }
      if (height < 0) {
        currentShape.y(pos.y)
        height = Math.abs(height)
      }

      currentShape.width(width)
      currentShape.height(height)
      break
    }
    case 'circle': {
      const dx = pos.x - startPos.x
      const dy = pos.y - startPos.y
      const radius = Math.sqrt(dx * dx + dy * dy)
      currentShape.radius(radius)
      break
    }
    case 'arrow': {
      currentShape.points([startPos.x, startPos.y, pos.x, pos.y])
      break
    }
    case 'polygon': {
      const points = [...polygonPoints, pos.x, pos.y]
      currentShape.points(points)
      break
    }
    case 'freedraw': {
      const points = [...currentShape.points(), pos.x, pos.y]
      currentShape.points(points)
      break
    }
  }


  layer.draw()
}

const handleMouseUp = () => {
  if (!isDrawing) return

  if(selectedShape.value === 'polygon') {
    isDrawing = false
    currentShape = null
  }else if (selectedShape.value === 'freedraw') {
    isDrawing = false
    currentShape = null
  }else {
    isDrawing = false
    if (currentShape) {
      const isShapeTooSmall = () => {
        switch (selectedShape.value) {
          case 'rectangle':
            return currentShape.width() < 4 || currentShape.height() < 4
          case 'circle':
            return currentShape.radius() < 2
          case 'arrow':
            const points = currentShape.points()
            const dx = points[2] - points[0]
            const dy = points[3] - points[1]
            return Math.sqrt(dx * dx + dy * dy) < 4
          default:
            return false
        }
      }

      if (isShapeTooSmall()) {
        currentShape.destroy()
      } else {
        tr.nodes([currentShape])
      }
      layer.draw()
      currentShape = null
    }
  }
}

// 监听笔画颜色和宽度的变化，实时更新选中图形的样式
watch([strokeColor, strokeWidth], () => {
  const selectedNode = tr.nodes()[0]
  if (selectedNode) {
    selectedNode.stroke(strokeColor.value)
    selectedNode.strokeWidth(strokeWidth.value)
    if (selectedNode.className === 'Arrow') {
      selectedNode.fill(strokeColor.value)
    }
    layer.draw()
  }
})
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.controls {
  padding: 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.control-item {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

#container {
  flex: 1;
}
</style>
