var expect = chai.expect;

describe('Notification Service', function() {

  var notification, rootScope, timeout;

  var testMessage = "Test Message";
  var mockNotification = {
    message: testMessage,
    status: {
      duration: 1000
    }
  }

  /** SETUP **/
   // Load the benefisher.services module
  beforeEach(module('benefisher.services'));
  // Save root scope and stub $broadcast method.
  beforeEach(inject(function($rootScope) {
    rootScope = $rootScope;
    rootScope.$broadcast = sinon.spy();
  }));
  // Save timeout
  beforeEach(inject(function(_$timeout_) {
    timeout = _$timeout_;
  }));
  // Get the service
  beforeEach(inject(function(_notification_) {
    notification = _notification_;
  }));

  /** TESTS **/
  it('should contain correct status constants', function() {
    expect(notification.STATUSES.INFO).to.be.an('object');
    expect(notification.STATUSES.SUCCESS).to.be.an('object');
    expect(notification.STATUSES.WARNING).to.be.an('object');
    expect(notification.STATUSES.ERROR).to.be.an('object');
  });

  it('should add new notifications to scope', function() {
    notification.new(mockNotification);
    expect(rootScope.notifications.length).to.equal(1);
    expect(rootScope.notifications).to.include(mockNotification);
  });

  it('should remove notification after status duration', function() {
    notification.new(mockNotification).then(function() {
      expect(rootScope.notifications.length).to.equal(0);
    });
    timeout.flush();
  });

  it('should allow messages that should only be displayed once at a time', function() {
    notification.new(mockNotification, { singleton: true });
    notification.new(mockNotification, { singleton: true });
    expect(rootScope.notifications.length).to.equal(1);
  });

  it('should emit new notification event', function() {
    notification.new(mockNotification);
    expect(rootScope.$broadcast).to.have.been.calledWith('notification.new', { notification: mockNotification, index: 0 });
  });

  it('should emit notification removed event', function() {
    notification.new(mockNotification).then(function() {
      expect(rootScope.$broadcast).to.have.been.calledWith('notification.new', { notification: mockNotification, index: 0 });
    });
    timeout.flush();
  });

  it('should add new info notification to scope.', function() {
    notification.info(testMessage);
    expect(rootScope.notifications.length).to.equal(1);
    expect(rootScope.notifications[0].message).to.equal(testMessage);
    expect(rootScope.notifications[0].status).to.equal(notification.STATUSES.INFO);
  });

  it('should add new success notification to scope.', function() {
    notification.success(testMessage);
    expect(rootScope.notifications.length).to.equal(1);
    expect(rootScope.notifications[0].message).to.equal(testMessage);
    expect(rootScope.notifications[0].status).to.equal(notification.STATUSES.SUCCESS);
  });

  it('should add new warning notification to scope.', function() {
    notification.warning(testMessage);
    expect(rootScope.notifications.length).to.equal(1);
    expect(rootScope.notifications[0].message).to.equal(testMessage);
    expect(rootScope.notifications[0].status).to.equal(notification.STATUSES.WARNING);
  });

  it('should add new error notification to scope.', function() {
    notification.error(testMessage);
    expect(rootScope.notifications.length).to.equal(1);
    expect(rootScope.notifications[0].message).to.equal(testMessage);
    expect(rootScope.notifications[0].status).to.equal(notification.STATUSES.ERROR);
  });

});