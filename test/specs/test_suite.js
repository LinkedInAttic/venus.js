// Defines the includes for all Venus tests to be run, which in turn
// can be run using `npm test`

require('./config.spec');
require('./executor.spec');
require('./executor.http.spec');
require('./executor.socketio.spec');
require('./testcase.spec');
require('./testrun.spec');
require('./Venus.spec');

require('./uac/phantom.spec');

require('./util/commentsParser.spec');
require('./util/pathHelper.spec');
