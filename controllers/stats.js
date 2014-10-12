/**
 * Controller for the stats route.
 * @param req
 * @param res
 * @constructor
 */
var StatsController = function(req, res)
{

  var results = [];
  var dummyId = 1;

  /**
   * Render output
   */
  this.render = function()
  {
    var stat = req.body.stat;
    if (stat) {
      stat = saveStat(stat);
      console.log(stat);
      res.status(201).json(stat);
    } else {
      res.status(400).send('"stat" parameter empty.');
    }
  };

  /**
   * Save a stats object to the db
   * @param stat
   */
  function saveStat(stat)
  {
    stat.id = dummyId++;
    // save stat to DB
    return stat;
  }

};


module.exports = StatsController;