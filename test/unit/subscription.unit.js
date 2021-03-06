describe("The Asteroid.subscribe method", function () {

	beforeEach(function () {
		window.DDP = function () {
			ddp = {};
			ddp.on = function (e, f) {
				if (e === "connected") ddp.emitConnected = f;
				if (e === "added") ddp.emitAdded = f;
				if (e === "changed") ddp.emitChanged = f;
				if (e === "removed") ddp.emitRemoved = f;
			};
			ddp.sub = function (n, p, f, s, r) {
				ddp.resolve = f;
				ddp.stop = s;
				ddp.reject = r;
				ddp.params = p;
				return 0;
			};
			ddp.unsub = sinon.spy(function () {
				ddp.stop();
			});
			return ddp;
		};
	});

	afterEach(function () {
		delete window.DDP;
	});

	it("should throw if the first argument is not a string", function () {
		var ceres = new Asteroid("example.com");	
		var troublemaker = function () {
			ceres.subscribe({});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

	it("should save a reference to the subscription", function () {
		var ceres = new Asteroid("example.com");	
		var sub = ceres.subscribe("sub");
		ceres.subscriptions[sub.id].should.equal(sub);
	});

	describe("should return an object with a ready property, which", function () {

		it("is a promise", function () {
			var ceres = new Asteroid("example.com");	
			var promise = ceres.subscribe("sub").ready;
			Q.isPromise(promise).should.equal(true);
		});

		it("will be resolved if the subscription is successful", function () {
			var ceres = new Asteroid("example.com");	
			var promise = ceres.subscribe("sub").ready;
			ceres.ddp.resolve();
			promise.isFulfilled().should.equal(true);
		});

		it("will be rejected if the subscription is not successful", function () {
			var ceres = new Asteroid("example.com");	
			var promise = ceres.subscribe("sub").ready;
			ceres.ddp.reject();
			promise.isRejected().should.equal(true);	
		});

	});

	describe("should return an object with a stop method, which", function () {

		it("is a function", function () {
			var ceres = new Asteroid("example.com");	
			var sub = ceres.subscribe("sub");
			_.isFunction(sub.stop).should.equal(true);
		});

		it("when called will stop the subscription", function () {
			var ceres = new Asteroid("example.com");	
			var sub = ceres.subscribe("sub");
			sub.stop();
			ceres.ddp.unsub.calledWith(sub.id).should.equal(true);
		});

		it("will delete the subscription on stop", function () {
			var ceres = new Asteroid("example.com");	
			var sub = ceres.subscribe("sub");
			ceres.subscriptions[sub.id].should.equal(sub);
			sub.stop();
			_.isUndefined(ceres.subscriptions[sub.id]).should.equal(true);
		});

	});

	it("should pass the correct parameters to the publish function (on the server)", function () {
		var p0 = {};
		var p1 = {};
		var p2 = {};
		// ...
		var ceres = new Asteroid("example.com");	
		var promise = ceres.subscribe("sub", p0, p1, p2);
		ceres.ddp.params[0].should.equal(p0);
		ceres.ddp.params[1].should.equal(p1);
		ceres.ddp.params[2].should.equal(p2);
	});

});
