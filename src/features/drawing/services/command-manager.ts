import { Command } from "@/features/drawing/domain/commands/command";

export type CommandManagerListener = () => void;

export class CommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private listeners: Set<CommandManagerListener> = new Set();

  public execute(command: Command) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    this.notify();
  }

  public undo() {
    const command = this.undoStack.pop();

    if (!command) {
      return;
    }

    command.undo();
    this.redoStack.push(command);
    this.notify();
  }

  public redo() {
    const command = this.redoStack.pop();

    if (!command) {
      return;
    }

    command.execute();
    this.undoStack.push(command);
    this.notify();
  }

  public subscribe(listener: CommandManagerListener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public snapshot() {
    return `${this.undoStack.length}:${this.redoStack.length}`;
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }

  private notify() {
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}
