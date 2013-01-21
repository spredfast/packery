/**
 * Packery Item Element
**/

( function( window ) {

'use strict';

// dependencies
var Packery = window.Packery;
var Rect = Packery.Rect;

// -------------------------- getStyleProperty by kangax -------------------------- //
// http://perfectionkills.com/feature-testing-css-properties/

function capitalize( str ) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

var prefixes = 'Moz Webkit Ms O'.split(' ');

function getStyleProperty( propName ) {
  var style = document.documentElement.style,
      prefixed;

  // test standard property first
  if ( typeof style[propName] === 'string' ) {
    return propName;
  }

  // capitalize
  propName = capitalize( propName );

  // test vendor specific properties
  for ( var i=0, len = prefixes.length; i < len; i++ ) {
    prefixed = prefixes[i] + propName;
    if ( typeof style[ prefixed ] === 'string' ) {
      return prefixed;
    }
  }
}

var transitionProperty = getStyleProperty('transition');
var transitionEndEvent, transitionCSSProperty, transformCSSProperty;

if ( transitionProperty ) {

  transitionEndEvent = {
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'otransitionend',
    transition: 'transitionend'
  }[ transitionProperty ];

  transitionCSSProperty = {
    WebkitTransition: '-webkit-transition',
    MozTransition: '-moz-transition',
    OTransition: '-o-transition',
    transition: 'transition'
  }[ transitionProperty ];

  transformCSSProperty = {
    WebkitTransition: '-webkit-transform',
    MozTransition: '-moz-transform',
    OTransition: '-o-transform',
    transition: 'transform'
  }[ transitionProperty ];

}

// -------------------------- Item -------------------------- //

function Item( element, packery ) {
  this.element = element;
  this.packery = packery;
  this.position = {
    x: 0,
    y: 0
  };

  this.rect = new Rect();

  // style initial style
  this.element.style.position = 'absolute';
}

Item.prototype.handleEvent = function( event ) {
  var method = event.type + 'Handler';
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

Item.prototype.css = function( style ) {
  var elemStyle = this.element.style;
  for ( var prop in style ) {
    elemStyle[ prop ] = style[ prop ];
  }
};

Item.prototype.transitionPosition = function( x, y ) {
  // save end position
  this.position.x = x;
  this.position.y = y;

  // get current x & y
  var elem = this.element;
  var curX = elem.style.left && parseInt( elem.style.left, 10 ) || 0;
  var curY = elem.style.top  && parseInt( elem.style.top,  10 ) || 0;

  var packerySize = this.packery.elementSize;
  var transX = ( x - curX ) + packerySize.paddingLeft;
  var transY = ( y - curY ) + packerySize.paddingTop;

  var transitionStyle = {};
  transitionStyle[ transformCSSProperty ] = 'translate( ' + transX + 'px, ' + transY + 'px)';

  this.transition( transitionStyle, this.layoutPosition );

};

Item.prototype.layoutPosition = function() {
  var packerySize = this.packery.elementSize;
  this.css({
    // set settled position
    left: ( this.position.x + packerySize.paddingLeft ) + 'px',
    top : ( this.position.y + packerySize.paddingTop ) + 'px'
  });
};

/**
 * @param {Object} style - CSS
 * @param {Function} onTransitionEnd
 */
Item.prototype.transition = function( style, onTransitionEnd ) {
  this.transitionStyle = style;

  var transitionValue = [];
  for ( var prop in style ) {
    transitionValue.push( prop );
  }

  // enable transition
  style[ transitionProperty + 'Property' ] = transitionValue.join(',');
  style[ transitionProperty + 'Duration' ] = '1s';

  // transition end callback
  this.onTransitionEnd = onTransitionEnd;
  this.element.addEventListener( transitionEndEvent, this, false );

  // set transition styles
  this.css( style );

  this.isTransitioning = true;
};

Item.prototype.webkitTransitionEndHandler = function( event ) {
  this.transitionEndHandler( event );
};

Item.prototype.mozTransitionEndHandler = function( event ) {
  this.transitionEndHandler( event );
};

Item.prototype.otransitionEndHandler = function( event ) {
  this.transitionEndHandler( event );
};

Item.prototype.transitionEndHandler = function( event ) {
  // disregard bubbled events from children
  if ( event.target !== this.element ) {
    return;
  }

  if ( this.onTransitionEnd ) {
    this.onTransitionEnd();
    delete this.onTransitionEnd;
  }

  // clean up transition styles
  var elemStyle = this.element.style;
  var cleanStyle = {};
  // remove transition
  cleanStyle[ transitionProperty + 'Property' ] = '';
  cleanStyle[ transitionProperty + 'Duration' ] = '';

  for ( var prop in this.transitionStyle ) {
    cleanStyle[ prop ] = '';
  }

  this.css( cleanStyle );

  this.element.removeEventListener( transitionEndEvent, this, false );

  delete this.transitionStyle;

  this.isTransitioning = false;
};

Item.prototype.remove = function() {
  console.log('hiding');
  // start transition
  this.transition({
    '-webkit-transform': 'scale(0.001)',
    opacity: 0
  }, this.removeElem );

};


// remove element from DOM
Item.prototype.removeElem = function() {
  console.log('removing elem');
  this.element.parentNode.removeChild( this.element );
};

Item.prototype.reveal = function() {
  // hide item
  this.css({
    '-webkit-transform': 'scale(0.001)',
    opacity: 0
  });
  // force redraw. http://blog.alexmaccaw.com/css-transitions
  var h = this.element.offsetHeight;
  // transition to revealed
  this.transition({
    '-webkit-transform': 'scale(1)',
    opacity: 1
  });
};

Item.prototype.destroy = function() {
  this.css({
    position: '',
    left: '',
    top: ''
  });
};

// --------------------------  -------------------------- //

// publicize
Packery.Item = Item;

})( window );
