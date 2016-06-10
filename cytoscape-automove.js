;(function(){ 'use strict';

  var typeofStr = typeof '';

  // Object.assign() polyfill
  var assign = /*Object.assign ? Object.assign.bind( Object ) :*/ function( tgt ){
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
    if( typeof spec === typeofStr ){
      return ele.is( spec );
    } else {
      return spec( ele );
    }
  };

  var bindings = [];

  var bind = function( cy, events, selector, fn ){
    cy.on( events, 'node', fn );

    bindings.push({ cy: cy, events: events, selector: 'node', fn: fn });
  };

  var unbindAll = function(){
    bindings.forEach(function( b ){
      b.cy.off( b.events, b.selector, b.fn );
    });

    bindings = [];
  };

  var getRepositioner = function( spec ){
    if( spec === 'mean' ){
      return meanNeighborhoodPosition;
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

  // registers the extension on a cytoscape lib ref
  var register = function( cytoscape ){

    if( !cytoscape ){ return; } // can't register if cytoscape unspecified

    var defaults = {
      // space separated list of events to update on, probably either just 'position' or 'drag'
      events: 'position',

      // specify nodes that should be automoved with a function or a selector string (none by default)
      nodeMatches: function( node ){ return false; },

      // specify how a node's position should be updated with one of
      // - function( node ){ return pos; } => put the node where the function returns
      // - 'mean' => put the node in the average position of its neighbourhood
      reposition: 'mean'
    };

    cytoscape( 'core', 'automove', function( options ){
      var cy = this;

      if( options === 'destroy' ){
        unbindAll();

        return this;
      }

      options = assign( {}, defaults, options );

      var getNewPos = getRepositioner( options.reposition );
      var matches = function( ele ){ return eleMatchesSpec( ele, options.nodeMatches ); };
      var updating = false;

      var update = function( immediate ){
        var node = this;

        // limit updates to once per frame for performance
        if( updating ){
          return;
        } else {
          updating = true;
        }

        var doUpdate = function(){
          var nodes = cy.nodes();

          cy.batch(function(){ // batch for performance
            for( var i = 0; i < nodes.length; i++ ){
              var node = nodes[i];

              if( !matches(node) ){ continue; }

              node.position( getNewPos( node ) );
            }
          });

          updating = false;
        };

        if( immediate ){
          doUpdate();
        } else {
          requestAnimationFrame( doUpdate );
        }

      };

      bind( cy, options.events, '*', update );

      update( true ); // do an initial update to make sure the start state is correct

      return this; // chainability
    } );

  };

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-automove', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape );
  }

})();
