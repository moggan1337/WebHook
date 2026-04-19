export class WebHook {
  private handlers = new Map<string, (data: any) => void>();
  register(url: string, fn: (data: any) => void) { this.handlers.set(url, fn); }
  async trigger(url: string, data: any) { const fn = this.handlers.get(url); if (fn) fn(data); }
  list() { return [...this.handlers.keys()]; }
}
export default WebHook;
