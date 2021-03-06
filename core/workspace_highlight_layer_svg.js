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
  this.createSVGLines_();
  this.createSVGRect_();
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
 * rect to draw on the layer.
 * @type {element}
 * @private 
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.highlightRect_ = null;

/**
 * OB [CSI-1411]
 * Add left and right offsets to the workspace highlight layer. Objects on that layer (lines and highlight rect)
 * will now display offsetted accordingly
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.horizontalOffsets = {left: 0, right: 0};

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
 * Create a pool of svg lines.
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.createSVGLines_ = function() {
  // Make a bunch of lines so that they can be turn on/off without having to recreating it every time.
  for (var i = 0; i < 100; i++) {
    var line = Blockly.utils.createSvgElement('line',{
      'x1': 0,
      'y1': 10 + (10*i),
      'x2': 500,
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
 * Create a single svg rect.
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.createSVGRect_ = function() {
  
    // Make an SVG Rect to use for highlighting without having to recreate it every time.
    var rect = Blockly.utils.createSvgElement('rect',{
      'x': 0,
      'y': 0,
      'width': 500,
      'height': 10,
      'fill' : '#B0D3FF',
      'stroke' : '#B0D3FF',
      'fill-opacity' : '1.0',
      'class': 'blockHighlightRect',
      'visibility' : 'hidden',
    }, this.SVG_);
    this.highlightRect_ = rect;
};

/**
 * Respond to workspace being resized.
 * @param {!element} width, width of the workspace.
 * @param {!element} height, height of the workspace.
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.resize = function(width, height) {
  if (this.SVG_) {
    // Update width and height.
    this.SVG_.setAttribute('width', width + 'px');
    this.SVG_.setAttribute('height', height + 'px');

    // // resize the lines to expand to the width of the workspace.
    // for (var i = 0; i < this.lineSegments_.length; i++) {
    //   var visibility = this.lineSegments_[i].getAttribute('visibility');
    //   if (visibility === 'visible') {
    //     this.lineSegments_[i].setAttribute('x2', (width - this.horizontalOffsets.right) + 'px');
    //   }
    // }
    this.updateSVGLines();
    var rectVisibility = this.highlightRect_.getAttribute('visibility');
    if(rectVisibility === 'visible'){
      this.highlightRect_.setAttribute('width', (width - this.horizontalOffsets.right) + 'px');
    }
  }
};

Blockly.WorkspaceHighlightLayerSvg.prototype.updateSVGLines = function() {
  var svgSize = Blockly.svgSize(this.container_);
  for (var i = 0, currentLine; currentLine = this.lineSegments_[i]; i++) {
    currentLine.setAttribute('x1', this.horizontalOffsets.left + 'px');
    currentLine.setAttribute('x2', (svgSize.width - this.horizontalOffsets.right) + 'px');
  }
};

/**
 * Update line rendering
 * @param {element} lineSegmentsInfo
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.updateHighlightLayer = function(lineSegmentsInfo) {

  var i, b, j;
  var lineIndex = 0;
  var totalLineSegments = lineSegmentsInfo.map(function(lineSegment) {
    return lineSegment.lineSegments.length;
  });
  var totalNumberNeeded = 0;
  for(var num = 0; num < totalLineSegments.length; num++) {
    totalNumberNeeded += totalLineSegments[num];
  }

  // There are more lineSegments to draw than what we have in the pool.
  // create some new ones.
  if (totalNumberNeeded > this.lineSegments_.length-1) {
    this.createSVGLines_();
  }

  var previousY;

  for (i = 0; i < lineSegmentsInfo.length; i++) {
    for(b = 0; b < lineSegmentsInfo[i].lineSegments.length; b++) {
      var lineSegment = lineSegmentsInfo[i].lineSegments[b];

      // OB Skip this test for now... TODO Fix it
      // // skip the new line if there is a line already occupying the Y position.
      // if (previousY !== lineSegment.y)
      {
        this.lineSegments_[lineIndex].setAttribute('y1', lineSegment.y);
        this.lineSegments_[lineIndex].setAttribute('y2', lineSegment.y);
        this.lineSegments_[lineIndex].setAttribute('x2', lineSegment.width);
        var visibility = (lineSegment.visible ? 'visible' : 'hidden');
        this.lineSegments_[lineIndex].setAttribute('visibility', visibility);

        previousY = lineSegment.y;
        //prevVisible = lineSegment.visible;
        lineIndex +=1;
      }

    }
  }
  
  // go through the rest and set the lines to be hidden.
  for (j = lineIndex; j < this.lineSegments_.length; j++) {
    this.lineSegments_[j].setAttribute('visibility', 'hidden');
  }

};

/**
 * Update rect rendering. This function assumes all incoming values are already scaled. 
 * @param {!element} visible, 
 * @param {!element} x, x position of the left of the highlighted block.
 * @param {!element} y, y position of the top of the highlighted block
 * @param {!element} width, width of the workspace.
 * @param {!element} height, height of the highlighted block.
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.updateHighlightRect = function(visible, x, y, width, height) {
  if(visible){
    this.highlightRect_.setAttribute('visibility', 'visible');
  }else{
    this.highlightRect_.setAttribute('visibility', 'hidden');
    return;
  }
  this.highlightRect_.setAttribute('x', x);
  this.highlightRect_.setAttribute('y', y);
  this.highlightRect_.setAttribute('width', width);
  this.highlightRect_.setAttribute('height', height);

}

/**
 * Translate the layer so that it matches the workspace.
 */
Blockly.WorkspaceHighlightLayerSvg.prototype.translateLayer = function(x, y) {
  if (this.SVG_) {
    var translation = 'translate(' + 0 + ',' + y + ') ';
    for (var i = 0; i < this.lineSegments_.length; i++) {
      this.lineSegments_[i].setAttribute('transform', translation);
    }

    this.highlightRect_.setAttribute('transform', translation);
  }
};

Blockly.WorkspaceHighlightLayerSvg.prototype.setLayerHorizontalOffsets = function (left, right) {
  this.horizontalOffsets.left = left;
  this.horizontalOffsets.right = right;
  this.updateSVGLines();
};
