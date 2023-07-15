import { change, date } from 'common/changelog';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import { CamClark, Tialyss, ToppleTheNun, xizbow, Trevor, Abelito75 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS/paladin';

export default [
  change(date(2023, 7, 14), <>Added <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> to Infusion of Light usage</>, Tialyss),
  change(date(2023, 7, 14), <>Added <SpellLink spell={TALENTS.DIVINE_REVELATIONS_TALENT} /></>, Tialyss),
  change(date(2023, 7, 14), <>Added <SpellLink spell={TALENTS.LIGHTS_PROTECTION_TALENT} /></>, Abelito75),
  change(date(2023, 7, 13), <>Added <SpellLink spell={TALENTS.DAYBREAK_TALENT} /></>, Tialyss),
  change(date(2023, 7, 12), <>Glimmer rewrite</>, Abelito75),
  change(date(2023, 7, 12), <>Check for the right talent</>, Abelito75),
  change(date(2023, 7, 12), <>Update Glimmer of Light target cap and correct beacon transfer factor</>, Abelito75),
  change(date(2023, 7, 11), <>Updated ability definitions</>, Abelito75),
  change(date(2023, 7, 11), <>Added <SpellLink spell={TALENTS.RECLAMATION_TALENT} /></>, Abelito75),
  change(date(2023, 7, 5), <>Updated Tirion's Devotion title to not be confusing</>, Abelito75),
  change(date(2023, 7, 4), <>Tirion's Devotion CDR</>, Abelito75),
  change(date(2023, 7, 4), <>Bar chart for average LoD Distance.</>, Abelito75),
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 6, 23), <>Possible Empyrean Legacy Buffs and Buffs actually consumed.</>, Abelito75),
  change(date(2023, 6, 23), <>Holy Prism Average Targets Hit.</>, Abelito75),
  change(date(2023, 6, 22), <>Updated Abilities.jpg.</>, Abelito75),
  change(date(2023, 6, 19), <>Imbued Infusions.png enabled.</>, Abelito75),
  change(date(2023, 6, 19), <>Divine Favor and Barrier of Faith Tracked.</>, Abelito75),
  change(date(2023, 6, 19), <>Judgment of light is 5 not 25.</>, Abelito75),
  change(date(2023, 6, 19), <>Divine Toll checklist item added.</>, Abelito75),
  change(date(2023, 6, 17), <>Devo Aura AM is 15%.</>, Abelito75),
  change(date(2023, 6, 17), <>Rule of Law doens't increase Mastery Range.</>, Abelito75),
  change(date(2023, 6, 16), <>Average Light of Dawn Distance.</>, Abelito75),
  change(date(2023, 5, 15), <>Bump to full support</>, Trevor),
  change(date(2023, 4, 28), <>Add module for T30 Tier set</>, Trevor),
  change(date(2023, 3, 30), <>Update icons for <SpellLink spell={SPELLS.BLESSING_OF_SUMMER_TALENT} />, <SpellLink spell={SPELLS.BLESSING_OF_AUTUMN_TALENT} />, <SpellLink spell={SPELLS.BLESSING_OF_WINTER_TALENT} />, and <SpellLink spell={SPELLS.BLESSING_OF_SPRING_TALENT} />.</>, ToppleTheNun),
  change(date(2023, 1, 26), <>Implement CDR from <SpellLink spell={TALENTS.SEAL_OF_ORDER_TALENT} />,
  {' '}<SpellLink spell={TALENTS.AVENGING_CRUSADER_TALENT} />,
  and <SpellLink spell={SPELLS.BLESSING_OF_AUTUMN_TALENT} /></>, Tialyss),
  change(date(2023, 1, 7), <>Beacon refactoring and better <SpellLink spell={TALENTS.BEACON_OF_VIRTUE_TALENT} /> support.</>, Tialyss),
  change(date(2022, 12, 23), 'Remove myself from Holy Paladin maintainer list.', xizbow),
  change(date(2022, 12, 21), <>Correct <SpellLink spell={TALENTS.BEACON_OF_FAITH_TALENT} /> uptime tracking.</>, ToppleTheNun),
  change(date(2022, 10, 16), <>Modify missed <SpellLink spell={TALENTS.MARAADS_DYING_BREATH_TALENT} /> as was previously legendary</>, CamClark),
  change(date(2022, 10, 11), `Move shadowland legendaries to talents`, CamClark),
  change(date(2022, 10, 5), `Remove redundant spells replaced by talents`, CamClark),
  change(date(2022, 10, 2), `Dragonflight initial cleanup`, CamClark),
];
