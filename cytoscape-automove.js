(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeAutomove"] = factory();
	else
		root["cytoscapeAutomove"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var defaults = __webpack_require__(2);

var typeofStr = _typeof('');
var typeofObj = _typeof({});
var typeofFn = _typeof(function () {});

var isObject = function isObject(x) {
  return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === typeofObj;
};
var isString = function isString(x) {
  return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === typeofStr;
};
var isFunction = function isFunction(x) {
  return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === typeofFn;
};
var isCollection = function isCollection(x) {
  return isObject(x) && isFunction(x.collection);
};

// Object.assign() polyfill
var assign = __webpack_require__(1);

var eleExists = function eleExists(ele) {
  return ele != null && !ele.removed();
};

var _elesHasEle = function elesHasEle(eles, ele) {
  if (eles.has != undefined) {
    // 3.x
    _elesHasEle = function elesHasEle(eles, ele) {
      return eles.has(ele);
    };
  } else {
    // 2.x
    _elesHasEle = function elesHasEle(eles, ele) {
      return eles.intersection(ele).length > 0;
    };
  }

  return _elesHasEle(eles, ele);
};

var getEleMatchesSpecFn = function getEleMatchesSpecFn(spec) {
  if (isString(spec)) {
    return function (ele) {
      return ele.is(spec);
    };
  } else if (isFunction(spec)) {
    return spec;
  } else if (isCollection(spec)) {
    return function (ele) {
      return _elesHasEle(spec, ele);
    };
  } else {
    throw new Error('Can not create match function for spec', spec);
  }
};

var bindings = [];

var bind = function bind(cy, events, selector, fn) {
  var b = { cy: cy, events: events, selector: selector || 'node', fn: fn };

  bindings.push(b);

  cy.on(b.events, b.selector, b.fn);

  return b;
};

var bindOnRule = function bindOnRule(rule, cy, events, selector, fn) {
  var b = bind(cy, events, selector, fn);
  var bindings = rule.bindings = rule.bindings || [];

  bindings.push(b);
};

var unbindAllOnRule = function unbindAllOnRule(rule) {
  var unbind = function unbind(b) {
    b.cy.off(b.events, b.selector, b.fn);
  };

  rule.bindings.forEach(unbind);

  rule.bindings = [];
};

var getRepositioner = function getRepositioner(rule, cy) {
  var r = rule.reposition;

  if (r === 'mean') {
    return meanNeighborhoodPosition(getEleMatchesSpecFn(rule.meanIgnores));
  } else if (r === 'viewport') {
    return viewportPosition(cy);
  } else if (r === 'drag') {
    return dragAlong(rule);
  } else if (isObject(r)) {
    return boxPosition(r);
  } else {
    return r;
  }
};

var dragAlong = function dragAlong(rule) {
  return function (node) {
    var pos = node.position();
    var delta = rule.delta;

    if (rule.delta != null && !node.same(rule.grabbedNode) && !node.grabbed()) {
      return {
        x: pos.x + delta.x,
        y: pos.y + delta.y
      };
    }
  };
};

var meanNeighborhoodPosition = function meanNeighborhoodPosition(ignore) {
  return function (node) {
    var nhood = node.neighborhood();
    var avgPos = { x: 0, y: 0 };
    var nhoodSize = 0;

    for (var i = 0; i < nhood.length; i++) {
      var nhoodEle = nhood[i];

      if (nhoodEle.isNode() && !ignore(nhoodEle)) {
        var pos = nhoodEle.position();

        avgPos.x += pos.x;
        avgPos.y += pos.y;

        nhoodSize++;
      }
    }

    // the position should remain unchanged if we would stack the nodes on top of each other
    if (nhoodSize < 2) {
      return undefined;
    }

    avgPos.x /= nhoodSize;
    avgPos.y /= nhoodSize;

    return avgPos;
  };
};

var constrain = function constrain(val, min, max) {
  return val < min ? min : val > max ? max : val;
};

var constrainInBox = function constrainInBox(node, bb) {
  var pos = node.position();

  return {
    x: constrain(pos.x, bb.x1, bb.x2),
    y: constrain(pos.y, bb.y1, bb.y2)
  };
};

var boxPosition = function boxPosition(bb) {
  return function (node) {
    return constrainInBox(node, bb);
  };
};

var viewportPosition = function viewportPosition(cy) {
  return function (node) {
    var extent = cy.extent();
    var w = node.outerWidth();
    var h = node.outerHeight();
    var bb = {
      x1: extent.x1 + w / 2,
      x2: extent.x2 - w / 2,
      y1: extent.y1 + h / 2,
      y2: extent.y2 - h / 2
    };

    return constrainInBox(node, bb);
  };
};

var meanListener = function meanListener(rule) {
  return function (update, cy) {
    var matches = function matches(ele) {
      // must meet ele set and be connected to more than (1 edge + 1 node)
      return rule.matches(ele) && ele.neighborhood().length > 2 && !ele.grabbed();
    };

    bindOnRule(rule, cy, 'position', 'node', function () {
      var movedNode = this;

      if (movedNode.neighborhood().some(matches) || rule.meanOnSelfPosition(movedNode) && matches(movedNode)) {
        update(cy, [rule]);
      }
    });

    bindOnRule(rule, cy, 'add remove', 'edge', function () {
      var edge = this;
      var src = cy.getElementById(edge.data('source'));
      var tgt = cy.getElementById(edge.data('target'));

      if ([src, tgt].some(matches)) {
        update(cy, [rule]);
      }
    });
  };
};

var dragListener = function dragListener(rule) {
  return function (update, cy) {
    bindOnRule(rule, cy, 'grab', 'node', function () {
      var node = this;

      if (rule.dragWithMatches(node)) {
        var p = node.position();

        rule.grabbedNode = node;
        rule.p1 = { x: p.x, y: p.y };
        rule.delta = { x: 0, y: 0 };
      }
    });

    bindOnRule(rule, cy, 'drag', 'node', function () {
      var node = this;

      if (node.same(rule.grabbedNode)) {
        var d = rule.delta;
        var p1 = rule.p1;
        var p = node.position();
        var p2 = { x: p.x, y: p.y };

        d.x = p2.x - p1.x;
        d.y = p2.y - p1.y;

        rule.p1 = p2;

        update(cy, [rule]);
      }
    });

    bindOnRule(rule, cy, 'free', 'node', function () {
      rule.grabbedNode = null;
      rule.delta = null;
      rule.p1 = null;
    });
  };
};

var matchingNodesListener = function matchingNodesListener(rule) {
  return function (update, cy) {
    bindOnRule(rule, cy, 'position', 'node', function () {
      var movedNode = this;

      if (rule.matches(movedNode)) {
        update(cy, [rule]);
      }
    });
  };
};

var getListener = function getListener(cy, rule) {
  if (rule.reposition === 'mean') {
    return meanListener(rule);
  } else if (rule.reposition === 'drag') {
    return dragListener(rule);
  } else if (isObject(rule.reposition) || rule.when === 'matching' || rule.reposition === 'viewport') {
    return matchingNodesListener(rule);
  } else {
    return rule.when;
  }
};

var addRule = function addRule(cy, scratch, options) {
  var rule = assign({}, defaults, options);

  rule.getNewPos = getRepositioner(rule, cy);
  rule.listener = getListener(cy, rule);

  var nodesAreCollection = isCollection(rule.nodesMatching);

  if (nodesAreCollection) {
    rule.nodes = rule.nodesMatching;

    rule.matches = function (ele) {
      return eleExists(ele) && _elesHasEle(rule.nodes, ele);
    };
  } else {
    var matches = getEleMatchesSpecFn(rule.nodesMatching);

    rule.matches = function (ele) {
      return eleExists(ele) && matches(ele);
    };
  }

  if (rule.dragWith != null) {
    rule.dragWithMatches = getEleMatchesSpecFn(rule.dragWith);
  }

  rule.listener(function () {
    update(cy, [rule]);
  }, cy);

  rule.enabled = true;

  scratch.rules.push(rule);

  return rule;
};

var bindForNodeList = function bindForNodeList(cy, scratch) {
  scratch.onAddNode = function (evt) {
    var target = evt.target;

    scratch.nodes.push(target);
  };

  cy.on('add', 'node', scratch.onAddNode);
};

var unbindForNodeList = function unbindForNodeList(cy, scratch) {
  cy.removeListener('add', 'node', scratch.onAddNode);
};

var update = function update(cy, rules) {
  var scratch = cy.scratch().automove;

  rules = rules != null ? rules : scratch.rules;

  cy.batch(function () {
    // batch for performance
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];

      if (rule.destroyed || !rule.enabled) {
        break;
      } // ignore destroyed rules b/c user may use custom when()

      var nodes = rule.nodes || scratch.nodes;

      for (var j = nodes.length - 1; j >= 0; j--) {
        var node = nodes[j];

        if (node.removed()) {
          // remove from list for perf
          nodes.splice(j, 1);
          continue;
        }

        if (!rule.matches(node)) {
          continue;
        }

        var pos = node.position();
        var newPos = rule.getNewPos(node);
        var newPosIsDiff = newPos != null && (pos.x !== newPos.x || pos.y !== newPos.y);

        if (newPosIsDiff) {
          // only update on diff for perf
          node.position(newPos);

          node.trigger('automove', [rule]);
        }
      }
    }
  });
};

