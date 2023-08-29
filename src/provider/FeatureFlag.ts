import Flagsmith, { Flags } from 'flagsmith-nodejs' // Add this line if you're using flagsmith via npm

const flagsmith = new Flagsmith({
  environmentKey: 'NJTKgnNToZxbe6TCksAcmD',
})

const getFlags = async (): Promise<Flags> => {
  return flagsmith.getEnvironmentFlags()
}

export default getFlags
