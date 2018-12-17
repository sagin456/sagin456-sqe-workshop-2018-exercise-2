import * as esprima from 'esprima';

let colors = {
    GREEN: 1,
    RED: 2,
    TRANSPARENT: 3,
};

let elseif = false;

let function_parameters = {};

let lines_to_eval = {};

let original_code = '';

let parsed_code_with_colors = {};

let calculateParsedArray = {
    'Program' : handle_program,
    'IfStatement' : handle_if,
    'ReturnStatement': handle_return,
    'WhileStatement' : handle_while,
    'FunctionDeclaration' : handle_func_dec,
    'BlockStatement' : handle_block,
    'VariableDeclaration' : handle_var_declaration,
    'AssignmentExpression' : handle_assignment,
    'ExpressionStatement' : handle_expression,
    //'MemberExpression' : handle_member

};


function findPrefixWhiteSpaces(str){
    let counter=0;
    for(let i=0;i<str.length;i++){
        if(str[i] == ' ')
            counter++;
        else
            break;
    }
    return counter;
}

// function handle_member(to_parse, localVariables){
//     calculateParsedArray[to_parse.expression.type](to_parse.expression, localVariables);
// }

function handle_program(to_parse, localVariables){
    for(let i = 0; i< to_parse.body.length; i++)
        localVariables = calculateParsedArray[to_parse.body[i].type](to_parse.body[i], localVariables);
    return localVariables;
}

function handle_block(to_parse, localVariables){
    for(let i = 0; i< to_parse.body.length; i++)
        localVariables = calculateParsedArray[to_parse.body[i].type](to_parse.body[i], localVariables);
    return localVariables;
}

function handle_func_dec(to_parse, localVariables){
    for(let i=0; i< to_parse.params.length; i++){
        function_parameters[to_parse.params[i].name] = null;
    }
    calculateParsedArray[to_parse.body.type](to_parse.body, localVariables);
    return localVariables;
}

function handle_while(to_parse, localVariables){
    let to_substitute = substitute(to_parse.test, localVariables);
    //lines_to_eval[to_parse.loc.start.line - 1] = to_substitute;
    let prefix_size = findPrefixWhiteSpaces(parsed_code_with_colors[to_parse.loc.start.line - 1].code);
    parsed_code_with_colors[to_parse.loc.start.line - 1].code = '';
    for(let i=0;i<prefix_size;i++)
        parsed_code_with_colors[to_parse.loc.start.line - 1].code+=' ';
    parsed_code_with_colors[to_parse.loc.start.line - 1].code += original_code.substring(to_parse.range[0], to_parse.test.range[0]) +
        to_substitute + original_code.substring(to_parse.test.range[1], to_parse.test.range[1]+4);
    localVariables = calculateParsedArray[to_parse.body.type](to_parse.body, localVariables);
    return localVariables;
}

function handle_expression(to_parse,localVariables){
    calculateParsedArray[to_parse.expression.type](to_parse.expression, localVariables);
    return localVariables;
}

function copyLocals(localVariables){
    let objCopy = {}; // objCopy will store a copy of the mainObj
    let key;

    for (key in localVariables) {
        objCopy[key] = localVariables[key]; // copies each property to the objCopy object
    }
    return objCopy;
}

function handle_if(to_parse, localVariables){
    let prev_locals = copyLocals(localVariables);
    let to_substitute = substitute(to_parse.test, localVariables);
    lines_to_eval[to_parse.loc.start.line - 1] = to_substitute;
    let prefix_size = findPrefixWhiteSpaces(parsed_code_with_colors[to_parse.loc.start.line - 1].code);
    parsed_code_with_colors[to_parse.loc.start.line - 1].code = '';
    for(let i=0;i<prefix_size;i++)
        parsed_code_with_colors[to_parse.loc.start.line - 1].code+=' ';
    parsed_code_with_colors[to_parse.loc.start.line - 1].code += elseif ? '} else ' : '';
    parsed_code_with_colors[to_parse.loc.start.line - 1].code += original_code.substring(to_parse.range[0], to_parse.test.range[0]) + to_substitute + original_code.substring(to_parse.test.range[1], to_parse.test.range[1]+4);
    calculateParsedArray[to_parse.consequent.type](to_parse.consequent, localVariables);
    if(to_parse.alternate != null){
        elseif = true; calculateParsedArray[to_parse.alternate.type](to_parse.alternate, prev_locals);
    }
    else
        elseif = false;
    return localVariables;
}