var automove = function automove(options) {
  var cy = this;

  var scratch = cy.scratch().automove = cy.scratch().automove || {
    rules: []
  };

  if (scratch.rules.length === 0) {
    scratch.nodes = cy.nodes().toArray();

    bindForNodeList(cy, scratch);
  }

  if (options === 'destroy') {
    scratch.rules.forEach(function (r) {
      r.destroy();
    });
    scratch.rules.splice(0, scratch.rules.length);

    unbindForNodeList(cy, scratch);

    return;
  }

  var rule = addRule(cy, scratch, options);

  update(cy, [rule]); // do an initial update to make sure the start state is correct

  return {
    apply: function apply() {
      update(cy, [rule]);
    },

    disable: function disable() {
      this.toggle(false);
    },

    enable: function enable() {
      this.toggle(true);
    },

    enabled: function enabled() {
      return rule.enabled;
    },

    toggle: function toggle(on) {
      rule.enabled = on !== undefined ? on : !rule.enabled;

      if (rule.enabled) {
        update(cy, [rule]);
      }
    },

    destroy: function destroy() {
      var rules = scratch.rules;

      unbindAllOnRule(rule);

      rules.splice(rules.indexOf(rule), 1);

      if (rules.length === 0) {
        unbindForNodeList(cy, scratch);
      }

      return this;
    }
  };
};

module.exports = automove;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Simple, internal Object.assign() polyfill for options objects etc.

module.exports = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
  for (var _len = arguments.length, srcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }

  srcs.forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });

  return tgt;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint-disable no-unused-vars */
var defaults = {
  // specify nodes that should be automoved with one of
  // - a function that returns true for matching nodes
  // - a selector that matches the nodes
  // - a collection of nodes (very good for performance)
  nodesMatching: function nodesMatching(node) {
    return false;
  },

  // specify how a node's position should be updated with one of
  // - function( node ){ return { x: 1, y: 2 }; } => put the node where the function returns
  // - { x1, y1, x2, y2 } => constrain the node position within the bounding box (in model co-ordinates)
  // - 'mean' => put the node in the average position of its neighbourhood
  // - 'viewport' => keeps the node body within the viewport
  // - 'drag' => matching nodes are effectively dragged along
  reposition: 'mean',

  // specify when the repositioning should occur by specifying a function that
  // calls update() when reposition updates should occur
  // - function( update ){ /* ... */ update(); } => a manual function for updating
  // - 'matching' => automatically update on position events for nodesMatching
  // - set efficiently and automatically for
  //   - reposition: 'mean'
  //   - reposition: { x1, y1, x2, y2 }
  //   - reposition: 'viewport'
  //   - reposition: 'drag'
  // - default/undefined => on a position event for any node (not as efficient...)
  when: undefined,

  //
  // customisation options for non-function `reposition` values
  //

  // `reposition: 'mean'`

  // specify nodes that should be ignored in the mean calculation
  // - a function that returns true for nodes to be ignored
  // - a selector that matches the nodes to be ignored
  // - a collection of nodes to be ignored (very good for performance)
  meanIgnores: function meanIgnores(node) {
    return false;
  },

  // specify whether moving a particular `nodesMatching` node causes repositioning
  // - true : the mid node can't be independently moved/dragged
  // - false : the mid node can be independently moved/dragged (useful if you want the mid node to use `reposition: 'drag' in another rule with its neighbourhood`)
  meanOnSelfPosition: function meanOnSelfPosition(node) {
    return true;
  },

  // `reposition: 'drag'`

  // specify nodes that when dragged cause the matched nodes to move along (i.e. the master nodes)
  // - a function that returns true for nodes to be listened to for drag events
  // - a selector that matches the nodes to be listened to for drag events
  // - a collection of nodes to be listened to for drag events (very good for performance)
  dragWith: function dragWith(node) {
    return false;
  }
};

/* eslint-enable */

module.exports = defaults;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var automove = __webpack_require__(0);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('core', 'automove', automove); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}

module.exports = register;

