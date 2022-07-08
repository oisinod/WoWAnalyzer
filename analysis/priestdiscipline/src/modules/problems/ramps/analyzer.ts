import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventHistory from 'parser/shared/modules/EventHistory';
import StatTracker from 'parser/shared/modules/StatTracker';

import GlobalCooldown from '../../core/GlobalCooldown';
import Atonement from '../../spells/Atonement';
const POWER_WORD_RADIANCE_CAST_TIME_MS = 2000;
const ALLOWED_PRE_EVANG = [
  SPELLS.POWER_WORD_RADIANCE.id,
  SPELLS.POWER_WORD_SHIELD.id,
  SPELLS.SHADOW_MEND.id,
  SPELLS.RAPTURE.id,
  SPELLS.SHADOWFIEND.id,
  SPELLS.EVANGELISM_TALENT.id,
  SPELLS.SHADOW_WORD_PAIN.id,
];
const RAMP_STARTERS = [
  SPELLS.SHADOW_WORD_PAIN.id,
  SPELLS.PURGE_THE_WICKED_TALENT.id,
  SPELLS.SHADOW_MEND.id,
  SPELLS.RAPTURE.id,
  SPELLS.POWER_WORD_SHIELD.id,
];

export type ProblemHash = {
  problemDescription: string;
  index: number;
  problemType: string;
  timestamp: string;
  gcdTime?: number;
};

type EvangelismRampType = {
  rampInfo: CastEvent[];
  evangelismTimestamp: string;
};

class Ramps extends Analyzer {
  static dependencies = {
    atonementModule: Atonement,
    eventHistory: EventHistory,
    globalCooldown: GlobalCooldown,
    statTracker: StatTracker,
  };
  protected eventHistory!: EventHistory;
  _previousEvangelismCast: CastEvent | null = null;
  protected atonementModule!: Atonement;
  protected globalCooldown!: GlobalCooldown;
  protected statTracker!: StatTracker;
  evangelismRamps: EvangelismRampType[];
  rampProblems: ProblemHash[][];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EVANGELISM_TALENT),
      this.onCast,
    );
    this.evangelismRamps = [];
    this.rampProblems = [];
  }

  onCast(event: CastEvent) {
    const rampHistory = this.eventHistory
      .last(30, 17000, Events.cast.by(SELECTED_PLAYER))
      .filter(
        (cast) =>
          !CASTS_THAT_ARENT_CASTS.includes(cast.ability.guid) &&
          this.globalCooldown.isOnGlobalCooldown(cast.ability.guid),
      );
    // if (rampHistory.some((ramp) => (ramp.ability.guid ===(SPELLS.PURGE_THE_WICKED_TALENT.id)))){
    while (!RAMP_STARTERS.includes(rampHistory[0].ability.guid)) {
      // console.log(rampHistory[0].ability.guid)
      rampHistory.shift();
    }
    // }
    rampHistory.push(event);
    this.evangelismRamps.push({
      rampInfo: rampHistory,
      evangelismTimestamp: this.owner.formatTimestamp(event.timestamp),
    });
  }

  get analyzeRamps() {
    this.evangelismRamps.forEach((evangelism) => {
      const problems: ProblemHash[] = [];
      let radianceCount = 0;
      evangelism.rampInfo.forEach((cast, index) => {
        const castTime =
          cast.ability.guid === SPELLS.POWER_WORD_RADIANCE.id
            ? POWER_WORD_RADIANCE_CAST_TIME_MS / (1 + this.statTracker.currentHastePercentage)
            : this.globalCooldown.getGlobalCooldownDuration(cast.ability.guid);
        const nonCastTime = evangelism.rampInfo[index + 1]?.timestamp - cast.timestamp - castTime;
        if (nonCastTime > 500) {
          problems.push({
            problemDescription: `You spent too much time off GCD and not casting. You spent ${(
              nonCastTime / 1000
            ).toFixed(1)} seconds not casting during your ramp.`,
            index: index,
            problemType: 'deadGCD',
            timestamp: this.owner.formatTimestamp(cast.timestamp),
            gcdTime: nonCastTime,
          });
        }

        if (!ALLOWED_PRE_EVANG.includes(cast.ability.guid)) {
          problems.push({
            problemDescription: `You should only apply atonements before you press evangelism`,
            index: index,
            problemType: 'nonapplicator',
            timestamp: this.owner.formatTimestamp(cast.timestamp),
          });
        }

        if (
          (cast.ability.guid !== SPELLS.SHADOW_WORD_PAIN.id ||
            cast.ability.guid !== SPELLS.PURGE_THE_WICKED_TALENT.id) &&
          evangelism.rampInfo.indexOf(cast) === 0
        ) {
          // problem found - you didn't refresh your dot at the start of the ramp
          // console.log("in no dot refresh");
          problems.push({
            problemDescription: `You didn't refresh your dot at the start of the ramp. Before you ramp, it is important to refresh your dot so that it lasts the full duration of your ramp.`,
            index: index,
            problemType: 'nodot',
            timestamp: this.owner.formatTimestamp(cast.timestamp),
          });
        }

        if (cast.ability.guid === SPELLS.POWER_WORD_RADIANCE.id) {
          radianceCount += 1;
        }
      });
      // console.log(problems);

      if (radianceCount < 2) {
        problems.push({
          problemDescription: `Make sure to cast Power Word: Radiance twice before casting Evangelism.`,
          index: evangelism.rampInfo.length - 1,
          problemType: 'lessthan2radiances',
          timestamp: this.owner.formatTimestamp(parseInt(problems[problems.length - 1].timestamp)),
        });
      }

      this.rampProblems.push(problems);
    });
    return this.rampProblems;
  }
}
export default Ramps;
//
