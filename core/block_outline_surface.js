/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview A class that manages a surface for dragging blocks.  When a
 * block drag is started, we move the block (and children) to a separate dom
 * element that we move around using translate3d. At the end of the drag, the
 * blocks are put back in into the svg they came from. This helps performance by
 * avoiding repainting the entire svg on every mouse move while dragging blocks.
 * @author picklesrus
 */

'use strict';

goog.provide('Blockly.BlockOutlineSurfaceSvg');
goog.require('Blockly.utils');
goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


/**
 * Class for a drag surface for the currently dragged block. This is a separate
 * SVG that contains only the currently moving block, or nothing.
 * @param {!Element} container Containing element.
 * @constructor
 */
Blockly.BlockOutlineSurfaceSvg = function(container) {
  /**
   * @type {!Element}
   * @private
   */
  this.container_ = container;
  this.createDom();
};

/**
 * The SVG drag surface. Set once by Blockly.BlockOutlineSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.BlockOutlineSurfaceSvg.prototype.hasBlocks_ = false;

/**
 * The SVG drag surface. Set once by Blockly.BlockOutlineSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.BlockOutlineSurfaceSvg.prototype.SVG_ = null;

/**
 * This is where blocks live while they are being dragged if the drag surface
 * is enabled.
 * @type {Element}
 * @private
 */
Blockly.BlockOutlineSurfaceSvg.prototype.outlineGroup_ = null;

/**
 * Containing HTML element; parent of the workspace and the drag surface.
 * @type {Element}
 * @private
 */
Blockly.BlockOutlineSurfaceSvg.prototype.container_ = null;

/**
 * Cached value for the scale of the drag surface.
 * Used to set/get the correct translation during and after a drag.
 * @type {number}
 * @private
 */
Blockly.BlockOutlineSurfaceSvg.prototype.scale_ = 1;

/**
 * Cached value for the translation of the drag surface.
 * This translation is in pixel units, because the scale is applied to the
 * drag group rather than the top-level SVG.
 * @type {goog.math.Coordinate}
 * @private
 */
Blockly.BlockOutlineSurfaceSvg.prototype.surfaceXY_ = null;

/**
 * ID for the drag shadow filter, set in createDom.
 * @type {string}
 * @private
 */
Blockly.BlockOutlineSurfaceSvg.prototype.dragShadowFilterId_ = '';

/**
 * Standard deviation for gaussian blur on drag shadow, in px.
 * @type {number}
 * @const
 */
Blockly.BlockOutlineSurfaceSvg.SHADOW_STD_DEVIATION = 6;

/**
 * Create the drag surface and inject it into the container.
 */
Blockly.BlockOutlineSurfaceSvg.prototype.createDom = function() {
  if (this.SVG_) {
    return;  // Already created.
  }
this.SVG_ = Blockly.utils.createSvgElement('g',
    {'class': 'blocklyBlocksOutlineSurface'}, this.container_);
  var defs = Blockly.utils.createSvgElement('defs', {}, this.SVG_);
  this.selectFilterId_ = this.createOutlineDom_(defs);
  this.outlineGroup_ = Blockly.utils.createSvgElement('g', {}, this.SVG_);
  this.outlineGroup_.setAttribute('filter', 'url(#' + this.selectFilterId_ + ')');
};

/**
 * Scratch-specific: Create the SVG def for the drop shadow.
 * @param {Element} defs Defs element to insert the shadow filter definition
 * @return {string} ID for the filter element
 */
Blockly.BlockOutlineSurfaceSvg.prototype.createOutlineDom_ = function(defs) {
  var rnd = String(Math.random()).substring(2);
  // Adjust these width/height, x/y properties to prevent the shadow from clipping
  var selectFilter = Blockly.utils.createSvgElement('filter',
    {'id': 'blocklySelectFilter' + rnd, 'height': '140%', 'width': '140%', y: '-20%', x: '-20%'}, defs);
  Blockly.utils.createSvgElement('feMorphology',
    {'operator': 'dilate', 'radius': Blockly.Colours.outlineRadius, 'result': 'border'}, selectFilter);
  Blockly.utils.createSvgElement('feFlood',
    {'flood-color': Blockly.Colours.outlineColor}, selectFilter);
  Blockly.utils.createSvgElement('feComposite',
    {'in2': 'border', 'operator': 'in', 'result': 'border'}, selectFilter);
      
  var componentTransfer = Blockly.utils.createSvgElement('feComponentTransfer',
    {'result': 'offsetBlur'}, selectFilter);
  // Outline opacity is specified in the adjustable colour library.
  Blockly.utils.createSvgElement('feFuncA',
    {'type': 'linear', 'slope': Blockly.Colours.outlineOpacity}, componentTransfer);
  Blockly.utils.createSvgElement('feComposite',
    {'in': 'SourceGraphic', 'in2': 'offsetBlur', 'operator': 'over'}, selectFilter);
  return selectFilter.id;
};

Blockly.BlockOutlineSurfaceSvg.prototype.isInOutlineSurface = function(element) {
  //return this.dragGroup_.contains(element);
  return (this.outlineGroup_.contains(element) || this.outlineGroup_.contains(element));
};

Blockly.BlockOutlineSurfaceSvg.prototype.setBlocksAndShow = function(blocks) {
  goog.asserts.assert(this.outlineGroup_.childNodes.length == 0,
    'Already dragging a block.');
  // appendChild removes the blocks from the previous parent
  this.outlineGroup_.appendChild(blocks);
  this.show();
  this.hasBlocks_ = true;
};

