import Flagsmith, { Flags } from 'flagsmith-nodejs' // Add this line if you're using flagsmith via npm

const flagsmith = new Flagsmith({
  environmentKey: 'NJTKgnNToZxbe6TCksAcmD',
})

export class FlagService {
  public static instance: FlagService
  private flags: Flags

  public static getInstace(): FlagService {
    if (!FlagService.instance) {
      FlagService.instance = new FlagService()
    }
    return FlagService.instance
  }

  public async init() {
    this.flags = await flagsmith.getEnvironmentFlags()
  }

  public isFeatureEnabled(feature: string): boolean {
    return this.flags.isFeatureEnabled(feature)
  }
}
