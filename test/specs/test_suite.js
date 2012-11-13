// Defines the includes for all Venus tests to be run, which in turn
// can be run using `npm test`

require('./config');
require('./executor');
require('./overlord');
require('./testcase');
require('./testrun');
require('./Venus');

require('./runners/phantom');

require('./util/commentsParser');
require('./util/pathHelper');
