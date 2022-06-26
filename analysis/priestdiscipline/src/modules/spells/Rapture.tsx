import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class Rapture extends Analyzer {
  raptureBuffActive = false;
  raptureShields = 0;
  rapturesUnderThreshold = 0;

  constructor(options: Options) {
    super(options);

    this.active = !this.selectedCombatant.hasTalent(SPELLS.SPIRIT_SHELL_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.POWER_WORD_SHIELD, SPELLS.RAPTURE]),
      this.checkRapture,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAPTURE), this.applyRapture);
    this.addEventListener(
      Events.removebuff.spell(SPELLS.RAPTURE).by(SELECTED_PLAYER),
      this.raptureRemoved,
    );
  }

  private checkRapture(event: CastEvent) {
    if (this.raptureBuffActive) {
      this.raptureShields += 1;
    }
  }

  applyRapture(event: CastEvent) {
    this.raptureBuffActive = true;
    this.raptureShields += 1;
  }

  raptureRemoved() {
    if (this.raptureShields < 7) {
      this.rapturesUnderThreshold += 3;
    }
    this.raptureShields = 0;

    return (this.raptureBuffActive = false);
  }

  get suggestionThresholds() {
    return {
      actual: this.rapturesUnderThreshold,
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
          Cast <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} /> for the entire duration of the{' '}
          <SpellLink id={SPELLS.RAPTURE.id} />. You should aim to cast{' '}
          <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} /> 7 or more times per{' '}
          <SpellLink id={SPELLS.RAPTURE.id} />.
        </>,
      )
        .icon(SPELLS.RAPTURE.icon)
        .actual(
          t({
            message: `${actual} raptures with less than 7 shields`,
          }),
        )
        .recommended(`${recommended} is recommended`),
    );
  }
}

export default Rapture;
