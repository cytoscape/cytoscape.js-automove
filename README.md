cytoscape-automove
================================================================================


## Description

This extension automatically updates the positions of nodes based on rules that you specify.  

Common usecases
 * Making one node move in step with another node
 * Constraining a node within a boundary
 * Using a node to represent an n-ary interaction


## Dependencies

 * Cytoscape.js ^2.7.0


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
  // space separated list of events to update on, probably either just 'position' or 'drag'
  events: 'position',

  // specify nodes that should be automoved with a function or a selector string (none by default)
  nodeMatches: function( node ){ return false; },

  // specify how a node's position should be updated with one of
  // - function( node ){ return pos; } => put the node where the function returns
  // - 'mean' => put the node in the average position of its neighbourhood
  reposition: 'mean'
};

var options = defaults;

cy.automove( options );
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
