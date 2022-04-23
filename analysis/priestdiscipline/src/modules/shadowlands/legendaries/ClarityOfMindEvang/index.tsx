// import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class ClarityOfMindEvang extends Analyzer {
  healing = 0;

  on_initialized() {
    console.log('test to see if');
  }
  statisticOrder = STATISTIC_ORDER.CORE(40);
}

export default ClarityOfMindEvang;
