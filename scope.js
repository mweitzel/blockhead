module.exports = {
  extend: function (o) {
    function Scope() {}
    Scope.prototype = o
    return new Scope()
  }
}
