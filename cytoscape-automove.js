;(function(){ 'use strict';

  var defaults = {
    // specify nodes that should be automoved with one of
    // - a function that returns true for matching nodes
    // - a selector that matches the nodes
    nodesMatching: function( node ){ return false; },

    // specify how a node's position should be updated with one of
    // - function( node ){ return { x: 1, y: 2 }; } => put the node where the function returns
    // - { x1, y1, x2, y2 } => constrain the node position within the bounding box (in model co-ordinates)
    // - 'mean' => put the node in the average position of its neighbourhood
    // - 'viewport' => keeps the node body within the viewport
    reposition: 'mean',

    // specify when the repositioning should occur by specifying a function that
    // calls update() when reposition updates should occur
    // - function( update ){ /* ... */ } => a manual function for updating
    // - 'matching' => automatically update on position events for nodesMatching
    // - set efficiently and automatically for
    //   - reposition: 'mean'
    //   - reposition: { x1, y1, x2, y2 }
    //   - reposition: 'viewport'
    // - default/undefined => on a position event for any node (not as efficient...)
    when: undefined
  };

  var typeofStr = typeof '';
  var typeofObj = typeof {};

  var isObject = function( x ){ return typeof x === typeofObj; };
  var isString = function( x ){ return typeof x === typeofStr; };

  // Object.assign() polyfill
  var assign = Object.assign ? Object.assign.bind( Object ) : function( tgt ){
    var args = arguments;

    for( var i = 1; i < args.length; i++ ){
      var obj = args[i];

      for( var k in obj ){ tgt[k] = obj[k]; }
    }

    return tgt;
  };

  var requestAnimationFrame = ( window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ).bind( window );

  var onNextTick = function( fn ){
    setTimeout( fn, 0 );
  };

  var eleMatchesSpec = function( ele, spec ){
    if( isString( spec ) ){
      return ele.is( spec );
    } else {
      return spec( ele );
    }
  };

  var bindings = [];

  var bind = function( cy, events, selector, fn ){
    cy.on( events, 'node', fn );

    var b = { cy: cy, events: events, selector: 'node', fn: fn };

    bindings.push( b );

    return b;
  };

  var bindOnRule = function( rule, cy, events, selector, fn ){
    var b = bind( cy, events, selector, fn );
    var bindings = rule.bindings = rule.bindings || [];

    bindings.push( b );
  };

  var unbindAll = function( cy ){
    var sameCy = function( b ){ return cy === b.cy; };
    var unbind = function( b ){ b.cy.off( b.events, b.selector, b.fn ); };

    bindings.filter( sameCy ).forEach( unbind );

    bindings = [];
  };

  var unbindAllOnRule = function( rule ){
    var unbind = function( b ){ b.cy.off( b.events, b.selector, b.fn ); };

    rule.bindings.forEach( unbind );

    rule.bindings = [];
  };

  var getRepositioner = function( spec, cy ){
    if( spec === 'mean' ){
      return meanNeighborhoodPosition;
    } else if( spec === 'viewport' ){
      return viewportPosition( cy );
    } else if( isObject( spec ) ){
      return boxPosition( spec );
    } else {
      return spec;
    }
  };

  var meanNeighborhoodPosition = function( node ){
    var nhood = node.neighbourhood().nodes();
    var avgPos = { x: 0, y: 0 };

    for( var i = 0; i < nhood.length; i++ ){
      var pos = nhood[i].position();

      avgPos.x += pos.x;
      avgPos.y += pos.y;
    }

    avgPos.x /= nhood.length;
    avgPos.y /= nhood.length;

    return avgPos;
  };

  var constrain = function( val, min, max ){
    return val < min ? min : ( val > max ? max : val );
  };

  var constrainInBox = function( node, bb ){
    var pos = node.position();

    return {
      x: constrain( pos.x, bb.x1, bb.x2 ),
      y: constrain( pos.y, bb.y1, bb.y2 )
    };
  };

  var boxPosition = function( bb ){
    return function( node ){
      return constrainInBox( node, bb );
    };
  };

  var viewportPosition = function( cy ){
    return function( node ){
      var extent = cy.extent();
      var w = node.outerWidth();
      var h = node.outerHeight();
      var bb = {
        x1: extent.x1 + w/2,
        x2: extent.x2 - w/2,
        y1: extent.y1 + h/2,
        y2: extent.y2 - h/2
      };

      return constrainInBox( node, bb );
    };
  };

  var meanListener = function( rule ){
    return function( update, cy ){
      bindOnRule( rule, cy, 'position', 'node', function(){
        var movedNode = this;

        if( movedNode.openNeighborhood().some( rule.matches ) ){
          update( cy, [ rule ] );
        }
      });
    };
  };

  var matchingNodesListener = function( rule ){
    return function( update, cy ){
      bindOnRule( rule, cy, 'position', 'node', function(){
        var movedNode = this;

        if( rule.matches( movedNode ) ){
          update( cy, [ rule ] );
        }
      });
    };
  };

  var getListener = function( cy, rule ){
    if( rule.reposition === 'mean' ){
      return meanListener( rule );
    } else if(
      isObject( rule.reposition )
      || rule.when === 'matching'
      || rule.reposition === 'viewport'
    ){
      return matchingNodesListener( rule );
    } else {
      return rule.when;
    }
  };

  var addRule = function( cy, scratch, options ){
    var rule = assign( {}, defaults, options );

    rule.getNewPos = getRepositioner( rule.reposition, cy );
    rule.matches = function( ele ){ return eleMatchesSpec( ele, rule.nodesMatching ); };
    rule.listener = getListener( cy, rule );

    rule.listener( function(){
      update( cy, [ rule ] );
    }, cy );

    rule.enabled = true;

    scratch.rules.push( rule );

    return rule;
  };

  var update = function( cy, rules ){
    var scratch = cy.scratch().automove;
    var nodes = cy.nodes();

    rules = rules != null ? rules : scratch.rules;

    cy.batch(function(){ // batch for performance
      for( var i = 0; i < nodes.length; i++ ){
        var node = nodes[i];

        for( var j = 0; j < rules.length; j++ ){
          var rule = rules[j];

          if( rule.destroyed || !rule.enabled ){ break; } // ignore destroyed rules b/c user may use custom when()

          if( !rule.matches(node) ){ continue; }

          var pos = node.position();
          var newPos = rule.getNewPos( node );
          var newPosIsDiff = pos.x !== newPos.x || pos.y !== newPos.y;

          if( newPosIsDiff ){ // only update on diff for perf
            node.position( newPos );
          }
        }
      }
    });
  };

  // registers the extension on a cytoscape lib ref
  var register = function( cytoscape ){

    if( !cytoscape ){ return; } // can't register if cytoscape unspecified

    cytoscape( 'core', 'automove', function( options ){
      var cy = this;

      var scratch = cy.scratch().automove = cy.scratch().automove || {
        rules: []
      };

      if( options === 'destroy' ){
        scratch.rules.forEach(function( r ){ r.destroy(); });
        scratch.rules.splice( 0, scratch.rules.length );
        return;
      }

      var rule = addRule( cy, scratch, options );

      update( cy, [ rule ] ); // do an initial update to make sure the start state is correct

      return {
        apply: function(){
          update( cy, [ rule ] );
        },

        disable: function(){
          this.toggle( false );
        },

        enable: function(){
          this.toggle( true );
        },

        enabled: function(){
          return rule.enabled;
        },

        toggle: function( on ){
          rule.enabled = on !== undefined ? on : !rule.enabled;

          if( rule.enabled ){
            update( cy, [ rule ] );
          }
        },

        destroy: function(){
          var rules = scratch.rules;

          unbindAllOnRule( rule );

          rules.splice( rules.indexOf( rule ), 1 );

          return this;
        }
      };
    } );

  };

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  } else if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-automove', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape );
  }

})();
