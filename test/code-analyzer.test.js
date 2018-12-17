import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {parseParametersValues} from '../src/js/code-analyzer';
import {firstLetterReplace} from '../src/js/code-analyzer';
import {restLettersReplace} from '../src/js/code-analyzer';


function getParsedCodeSize(parsedCode){
    let size = 0, key;
    for (key in parsedCode) {
        if (parsedCode.hasOwnProperty(key)) size++;
    }
    return size;
}

function dema9(){
    parseParametersValues('[\'gooo\']');
    return null;
}

function dema10(){
    parseParametersValues('["gooo"]');
    return null;
}

function dema11(){
    parseParametersValues('[false]');
    return null;
}


function dema12(){
    parseParametersValues('[true]');
    return null;
}

function dema13(){
    firstLetterReplace(0, '~~~~', '~');
    return null;
}


function dema14(){
    restLettersReplace(1, '~~~~', '~');
    return null;
}



function concatStrings(parsedCode){
    let ans ='';
    let length = getParsedCodeSize(parsedCode);

    for(let i=0;i<length;i++){
        ans += parsedCode[i].code;
    }
    return ans;
}

describe('The javascript parser', () => {
    it('1', () => {
        assert.deepEqual(
            parseCode('', []),
            {
                '0': {
                    'code': '',
                    'color': 3
                }
            }
        );
    });

    it('2', () => {
        assert.deepEqual(
            concatStrings(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n', [1,2,3])), 'function foo(x, y, z){        if (x + 1 + y < z) {\n        return x + y + z + 0 + 5;\n    } else if (x + 1 + y < (z) * (2)) {\n        return x + y + z + 0 + x + 5;\n    } else {        return x + y + z + 0 + z + 5;\n    }}'
        );
    });

    it('3', () => {
        assert.equal(
            concatStrings(parseCode('function foo(x, y, z){\n' +
                '    let a = [1,2];\n' +
                '    let b = 7 + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n', [1,2,3])), 'function foo(x, y, z){        if (7 + y < z) {\n        return x + y + z + 0 + 5;\n    } else if (7 + y < (z) * (2)) {\n        return x + y + z + 0 + x + 5;\n    } else {        return x + ' +
            'y + z + 0 + z + 5;\n    }}'
        );
    });

    it('4', () => {
        assert.equal(
            concatStrings(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}\n', [1,2,3])), 'function foo(x, y, z){        while (x + 1 < z) {\n        z = (x + 1 + x + 1 + y) * (2);\n    }        return z;\n}'
        );
    });

    it('5', () => {
        assert.equal(
            concatStrings(parseCode('function foo(){\n' +
                '    let a = [1];\n' +
                '    let z=a[0];\n' +
                '    return z;\n' +
                '}\n', [])), 'function foo(){    return 1;\n}'
        );
    });

    it('6', () => {
        assert.equal(
            concatStrings(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n', [1,2,3])), 'function foo(x, y, z){        if (x + 1 + y < z) {\n        return x + y + z + 0 + 5;\n    } else if (x + 1 + y < (z) * (2)) {\n        return x + y + z + 0 + x + 5;\n    }}'
        );
    });

    it('7', () => {
        assert.equal(
            concatStrings(parseCode('function foo(x, y, z){\n' +
                '    let a = -x;\n' +
                '    let b=-a;\n' +
                '    return b; \n' +
                '}\n', [1,2,3])), 'function foo(x, y, z){    return --x; }'
        );
    });

    it('8', () => {
        assert.deepEqual(
            parseParametersValues('[1,2, 3]'), [1,2,3]
        );
    });

    it('9', () => {
        assert.deepEqual(
            dema9(), null
        );
    });

    it('10', () => {
        assert.deepEqual(
            dema10(), null
        );
    });

    it('11', () => {
        assert.deepEqual(
            dema11(), null
        );
    });

    it('12', () => {
        assert.deepEqual(
            dema12(), null
        );
    });

    it('13', () => {
        assert.deepEqual(
            dema13(), null
        );
    });

    it('14', () => {
        assert.deepEqual(
            dema14(), null
        );
    });

});
