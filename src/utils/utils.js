/**
 * @class ClickSingle
 * @description 鼠标点击检测工具类
 * 用于判定鼠标在松开时是否符合点击的标准。
 * 
 * 有效点击需要同时满足以下条件：
 * 1. 必须使用鼠标左键
 * 2. 鼠标按下和松开的位置必须完全相同
 * 3. 从按下到松开的时间间隔必须小于300毫秒
 * 
 * @example
 * const clickDetector = new ClickSingle();
 * element.addEventListener('mousedown', clickDetector.handlerMousedown);
 * element.addEventListener('mouseup', clickDetector.handlerMouseup);
 * // 在mouseup事件后，通过检查 clickDetector.value 判断是否为有效点击
 */
export const ClickSingle = class {
  /**
   * 创建一个新的点击检测器实例
   */
  constructor() {
    /**
     * @type {number}
     * @description 长按判定阈值（毫秒）
     * 如果按下到松开的时间超过此值，则不会被视为有效点击
     */
    this.LONG_PRESS_TIME = 300;

    /**
     * @type {boolean}
     * @description 点击有效性标志
     * true表示最近一次鼠标操作是有效点击，false表示无效
     */
    this.value = false;

    /**
     * @type {Object|null}
     * @property {number} x - 鼠标按下时的X坐标
     * @property {number} y - 鼠标按下时的Y坐标
     * @description 记录鼠标按下时的坐标位置
     */
    this.pointPositionDown = null;

    /**
     * @type {number|null}
     * @description 记录鼠标按下时的时间戳
     */
    this.timePositionDown = null;
  }

  /**
   * @method handlerMousedown
   * @param {MouseEvent} e - 鼠标按下事件对象
   * @description 处理鼠标按下事件
   * 记录按下时的位置坐标和时间戳，重置点击有效性状态
   */
  handlerMousedown = (e) => {
    if (e.button !== 0) return; // 确保是鼠标左键
    this.value = false;
    this.pointPositionDown = { x: e.clientX, y: e.clientY };
    this.timePositionDown = Date.now();
  };

  /**
   * @method handlerMouseup
   * @param {MouseEvent} e - 鼠标松开事件对象
   * @description 处理鼠标松开事件
   * 通过比较按下和松开的位置、时间来判断是否为有效点击
   * 判定结果将存储在value属性中
   */
  handlerMouseup = (e) => {
    if (e.button !== 0) return; // 确保是鼠标左键

    const pointPositionUp = { x: e.clientX, y: e.clientY };
    const timePositionUp = Date.now();

    // 检查位置是否一致
    const isPositionSame =
      this.pointPositionDown.x === pointPositionUp.x &&
      this.pointPositionDown.y === pointPositionUp.y;

    // 检查时间间隔
    const isTimeValid =
      timePositionUp - this.timePositionDown < this.LONG_PRESS_TIME;

    // 判定为有效单击
    this.value = isPositionSame && isTimeValid;
  };
};
