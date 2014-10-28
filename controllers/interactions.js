/**
 * Controller for the interactions route.
 * @param req
 * @param res
 * @param Interaction The Interaction model
 * @constructor
 */
var InteractionsController = function(req, res, Interaction)
{

  /**
   * Render output
   */
  this.render = function()
  {
    var interaction = req.body.interaction;
    if ( ! interaction) {
      res.status(400).json('"interaction" parameter empty.');
    } else if ( ! interaction.ResultId) {
      res.status(400).json('Interaction must include the "ResultId" parameter.');
    } else {
      var interactionModel = Interaction.build(interaction);
      interactionModel.setResult(interaction.ResultId);
      interactionModel.save().success(function() {
        res.status(201).json(interaction);
      }).error(function(error) {
        res.status(500).json("Unable to save Interaction.");
      });
    }
  };
};

module.exports = InteractionsController;