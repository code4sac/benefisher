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
    var query = req.body.query;
    if ( ! interaction) {
      serverError('"interaction" parameter empty.', 400);
    } else if ( ! interaction.ResultId) {
      serverError('Interaction must include the "ResultId" parameter.', 400);
    } else if (! query.id ) {
      serverError('Interaction must include the "Query" parameter.', 400);
    } else {
      var interactionModel = Interaction.build(interaction);
      interactionModel.QueryId = query.id;
      interactionModel.save().success(function () {
        res.status(201).json(interaction);
      }).error(function(error) {
        serverError("Unable to save Interaction.", 500)
      });
    }
  };

  /**
   * Render a server error.
   * @param message
   * @param status
   */
  function serverError(message, status)
  {
    res.status(status).json({error: message});
  }
};

module.exports = InteractionsController;