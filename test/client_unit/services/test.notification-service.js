var expect = chai.expect;

describe('Notification Service', function() {

  var clock, rootScope, timeout;

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
  // Setup sinon clock
  beforeEach(function() {
    clock = sinon.useFakeTimers();
  });
  // Save root scope and stub $broadcast method.
  beforeEach(inject(function($rootScope) {
    rootScope = $rootScope;
    rootScope.$broadcast = sinon.spy();
  }));
  // Save timeout
  beforeEach(inject(function(_$timeout_) {
    timeout = _$timeout_;
  }));
  // Restore clock after each test
  after(function () { clock.restore(); });

  /** TESTS **/
  it('should contain correct status constants', inject(function(notification) {
    expect(notification.STATUSES.INFO).to.be.an('object');
    expect(notification.STATUSES.SUCCESS).to.be.an('object');
    expect(notification.STATUSES.WARNING).to.be.an('object');
    expect(notification.STATUSES.ERROR).to.be.an('object');
  }));

  it('should add new notifications to scope', inject(function(notification) {
    notification.new(mockNotification);
    expect(rootScope.notifications.length).to.equal(1);
    expect(rootScope.notifications).to.include(mockNotification);
  }));

  it('should remove notification after status duration', inject(function(notification) {
    notification.new(mockNotification).then(function() {
      expect(rootScope.notifications.length).to.equal(0);
    });
    timeout.flush();
  }));

  it('should emit new notification event', inject(function(notification) {
    notification.new(mockNotification);
    expect(rootScope.$broadcast).to.have.been.calledWith('notification.new', { notification: mockNotification, index: 0 });
  }));

  it('should emit notification removed event', inject(function(notification) {
    notification.new(mockNotification).then(function() {
      expect(rootScope.$broadcast).to.have.been.calledWith('notification.new', { notification: mockNotification, index: 0 });
    });
    timeout.flush();
  }));

  it('should add new info notification to scope.', inject(function(notification) {
    notification.info(testMessage);
    expect(rootScope.notifications.length).to.equal(1);
    expect(rootScope.notifications[0].message).to.equal(testMessage);
    expect(rootScope.notifications[0].status).to.equal(notification.STATUSES.INFO);
  }));

  it('should add new success notification to scope.', inject(function(notification) {
    notification.success(testMessage);
    expect(rootScope.notifications.length).to.equal(1);
    expect(rootScope.notifications[0].message).to.equal(testMessage);
    expect(rootScope.notifications[0].status).to.equal(notification.STATUSES.SUCCESS);
  }));

  it('should add new warning notification to scope.', inject(function(notification) {
    notification.warning(testMessage);
    expect(rootScope.notifications.length).to.equal(1);
    expect(rootScope.notifications[0].message).to.equal(testMessage);
    expect(rootScope.notifications[0].status).to.equal(notification.STATUSES.WARNING);
  }));

  it('should add new error notification to scope.', inject(function(notification) {
    notification.error(testMessage);
    expect(rootScope.notifications.length).to.equal(1);
    expect(rootScope.notifications[0].message).to.equal(testMessage);
    expect(rootScope.notifications[0].status).to.equal(notification.STATUSES.ERROR);
  }));

});