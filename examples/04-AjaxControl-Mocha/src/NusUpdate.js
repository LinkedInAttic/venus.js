function NusUpdate($el, config) {
  this.$el    = $el;
  this.$title = $('h1', $el);
  this.$name  = $('h2', $el);
  this.$text  = $('p', $el);
  this.config = config;
}

NusUpdate.prototype.loadData = function(done) {
  var update = this.updateDom, self = this;

  // fetch data from server
  $.get( this.config.dataUrl, function(data) {
    // update DOM
    update.call(self, data);

    // fire done() callback
    done();
  });
};

NusUpdate.prototype.updateDom = function(data) {
    this.$title.html(data.title);
    this.$name.html(data.name);
    this.$text.html(data.text);
};