/***/ })
/******/ ]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA1YTZjNzIwMTI4MDY4YWQ1NTdhMyIsIndlYnBhY2s6Ly8vLi9zcmMvYXV0b21vdmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Fzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbImRlZmF1bHRzIiwicmVxdWlyZSIsInR5cGVvZlN0ciIsInR5cGVvZk9iaiIsInR5cGVvZkZuIiwiaXNPYmplY3QiLCJ4IiwiaXNTdHJpbmciLCJpc0Z1bmN0aW9uIiwiaXNDb2xsZWN0aW9uIiwiY29sbGVjdGlvbiIsImFzc2lnbiIsImVsZUV4aXN0cyIsImVsZSIsInJlbW92ZWQiLCJlbGVzSGFzRWxlIiwiZWxlcyIsImhhcyIsInVuZGVmaW5lZCIsImludGVyc2VjdGlvbiIsImxlbmd0aCIsImdldEVsZU1hdGNoZXNTcGVjRm4iLCJzcGVjIiwiaXMiLCJFcnJvciIsImJpbmRpbmdzIiwiYmluZCIsImN5IiwiZXZlbnRzIiwic2VsZWN0b3IiLCJmbiIsImIiLCJwdXNoIiwib24iLCJiaW5kT25SdWxlIiwicnVsZSIsInVuYmluZEFsbE9uUnVsZSIsInVuYmluZCIsIm9mZiIsImZvckVhY2giLCJnZXRSZXBvc2l0aW9uZXIiLCJyIiwicmVwb3NpdGlvbiIsIm1lYW5OZWlnaGJvcmhvb2RQb3NpdGlvbiIsIm1lYW5JZ25vcmVzIiwidmlld3BvcnRQb3NpdGlvbiIsImRyYWdBbG9uZyIsImJveFBvc2l0aW9uIiwibm9kZSIsInBvcyIsInBvc2l0aW9uIiwiZGVsdGEiLCJzYW1lIiwiZ3JhYmJlZE5vZGUiLCJncmFiYmVkIiwieSIsImlnbm9yZSIsIm5ob29kIiwibmVpZ2hib3Job29kIiwiYXZnUG9zIiwibmhvb2RTaXplIiwiaSIsIm5ob29kRWxlIiwiaXNOb2RlIiwiY29uc3RyYWluIiwidmFsIiwibWluIiwibWF4IiwiY29uc3RyYWluSW5Cb3giLCJiYiIsIngxIiwieDIiLCJ5MSIsInkyIiwiZXh0ZW50IiwidyIsIm91dGVyV2lkdGgiLCJoIiwib3V0ZXJIZWlnaHQiLCJtZWFuTGlzdGVuZXIiLCJ1cGRhdGUiLCJtYXRjaGVzIiwibW92ZWROb2RlIiwic29tZSIsIm1lYW5PblNlbGZQb3NpdGlvbiIsImVkZ2UiLCJzcmMiLCJnZXRFbGVtZW50QnlJZCIsImRhdGEiLCJ0Z3QiLCJkcmFnTGlzdGVuZXIiLCJkcmFnV2l0aE1hdGNoZXMiLCJwIiwicDEiLCJkIiwicDIiLCJtYXRjaGluZ05vZGVzTGlzdGVuZXIiLCJnZXRMaXN0ZW5lciIsIndoZW4iLCJhZGRSdWxlIiwic2NyYXRjaCIsIm9wdGlvbnMiLCJnZXROZXdQb3MiLCJsaXN0ZW5lciIsIm5vZGVzQXJlQ29sbGVjdGlvbiIsIm5vZGVzTWF0Y2hpbmciLCJub2RlcyIsImRyYWdXaXRoIiwiZW5hYmxlZCIsInJ1bGVzIiwiYmluZEZvck5vZGVMaXN0Iiwib25BZGROb2RlIiwiZXZ0IiwidGFyZ2V0IiwidW5iaW5kRm9yTm9kZUxpc3QiLCJyZW1vdmVMaXN0ZW5lciIsImF1dG9tb3ZlIiwiYmF0Y2giLCJkZXN0cm95ZWQiLCJqIiwic3BsaWNlIiwibmV3UG9zIiwibmV3UG9zSXNEaWZmIiwidHJpZ2dlciIsInRvQXJyYXkiLCJkZXN0cm95IiwiYXBwbHkiLCJkaXNhYmxlIiwidG9nZ2xlIiwiZW5hYmxlIiwiaW5kZXhPZiIsIm1vZHVsZSIsImV4cG9ydHMiLCJPYmplY3QiLCJzcmNzIiwia2V5cyIsImsiLCJyZWdpc3RlciIsImN5dG9zY2FwZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFqQjs7QUFFQTtBQUNBLElBQUl3SSxXQUFXLFNBQVhBLFFBQVcsQ0FBVUMsU0FBVixFQUFxQjtBQUNsQyxNQUFJLENBQUNBLFNBQUwsRUFBZ0I7QUFBRTtBQUFTLEdBRE8sQ0FDTjs7QUFFNUJBLFlBQVcsTUFBWCxFQUFtQixVQUFuQixFQUErQnRCLFFBQS9CLEVBSGtDLENBR1M7QUFDNUMsQ0FKRDs7QUFNQSxJQUFJLE9BQU9zQixTQUFQLEtBQXFCLFdBQXpCLEVBQXNDO0FBQUU7QUFDdENELFdBQVVDLFNBQVY7QUFDRDs7QUFFRFAsT0FBT0MsT0FBUCxHQUFpQkssUUFBakIsQyIsImZpbGUiOiJjeXRvc2NhcGUtYXV0b21vdmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJjeXRvc2NhcGVBdXRvbW92ZVwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJjeXRvc2NhcGVBdXRvbW92ZVwiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIFxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDMpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDVhNmM3MjAxMjgwNjhhZDU1N2EzIiwibGV0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG5sZXQgdHlwZW9mU3RyID0gdHlwZW9mICcnO1xubGV0IHR5cGVvZk9iaiA9IHR5cGVvZiB7fTtcbmxldCB0eXBlb2ZGbiA9IHR5cGVvZiBmdW5jdGlvbigpe307XG5cbmxldCBpc09iamVjdCA9IGZ1bmN0aW9uKCB4ICl7IHJldHVybiB0eXBlb2YgeCA9PT0gdHlwZW9mT2JqOyB9O1xubGV0IGlzU3RyaW5nID0gZnVuY3Rpb24oIHggKXsgcmV0dXJuIHR5cGVvZiB4ID09PSB0eXBlb2ZTdHI7IH07XG5sZXQgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKCB4ICl7IHJldHVybiB0eXBlb2YgeCA9PT0gdHlwZW9mRm47IH07XG5sZXQgaXNDb2xsZWN0aW9uID0gZnVuY3Rpb24oIHggKXsgcmV0dXJuIGlzT2JqZWN0KCB4ICkgJiYgaXNGdW5jdGlvbiggeC5jb2xsZWN0aW9uICk7IH07XG5cbi8vIE9iamVjdC5hc3NpZ24oKSBwb2x5ZmlsbFxubGV0IGFzc2lnbiA9IHJlcXVpcmUoJy4vYXNzaWduJyk7XG5cbmxldCBlbGVFeGlzdHMgPSBmdW5jdGlvbiggZWxlICl7XG4gIHJldHVybiBlbGUgIT0gbnVsbCAmJiAhZWxlLnJlbW92ZWQoKTtcbn07XG5cbmxldCBlbGVzSGFzRWxlID0gZnVuY3Rpb24oIGVsZXMsIGVsZSApe1xuICBpZiggZWxlcy5oYXMgIT0gdW5kZWZpbmVkICl7IC8vIDMueFxuICAgIGVsZXNIYXNFbGUgPSBmdW5jdGlvbiggZWxlcywgZWxlICl7IHJldHVybiBlbGVzLmhhcyggZWxlICk7IH07XG4gIH0gZWxzZSB7IC8vIDIueFxuICAgIGVsZXNIYXNFbGUgPSBmdW5jdGlvbiggZWxlcywgZWxlICl7IHJldHVybiBlbGVzLmludGVyc2VjdGlvbiggZWxlICkubGVuZ3RoID4gMDsgfTtcbiAgfVxuXG4gIHJldHVybiBlbGVzSGFzRWxlKCBlbGVzLCBlbGUgKTtcbn07XG5cbmxldCBnZXRFbGVNYXRjaGVzU3BlY0ZuID0gZnVuY3Rpb24oIHNwZWMgKXtcbiAgaWYoIGlzU3RyaW5nKCBzcGVjICkgKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oIGVsZSApe1xuICAgICAgcmV0dXJuIGVsZS5pcyggc3BlYyApO1xuICAgIH07XG4gIH0gZWxzZSBpZiggaXNGdW5jdGlvbiggc3BlYyApICl7XG4gICAgcmV0dXJuIHNwZWM7XG4gIH0gZWxzZSBpZiggaXNDb2xsZWN0aW9uKCBzcGVjICkgKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oIGVsZSApe1xuICAgICAgcmV0dXJuIGVsZXNIYXNFbGUoIHNwZWMsIGVsZSApO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGNyZWF0ZSBtYXRjaCBmdW5jdGlvbiBmb3Igc3BlYycsIHNwZWMpO1xuICB9XG59O1xuXG5sZXQgYmluZGluZ3MgPSBbXTtcblxubGV0IGJpbmQgPSBmdW5jdGlvbiggY3ksIGV2ZW50cywgc2VsZWN0b3IsIGZuICl7XG4gIGxldCBiID0geyBjeTogY3ksIGV2ZW50czogZXZlbnRzLCBzZWxlY3Rvcjogc2VsZWN0b3IgfHwgJ25vZGUnLCBmbjogZm4gfTtcblxuICBiaW5kaW5ncy5wdXNoKCBiICk7XG5cbiAgY3kub24oIGIuZXZlbnRzLCBiLnNlbGVjdG9yLCBiLmZuICk7XG5cbiAgcmV0dXJuIGI7XG59O1xuXG5sZXQgYmluZE9uUnVsZSA9IGZ1bmN0aW9uKCBydWxlLCBjeSwgZXZlbnRzLCBzZWxlY3RvciwgZm4gKXtcbiAgbGV0IGIgPSBiaW5kKCBjeSwgZXZlbnRzLCBzZWxlY3RvciwgZm4gKTtcbiAgbGV0IGJpbmRpbmdzID0gcnVsZS5iaW5kaW5ncyA9IHJ1bGUuYmluZGluZ3MgfHwgW107XG5cbiAgYmluZGluZ3MucHVzaCggYiApO1xufTtcblxubGV0IHVuYmluZEFsbE9uUnVsZSA9IGZ1bmN0aW9uKCBydWxlICl7XG4gIGxldCB1bmJpbmQgPSBmdW5jdGlvbiggYiApeyBiLmN5Lm9mZiggYi5ldmVudHMsIGIuc2VsZWN0b3IsIGIuZm4gKTsgfTtcblxuICBydWxlLmJpbmRpbmdzLmZvckVhY2goIHVuYmluZCApO1xuXG4gIHJ1bGUuYmluZGluZ3MgPSBbXTtcbn07XG5cbmxldCBnZXRSZXBvc2l0aW9uZXIgPSBmdW5jdGlvbiggcnVsZSwgY3kgKXtcbiAgbGV0IHIgPSBydWxlLnJlcG9zaXRpb247XG5cbiAgaWYoIHIgPT09ICdtZWFuJyApe1xuICAgIHJldHVybiBtZWFuTmVpZ2hib3Job29kUG9zaXRpb24oIGdldEVsZU1hdGNoZXNTcGVjRm4oIHJ1bGUubWVhbklnbm9yZXMgKSApO1xuICB9IGVsc2UgaWYoIHIgPT09ICd2aWV3cG9ydCcgKXtcbiAgICByZXR1cm4gdmlld3BvcnRQb3NpdGlvbiggY3kgKTtcbiAgfSBlbHNlIGlmKCByID09PSAnZHJhZycgKXtcbiAgICByZXR1cm4gZHJhZ0Fsb25nKCBydWxlICk7XG4gIH0gZWxzZSBpZiggaXNPYmplY3QoIHIgKSApe1xuICAgIHJldHVybiBib3hQb3NpdGlvbiggciApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiByO1xuICB9XG59O1xuXG5sZXQgZHJhZ0Fsb25nID0gZnVuY3Rpb24oIHJ1bGUgKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCBub2RlICl7XG4gICAgbGV0IHBvcyA9IG5vZGUucG9zaXRpb24oKTtcbiAgICBsZXQgZGVsdGEgPSBydWxlLmRlbHRhO1xuXG4gICAgaWYoIHJ1bGUuZGVsdGEgIT0gbnVsbCAmJiAhbm9kZS5zYW1lKCBydWxlLmdyYWJiZWROb2RlICkgJiYgIW5vZGUuZ3JhYmJlZCgpICl7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiBwb3MueCArIGRlbHRhLngsXG4gICAgICAgIHk6IHBvcy55ICsgZGVsdGEueVxuICAgICAgfTtcbiAgICB9XG4gIH07XG59O1xuXG5sZXQgbWVhbk5laWdoYm9yaG9vZFBvc2l0aW9uID0gZnVuY3Rpb24oIGlnbm9yZSApe1xuICByZXR1cm4gZnVuY3Rpb24oIG5vZGUgKXtcbiAgICBsZXQgbmhvb2QgPSBub2RlLm5laWdoYm9yaG9vZCgpO1xuICAgIGxldCBhdmdQb3MgPSB7IHg6IDAsIHk6IDAgfTtcbiAgICBsZXQgbmhvb2RTaXplID0gMDtcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgbmhvb2QubGVuZ3RoOyBpKysgKXtcbiAgICAgIGxldCBuaG9vZEVsZSA9IG5ob29kW2ldO1xuXG4gICAgICBpZiggbmhvb2RFbGUuaXNOb2RlKCkgJiYgIWlnbm9yZSggbmhvb2RFbGUgKSApe1xuICAgICAgICBsZXQgcG9zID0gbmhvb2RFbGUucG9zaXRpb24oKTtcblxuICAgICAgICBhdmdQb3MueCArPSBwb3MueDtcbiAgICAgICAgYXZnUG9zLnkgKz0gcG9zLnk7XG5cbiAgICAgICAgbmhvb2RTaXplKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdGhlIHBvc2l0aW9uIHNob3VsZCByZW1haW4gdW5jaGFuZ2VkIGlmIHdlIHdvdWxkIHN0YWNrIHRoZSBub2RlcyBvbiB0b3Agb2YgZWFjaCBvdGhlclxuICAgIGlmKCBuaG9vZFNpemUgPCAyICl7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGF2Z1Bvcy54IC89IG5ob29kU2l6ZTtcbiAgICBhdmdQb3MueSAvPSBuaG9vZFNpemU7XG5cbiAgICByZXR1cm4gYXZnUG9zO1xuICB9O1xufTtcblxubGV0IGNvbnN0cmFpbiA9IGZ1bmN0aW9uKCB2YWwsIG1pbiwgbWF4ICl7XG4gIHJldHVybiB2YWwgPCBtaW4gPyBtaW4gOiAoIHZhbCA+IG1heCA/IG1heCA6IHZhbCApO1xufTtcblxubGV0IGNvbnN0cmFpbkluQm94ID0gZnVuY3Rpb24oIG5vZGUsIGJiICl7XG4gIGxldCBwb3MgPSBub2RlLnBvc2l0aW9uKCk7XG5cbiAgcmV0dXJuIHtcbiAgICB4OiBjb25zdHJhaW4oIHBvcy54LCBiYi54MSwgYmIueDIgKSxcbiAgICB5OiBjb25zdHJhaW4oIHBvcy55LCBiYi55MSwgYmIueTIgKVxuICB9O1xufTtcblxubGV0IGJveFBvc2l0aW9uID0gZnVuY3Rpb24oIGJiICl7XG4gIHJldHVybiBmdW5jdGlvbiggbm9kZSApe1xuICAgIHJldHVybiBjb25zdHJhaW5JbkJveCggbm9kZSwgYmIgKTtcbiAgfTtcbn07XG5cbmxldCB2aWV3cG9ydFBvc2l0aW9uID0gZnVuY3Rpb24oIGN5ICl7XG4gIHJldHVybiBmdW5jdGlvbiggbm9kZSApe1xuICAgIGxldCBleHRlbnQgPSBjeS5leHRlbnQoKTtcbiAgICBsZXQgdyA9IG5vZGUub3V0ZXJXaWR0aCgpO1xuICAgIGxldCBoID0gbm9kZS5vdXRlckhlaWdodCgpO1xuICAgIGxldCBiYiA9IHtcbiAgICAgIHgxOiBleHRlbnQueDEgKyB3LzIsXG4gICAgICB4MjogZXh0ZW50LngyIC0gdy8yLFxuICAgICAgeTE6IGV4dGVudC55MSArIGgvMixcbiAgICAgIHkyOiBleHRlbnQueTIgLSBoLzJcbiAgICB9O1xuXG4gICAgcmV0dXJuIGNvbnN0cmFpbkluQm94KCBub2RlLCBiYiApO1xuICB9O1xufTtcblxubGV0IG1lYW5MaXN0ZW5lciA9IGZ1bmN0aW9uKCBydWxlICl7XG4gIHJldHVybiBmdW5jdGlvbiggdXBkYXRlLCBjeSApe1xuICAgIGxldCBtYXRjaGVzID0gZnVuY3Rpb24oIGVsZSApe1xuICAgICAgLy8gbXVzdCBtZWV0IGVsZSBzZXQgYW5kIGJlIGNvbm5lY3RlZCB0byBtb3JlIHRoYW4gKDEgZWRnZSArIDEgbm9kZSlcbiAgICAgIHJldHVybiBydWxlLm1hdGNoZXMoIGVsZSApICYmIGVsZS5uZWlnaGJvcmhvb2QoKS5sZW5ndGggPiAyICYmICFlbGUuZ3JhYmJlZCgpO1xuICAgIH07XG5cbiAgICBiaW5kT25SdWxlKCBydWxlLCBjeSwgJ3Bvc2l0aW9uJywgJ25vZGUnLCBmdW5jdGlvbigpe1xuICAgICAgbGV0IG1vdmVkTm9kZSA9IHRoaXM7XG5cbiAgICAgIGlmKFxuICAgICAgICBtb3ZlZE5vZGUubmVpZ2hib3Job29kKCkuc29tZSggbWF0Y2hlcyApIHx8XG4gICAgICAgICggcnVsZS5tZWFuT25TZWxmUG9zaXRpb24oIG1vdmVkTm9kZSApICYmIG1hdGNoZXMoIG1vdmVkTm9kZSApIClcbiAgICAgICl7XG4gICAgICAgIHVwZGF0ZSggY3ksIFsgcnVsZSBdICk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBiaW5kT25SdWxlKCBydWxlLCBjeSwgJ2FkZCByZW1vdmUnLCAnZWRnZScsIGZ1bmN0aW9uKCl7XG4gICAgICBsZXQgZWRnZSA9IHRoaXM7XG4gICAgICBsZXQgc3JjID0gY3kuZ2V0RWxlbWVudEJ5SWQoIGVkZ2UuZGF0YSgnc291cmNlJykgKTtcbiAgICAgIGxldCB0Z3QgPSBjeS5nZXRFbGVtZW50QnlJZCggZWRnZS5kYXRhKCd0YXJnZXQnKSApO1xuXG4gICAgICBpZiggWyBzcmMsIHRndCBdLnNvbWUoIG1hdGNoZXMgKSApe1xuICAgICAgICB1cGRhdGUoIGN5LCBbIHJ1bGUgXSApO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xufTtcblxubGV0IGRyYWdMaXN0ZW5lciA9IGZ1bmN0aW9uKCBydWxlICl7XG4gIHJldHVybiBmdW5jdGlvbiggdXBkYXRlLCBjeSApe1xuICAgIGJpbmRPblJ1bGUoIHJ1bGUsIGN5LCAnZ3JhYicsICdub2RlJywgZnVuY3Rpb24oKXtcbiAgICAgIGxldCBub2RlID0gdGhpcztcblxuICAgICAgaWYoIHJ1bGUuZHJhZ1dpdGhNYXRjaGVzKCBub2RlICkgKXtcbiAgICAgICAgbGV0IHAgPSBub2RlLnBvc2l0aW9uKCk7XG5cbiAgICAgICAgcnVsZS5ncmFiYmVkTm9kZSA9IG5vZGU7XG4gICAgICAgIHJ1bGUucDEgPSB7IHg6IHAueCwgeTogcC55IH07XG4gICAgICAgIHJ1bGUuZGVsdGEgPSB7IHg6IDAsIHk6IDAgfTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGJpbmRPblJ1bGUoIHJ1bGUsIGN5LCAnZHJhZycsICdub2RlJywgZnVuY3Rpb24oKXtcbiAgICAgIGxldCBub2RlID0gdGhpcztcblxuICAgICAgaWYoIG5vZGUuc2FtZSggcnVsZS5ncmFiYmVkTm9kZSApICl7XG4gICAgICAgIGxldCBkID0gcnVsZS5kZWx0YTtcbiAgICAgICAgbGV0IHAxID0gcnVsZS5wMTtcbiAgICAgICAgbGV0IHAgPSBub2RlLnBvc2l0aW9uKCk7XG4gICAgICAgIGxldCBwMiA9IHsgeDogcC54LCB5OiBwLnkgfTtcblxuICAgICAgICBkLnggPSBwMi54IC0gcDEueDtcbiAgICAgICAgZC55ID0gcDIueSAtIHAxLnk7XG5cbiAgICAgICAgcnVsZS5wMSA9IHAyO1xuXG4gICAgICAgIHVwZGF0ZSggY3ksIFsgcnVsZSBdICk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBiaW5kT25SdWxlKCBydWxlLCBjeSwgJ2ZyZWUnLCAnbm9kZScsIGZ1bmN0aW9uKCl7XG4gICAgICBydWxlLmdyYWJiZWROb2RlID0gbnVsbDtcbiAgICAgIHJ1bGUuZGVsdGEgPSBudWxsO1xuICAgICAgcnVsZS5wMSA9IG51bGw7XG4gICAgfSk7XG4gIH07XG59O1xuXG5sZXQgbWF0Y2hpbmdOb2Rlc0xpc3RlbmVyID0gZnVuY3Rpb24oIHJ1bGUgKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCB1cGRhdGUsIGN5ICl7XG4gICAgYmluZE9uUnVsZSggcnVsZSwgY3ksICdwb3NpdGlvbicsICdub2RlJywgZnVuY3Rpb24oKXtcbiAgICAgIGxldCBtb3ZlZE5vZGUgPSB0aGlzO1xuXG4gICAgICBpZiggcnVsZS5tYXRjaGVzKCBtb3ZlZE5vZGUgKSApe1xuICAgICAgICB1cGRhdGUoIGN5LCBbIHJ1bGUgXSApO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xufTtcblxubGV0IGdldExpc3RlbmVyID0gZnVuY3Rpb24oIGN5LCBydWxlICl7XG4gIGlmKCBydWxlLnJlcG9zaXRpb24gPT09ICdtZWFuJyApe1xuICAgIHJldHVybiBtZWFuTGlzdGVuZXIoIHJ1bGUgKTtcbiAgfSBlbHNlIGlmKCBydWxlLnJlcG9zaXRpb24gPT09ICdkcmFnJyApe1xuICAgIHJldHVybiBkcmFnTGlzdGVuZXIoIHJ1bGUgKTtcbiAgfSBlbHNlIGlmKFxuICAgIGlzT2JqZWN0KCBydWxlLnJlcG9zaXRpb24gKVxuICAgIHx8IHJ1bGUud2hlbiA9PT0gJ21hdGNoaW5nJ1xuICAgIHx8IHJ1bGUucmVwb3NpdGlvbiA9PT0gJ3ZpZXdwb3J0J1xuICApe1xuICAgIHJldHVybiBtYXRjaGluZ05vZGVzTGlzdGVuZXIoIHJ1bGUgKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcnVsZS53aGVuO1xuICB9XG59O1xuXG5sZXQgYWRkUnVsZSA9IGZ1bmN0aW9uKCBjeSwgc2NyYXRjaCwgb3B0aW9ucyApe1xuICBsZXQgcnVsZSA9IGFzc2lnbigge30sIGRlZmF1bHRzLCBvcHRpb25zICk7XG5cbiAgcnVsZS5nZXROZXdQb3MgPSBnZXRSZXBvc2l0aW9uZXIoIHJ1bGUsIGN5ICk7XG4gIHJ1bGUubGlzdGVuZXIgPSBnZXRMaXN0ZW5lciggY3ksIHJ1bGUgKTtcblxuICBsZXQgbm9kZXNBcmVDb2xsZWN0aW9uID0gaXNDb2xsZWN0aW9uKCBydWxlLm5vZGVzTWF0Y2hpbmcgKTtcblxuICBpZiggbm9kZXNBcmVDb2xsZWN0aW9uICl7XG4gICAgcnVsZS5ub2RlcyA9IHJ1bGUubm9kZXNNYXRjaGluZztcblxuICAgIHJ1bGUubWF0Y2hlcyA9IGZ1bmN0aW9uKCBlbGUgKXsgcmV0dXJuIGVsZUV4aXN0cyggZWxlICkgJiYgZWxlc0hhc0VsZSggcnVsZS5ub2RlcywgZWxlICk7IH07XG4gIH0gZWxzZSB7XG4gICAgbGV0IG1hdGNoZXMgPSBnZXRFbGVNYXRjaGVzU3BlY0ZuKCBydWxlLm5vZGVzTWF0Y2hpbmcgKTtcblxuICAgIHJ1bGUubWF0Y2hlcyA9IGZ1bmN0aW9uKCBlbGUgKXsgcmV0dXJuIGVsZUV4aXN0cyggZWxlICkgJiYgbWF0Y2hlcyggZWxlICk7IH07XG4gIH1cblxuICBpZiggcnVsZS5kcmFnV2l0aCAhPSBudWxsICl7XG4gICAgcnVsZS5kcmFnV2l0aE1hdGNoZXMgPSBnZXRFbGVNYXRjaGVzU3BlY0ZuKCBydWxlLmRyYWdXaXRoICk7XG4gIH1cblxuICBydWxlLmxpc3RlbmVyKCBmdW5jdGlvbigpe1xuICAgIHVwZGF0ZSggY3ksIFsgcnVsZSBdICk7XG4gIH0sIGN5ICk7XG5cbiAgcnVsZS5lbmFibGVkID0gdHJ1ZTtcblxuICBzY3JhdGNoLnJ1bGVzLnB1c2goIHJ1bGUgKTtcblxuICByZXR1cm4gcnVsZTtcbn07XG5cbmxldCBiaW5kRm9yTm9kZUxpc3QgPSBmdW5jdGlvbiggY3ksIHNjcmF0Y2ggKXtcbiAgc2NyYXRjaC5vbkFkZE5vZGUgPSBmdW5jdGlvbiggZXZ0ICl7XG4gICAgbGV0IHRhcmdldCA9IGV2dC50YXJnZXQ7XG5cbiAgICBzY3JhdGNoLm5vZGVzLnB1c2goIHRhcmdldCApO1xuICB9O1xuXG4gIGN5Lm9uKCdhZGQnLCAnbm9kZScsIHNjcmF0Y2gub25BZGROb2RlKTtcbn07XG5cbmxldCB1bmJpbmRGb3JOb2RlTGlzdCA9IGZ1bmN0aW9uKCBjeSwgc2NyYXRjaCApe1xuICBjeS5yZW1vdmVMaXN0ZW5lcignYWRkJywgJ25vZGUnLCBzY3JhdGNoLm9uQWRkTm9kZSk7XG59O1xuXG5sZXQgdXBkYXRlID0gZnVuY3Rpb24oIGN5LCBydWxlcyApe1xuICBsZXQgc2NyYXRjaCA9IGN5LnNjcmF0Y2goKS5hdXRvbW92ZTtcblxuICBydWxlcyA9IHJ1bGVzICE9IG51bGwgPyBydWxlcyA6IHNjcmF0Y2gucnVsZXM7XG5cbiAgY3kuYmF0Y2goZnVuY3Rpb24oKXsgLy8gYmF0Y2ggZm9yIHBlcmZvcm1hbmNlXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKyApe1xuICAgICAgbGV0IHJ1bGUgPSBydWxlc1tpXTtcblxuICAgICAgaWYoIHJ1bGUuZGVzdHJveWVkIHx8ICFydWxlLmVuYWJsZWQgKXsgYnJlYWs7IH0gLy8gaWdub3JlIGRlc3Ryb3llZCBydWxlcyBiL2MgdXNlciBtYXkgdXNlIGN1c3RvbSB3aGVuKClcblxuICAgICAgbGV0IG5vZGVzID0gcnVsZS5ub2RlcyB8fCBzY3JhdGNoLm5vZGVzO1xuXG4gICAgICBmb3IoIGxldCBqID0gbm9kZXMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0gKXtcbiAgICAgICAgbGV0IG5vZGUgPSBub2Rlc1tqXTtcblxuICAgICAgICBpZiggbm9kZS5yZW1vdmVkKCkgKXsgLy8gcmVtb3ZlIGZyb20gbGlzdCBmb3IgcGVyZlxuICAgICAgICAgIG5vZGVzLnNwbGljZSggaiwgMSApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFydWxlLm1hdGNoZXMobm9kZSkgKXsgY29udGludWU7IH1cblxuICAgICAgICBsZXQgcG9zID0gbm9kZS5wb3NpdGlvbigpO1xuICAgICAgICBsZXQgbmV3UG9zID0gcnVsZS5nZXROZXdQb3MoIG5vZGUgKTtcbiAgICAgICAgbGV0IG5ld1Bvc0lzRGlmZiA9IG5ld1BvcyAhPSBudWxsICYmICggcG9zLnggIT09IG5ld1Bvcy54IHx8IHBvcy55ICE9PSBuZXdQb3MueSApO1xuXG4gICAgICAgIGlmKCBuZXdQb3NJc0RpZmYgKXsgLy8gb25seSB1cGRhdGUgb24gZGlmZiBmb3IgcGVyZlxuICAgICAgICAgIG5vZGUucG9zaXRpb24oIG5ld1BvcyApO1xuXG4gICAgICAgICAgbm9kZS50cmlnZ2VyKCAnYXV0b21vdmUnLCBbcnVsZV0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59O1xuXG5sZXQgYXV0b21vdmUgPSBmdW5jdGlvbiggb3B0aW9ucyApe1xuICBsZXQgY3kgPSB0aGlzO1xuXG4gIGxldCBzY3JhdGNoID0gY3kuc2NyYXRjaCgpLmF1dG9tb3ZlID0gY3kuc2NyYXRjaCgpLmF1dG9tb3ZlIHx8IHtcbiAgICBydWxlczogW11cbiAgfTtcblxuICBpZiggc2NyYXRjaC5ydWxlcy5sZW5ndGggPT09IDAgKXtcbiAgICBzY3JhdGNoLm5vZGVzID0gY3kubm9kZXMoKS50b0FycmF5KCk7XG5cbiAgICBiaW5kRm9yTm9kZUxpc3QoIGN5LCBzY3JhdGNoICk7XG4gIH1cblxuICBpZiggb3B0aW9ucyA9PT0gJ2Rlc3Ryb3knICl7XG4gICAgc2NyYXRjaC5ydWxlcy5mb3JFYWNoKGZ1bmN0aW9uKCByICl7IHIuZGVzdHJveSgpOyB9KTtcbiAgICBzY3JhdGNoLnJ1bGVzLnNwbGljZSggMCwgc2NyYXRjaC5ydWxlcy5sZW5ndGggKTtcblxuICAgIHVuYmluZEZvck5vZGVMaXN0KCBjeSwgc2NyYXRjaCApO1xuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IHJ1bGUgPSBhZGRSdWxlKCBjeSwgc2NyYXRjaCwgb3B0aW9ucyApO1xuXG4gIHVwZGF0ZSggY3ksIFsgcnVsZSBdICk7IC8vIGRvIGFuIGluaXRpYWwgdXBkYXRlIHRvIG1ha2Ugc3VyZSB0aGUgc3RhcnQgc3RhdGUgaXMgY29ycmVjdFxuXG4gIHJldHVybiB7XG4gICAgYXBwbHk6IGZ1bmN0aW9uKCl7XG4gICAgICB1cGRhdGUoIGN5LCBbIHJ1bGUgXSApO1xuICAgIH0sXG5cbiAgICBkaXNhYmxlOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy50b2dnbGUoIGZhbHNlICk7XG4gICAgfSxcblxuICAgIGVuYWJsZTogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMudG9nZ2xlKCB0cnVlICk7XG4gICAgfSxcblxuICAgIGVuYWJsZWQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gcnVsZS5lbmFibGVkO1xuICAgIH0sXG5cbiAgICB0b2dnbGU6IGZ1bmN0aW9uKCBvbiApe1xuICAgICAgcnVsZS5lbmFibGVkID0gb24gIT09IHVuZGVmaW5lZCA/IG9uIDogIXJ1bGUuZW5hYmxlZDtcblxuICAgICAgaWYoIHJ1bGUuZW5hYmxlZCApe1xuICAgICAgICB1cGRhdGUoIGN5LCBbIHJ1bGUgXSApO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBkZXN0cm95OiBmdW5jdGlvbigpe1xuICAgICAgbGV0IHJ1bGVzID0gc2NyYXRjaC5ydWxlcztcblxuICAgICAgdW5iaW5kQWxsT25SdWxlKCBydWxlICk7XG5cbiAgICAgIHJ1bGVzLnNwbGljZSggcnVsZXMuaW5kZXhPZiggcnVsZSApLCAxICk7XG5cbiAgICAgIGlmKCBydWxlcy5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgdW5iaW5kRm9yTm9kZUxpc3QoIGN5LCBzY3JhdGNoICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXV0b21vdmU7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvYXV0b21vdmUuanMiLCIvLyBTaW1wbGUsIGludGVybmFsIE9iamVjdC5hc3NpZ24oKSBwb2x5ZmlsbCBmb3Igb3B0aW9ucyBvYmplY3RzIGV0Yy5cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduICE9IG51bGwgPyBPYmplY3QuYXNzaWduLmJpbmQoIE9iamVjdCApIDogZnVuY3Rpb24oIHRndCwgLi4uc3JjcyApe1xuICBzcmNzLmZvckVhY2goIHNyYyA9PiB7XG4gICAgT2JqZWN0LmtleXMoIHNyYyApLmZvckVhY2goIGsgPT4gdGd0W2tdID0gc3JjW2tdICk7XG4gIH0gKTtcblxuICByZXR1cm4gdGd0O1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hc3NpZ24uanMiLCJcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5sZXQgZGVmYXVsdHMgPSB7XG4gIC8vIHNwZWNpZnkgbm9kZXMgdGhhdCBzaG91bGQgYmUgYXV0b21vdmVkIHdpdGggb25lIG9mXG4gIC8vIC0gYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdHJ1ZSBmb3IgbWF0Y2hpbmcgbm9kZXNcbiAgLy8gLSBhIHNlbGVjdG9yIHRoYXQgbWF0Y2hlcyB0aGUgbm9kZXNcbiAgLy8gLSBhIGNvbGxlY3Rpb24gb2Ygbm9kZXMgKHZlcnkgZ29vZCBmb3IgcGVyZm9ybWFuY2UpXG4gIG5vZGVzTWF0Y2hpbmc6IGZ1bmN0aW9uKCBub2RlICl7IHJldHVybiBmYWxzZTsgfSxcblxuICAvLyBzcGVjaWZ5IGhvdyBhIG5vZGUncyBwb3NpdGlvbiBzaG91bGQgYmUgdXBkYXRlZCB3aXRoIG9uZSBvZlxuICAvLyAtIGZ1bmN0aW9uKCBub2RlICl7IHJldHVybiB7IHg6IDEsIHk6IDIgfTsgfSA9PiBwdXQgdGhlIG5vZGUgd2hlcmUgdGhlIGZ1bmN0aW9uIHJldHVybnNcbiAgLy8gLSB7IHgxLCB5MSwgeDIsIHkyIH0gPT4gY29uc3RyYWluIHRoZSBub2RlIHBvc2l0aW9uIHdpdGhpbiB0aGUgYm91bmRpbmcgYm94IChpbiBtb2RlbCBjby1vcmRpbmF0ZXMpXG4gIC8vIC0gJ21lYW4nID0+IHB1dCB0aGUgbm9kZSBpbiB0aGUgYXZlcmFnZSBwb3NpdGlvbiBvZiBpdHMgbmVpZ2hib3VyaG9vZFxuICAvLyAtICd2aWV3cG9ydCcgPT4ga2VlcHMgdGhlIG5vZGUgYm9keSB3aXRoaW4gdGhlIHZpZXdwb3J0XG4gIC8vIC0gJ2RyYWcnID0+IG1hdGNoaW5nIG5vZGVzIGFyZSBlZmZlY3RpdmVseSBkcmFnZ2VkIGFsb25nXG4gIHJlcG9zaXRpb246ICdtZWFuJyxcblxuICAvLyBzcGVjaWZ5IHdoZW4gdGhlIHJlcG9zaXRpb25pbmcgc2hvdWxkIG9jY3VyIGJ5IHNwZWNpZnlpbmcgYSBmdW5jdGlvbiB0aGF0XG4gIC8vIGNhbGxzIHVwZGF0ZSgpIHdoZW4gcmVwb3NpdGlvbiB1cGRhdGVzIHNob3VsZCBvY2N1clxuICAvLyAtIGZ1bmN0aW9uKCB1cGRhdGUgKXsgLyogLi4uICovIHVwZGF0ZSgpOyB9ID0+IGEgbWFudWFsIGZ1bmN0aW9uIGZvciB1cGRhdGluZ1xuICAvLyAtICdtYXRjaGluZycgPT4gYXV0b21hdGljYWxseSB1cGRhdGUgb24gcG9zaXRpb24gZXZlbnRzIGZvciBub2Rlc01hdGNoaW5nXG4gIC8vIC0gc2V0IGVmZmljaWVudGx5IGFuZCBhdXRvbWF0aWNhbGx5IGZvclxuICAvLyAgIC0gcmVwb3NpdGlvbjogJ21lYW4nXG4gIC8vICAgLSByZXBvc2l0aW9uOiB7IHgxLCB5MSwgeDIsIHkyIH1cbiAgLy8gICAtIHJlcG9zaXRpb246ICd2aWV3cG9ydCdcbiAgLy8gICAtIHJlcG9zaXRpb246ICdkcmFnJ1xuICAvLyAtIGRlZmF1bHQvdW5kZWZpbmVkID0+IG9uIGEgcG9zaXRpb24gZXZlbnQgZm9yIGFueSBub2RlIChub3QgYXMgZWZmaWNpZW50Li4uKVxuICB3aGVuOiB1bmRlZmluZWQsXG5cblxuXG4gIC8vXG4gIC8vIGN1c3RvbWlzYXRpb24gb3B0aW9ucyBmb3Igbm9uLWZ1bmN0aW9uIGByZXBvc2l0aW9uYCB2YWx1ZXNcbiAgLy9cblxuICAvLyBgcmVwb3NpdGlvbjogJ21lYW4nYFxuXG4gICAgLy8gc3BlY2lmeSBub2RlcyB0aGF0IHNob3VsZCBiZSBpZ25vcmVkIGluIHRoZSBtZWFuIGNhbGN1bGF0aW9uXG4gICAgLy8gLSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0cnVlIGZvciBub2RlcyB0byBiZSBpZ25vcmVkXG4gICAgLy8gLSBhIHNlbGVjdG9yIHRoYXQgbWF0Y2hlcyB0aGUgbm9kZXMgdG8gYmUgaWdub3JlZFxuICAgIC8vIC0gYSBjb2xsZWN0aW9uIG9mIG5vZGVzIHRvIGJlIGlnbm9yZWQgKHZlcnkgZ29vZCBmb3IgcGVyZm9ybWFuY2UpXG4gICAgbWVhbklnbm9yZXM6IGZ1bmN0aW9uKCBub2RlICl7IHJldHVybiBmYWxzZTsgfSxcblxuICAgIC8vIHNwZWNpZnkgd2hldGhlciBtb3ZpbmcgYSBwYXJ0aWN1bGFyIGBub2Rlc01hdGNoaW5nYCBub2RlIGNhdXNlcyByZXBvc2l0aW9uaW5nXG4gICAgLy8gLSB0cnVlIDogdGhlIG1pZCBub2RlIGNhbid0IGJlIGluZGVwZW5kZW50bHkgbW92ZWQvZHJhZ2dlZFxuICAgIC8vIC0gZmFsc2UgOiB0aGUgbWlkIG5vZGUgY2FuIGJlIGluZGVwZW5kZW50bHkgbW92ZWQvZHJhZ2dlZCAodXNlZnVsIGlmIHlvdSB3YW50IHRoZSBtaWQgbm9kZSB0byB1c2UgYHJlcG9zaXRpb246ICdkcmFnJyBpbiBhbm90aGVyIHJ1bGUgd2l0aCBpdHMgbmVpZ2hib3VyaG9vZGApXG4gICAgbWVhbk9uU2VsZlBvc2l0aW9uOiBmdW5jdGlvbiggbm9kZSApeyByZXR1cm4gdHJ1ZTsgfSxcblxuICAvLyBgcmVwb3NpdGlvbjogJ2RyYWcnYFxuXG4gICAgLy8gc3BlY2lmeSBub2RlcyB0aGF0IHdoZW4gZHJhZ2dlZCBjYXVzZSB0aGUgbWF0Y2hlZCBub2RlcyB0byBtb3ZlIGFsb25nIChpLmUuIHRoZSBtYXN0ZXIgbm9kZXMpXG4gICAgLy8gLSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0cnVlIGZvciBub2RlcyB0byBiZSBsaXN0ZW5lZCB0byBmb3IgZHJhZyBldmVudHNcbiAgICAvLyAtIGEgc2VsZWN0b3IgdGhhdCBtYXRjaGVzIHRoZSBub2RlcyB0byBiZSBsaXN0ZW5lZCB0byBmb3IgZHJhZyBldmVudHNcbiAgICAvLyAtIGEgY29sbGVjdGlvbiBvZiBub2RlcyB0byBiZSBsaXN0ZW5lZCB0byBmb3IgZHJhZyBldmVudHMgKHZlcnkgZ29vZCBmb3IgcGVyZm9ybWFuY2UpXG4gICAgZHJhZ1dpdGg6IGZ1bmN0aW9uKCBub2RlICl7IHJldHVybiBmYWxzZTsgfVxufTtcblxuLyogZXNsaW50LWVuYWJsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2RlZmF1bHRzLmpzIiwiY29uc3QgYXV0b21vdmUgPSByZXF1aXJlKCcuL2F1dG9tb3ZlJyk7XG5cbi8vIHJlZ2lzdGVycyB0aGUgZXh0ZW5zaW9uIG9uIGEgY3l0b3NjYXBlIGxpYiByZWZcbmxldCByZWdpc3RlciA9IGZ1bmN0aW9uKCBjeXRvc2NhcGUgKXtcbiAgaWYoICFjeXRvc2NhcGUgKXsgcmV0dXJuOyB9IC8vIGNhbid0IHJlZ2lzdGVyIGlmIGN5dG9zY2FwZSB1bnNwZWNpZmllZFxuXG4gIGN5dG9zY2FwZSggJ2NvcmUnLCAnYXV0b21vdmUnLCBhdXRvbW92ZSApOyAvLyByZWdpc3RlciB3aXRoIGN5dG9zY2FwZS5qc1xufTtcblxuaWYoIHR5cGVvZiBjeXRvc2NhcGUgIT09ICd1bmRlZmluZWQnICl7IC8vIGV4cG9zZSB0byBnbG9iYWwgY3l0b3NjYXBlIChpLmUuIHdpbmRvdy5jeXRvc2NhcGUpXG4gIHJlZ2lzdGVyKCBjeXRvc2NhcGUgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZWdpc3RlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VSb290IjoiIn0=