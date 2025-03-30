import { EventRef, Events } from 'obsidian'

// ref this article https://shbgm.ca/blog/obsidian/plugin-development/custom-events
export class PluginEvent extends Events {
  private static instance: PluginEvent
  protected refs: EventRef[] = []

  constructor() {
    super()
  }

  public static getInstance(): PluginEvent {
    if (!PluginEvent.instance) {
      PluginEvent.instance = new PluginEvent()
    }
    return PluginEvent.instance
  }

  on(name: string, callback: (...data: never) => never|void, ctx?: never): EventRef {
    const ref = super.on(name, callback, ctx)
    this.refs.push(ref)
    return ref
  }

  public offAll() {
    this.refs.forEach((ref) => {
      this.offref(ref)
    })
  }
}

export const pluginEvent = PluginEvent.getInstance()
