import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import DualStatisticBox from 'parser/ui/DualStatisticBox';

import AtonementAnalyzer, {
  AtonementAnalyzerEvent,
} from '@wowanalyzer/priest-discipline/src/modules/core/AtonementAnalyzer';

import { POWER_WORD_RADIANCE_ATONEMENT_DUR } from '../../constants';
import AtonementDamageSource from '../features/AtonementDamageSource';

class Schism extends Analyzer {
  protected enemies!: Enemies;
  protected atonementDamageSource!: AtonementDamageSource;

  static dependencies = {
    enemies: Enemies,
    atonementDamageSource: AtonementDamageSource,
  };

  static bonus = 0.25;

  private directDamage = 0;
  private damageFromBuff = 0;
  private healing = 0;
  private radianceCast = false;
  private lastRadianceCast = 0;
  private badSchism = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SCHISM_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_RADIANCE),
      this.onRadiance,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SCHISM_TALENT),
      this.onSchism,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);
  }

  private onRadiance(event: CastEvent) {
    this.radianceCast = true;
    this.lastRadianceCast = event.timestamp;
  }

  private onSchism(event: CastEvent) {
    if (
      !this.radianceCast ||
      event.timestamp - this.lastRadianceCast >= POWER_WORD_RADIANCE_ATONEMENT_DUR
    ) {
      this.badSchism += 1;
    }
    this.radianceCast = false;
  }

  get suggestionThresholds() {
    return {
      actual: this.badSchism,
      isGreaterThan: {
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  private onAtonement(event: AtonementAnalyzerEvent) {
    const { healEvent, damageEvent } = event;
    if (!damageEvent) {
      return;
    }
    const target = this.enemies.getEntity(damageEvent);
    if (!target?.hasBuff(SPELLS.SCHISM_TALENT.id)) {
      return;
    }

    // Schism isn't buffed by itself, so requires a different path
    if (damageEvent.ability.guid === SPELLS.SCHISM_TALENT.id) {
      this.healing += healEvent.amount;
    }

    this.healing += calculateEffectiveHealing(healEvent, Schism.bonus);
  }

  /**
   * Processes the passive damage added by Schism on a target
   * @param event The damage event being considered
   */
  private onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    const target = this.enemies.getEntity(event);

    if (spellId === SPELLS.SCHISM_TALENT.id) {
      this.directDamage += event.amount + (event.absorbed || 0);
      return;
    }
    if (target?.hasBuff(SPELLS.SCHISM_TALENT.id)) {
      return;
    }

    this.damageFromBuff += calculateEffectiveDamage(event, Schism.bonus);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          {' '}
          Always pair <SpellLink id={SPELLS.SCHISM_TALENT.id} /> with one or two charges of{' '}
          <SpellLink id={SPELLS.POWER_WORD_RADIANCE.id} />
        </>,
      )
        .icon(SPELLS.SCHISM_TALENT.icon)
        .actual(
          t({
            message: `${actual} schisms not following a Power Word: Radiance cast`,
          }),
        )
        .recommended(`${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <DualStatisticBox
        icon={<SpellIcon id={SPELLS.SCHISM_TALENT.id} />}
        values={[
          `${formatNumber((this.healing / this.owner.fightDuration) * 1000)} HPS`,
          `${formatNumber(
            ((this.directDamage + this.damageFromBuff) / this.owner.fightDuration) * 1000,
          )} DPS`,
        ]}
        footer={
          <>
            <SpellLink id={SPELLS.SCHISM_TALENT.id} /> throughput
          </>
        }
        tooltip={
          <>
            The effective healing contributed by Schism was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))}% of total
            healing done.
            <br />
            The direct damage contributed by the Schism talent was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.directDamage))}% of
            total damage done.
            <br />
            The effective damage contributed by the Schism bonus was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageFromBuff))}% of
            total damage done. <br />
          </>
        }
        alignIcon="center"
      />
    );
  }
}

export default Schism;
