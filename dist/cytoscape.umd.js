(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["cytposcape-automove"] = factory());
})(this, (function () { 'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function _typeof(o) {
	  "@babel/helpers - typeof";

	  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, _typeof(o);
	}

	/* eslint-disable no-unused-vars */
	var defaults$1 = {
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
	  // - { x1, y1, x2, y2, type: 'inside' } => constrain the node position within the bounding box (in model co-ordinates)
	  // - { x1, y1, x2, y2, type: 'outside' } => constrain the node position outside the bounding box (in model co-ordinates)
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

	var defaults_1 = defaults$1;

	// Simple, internal Object.assign() polyfill for options objects etc.

	var assign$1 = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
	  for (var _len = arguments.length, srcs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    srcs[_key - 1] = arguments[_key];
	  }
	  srcs.forEach(function (src) {
	    Object.keys(src).forEach(function (k) {
	      return tgt[k] = src[k];
	    });
	  });
	  return tgt;
	};

	var defaults = defaults_1;
	var typeofStr = _typeof('');
	var typeofObj = _typeof({});
	var typeofFn = _typeof(function () {});
	var isObject = function isObject(x) {
	  return _typeof(x) === typeofObj;
	};
	var isString = function isString(x) {
	  return _typeof(x) === typeofStr;
	};
	var isFunction = function isFunction(x) {
	  return _typeof(x) === typeofFn;
	};
	var isCollection = function isCollection(x) {
	  return isObject(x) && isFunction(x.collection);
	};

	// Object.assign() polyfill
	var assign = assign$1;
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
	var bind = function bind(cy, events, selector, fn) {
	  var b = {
	    cy: cy,
	    events: events,
	    selector: selector || 'node',
	    fn: fn
	  };
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
	    if (r.type == undefined || r.type == "inside") {
	      return boxPosition(r);
	    } else if (r.type == "outside") {
	      return outsideBoxPosition(r);
	    }
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
	    var avgPos = {
	      x: 0,
	      y: 0
	    };
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
	var constrainOutsideBox = function constrainOutsideBox(node, bb) {
	  var pos = node.position();
	  var x = pos.x,
	    y = pos.y;
	  var x1 = bb.x1,
	    y1 = bb.y1,
	    x2 = bb.x2,
	    y2 = bb.y2;
	  var inX = x1 <= x && x <= x2;
	  var inY = y1 <= y && y <= y2;
	  var abs = Math.abs;
	  if (inX && inY) {
	    // inside
	    var dx1 = abs(x1 - x);
	    var dx2 = abs(x2 - x);
	    var dy1 = abs(y1 - y);
	    var dy2 = abs(y2 - y);
	    var min = Math.min(dx1, dx2, dy1, dy2); // which side of box is closest?

	    // get position outside, by closest side of box
	    if (min === dx1) {
	      return {
	        x: x1,
	        y: y
	      };
	    } else if (min === dx2) {
	      return {
	        x: x2,
	        y: y
	      };
	    } else if (min === dy1) {
	      return {
	        x: x,
	        y: y1
	      };
	    } else {
	      // min === dy2
	      return {
	        x: x,
	        y: y2
	      };
	    }
	  } else {
	    // outside already
	    return {
	      x: x,
	      y: y
	    };
	  }
	};
	var outsideBoxPosition = function outsideBoxPosition(bb) {
	  return function (node) {
	    return constrainOutsideBox(node, bb);
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
	        rule.p1 = {
	          x: p.x,
	          y: p.y
	        };
	        rule.delta = {
	          x: 0,
	          y: 0
	        };
	      }
	    });
	    bindOnRule(rule, cy, 'drag', 'node', function () {
	      var node = this;
	      if (node.same(rule.grabbedNode)) {
	        var d = rule.delta;
	        var p1 = rule.p1;
	        var p = node.position();
	        var p2 = {
	          x: p.x,
	          y: p.y
	        };
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
	    rule.nodes = rule.nodesMatching.slice();
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
	    scratch.nodes.merge(target);
	  };
	  scratch.onRmNode = function (evt) {
	    var target = evt.target;
	    scratch.nodes.unmerge(target);
	  };
	  cy.on('add', 'node', scratch.onAddNode);
	  cy.on('remove', 'node', scratch.onRmNode);
	};
	var unbindForNodeList = function unbindForNodeList(cy, scratch) {
	  cy.removeListener('add', 'node', scratch.onAddNode);
	  cy.removeListener('remove', 'node', scratch.onRmNode);
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
	          nodes.unmerge(node);
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
	var automove$1 = function automove(options) {
	  var cy = this;
	  var scratch = cy.scratch().automove = cy.scratch().automove || {
	    rules: []
	  };
	  if (scratch.rules.length === 0) {
	    scratch.nodes = cy.nodes().slice();
	    bindForNodeList(cy, scratch);
	  }
	  if (options === 'destroy') {
	    scratch.rules.forEach(function (r) {
	      unbindAllOnRule(r);
	      r.destroyed = true;
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
	      rule.destroyed = true;
	      rules.splice(rules.indexOf(rule), 1);
	      if (rules.length === 0) {
	        unbindForNodeList(cy, scratch);
	      }
	      return this;
	    }
	  };
	};
	var automove_1 = automove$1;

	var automove = automove_1;

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
	var src = register;
	var index = /*@__PURE__*/getDefaultExportFromCjs(src);

	return index;

}));
