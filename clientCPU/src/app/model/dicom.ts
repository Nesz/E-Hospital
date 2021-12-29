interface entry {
  vr: string;
  value: any;
}

export class Dictionary<T> {
  [Key: string]: T;
}

export interface request {
  preamble: string;
  prefix: string;
  entries: Dictionary<entry>;
}

export class Dicom {
  public static empty = (): Dicom => new Dicom('', '', new Dictionary<entry>());

  preamble: string;
  prefix: string;
  entries: Sequence;

  constructor(preamble: string, prefix: string, entries: Dictionary<entry>) {
    this.preamble = preamble;
    this.prefix = prefix;
    this.entries = new Sequence(entries);
  }

  public hasTag(tag: string) {
    return this.entries.hasTag(tag);
  }

  public getValue(tag: string, recursive = false): Attribute {
    return this.entries.getValue(tag, recursive);
  }

  public getValueOrDefault(tag: string, dv: any) {
    return this.entries.getValueOrDefault(tag, dv);
  }
}

export class Sequence {
  entries: Dictionary<entry>;

  constructor(entries: Dictionary<entry>) {
    this.entries = entries;
  }

  public hasTag(tag: string) {
    return this.entries[tag] !== undefined;
  }

  public getValue(tag: string, recursive = false): Attribute {
    if (this.hasTag(tag)) {
      return new Attribute(this.entries[tag].value);
    }

    if (recursive) {
      for (const key in this.entries) {
        const entry = this.entries[key];
        if (entry.vr === 'SQ') {
          const sequence = new Sequence(entry.value[0]);
          const val = sequence.getValue(tag, true);
          if (val != null) {
            return val;
          }
        }
      }
    }

    return new Attribute(-0xff);
  }

  public getValueOrDefault(tag: string, dv: any) {
    const entry = this.entries[tag];
    return entry === undefined ? new Attribute(dv) : new Attribute(entry.value);
  }
}

export class Attribute {
  value: any;

  constructor(value: any) {
    this.value = value;
  }

  public asSequence() {
    return this.value as Sequence;
  }

  public asNumber() {
    return Number(this.value);
  }

  public asString() {
    return String(this.value);
  }

  public asList<T>() {
    return this.value as Array<T>;
  }
}
