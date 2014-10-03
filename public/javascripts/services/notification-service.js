/**
 * Created by jesserosato on 9/29/14.
 */
var services = angular.module('benefisher.services');

/**
 * Notification service
 * Receives notifications and adds them to root scope.
 * @param $rootScope
 * @param $timeout
 * @param $sce Service of ngSanitize
 * @constructor
 */
var NotificationService = function ($rootScope, $timeout, $sce) {
  // Init root scope
  $rootScope.notifications = [];
  var self = this;
  // Expose public methods;
  self.info = _info;
  self.success = _success;
  self.warning = _warning;
  self.error = _error;
  self.new = _addNotification;

  /**
   * Status constants
   * @type {{INFO: {class: string, duration: number}, IMPORTANT: {class: string, duration: number}, SUCCESS: {class: string, duration: number}, WARNING: {class: string, duration: number}, ERROR: {class: string, duration: number}}}
   */
  self.STATUSES = {
    INFO: {
      class: 'info',
      duration: 5000
    },
    SUCCESS: {
      class: 'success',
      duration: 3000
    },
    WARNING: {
      class: 'warning',
      duration: 5000
    },
    ERROR: {
      class: 'error',
      duration: 10000
    }
  };

  /**
   * Add an info notification.
   * @param message
   * @returns {Promise}
   * @private
   */
  function _info(message)
  {
    return _addNotification({
      message: message,
      status: self.STATUSES.INFO
    });
  }

  /**
   * Add a success notification.
   * @param message
   * @returns {Promise}
   * @private
   */
  function _success(message)
  {
    return _addNotification({
      message: message,
      status: self.STATUSES.SUCCESS
    });
  }

  /**
   * Add a warning notification.
   * @param message
   * @returns {Promise}
   * @private
   */
  function _warning(message)
  {
    return _addNotification({
      message: message,
      status: self.STATUSES.WARNING
    });
  }

  /**
   * Add an error notification.
   * @param message
   * @returns {Promise}
   * @private
   */
  function _error(message)
  {
    return _addNotification({
      message: message,
      status: self.STATUSES.ERROR
    });
  }

  /**
   * Add a notification to be displayed.
   * @param notification
   * @returns {Promise}
   * @private
   */
  function _addNotification(notification)
  {
    var key = $rootScope.notifications.length;
    $rootScope.notifications.push(notification);
    // Broadcast a 'new notification' event.
    $rootScope.$broadcast('notification.new', { notification: notification, index: key });
    return $timeout(function() {
      $rootScope.notifications.splice(key, 1);
      // Broadcast a 'notification removed' event.
      $rootScope.$broadcast('notification.removed', { notification: notification, index: key });
    }, notification.status.duration);
  }

};

services.service('notification', ['$rootScope', '$timeout', '$sce', NotificationService]);