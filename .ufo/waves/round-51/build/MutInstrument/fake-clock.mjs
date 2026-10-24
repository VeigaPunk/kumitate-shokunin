// fake-clock.mjs — preload that offsets the wall clock by FAKE_OFFSET_MS so that receipts
// generated at different offsets carry different `run-at:` values (the A2 arm needs
// max(run-at) - min(run-at) >= 300 s without waiting 10 real minutes).
const offset = Number(process.env.FAKE_OFFSET_MS || 0);
const RealDate = Date;
class FakeDate extends RealDate {
  constructor(...args) {
    if (args.length === 0) super(RealDate.now() + offset);
    else super(...args);
  }
  static now() { return RealDate.now() + offset; }
}
Object.defineProperty(FakeDate, 'name', { value: 'Date' });
globalThis.Date = FakeDate;
