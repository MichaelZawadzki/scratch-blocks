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

goog.provide('Blockly.WorkspaceHighlightLayerSvg');

goog.require('Blockly.utils');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


/**
 * SVG layer that contains the lines behind the blocks.
 * @param {!Element} container Containing element.
 * @constructor
 */
Blockly.WorkspaceHighlightLayerSvg = function(container) {
  this.container_ = container;
  this.createDom();

  // Make a bunch of lines so that we don't need to dynamically create them.
  for (var i = 0; i < 100; i++) {
    var line = Blockly.utils.createSvgElement('line',{
      'x1': 0,
      'y1': 10 + (10*i),
      'x2': 300,
      'y2': 10 + (10*i),
      'class': 'blockHighlightLine',
      'visibility' : 'hidden',
    }, this.SVG_);
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke', '#b6b6b6');
    line.setAttribute('stroke-dasharray', '4 4');
    this.lineSegments_.push(line);
  }
};

/**
 * The SVG layer. Set once by Blockly.WorkspaceHighlightLayerSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.SVG_ = null;

/**
 * Containing HTML element; parent of the workspace
 * @type {Element}
 * @private
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.container_ = null;

/**
 * List of line segments to draw on the layer.
 * @type {element}
 * @private 
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.lineSegments_ = [];

/**
 * Create the layer and inject it into the container.
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.createDom = function() {
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
    'class': 'blocklyWsHighlightLayer',
  }, null);
  this.container_.appendChild(this.SVG_);
};

/**
 * Respond to workspace being resized.
 * @param {!element} width, width of the workspace.
 * @param {!element} height, height of the workspace.
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.resize = function(width, height) {
  if (this.SVG_) {
    // Update width and height.
    this.SVG_.setAttribute('width', width);
    this.SVG_.setAttribute('height', height);

    // resize the lines to expand to the width of the workspace.
    for (var i = 0; i < this.lineSegments_.length; i++) {
      var visibility = this.lineSegments_[i].getAttribute('visibility');
      if (visibility === 'visible') {
        this.lineSegments_[i].setAttribute('x2', width);
      }
    }
  }
};

/**
 * Update line rendering
 * @param {element} lineSegmentsInfo
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.updateHighlightLayer = function(lineSegmentsInfo) {
  
  var i, b;

  // There are more lineSegments to draw than what we have in the pool.
  // console log it and return.
  if (this.lineSegments_.length <= lineSegmentsInfo.length) {
    console.log('There are too many line segments than are supported. Please increase the pool size! (TotalNumberNeeded = ' + lineSegmentsInfo.length + '.)');
  }

  for (var b = 0; b < lineSegmentsInfo.length; b++) {
    this.lineSegments_[b].setAttribute('y1', lineSegmentsInfo[b].y);
    this.lineSegments_[b].setAttribute('y2', lineSegmentsInfo[b].y);
    this.lineSegments_[b].setAttribute('x2', lineSegmentsInfo[b].width);
    this.lineSegments_[b].setAttribute('visibility', 'visible');
  }

  // go through the rest and set the lines to be hidden.
  for (i = b; i < this.lineSegments_.length; i++) {
    this.lineSegments_[i].setAttribute('visibility', 'hidden');
  }
};

/**
 * 
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.translateLayer = function(x, y) {
  if (this.SVG_) {
    var translation = 'translate(' + 0 + ',' + y + ') ';
    for (var i = 0; i < this.lineSegments_.length; i++) {
      this.lineSegments_[i].setAttribute('transform', translation);
    }
  }
};
