import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import PlayerHits from 'parser/ui/PlayerHits';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import './LightOfDawn.scss';

class LightOfDawn extends Analyzer {
  protected casts = 0;
  protected heals = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN_CAST),
      this.handleCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN_HEAL),
      this.handleHeal,
    );
  }

  protected handleCast() {
    this.casts += 1;
  }
  protected handleHeal() {
    this.heals += 1;
  }

  statistic() {
    const playersHitPerCast = this.heals / this.casts || 0;
    const performance = playersHitPerCast / 5;

    return (
      <Statistic position={STATISTIC_ORDER.CORE(60)} size="small">
        <BoringSpellValue
          spellId={SPELLS.LIGHT_OF_DAWN_CAST.id}
          value={playersHitPerCast.toFixed(2)}
          label={
            <Trans id="paladin.holy.modules.lightOfDawn.avgHitPerCast">
              Average targets hit per cast
            </Trans>
          }
          className="light-of-dawn-hits-per-cast"
          extra={<PlayerHits performance={performance} />}
        />
      </Statistic>
    );
  }
}

export default LightOfDawn;