function handle_assignment(to_parse, localVariables){
    let substituted = substitute(to_parse.right, localVariables);
    if(!(typeof localVariables === 'undefined') && localVariables.hasOwnProperty(to_parse.left.name.valueOf()))
        localVariables[to_parse.left.name] = substituted;
    else {
        function_parameters[to_parse.left.name] = substituted;
    }
    return handle_assignment2(to_parse, localVariables, substituted);
}

function handle_assignment2(to_parse, localVariables, substituted){
    let prefix_size = findPrefixWhiteSpaces(parsed_code_with_colors[to_parse.loc.start.line - 1].code);
    parsed_code_with_colors[to_parse.loc.start.line - 1].code = '';
    for(let i=0;i<prefix_size;i++){
        parsed_code_with_colors[to_parse.loc.start.line - 1].code+=' ';
    }
    parsed_code_with_colors[to_parse.loc.start.line - 1].code += original_code.substring(to_parse.range[0], to_parse.right.range[0]) +
        substituted + original_code.substring(to_parse.right.range[1], to_parse.right.range[1]+2);
    if(!(typeof function_parameters === 'undefined') && !function_parameters.hasOwnProperty(to_parse.left.name.valueOf())) {
        parsed_code_with_colors[to_parse.loc.start.line - 1].code = '';
    }
    return localVariables;
}

function handle_var_declaration(to_parse, localVariables) {
    for (let i = 0; i < to_parse.declarations.length; i++) {
        localVariables[to_parse.declarations[i].id.name] = substitute(to_parse.declarations[i].init, localVariables);
    }
    parsed_code_with_colors[to_parse.loc.start.line - 1].code = '';
    return localVariables;
}

function handle_return(to_parse, localVariables){
    let to_substitute = substitute(to_parse.argument, localVariables);
    let prefix_size = findPrefixWhiteSpaces(parsed_code_with_colors[to_parse.loc.start.line - 1].code);
    parsed_code_with_colors[to_parse.loc.start.line - 1].code = '';
    for(let i=0;i<prefix_size;i++){
        parsed_code_with_colors[to_parse.loc.start.line - 1].code+=' ';
    }
    parsed_code_with_colors[to_parse.loc.start.line - 1].code += original_code.substring(to_parse.range[0], to_parse.argument.range[0]) +
        to_substitute + original_code.substring(to_parse.argument.range[1], to_parse.argument.range[1]+2);
    return localVariables;
}





let substituting = {
    'BinaryExpression' : binary_substituting,
    'ArrayExpression' : array_substituting,
    'MemberExpression': member_substituting,
    'UnaryExpression' : unary_substituting,
    'Identifier' : identifier_substituting,
    'Literal' : literal_substituting

};

function member_substituting(toSubstitute, localVariables){
    return localVariables[toSubstitute.object.name][toSubstitute.property.value];
}

function array_substituting(toSubstitute, localVariables){
    let yossi = [];
    for(let i=0;i<toSubstitute.elements.length;i++){
        yossi.push(substituting[toSubstitute.elements[i].type](toSubstitute.elements[i], localVariables));
    }
    return yossi;
}

function handleBinarySide(toSubstitute,localVariables){
    return toSubstitute.type.valueOf() === 'Identifier'.valueOf() && !(typeof localVariables === 'undefined') && localVariables.hasOwnProperty(toSubstitute.name.valueOf()) ?
        localVariables[toSubstitute.name] : substituting[toSubstitute.type](toSubstitute, localVariables);
}

function binary_substituting(toSubstitute, localVariables) {
    let substituted = '';
    if(toSubstitute.operator.valueOf() === '*'.valueOf() || toSubstitute.operator.valueOf() === '/'.valueOf()){
        substituted += '(' + handleBinarySide(toSubstitute.left, localVariables) + ')';
        substituted += ' ' + toSubstitute.operator + ' ';
        substituted += '(' + handleBinarySide(toSubstitute.right, localVariables) + ')';
    }
    else{
        substituted += handleBinarySide(toSubstitute.left, localVariables);
        substituted += ' ' +  toSubstitute.operator + ' ';
        substituted += handleBinarySide(toSubstitute.right, localVariables);
    }
    return substituted;
}

function unary_substituting(toSubstitute, localVariables){
    let substituted = toSubstitute.operator;
    if(toSubstitute.argument.type.valueOf() === 'Identifier'.valueOf() && !(typeof localVariables === 'undefined') && localVariables.hasOwnProperty(toSubstitute.argument.name.valueOf())){
        substituted += localVariables[toSubstitute.argument.name];
    }
    else{
        substituted += substituting[toSubstitute.argument.type](toSubstitute.argument, localVariables);
    }
    return substituted;
}

