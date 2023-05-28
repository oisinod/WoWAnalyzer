import SPELLS from 'common/SPELLS';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const EVENT_ORDERS: EventOrder[] = [
  {
    beforeEventId: SPELLS.ENRAGE.id,
    beforeEventType: EventType.ApplyBuff,
    afterEventId: SPELLS.BLOODTHIRST.id,
    afterEventType: EventType.Cast,
    bufferMs: 50,
    anyTarget: true,
  },
];

/**
 * The applybuff from enrage is logged after the cast of Bloodthirst if it procs
 * This ensures the enrage buff comes before the cast of Bloodthirst so the haste effect of Enrage updates the GCD correctly
 */
class Enrage extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}

export default Enrage;
