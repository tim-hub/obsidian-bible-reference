// Configuration interface for Umami
import { AckeeInstance, AckeeTrackingReturn, ActionAttributes, create } from 'ackee-tracker';

const EVENTS = {

  // key:count value 1
  settingsOpen: '2b5c608e-a773-4e99-8253-ae466e34ea3c',
  vodModalOpen: 'd109ceb7-c654-4450-b4c7-b258845dbe6d',
  vodEditorOpen: 'f814103b-d147-498d-8024-ec9285c5c6c7',
  lookupEditorOpen: '42abd468-3d86-45de-99bb-856267b6ce61', // got triggered in the editor
  lookupModalOpen: '63e6a132-2113-4363-8337-e8716c5bcb13',

  // key:john1:1 value: 1
  verseLookUp: '1e25a766-e81c-4241-aae9-16cfdadf3bd5',
  vodLookUp: 'ca89d404-8953-4e8a-96aa-bc9dc5f3b12d',

  // settings, NIV 1
  changeVersion: '4504d174-6535-426e-8d54-c6e49d27d537',
  changeVerseFormatting: 'af3fb034-a428-4a52-a2c4-556d61f95602',
  // changeLinkPosition: '',
  // changeVerseNumberFormatting: '',
  // changeCollapsible: '',
  // changeBookTagging: '',
  // changeChapterTagging: '',
}


type VerseLookUp = 'verseLookUp' | 'vodLookUp'
type UIOpen = 'settingsOpen' | 'vodModalOpen' | 'vodEditorOpen' | 'lookupEditorOpen' | 'lookupModalOpen'
type SettingChange = 'changeVersion' | 'changeVerseFormatting'
type EventsKeys = VerseLookUp | UIOpen | SettingChange
type EventsValues = typeof EVENTS[EventsKeys]

class Logger {
  protected static instance: Logger;
  public ackeeTracker: AckeeInstance;
  private server: string
  private domainId: string
  private record: AckeeTrackingReturn


  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  init(server: string, domainId: string) {
    this.server = server;
    this.domainId = domainId;
    this.ackeeTracker = create(server, {ignoreLocalhost: true, detailed: true})
    this.record = Logger.instance.ackeeTracker.record(this.domainId)
    this.record.stop(); // to not over record
  }

  private async fireEvent(eventId: EventsValues, actionAttributes: ActionAttributes): Promise<void> {
    Logger.instance.ackeeTracker.action(eventId, actionAttributes);
  }

  logSettingChange = (eventName: SettingChange, actionAttributes: ActionAttributes): void => {
    this.fireEvent(
      this.getEventId(eventName),
      actionAttributes
    )
  }

  logLookup = (eventName: VerseLookUp, actionAttributes: ActionAttributes): void => {
    this.fireEvent(
      this.getEventId(eventName),
      actionAttributes
    )
  }

  logUIOpen = (eventName: UIOpen, actionAttributes: ActionAttributes): void => {
    this.fireEvent(
      this.getEventId(eventName),
      actionAttributes
    )
  }

  private getEventId = (eventName: EventsKeys): string => {
    try {
      return EVENTS[eventName]
    } catch (e) {
      console.error(`EventStats: ${eventName} is not a valid event name`)
    }
  }

}


const tracker = Logger.getInstance()
tracker.init('https://log.techtim42.com', 'f73c4c66-05ae-4c79-921e-fd0848d15d35')

export const EventStats = tracker
