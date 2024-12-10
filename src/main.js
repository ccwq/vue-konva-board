import Konva from 'konva';

// 初始化舞台
const width = window.innerWidth;
const height = window.innerHeight;
const stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height,
});

// 创建图层
const layer = new Konva.Layer();
stage.add(layer);

let isDrawing = false;
let currentRect = null;
let startPos = null;

// 创建 transformer
const tr = new Konva.Transformer({
  nodes: [],
  rotateEnabled: false,
  keepRatio: false,
  shouldOverdrawWholeArea: true,
  boundBoxFunc: function(oldBox, newBox) {
    // 限制最小尺寸为4像素
    if (newBox.width < 4 || newBox.height < 4) {
      return oldBox;
    }
    return newBox;
  },
});

// 添加 transformend 事件处理
tr.on('transformend', function() {
  const shape = tr.nodes()[0];
  if (shape) {
    // 重置缩放，保持边框宽度
    shape.strokeScaleEnabled(false);
    shape.strokeWidth(2);
  }
});

layer.add(tr);

// 选中矩形的函数
function selectShape(shape) {
  tr.nodes([shape]);
  layer.draw();
}

// 点击舞台空白处取消选中
stage.on('click tap', function(e) {
  if (e.target === stage) {
    tr.nodes([]);
    layer.draw();
  }
});

// 鼠标按下事件
stage.on('mousedown', function(e) {
  if (e.target === stage) {
    isDrawing = true;
    startPos = stage.getPointerPosition();
    
    // 创建初始矩形，只有边框没有填充
    currentRect = new Konva.Rect({
      x: startPos.x,
      y: startPos.y,
      width: 1,
      height: 1,
      stroke: 'black',
      strokeWidth: 2,
      strokeScaleEnabled: false,
      draggable: true,
    });
    
    // 添加点击事件以选中矩形
    currentRect.on('click tap', function() {
      selectShape(this);
    });
    
    layer.add(currentRect);
    layer.draw();
  }
});

// 鼠标移动事件
stage.on('mousemove', function() {
  if (!isDrawing) {
    return;
  }
  
  const pos = stage.getPointerPosition();
  let width = pos.x - startPos.x;
  let height = pos.y - startPos.y;
  
  if (width < 0) {
    currentRect.x(pos.x);
    width = Math.abs(width);
  }
  if (height < 0) {
    currentRect.y(pos.y);
    height = Math.abs(height);
  }
  
  currentRect.width(width);
  currentRect.height(height);
  layer.draw();
});

// 鼠标释放事件
stage.on('mouseup', function() {
  isDrawing = false;
  if (currentRect) {
    // 检查矩形大小，如果太小就删除
    if (currentRect.width() < 4 || currentRect.height() < 4) {
      currentRect.destroy();
    } else {
      // 选中新创建的矩形
      selectShape(currentRect);
    }
    layer.draw();
  }
});
