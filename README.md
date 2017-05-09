cytoscape-automove
================================================================================


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
  nodesMatching: function( node ){ return false; },

  // specify how a node's position should be updated with one of
  // - function( node ){ return { x: 1, y: 2 }; } => put the node where the function returns
  // - { x1, y1, x2, y2 } => constrain the node position within the bounding box (in model co-ordinates)
  // - 'mean' => put the node in the average position of its neighbourhood
  // - 'viewport' => keeps the node body within the viewport
  reposition: 'mean',

  // specify when the repositioning should occur by specifying a function that
  // calls update() when reposition updates should occur
  // - function( update ){ /* ... */ update(); } => a manual function for updating
  // - 'matching' => automatically update on position events for nodesMatching
  // - set efficiently and automatically for
  //   - reposition: 'mean'
  //   - reposition: { x1, y1, x2, y2 }
  //   - reposition: 'viewport'
  // - default/undefined => on a position event for any node (not as efficient...)
  when: undefined
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


## Publishing instructions

This project is set up to automatically be published to npm and bower.  To publish:

1. Set the version number environment variable: `export VERSION=1.2.3`
1. Publish: `gulp publish`
1. If publishing to bower for the first time, you'll need to run `bower register cytoscape-automove https://github.com/cytoscape/cytoscape.js-automove.git`
