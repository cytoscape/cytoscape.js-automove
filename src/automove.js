let defaults = require('./defaults');

let typeofStr = typeof '';
let typeofObj = typeof {};
let typeofFn = typeof function(){};

let isObject = function( x ){ return typeof x === typeofObj; };
let isString = function( x ){ return typeof x === typeofStr; };
let isFunction = function( x ){ return typeof x === typeofFn; };
let isCollection = function( x ){ return isObject( x ) && isFunction( x.collection ); };

// Object.assign() polyfill
let assign = require('./assign');

let eleExists = function( ele ){
  return ele != null && !ele.removed();
};

let elesHasEle = function( eles, ele ){
  if( eles.has != undefined ){ // 3.x
    elesHasEle = function( eles, ele ){ return eles.has( ele ); };
  } else { // 2.x
    elesHasEle = function( eles, ele ){ return eles.intersection( ele ).length > 0; };
  }

  return elesHasEle( eles, ele );
};

let getEleMatchesSpecFn = function( spec ){
  if( isString( spec ) ){
    return function( ele ){
      return ele.is( spec );
    };
  } else if( isFunction( spec ) ){
    return spec;
  } else if( isCollection( spec ) ){
    return function( ele ){
      return elesHasEle( spec, ele );
    };
  } else {
    throw new Error('Can not create match function for spec', spec);
  }
};

let bindings = [];

let bind = function( cy, events, selector, fn ){
  let b = { cy: cy, events: events, selector: selector || 'node', fn: fn };

  bindings.push( b );

  cy.on( b.events, b.selector, b.fn );

  return b;
};

let bindOnRule = function( rule, cy, events, selector, fn ){
  let b = bind( cy, events, selector, fn );
  let bindings = rule.bindings = rule.bindings || [];

  bindings.push( b );
};

let unbindAllOnRule = function( rule ){
  let unbind = function( b ){ b.cy.off( b.events, b.selector, b.fn ); };

  rule.bindings.forEach( unbind );

  rule.bindings = [];
};

let getRepositioner = function( rule, cy ){
  let r = rule.reposition;

  if( r === 'mean' ){
    return meanNeighborhoodPosition( getEleMatchesSpecFn( rule.meanIgnores ) );
  } else if( r === 'viewport' ){
    return viewportPosition( cy );
  } else if( r === 'drag' ){
    return dragAlong( rule );
  } else if( isObject( r ) ){
    if( r.type == undefined || r.type == "inside" ){
      return boxPosition( r );
    }
    else if( r.type == "outside" ){
      return outsideBoxPosition( r );
    }
  } else {
    return r;
  }
};

let dragAlong = function( rule ){
  return function( node ){
    let pos = node.position();
    let delta = rule.delta;

    if( rule.delta != null && !node.same( rule.grabbedNode ) && !node.grabbed() ){
      return {
        x: pos.x + delta.x,
        y: pos.y + delta.y
      };
    }
  };
};

let meanNeighborhoodPosition = function( ignore ){
  return function( node ){
    let nhood = node.neighborhood();
    let avgPos = { x: 0, y: 0 };
    let nhoodSize = 0;

    for( let i = 0; i < nhood.length; i++ ){
      let nhoodEle = nhood[i];

      if( nhoodEle.isNode() && !ignore( nhoodEle ) ){
        let pos = nhoodEle.position();

        avgPos.x += pos.x;
        avgPos.y += pos.y;

        nhoodSize++;
      }
    }

    // the position should remain unchanged if we would stack the nodes on top of each other
    if( nhoodSize < 2 ){
      return undefined;
    }

    avgPos.x /= nhoodSize;
    avgPos.y /= nhoodSize;

    return avgPos;
  };
};

let constrain = function( val, min, max ){
  return val < min ? min : ( val > max ? max : val );
};

let constrainInBox = function( node, bb ){
  let pos = node.position();

  return {
    x: constrain( pos.x, bb.x1, bb.x2 ),
    y: constrain( pos.y, bb.y1, bb.y2 )
  };
};

let boxPosition = function( bb ){
  return function( node ){
    return constrainInBox( node, bb );
  };
};

let constrainOutsideBox = function( node, bb ){
  let pos = node.position();
  let { x, y } = pos;
  let { x1, y1, x2, y2 } = bb;
  let inX = x1 <= x && x <= x2;
  let inY = y1 <= y && y <= y2;
  let abs = Math.abs;

  if( inX && inY ){ // inside
    let dx1 = abs(x1 - x);
    let dx2 = abs(x2 - x);
    let dy1 = abs(y1 - y);
    let dy2 = abs(y2 - y);
    let min = Math.min(dx1, dx2, dy1, dy2); // which side of box is closest?

    // get position outside, by closest side of box
    if( min === dx1 ){
      return { x: x1, y };
    } else if( min === dx2 ){
      return { x: x2, y };
    } else if( min === dy1 ){
      return { x, y: y1 };
    } else { // min === dy2
      return { x, y: y2 };
    }
  } else { // outside already
    return { x, y };
  }
};

let outsideBoxPosition = function( bb ){
  return function( node ){
    return constrainOutsideBox( node, bb );
  };
};

let viewportPosition = function( cy ){
  return function( node ){
    let extent = cy.extent();
    let w = node.outerWidth();
    let h = node.outerHeight();
    let bb = {
      x1: extent.x1 + w/2,
      x2: extent.x2 - w/2,
      y1: extent.y1 + h/2,
      y2: extent.y2 - h/2
    };

    return constrainInBox( node, bb );
  };
};

