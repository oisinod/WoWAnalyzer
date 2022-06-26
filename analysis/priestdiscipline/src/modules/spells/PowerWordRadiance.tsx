import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';

class PowerWordRadiance extends Analyzer {
  radiancesOnAtonedTarget = 0;

  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_RADIANCE),
      this.onRadiance,
    );
  }

  onRadiance(event: CastEvent) {
    const target = this.combatants.getEntity(event);
    if (target?.hasBuff(SPELLS.ATONEMENT_BUFF.id)) {
      this.radiancesOnAtonedTarget += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.radiancesOnAtonedTarget,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          {' '}
          Cast <SpellLink id={SPELLS.POWER_WORD_RADIANCE.id} /> on a target that doesn't have{' '}
          <SpellLink id={SPELLS.ATONEMENT_BUFF.id} />. You should aim to cast all charges of{' '}
          <SpellLink id={SPELLS.POWER_WORD_RADIANCE.id} /> on targets which don't have{' '}
          <SpellLink id={SPELLS.ATONEMENT_BUFF.id} />.
        </>,
      )
        .icon(SPELLS.POWER_WORD_RADIANCE.icon)
        .actual(
          t({
            message: `${actual} casts of Power Word: Radiance on atoned targets.`,
          }),
        )
        .recommended(`${recommended} is recommended`),
    );
  }
}

export default PowerWordRadiance;
