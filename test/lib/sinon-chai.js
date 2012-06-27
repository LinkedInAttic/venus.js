var chai      = require('chai'),
    sinonChai = require('sinon-chai');

chai.use(sinonChai);
module.exports.should = chai.should;
