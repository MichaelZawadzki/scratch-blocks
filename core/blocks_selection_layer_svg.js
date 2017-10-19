/**
 * @license
 *
 * Copyright 2017 Amplify Education Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview An SVG that floats on top of the workspace.
 * It is an layer that is between the blocks and the workspace, where dotted lines are rendered
 * to separate each block and highlighted when block is selected.
 * @author cdeng@amplify.com (Chuck Deng)
 */

'use strict';

goog.provide('Blockly.BlocksSelectionLayerSvg');

goog.require('Blockly.utils');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


/**
 * SVG layer that contains the lines behind the blocks.
 * @param {!Element} container Containing element.
 * @constructor
 */
Blockly.BlocksSelectionLayerSvg = function(container) {
  this.container_ = container;
  this.createDom();
  this.createSVGRect_();
};

/**
 * The SVG layer. Set once by Blockly.BlocksSelectionLayerSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.BlocksSelectionLayerSvg.prototype.SVG_ = null;

/**
 * Containing HTML element; parent of the workspace
 * @type {Element}
 * @private
 */
Blockly.BlocksSelectionLayerSvg.prototype.container_ = null;

/**
 * rect to draw on the layer.
 * @type {element}
 * @private 
 */
Blockly.BlocksSelectionLayerSvg.prototype.selectionRect_ = null;

/**
 * Create the layer and inject it into the container.
 */
Blockly.BlocksSelectionLayerSvg.prototype.createDom = function() {
  if (this.SVG_) {
    return;  // Already created.
  }

  /**
  * Dom structure for the workspace highlight layer for the blocks.
  * <svg class="blocklyWsHighlightLayer">
  * </svg>
  */
  this.SVG_ = Blockly.utils.createSvgElement('svg', {
    'xmlns': Blockly.SVG_NS,
    'xmlns:html': Blockly.HTML_NS,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklyBlocksSelectionLayer',
  }, null);
  this.container_.appendChild(this.SVG_);
};


// /**
//  * Create a single svg rect.
//  */
Blockly.BlocksSelectionLayerSvg.prototype.createSVGRect_ = function() {
  
    // Make an SVG Rect to use for highlighting without having to recreate it every time.
    var rect = Blockly.utils.createSvgElement('rect',{
      'x': 0,
      'y': 0,
      'width': 0,
      'height': 0,
      'fill' : '#e4f3fd',
      'stroke' : '#a0d6fb',
      'fill-opacity' : '0.4',
      'class': 'blocksSelectionRect',
      'visibility' : 'hidden',
    }, this.SVG_);
    this.selectionRect_ = rect;

    this.hideRect();
};

Blockly.BlocksSelectionLayerSvg.prototype.setRectVisible = function(visible) {
    var visibility = visible ? 'visible' : 'hidden';
    this.selectionRect_.setAttribute('visibility', visibility);
};

/**
 * Shows the selection rectangle.
 * @param {!element} x, the x position.
 * @param {!element} y, the y position
 */
Blockly.BlocksSelectionLayerSvg.prototype.showRect = function(x, y) {
  if (this.SVG_) {
    var containerRect = this.container_.getBoundingClientRect();
    this.SVG_.setAttribute('width', containerRect.width);
    this.SVG_.setAttribute('height', containerRect.height);
    this.setPosition(x, y);    
    this.setRectVisible(true);

  }
};

/**
 * Hides the selection rectangle.
 */
Blockly.BlocksSelectionLayerSvg.prototype.hideRect = function() {
  if (this.SVG_) {
    this.SVG_.setAttribute('width', 0);
    this.SVG_.setAttribute('height', 0);
    this.setPosition(0, 0);
    this.resize(0, 0);
    this.setRectVisible(false);
  }
};

/**
 * Sets the selection layer position
 * @param {!element} x, x position.
 * @param {!element} y, y position.
 */
Blockly.BlocksSelectionLayerSvg.prototype.setPosition = function(x, y) {
  if (this.selectionRect_) {
    // Update x and y.
    this.selectionRect_.setAttribute('x', x);
    this.selectionRect_.setAttribute('y', y);
  }
};

/**
 * Respond to the selection being resized.
 * @param {!element} width, width of the selection.
 * @param {!element} height, height of the selection.
 */
Blockly.BlocksSelectionLayerSvg.prototype.resize = function(width, height) {
  if (this.selectionRect_) {
    // Update width and height.
    this.selectionRect_.setAttribute('width', width);
    this.selectionRect_.setAttribute('height', height);
  }
};

/**
 * Translate the layer so that it matches the workspace.
 */
Blockly.BlocksSelectionLayerSvg.prototype.translateLayer = function(x, y, scale) {
  if (this.selectionRect_) {
    var translateX = x;
    var translateY = y;
    var translation = 'translate(' + translateX + ',' + translateY + ') ';
    this.selectionRect_.setAttribute('transform', translation);
  }
};