function identifier_substituting(toSubstitute, localVariables){
    if(localVariables.hasOwnProperty(toSubstitute.name)){
        return localVariables[toSubstitute.name];
    }
    return toSubstitute.name;
}

function literal_substituting(toSubstitute){
    return toSubstitute.value;
}

function substitute(toSubstitute, localVariables){
    return substituting[toSubstitute.type](toSubstitute, localVariables);
}


const parseCode = (codeToParse, parametersToParse) => {
    initializeGlobals();
    original_code = codeToParse;
    let parsed_code_array = original_code.split('\n');
    initializeParsedCodeColorsArray(parsed_code_array);
    let parameters_values = parseParametersValues('[' + parametersToParse + ']');
    let to_parse = esprima.parseScript(codeToParse, {loc:true, range:true});
    calculateParsedArray[to_parse.type](to_parse, {});
    calculateColors(parameters_values);
    return parsed_code_with_colors;
};

function calculateColors(parameters_values){
    let i=0;
    for(let key in function_parameters){
        //if (function_parameters.hasOwnProperty(key)) {
        function_parameters[key] = parameters_values[i];
        i++;
        //}
    }
    for (let line in lines_to_eval) {
        //if (lines_to_eval.hasOwnProperty(line))
        calculateColors2(function_parameters, lines_to_eval[line], line);
    }
}

function calculateColors2(function_parameters, line_val, line){
    for(let param in function_parameters){
        let place = line_val.indexOf(param);
        if(place > -1) {
            //if (shouldReplace(place, line_val, param)) {
            shouldReplace(place, line_val, param);
            line_val = line_val.replace(param, function_parameters[param]);
            //}
        }
    }
    lines_to_eval[line] = line_val;
    calculateColors3(lines_to_eval, line);
}

function shouldReplace(place, line, param){
    return firstLetterReplace(place, line, param) || restLettersReplace(place, line, param) || lstLetterReplace(place, line, param);
}

function calculateColors3(lines_to_eval, line){
    if(eval(lines_to_eval[line])){
        parsed_code_with_colors[line].color = colors.GREEN;
    }
    else{
        parsed_code_with_colors[line].color = colors.RED;
    }
}

function firstLetterReplace(place, line, param){
    return place === 0 && (line[place+ param.length] <'A' || line[place+ param.length] >'z');
}

function restLettersReplace(place, line, param){
    return place > 0 && ( line[place+ param.length] <'A' || line[place+ param.length] >'z') && (line[place -1] <'A' || line[place - 1] >'z');
}

function lstLetterReplace(place, line, param){
    return place > 0 && place+ param.length >= line.length;
}

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}

// a recursive function to parse the values of the parameters
function parseParametersValues(parametersToParse){
    if(parametersToParse.valueOf() === ''.valueOf())
        return;
    if(parametersToParse.charAt(0).valueOf() === ' '.valueOf())
        return parseParametersValues(parametersToParse.substring(1));
    if(parametersToParse.charAt(0).valueOf() === '['.valueOf())
        return handleArrayParameter(parametersToParse);
    if(parametersToParse.charAt(0).valueOf() === '\''.valueOf()) {
        return parametersToParse.substring(1, getPosition(parametersToParse, '\'',2 ));
    }
    return parseParametersValues2(parametersToParse);
}
function parseParametersValues2(parametersToParse){
    if(parametersToParse.charAt(0).valueOf() === '"'.valueOf())
        return parametersToParse.substring(1, getPosition(parametersToParse, '"',2 ));
    if(parametersToParse.valueOf() === 'true'.valueOf())
        return true;
    if(parametersToParse.valueOf() === 'false'.valueOf())
        return false;
    return Number(parametersToParse);
}

function handleArrayParameter(parametersToParse){
    let relevant_string = parametersToParse.substring(1, parametersToParse.indexOf(']'));
    let arr = relevant_string.split(',');
    for (let i = 0; i < arr.length; i++) {
        arr[i] = parseParametersValues(arr[i]);
    }
    return arr;
}

function initializeParsedCodeColorsArray(parsedArray){
    for (let i = 0; i < parsedArray.length; i++) {
        parsed_code_with_colors[i] = {
            code: parsedArray[i],
            color: colors.TRANSPARENT
        };
    }
}

function initializeGlobals() {

    elseif = false;

    function_parameters = {};

    lines_to_eval = {};

    original_code = '';
    parsed_code_with_colors = {};
}

export {parseCode};
export {parseParametersValues};
export {firstLetterReplace};
export {restLettersReplace};
