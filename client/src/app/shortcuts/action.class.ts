import { ActionShortcut } from './shortcut.types';

export abstract class Action<I> {
  public abstract slug(): string;
  public abstract title(input: I): string;
  public abstract icon(input: I): string | null;
  public abstract disabled(input: I): boolean;
  protected abstract action(input: I): Promise<void> | void;

  public shortcut(input: I): ActionShortcut | null {
    void input;
    return null;
  }

  public runAsync(input: I): void {
    void this.run(input);
  }

  public async run(input: I): Promise<void> {
    try {
      await this.action(input);
    } catch (error) {
      console.error(error);
    }
  }
}