let meanListener = function( rule ){
  return function( update, cy ){
    let matches = function( ele ){
      // must meet ele set and be connected to more than (1 edge + 1 node)
      return rule.matches( ele ) && ele.neighborhood().length > 2 && !ele.grabbed();
    };

    bindOnRule( rule, cy, 'position', 'node', function(){
      let movedNode = this;

      if(
        movedNode.neighborhood().some( matches ) ||
        ( rule.meanOnSelfPosition( movedNode ) && matches( movedNode ) )
      ){
        update( cy, [ rule ] );
      }
    });

    bindOnRule( rule, cy, 'add remove', 'edge', function(){
      let edge = this;
      let src = cy.getElementById( edge.data('source') );
      let tgt = cy.getElementById( edge.data('target') );

      if( [ src, tgt ].some( matches ) ){
        update( cy, [ rule ] );
      }
    });
  };
};

let dragListener = function( rule ){
  return function( update, cy ){
    bindOnRule( rule, cy, 'grab', 'node', function(){
      let node = this;

      if( rule.dragWithMatches( node ) ){
        let p = node.position();

        rule.grabbedNode = node;
        rule.p1 = { x: p.x, y: p.y };
        rule.delta = { x: 0, y: 0 };
      }
    });

    bindOnRule( rule, cy, 'drag', 'node', function(){
      let node = this;

      if( node.same( rule.grabbedNode ) ){
        let d = rule.delta;
        let p1 = rule.p1;
        let p = node.position();
        let p2 = { x: p.x, y: p.y };

        d.x = p2.x - p1.x;
        d.y = p2.y - p1.y;

        rule.p1 = p2;

        update( cy, [ rule ] );
      }
    });

    bindOnRule( rule, cy, 'free', 'node', function(){
      rule.grabbedNode = null;
      rule.delta = null;
      rule.p1 = null;
    });
  };
};

let matchingNodesListener = function( rule ){
  return function( update, cy ){
    bindOnRule( rule, cy, 'position', 'node', function(){
      let movedNode = this;

      if( rule.matches( movedNode ) ){
        update( cy, [ rule ] );
      }
    });
  };
};

let getListener = function( cy, rule ){
  if( rule.reposition === 'mean' ){
    return meanListener( rule );
  } else if( rule.reposition === 'drag' ){
    return dragListener( rule );
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

let addRule = function( cy, scratch, options ){
  let rule = assign( {}, defaults, options );

  rule.getNewPos = getRepositioner( rule, cy );
  rule.listener = getListener( cy, rule );

  let nodesAreCollection = isCollection( rule.nodesMatching );

  if( nodesAreCollection ){
    rule.nodes = rule.nodesMatching.slice();

    rule.matches = function( ele ){ return eleExists( ele ) && elesHasEle( rule.nodes, ele ); };
  } else {
    let matches = getEleMatchesSpecFn( rule.nodesMatching );

    rule.matches = function( ele ){ return eleExists( ele ) && matches( ele ); };
  }

  if( rule.dragWith != null ){
    rule.dragWithMatches = getEleMatchesSpecFn( rule.dragWith );
  }

  rule.listener( function(){
    update( cy, [ rule ] );
  }, cy );

  rule.enabled = true;

  scratch.rules.push( rule );

  return rule;
};

let bindForNodeList = function( cy, scratch ){
  scratch.onAddNode = function( evt ){
    let target = evt.target;

    scratch.nodes.merge( target );
  };

  scratch.onRmNode = function( evt ){
    let target = evt.target;

    scratch.nodes.unmerge( target );
  };

  cy.on('add', 'node', scratch.onAddNode);
  cy.on('remove', 'node', scratch.onRmNode);
};

let unbindForNodeList = function( cy, scratch ){
  cy.removeListener('add', 'node', scratch.onAddNode);
  cy.removeListener('remove', 'node', scratch.onRmNode);
};

let update = function( cy, rules ){
  let scratch = cy.scratch().automove;

  rules = rules != null ? rules : scratch.rules;

  cy.batch(function(){ // batch for performance
    for( let i = 0; i < rules.length; i++ ){
      let rule = rules[i];

      if( rule.destroyed || !rule.enabled ){ break; } // ignore destroyed rules b/c user may use custom when()

      let nodes = rule.nodes || scratch.nodes;

      for( let j = nodes.length - 1; j >= 0; j-- ){
        let node = nodes[j];

        if( node.removed() ){ // remove from list for perf
          nodes.unmerge( node );
          continue;
        }

        if( !rule.matches(node) ){ continue; }

        let pos = node.position();
        let newPos = rule.getNewPos( node );
        let newPosIsDiff = newPos != null && ( pos.x !== newPos.x || pos.y !== newPos.y );

        if( newPosIsDiff ){ // only update on diff for perf
          node.position( newPos );

          node.trigger( 'automove', [rule] );
        }
      }
    }
  });
};

let automove = function( options ){
  let cy = this;

  let scratch = cy.scratch().automove = cy.scratch().automove || {
    rules: []
  };

  if( scratch.rules.length === 0 ){
    scratch.nodes = cy.nodes().slice();

    bindForNodeList( cy, scratch );
  }

  if( options === 'destroy' ){
    scratch.rules.forEach(function( r ){
      unbindAllOnRule( r );

      r.destroyed = true;
    });

    scratch.rules.splice( 0, scratch.rules.length );

    unbindForNodeList( cy, scratch );

    return;
  }

  let rule = addRule( cy, scratch, options );

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
      let rules = scratch.rules;

      unbindAllOnRule( rule );

      rule.destroyed = true;

      rules.splice( rules.indexOf( rule ), 1 );

      if( rules.length === 0 ){
        unbindForNodeList( cy, scratch );
      }

      return this;
    }
  };
};

module.exports = automove;
