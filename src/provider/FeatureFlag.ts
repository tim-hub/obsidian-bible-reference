import Flagsmith, { Flags } from 'flagsmith-nodejs'
import { EventStats } from './EventStats' // Add this line if you're using flagsmith via npm

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

  public async init(id?: string) {
    if (id) {
      this.flags = await flagsmith.getIdentityFlags(id)
    } else {
      this.flags = await flagsmith.getEnvironmentFlags()
    }
  }

  public isFeatureEnabled(feature: string): boolean {
    return this.flags.isFeatureEnabled(feature)
  }

  public getFeatureValue(feature: string): any {
    try {
      const value = this.flags.getFlag(feature).value
      return JSON.parse(value as string)
    } catch (e) {
      console.error('get feature flag value error')
      EventStats.logError('errors', { key: 'featureflag', value: 1 })
    }
  }
}
