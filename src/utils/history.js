class HistoryManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    // 添加一个新的操作到历史记录
    addToHistory(action) {
        this.undoStack.push(action);
        // 清空重做栈，因为有了新的操作
        this.redoStack = [];
    }

    // 撤销操作
    undo() {
        if (this.undoStack.length > 0) {
            const action = this.undoStack.pop();
            this.redoStack.push(action);
            return action;
        }
        return null;
    }

    // 重做操作
    redo() {
        if (this.redoStack.length > 0) {
            const action = this.redoStack.pop();
            this.undoStack.push(action);
            return action;
        }
        return null;
    }

    // 检查是否可以撤销
    canUndo() {
        return this.undoStack.length > 0;
    }

    // 检查是否可以重做
    canRedo() {
        return this.redoStack.length > 0;
    }

    // 清空历史记录
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}

export default new HistoryManager();
