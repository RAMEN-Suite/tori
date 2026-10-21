import { ActionShortcut } from '../shortcuts/shortcut.types';

export abstract class Action<I> {
  public abstract slug(): string;
  public abstract title(input: I): string;
  public abstract icon(input: I): string | null;
  public abstract disabled(input: I): boolean;
  protected abstract action(input: I): Promise<void> | void;

  public configurableShortcut(): ActionShortcut | null {
    return null;
  }

  public shortcut(_input: I): ActionShortcut | null {
    return this.configurableShortcut();
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
