// Mock for Obsidian API
export class Notice {
  constructor(message: string) {
    // Mock implementation - just store the message
    this.message = message
  }

  message: string
}

// Add other Obsidian mocks as needed
export class Plugin {}
export class TFile {}
export class Vault {}