Blockly.BlockOutlineSurfaceSvg.prototype.show = function(translateXY) {
  this.SVG_.style.display = 'block';
  this.surfaceXY_ = new goog.math.Coordinate(0, 0);
  // This allows blocks to be dragged outside of the blockly svg space.
  // This should be reset to hidden at the end of the block drag.
  // Note that this behavior is different from blockly where block disappear
  // "under" the blockly area.
  var injectionDiv = document.getElementsByClassName('injectionDiv')[0];
  injectionDiv.style.overflow = 'visible';
};

/**
 * Translate and scale the entire drag surface group to the given position, to
 * keep in sync with the workspace.
 * @param {number} x X translation in workspace coordinates.
 * @param {number} y Y translation in workspace coordinates.
 * @param {number} scale Scale of the group.
 */
Blockly.BlockOutlineSurfaceSvg.prototype.translateAndScaleGroup = function(x, y, scale) {
  this.scale_ = scale;
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being dragged on the drag surface.
  x = x.toFixed(0);
  y = y.toFixed(0);
  this.outlineGroup_.setAttribute('transform', 'translate('+ x + ','+ y + ')' +
      ' scale(' + scale + ')');
};

/**
 * Translate the drag surface's SVG based on its internal state.
 * @private
 */
Blockly.BlockOutlineSurfaceSvg.prototype.translateSurfaceInternal_ = function() {
  var x = this.surfaceXY_.x;
  var y = this.surfaceXY_.y;
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being dragged on the drag surface.
  x = x.toFixed(0);
  y = y.toFixed(0);
  this.SVG_.style.display = 'block';

  Blockly.utils.setCssTransform(this.SVG_,
      'translate3d(' + x + 'px, ' + y + 'px, 0px)');
};

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {number} x X translation for the entire surface.
 * @param {number} y Y translation for the entire surface.
 */
Blockly.BlockOutlineSurfaceSvg.prototype.translateSurface = function(x, y) {
  this.surfaceXY_ = new goog.math.Coordinate(x * this.scale_, y * this.scale_);
  this.translateSurfaceInternal_();
};

/**
 * Reports the surface translation in scaled workspace coordinates.
 * Use this when finishing a drag to return blocks to the correct position.
 * @return {!goog.math.Coordinate} Current translation of the surface.
 */
Blockly.BlockOutlineSurfaceSvg.prototype.getSurfaceTranslation = function() {
  var xy = Blockly.utils.getRelativeXY(this.SVG_);
  return new goog.math.Coordinate(xy.x / this.scale_, xy.y / this.scale_);
};

/**
 * Provide a reference to the drag group (primarily for
 * BlockSvg.getRelativeToSurfaceXY).
 * @return {Element} Drag surface group element.
 */
Blockly.BlockOutlineSurfaceSvg.prototype.getGroup = function() {
  return this.outlineGroup_;
};

/**
 * Get the current blocks on the drag surface, if any (primarily
 * for BlockSvg.getRelativeToSurfaceXY).
 * @return {!Element|undefined} Drag surface block DOM element, or undefined
 * if no blocks exist.
 */
Blockly.BlockOutlineSurfaceSvg.prototype.getCurrentBlock = function() {
  return this.outlineGroup_.firstChild;
};

/**
 * Clear the group and hide the surface; move the blocks off onto the provided
 * element.
 * If the block is being deleted it doesn't need to go back to the original
 * surface, since it would be removed immediately during dispose.
 * @param {Element} opt_newSurface Surface the dragging blocks should be moved
 *     to, or null if the blocks should be removed from this surface without
 *     being moved to a different surface.
 */
Blockly.BlockOutlineSurfaceSvg.prototype.clearAndHide = function(opt_newSurface) {
  if (opt_newSurface) {
    // appendChild removes the node from this.outlineGroup_
    opt_newSurface.appendChild(this.getCurrentBlock());
  } else {
    this.outlineGroup_.removeChild(this.getCurrentBlock());
  }
  this.SVG_.style.display = 'none';
  goog.asserts.assert(this.outlineGroup_.childNodes.length == 0,
    'Drag group was not cleared.');
  this.surfaceXY_ = null;

  // Reset the overflow property back to hidden so that nothing appears outside
  // of the blockly area.
  // Note that this behavior is different from blockly. See note in
  // setBlocksAndShow.
  var injectionDiv = document.getElementsByClassName('injectionDiv')[0];
  injectionDiv.style.overflow = 'hidden';

  this.hasBlocks_ = false;
};


/**
 * Translate the layer so that it matches the workspace.
 * //OB TODO: Check if/how this is used and fix
 */
Blockly.BlockOutlineSurfaceSvg.prototype.translateLayer = function(x, y, scale) {
  // if (this.selectionRect_) {
  //   var translateX = x;
  //   var translateY = y;
  //   var translation = 'translate(' + translateX + ',' + translateY + ') ';
  //   this.selectionRect_.setAttribute('transform', translation);
  // }
};

Blockly.BlockOutlineSurfaceSvg.isBlockOnOutlineSurface = function (block) {
  if(block && block.workspace.blocksOutlineSurface && block.workspace.blocksOutlineSurface.isInOutlineSurface(block.getSvgRoot()) ) {
    return true;
  }
  return false;
};


