
/* eslint-disable no-unused-vars */
let defaults = {
  // specify nodes that should be automoved with one of
  // - a function that returns true for matching nodes
  // - a selector that matches the nodes
  // - a collection of nodes (very good for performance)
  nodesMatching: function( node ){ return false; },

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
    meanIgnores: function( node ){ return false; },

    // specify whether moving a particular `nodesMatching` node causes repositioning
    // - true : the mid node can't be independently moved/dragged
    // - false : the mid node can be independently moved/dragged (useful if you want the mid node to use `reposition: 'drag' in another rule with its neighbourhood`)
    meanOnSelfPosition: function( node ){ return true; },

  // `reposition: 'drag'`

    // specify nodes that when dragged cause the matched nodes to move along (i.e. the master nodes)
    // - a function that returns true for nodes to be listened to for drag events
    // - a selector that matches the nodes to be listened to for drag events
    // - a collection of nodes to be listened to for drag events (very good for performance)
    dragWith: function( node ){ return false; }
};

/* eslint-enable */

module.exports = defaults;
