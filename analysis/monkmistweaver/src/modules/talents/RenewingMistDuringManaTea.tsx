import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class RenewingMistDuringManaTea extends Analyzer {
  // tracks how long we had mana tea :)
  manaTeaDuration = 0;

  manaTeaActive = false;
  manaTeaStartTime = 0;
  lastTimeStamp = 0;

  dataHolder: Map<number, number> = new Map<number, number>();

  currentRenewingMists = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MANA_TEA_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_TALENT),
      this.manaTeaStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_TALENT),
      this.manaTeaEnd,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.applyRenewingMist,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.removeRenewingMist,
    );
  }

  manaTeaStart(event: ApplyBuffEvent) {
    this.manaTeaActive = true;
    this.lastTimeStamp = event.timestamp;
    this.manaTeaStartTime = event.timestamp;
  }

  manaTeaEnd(event: RemoveBuffEvent) {
    this.manaTeaDuration += event.timestamp - this.manaTeaStartTime;
    this.handleAdjustment(event);
    this.manaTeaActive = false;
  }

  applyRenewingMist(event: ApplyBuffEvent) {
    this.currentRenewingMists += 1;
    this.handleAdjustment(event);
  }

  removeRenewingMist(event: RemoveBuffEvent) {
    this.currentRenewingMists -= 1;
    this.handleAdjustment(event);
  }

  handleAdjustment(event: ApplyBuffEvent | RemoveBuffEvent) {
    if (!this.manaTeaActive) {
      return;
    }

    if (!this.dataHolder.has(this.currentRenewingMists)) {
      this.dataHolder.set(this.currentRenewingMists, 0);
    }

    let currentDuration = this.dataHolder.get(this.currentRenewingMists)!;
    currentDuration += event.timestamp - this.lastTimeStamp;
    this.dataHolder.set(this.currentRenewingMists, currentDuration);

    this.lastTimeStamp = event.timestamp;
  }

  get avgRemDuringMT() {
    // calculate stats first
    let total = 0;

    this.dataHolder.forEach((duration, activeREMs) => {
      total += activeREMs * (duration / this.manaTeaDuration);
    });

    return total;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgRemDuringMT,
      isLessThan: {
        minor: 2,
        average: 1.5,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          During <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> you should have a minimum of two{' '}
          <SpellLink id={SPELLS.RENEWING_MIST.id} /> out to maximize your healing during the buff.
        </>,
      )
        .icon(SPELLS.MANA_TEA_TALENT.icon)
        .actual(
          `${this.avgRemDuringMT.toFixed(2)}${t({
            id: 'monk.mistweaver.suggestions.renewingMistDuringManaTea.avgRenewingMists',
            message: ` average Renewing Mists during Mana Tea`,
          })}`,
        )
        .recommended(`${recommended} average Renewing Mists recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>This is the average number of Renewing Mists active during Mana Tea</>}
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.MANA_TEA_TALENT.id} /> Average Renewing Mists
            </>
          }
        >
          <>{this.avgRemDuringMT.toFixed(2)}</>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default RenewingMistDuringManaTea;
