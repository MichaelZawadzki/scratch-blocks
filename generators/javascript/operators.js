/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Generating JavaScript for math blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.JavaScript.operators');

goog.require('Blockly.JavaScript');


Blockly.JavaScript['operator_add'] = function(block) {
  // Get params
  var num1 = Blockly.JavaScript.valueToCode(block, 'NUM1', Blockly.JavaScript.ORDER_ADDITION) || '0';
  var num2 = Blockly.JavaScript.valueToCode(block, 'NUM2', Blockly.JavaScript.ORDER_ADDITION) || '0';

  // Make the code
  var code = '' + num1 + ' + ' + num2;
  
  return [code, Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['operator_subtract'] = function(block) {
  // Get params
  var num1 = Blockly.JavaScript.valueToCode(block, 'NUM1', Blockly.JavaScript.ORDER_SUBTRACTION) || '0';
  var num2 = Blockly.JavaScript.valueToCode(block, 'NUM2', Blockly.JavaScript.ORDER_SUBTRACTION) || '0';

  // Make the code
  var code = '' + num1 + ' - ' + num2;
  
  return [code, Blockly.JavaScript.ORDER_SUBTRACTION];
};

Blockly.JavaScript['operator_multiply'] = function(block) {
  // Get params
  var num1 = Blockly.JavaScript.valueToCode(block, 'NUM1', Blockly.JavaScript.ORDER_MULTIPLICATION) || '0';
  var num2 = Blockly.JavaScript.valueToCode(block, 'NUM2', Blockly.JavaScript.ORDER_MULTIPLICATION) || '0';

  // Make the code
  var code = '' + num1 + ' * ' + num2;
  
  return [code, Blockly.JavaScript.ORDER_MULTIPLICATION];
};

Blockly.JavaScript['operator_divide'] = function(block) {
  // Get params
  var num1 = Blockly.JavaScript.valueToCode(block, 'NUM1', Blockly.JavaScript.ORDER_DIVISION) || '0';
  var num2 = Blockly.JavaScript.valueToCode(block, 'NUM2', Blockly.JavaScript.ORDER_DIVISION) || '0';

  // Make the code
  var code = '' + num1 + ' / ' + num2;
  
  return [code, Blockly.JavaScript.ORDER_DIVISION];
};

Blockly.JavaScript['operator_divide'] = function(block) {
  // Get params
  var num1 = Blockly.JavaScript.valueToCode(block, 'NUM1', Blockly.JavaScript.ORDER_DIVISION) || '0';
  var num2 = Blockly.JavaScript.valueToCode(block, 'NUM2', Blockly.JavaScript.ORDER_DIVISION) || '0';

  // Make the code
  var code = '' + num1 + ' / ' + num2;
  
  return [code, Blockly.JavaScript.ORDER_DIVISION];
};

Blockly.JavaScript['operator_lt'] = function(block) {
  // Get params
  var op1 = Blockly.JavaScript.valueToCode(block, 'OPERAND1', Blockly.JavaScript.ORDER_RELATIONAL) || '0';
  var op2 = Blockly.JavaScript.valueToCode(block, 'OPERAND2', Blockly.JavaScript.ORDER_RELATIONAL) || '0';

  // Attempt to convert these into numbers
  var n1 = Number(op1.substring(1, op1.length-1));
  var n2 = Number(op2.substring(1, op2.length-1));

  if (isNaN(n1) || isNaN(n2))
  {
    n1 = op1;
    n2 = op2;
  }

  // Make the code
  var code = '' + n1 + ' < ' + n2;
  
  return [code, Blockly.JavaScript.ORDER_RELATIONAL];
};

Blockly.JavaScript['operator_equals'] = function(block) {
  // Get params
  var op1 = Blockly.JavaScript.valueToCode(block, 'OPERAND1', Blockly.JavaScript.ORDER_EQUALITY) || '0';
  var op2 = Blockly.JavaScript.valueToCode(block, 'OPERAND2', Blockly.JavaScript.ORDER_EQUALITY) || '0';

  // Attempt to convert these into numbers
  var n1 = Number(op1.substring(1, op1.length-1));
  var n2 = Number(op2.substring(1, op2.length-1));

  if (isNaN(n1) || isNaN(n2))
  {
    n1 = op1;
    n2 = op2;
  }

  // Make the code
  var code = '' + n1 + ' == ' + n2;

  return [code, Blockly.JavaScript.ORDER_EQUALITY];
};

Blockly.JavaScript['operator_gt'] = function(block) {
  // Get params
  var op1 = Blockly.JavaScript.valueToCode(block, 'OPERAND1', Blockly.JavaScript.ORDER_RELATIONAL) || '0';
  var op2 = Blockly.JavaScript.valueToCode(block, 'OPERAND2', Blockly.JavaScript.ORDER_RELATIONAL) || '0';

  // Attempt to convert these into numbers
  var n1 = Number(op1.substring(1, op1.length-1));
  var n2 = Number(op2.substring(1, op2.length-1));

  if (isNaN(n1) || isNaN(n2))
  {
    n1 = op1;
    n2 = op2;
  }

  // Make the code
  var code = '' + n1 + ' > ' + n2;
  
  return [code, Blockly.JavaScript.ORDER_RELATIONAL];
};

Blockly.JavaScript['operator_and'] = function(block) {
  // Get params
  var bool1 = Blockly.JavaScript.valueToCode(block, 'OPERAND1', Blockly.JavaScript.ORDER_LOGICAL_AND) || 'false';
  var bool2 = Blockly.JavaScript.valueToCode(block, 'OPERAND2', Blockly.JavaScript.ORDER_LOGICAL_AND) || 'false';

  // Make the code
  var code = '' + bool1 + ' && ' + bool2;
  
  return [code, Blockly.JavaScript.ORDER_LOGICAL_AND];
};

Blockly.JavaScript['operator_or'] = function(block) {
  // Get params
  var bool1 = Blockly.JavaScript.valueToCode(block, 'OPERAND1', Blockly.JavaScript.ORDER_LOGICAL_OR) || 'false';
  var bool2 = Blockly.JavaScript.valueToCode(block, 'OPERAND2', Blockly.JavaScript.ORDER_LOGICAL_OR) || 'false';

  // Make the code
  var code = '' + bool1 + ' || ' + bool2;
  
  return [code, Blockly.JavaScript.ORDER_LOGICAL_OR];
};