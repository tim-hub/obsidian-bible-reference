declare module 'bible-passage-reference-parser' {
  export class bcv_parser {
    constructor();
    parse(query: string): this;
    osis(): string;
    set_options(options: Record<string, any>): void;
  }
} 