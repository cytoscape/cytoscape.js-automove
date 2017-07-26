cytoscape-automove
================================================================================
[![DOI](https://zenodo.org/badge/60880224.svg)](https://zenodo.org/badge/latestdoi/60880224)

## Description

This extension automatically updates the positions of nodes based on rules that you specify.  

Common usecases:

 * Making one node move in step with another node
 * Constraining a node within a boundary
 * Using a node to represent an n-ary interaction


## Dependencies

 * Cytoscape.js ^2.7.0 || ^3.0.0


## Usage instructions

Download the library:

 * via npm: `npm install cytoscape-automove`,
 * via bower: `bower install cytoscape-automove`, or
 * via direct download in the repository (probably from a tag).

`require()` the library as appropriate for your project:

CommonJS:
```js
var cytoscape = require('cytoscape');
var automove = require('cytoscape-automove');

automove( cytoscape ); // register extension
```

AMD:
```js
require(['cytoscape', 'cytoscape-automove'], function( cytoscape, automove ){
  automove( cytoscape ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.


## API

Each time `cy.automove()` is called, the specified rules are added to the core instance:

```js
var defaults = {
  // specify nodes that should be automoved with one of
  // - a function that returns true for matching nodes
  // - a selector that matches the nodes
  // - a collection of nodes (very good for performance)
  nodesMatching: function( node ){ return false; },

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

var options = defaults;

var rule = cy.automove( options );
```

A rule has a number of functions available:

```js
rule.apply(); // manually apply a rule

rule.enabled(); // get whether rule is enabled

rule.toggle(); // toggle whether the rule is enabled

rule.disable(); // temporarily disable the rule

rule.enable(); // re-enable the rule

rule.destroy(); // remove and clean up just this rule
```

You can also remove all the rules you previously specified:

```js
cy.automove('destroy');
```

## Events

- `automove` : Emitted on a node when its position is changed by a rule
  - `node.on('automove', function( event, rule ){})`


## Publishing instructions

This project is set up to automatically be published to npm and bower.  To publish:

1. Set the version number environment variable: `export VERSION=1.2.3`
1. Publish: `gulp publish`
1. If publishing to bower for the first time, you'll need to run `bower register cytoscape-automove https://github.com/cytoscape/cytoscape.js-automove.git`
1. [Create a release](https://github.com/cytoscape/cytoscape.js/releases/new) for Zenodo from the latest tag
