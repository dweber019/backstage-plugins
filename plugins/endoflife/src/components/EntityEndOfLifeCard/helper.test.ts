import {
  calculateMaxTime,
  calculateMinTime,
  calculateTimelineGroups,
  calculateTimelineItems,
  getDateClass,
} from './helper';
import { DateTime } from 'luxon';
import { EndOfLifeCycle } from '../../api';

describe('Helper', () => {
  describe('getDateClass', () => {
    it(`should have dateMissed`, async () => {
      const date = DateTime.now().minus({ day: 1 });

      const dateClass = getDateClass(date.toISODate());

      expect(dateClass).toBe('dateMissed');
    });

    it(`should have dateClose as it's today`, async () => {
      const date = DateTime.now();

      const dateClass = getDateClass(date.toISODate());

      expect(dateClass).toBe('dateClose');
    });

    it(`should have dateClose as it's in within 90 days`, async () => {
      const date = DateTime.now().plus({ day: 45 });

      const dateClass = getDateClass(date.toISODate());

      expect(dateClass).toBe('dateClose');
    });

    it(`should have dateClose as it's 90 days`, async () => {
      const date = DateTime.now().plus({ day: 90 });

      const dateClass = getDateClass(date.toISODate());

      expect(dateClass).toBe('dateClose');
    });

    it(`should have dateOk as it's longer than 90 days`, async () => {
      const date = DateTime.now().plus({ day: 95 });

      const dateClass = getDateClass(date.toISODate());

      expect(dateClass).toBe('dateOk');
    });
  });

  describe('calculateMinTime', () => {
    it(`should have correct min date with 6 months in the past of lowest date`, async () => {
      const minTime = calculateMinTime([
        {
          releaseDate: '2024-01-19',
          eol: '2024-02-19',
          lts: '2024-03-19',
          support: '2024-04-19',
          extendedSupport: '2024-05-19',
        } as EndOfLifeCycle,
      ]);

      expect(minTime).toBe('2023-07-19');
    });

    it(`should have correct max date with 6 months in the future from now`, async () => {
      const minTime = calculateMaxTime([
        {
          releaseDate: '2023-01-19',
          eol: '2023-02-19',
          lts: '2023-03-19',
          support: '2023-04-19',
          extendedSupport: '2023-05-19',
        } as EndOfLifeCycle,
      ]);

      expect(minTime).toBe(
        DateTime.fromISO(DateTime.now().toISODate())
          .plus({ month: 6 })
          .toISODate(),
      );
    });

    it(`should have correct max date with 6 months in the future from highest date`, async () => {
      const minTime = calculateMaxTime([
        {
          releaseDate: '2099-01-19',
          eol: '2099-02-19',
          lts: '2099-03-19',
          support: '2099-04-19',
          extendedSupport: '2099-08-19',
        } as EndOfLifeCycle,
      ]);

      expect(minTime).toBe('2100-02-19');
    });
  });

  describe('calculateTimelineGroups', () => {
    it(`should have correct groups`, async () => {
      const groups = calculateTimelineGroups([
        {
          product: 'rhel',
          cycle: '4',
        } as EndOfLifeCycle,
        {
          product: 'rhel',
          cycle: '7',
        } as EndOfLifeCycle,
        {
          product: 'rhel',
          cycle: '9',
        } as EndOfLifeCycle,
      ]);

      expect(groups.length).toBe(3);
      expect(groups[0].id).toBe('rhel-4');
      expect((groups[0].content as HTMLElement).innerHTML).toContain('rhel 4');
    });
  });

  /**
   * 1. The releaseDate is always provided
   * 2. The order of the date is releaseDate, support, eol, lts, extendedSupport
   * 3. The fields support, eol, lts, extendedSupport can be a boolean with would be evaluated to today
   * 3.1. If the field is used as end date, we return class dateOk
   * 4. LTS is always aligned with the EOL date
   */
  describe('calculateTimelineItems', () => {
    it(`should have handle releaseDate only`, async () => {
      const items = calculateTimelineItems([
        {
          releaseDate: '2023-01-01',
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-01-01');
      expect(items[0].end).toContain(DateTime.now().toISODate());
    });

    it(`should have handle releaseDate only with discontinue`, async () => {
      const items = calculateTimelineItems([
        {
          releaseDate: '2023-01-01',
          discontinued: true,
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-01-01');
      expect(items[0].end).toBe('2023-01-01');
    });

    it(`should have handle releaseDate only with discontinue with latest release`, async () => {
      const items = calculateTimelineItems([
        {
          releaseDate: '2023-01-01',
          discontinued: true,
          latestReleaseDate: '2023-05-01',
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-01-01');
      expect(items[0].end).toBe('2023-05-01');
    });

    it(`should have handle releaseDate to support`, async () => {
      const items = calculateTimelineItems([
        {
          releaseDate: '2023-01-01',
          support: '2023-02-01',
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-01-01');
      expect(items[0].end).toBe('2023-02-01');
    });

    it(`should have handle releaseDate to now when support true`, async () => {
      const items = calculateTimelineItems([
        {
          releaseDate: '2023-01-01',
          support: true,
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-01-01');
      expect(items[0].end).toContain(DateTime.now().toISODate());
    });

    it(`should have handle support to eol`, async () => {
      const items = calculateTimelineItems([
        {
          support: '2023-02-01',
          eol: '2023-03-01',
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-02-01');
      expect(items[0].end).toBe('2023-03-01');
    });

    it(`should have handle release to eol`, async () => {
      const items = calculateTimelineItems([
        {
          releaseDate: '2023-01-01',
          eol: '2023-03-01',
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-01-01');
      expect(items[0].end).toBe('2023-03-01');
    });

    it(`should have handle support to eol when eol is true`, async () => {
      const items = calculateTimelineItems([
        {
          support: '2023-02-01',
          eol: true,
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-02-01');
      expect(items[0].end).toContain(DateTime.now().toISODate());
    });

    it(`should have handle release to eol when eol is true`, async () => {
      const items = calculateTimelineItems([
        {
          releaseDate: '2023-01-01',
          eol: true,
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-01-01');
      expect(items[0].end).toContain(DateTime.now().toISODate());
    });

    it(`should have handle eol to extendedSupport`, async () => {
      const items = calculateTimelineItems([
        {
          eol: '2023-03-01',
          extendedSupport: '2023-04-01',
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-03-01');
      expect(items[0].end).toBe('2023-04-01');
    });

    it(`should have handle release to extendedSupport`, async () => {
      const items = calculateTimelineItems([
        {
          releaseDate: '2023-01-01',
          extendedSupport: '2023-04-01',
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-01-01');
      expect(items[0].end).toBe('2023-04-01');
    });

    it(`should have handle eol to extendedSupport when extendedSupport is true`, async () => {
      const items = calculateTimelineItems([
        {
          eol: '2023-03-01',
          extendedSupport: true,
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-03-01');
      expect(items[0].end).toContain(DateTime.now().toISODate());
    });

    it(`should have handle release to extendedSupport when extendedSupport is true`, async () => {
      const items = calculateTimelineItems([
        {
          releaseDate: '2023-01-01',
          extendedSupport: true,
        } as EndOfLifeCycle,
      ]);

      expect(items.length).toBe(1);
      expect(items[0].start).toBe('2023-01-01');
      expect(items[0].end).toContain(DateTime.now().toISODate());
    });

    // new
  });
});
